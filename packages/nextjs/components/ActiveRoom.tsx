import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { FunctionFragment, ParamType } from "ethers/lib/utils.js";
import { useAccount, useContractWrite, useNetwork } from "wagmi";
import {
  Address,
  generateHalalHash,
  getFunctionInputKey,
  getParsedContractFunctionArgs,
  getParsedEthersError,
} from "~~/components/scaffold-eth";
import {
  useScaffoldContractWrite,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
  useTransactor,
} from "~~/hooks/scaffold-eth";
import { TActiveRoomProps } from "~~/types/halalTypes";
import { getTargetNetwork, notification, parseTxnValue } from "~~/utils/scaffold-eth";

const getInitialFormState = (joinRoomFn: FunctionFragment, roomNo: string) =>
  joinRoomFn.inputs.reduce((acc, input, inputIndex) => {
    let val = "";
    if (input.name == "roomNo") val = roomNo;
    acc[getFunctionInputKey(joinRoomFn, input, inputIndex)] = val;
    return acc;
  }, {} as Record<string, any>);

export const ActiveRoom = ({
  contractAddress,
  joinRoomFn,
  roomNo,
  creatorAddress,
  roomFee,
  triggerMyRooms,
  capacity,
}: TActiveRoomProps) => {
  /* User Account */
  const { address: currentAccount } = useAccount();

  if (!roomNo) return null;

  //////////////////////////////////////////
  /*********** Get Room History ***********/
  //////////////////////////////////////////
  const { data: enterRoomEvents } = useScaffoldEventHistory({
    contractName: "HalalGamble",
    eventName: "EnterRoom",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
    filters: {
      roomNo: ethers.BigNumber.from(roomNo),
    },
    blockData: false,
  });

  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    setParticipants(
      enterRoomEvents == undefined || enterRoomEvents.length == 0 ? [] : enterRoomEvents?.map(e => e.args[1] as string),
    );
  }, [enterRoomEvents]);

  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "EnterRoom",
    listener: (_roomNo, entrar) => {
      if (_roomNo.toString() != roomNo) return;
      setParticipants(prev => Array.from(new Set([entrar, ...prev])));
      triggerMyRooms(prev => !prev);
    },
  });

  /////////////////////////////////////////////
  /*********** join room tx prepare **********/
  /////////////////////////////////////////////
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(joinRoomFn, roomNo));
  const [txValue, setTxValue] = useState<string>(roomFee);
  if (txValue.toString() != roomFee) setTxValue(roomFee);

  const { chain } = useNetwork();
  const writeTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  const { isLoading: isJoinRoomLoading, writeAsync: joinRoom } = useContractWrite({
    address: contractAddress,
    functionName: joinRoomFn && joinRoomFn.name,
    abi: joinRoomFn && [joinRoomFn],
    args: getParsedContractFunctionArgs(form),
    mode: "recklesslyUnprepared",
    overrides: {
      value: typeof txValue === "string" ? parseTxnValue(txValue) : txValue,
    },
  });

  const [disableAfterSuccess, setDisableAfterSuccess] = useState(false);
  let userJoinedRoom =
    currentAccount && currentAccount != creatorAddress && participants.includes(currentAccount) && !isJoinRoomLoading;
  const isRoomFull = Array.from(participants).length == capacity;

  const joinButton = currentAccount != creatorAddress && (
    <button
      className={`bg-orange-100 btn btn-sm ${isJoinRoomLoading ? "loading" : ""} bg`}
      disabled={writeDisabled || isJoinRoomLoading || userJoinedRoom || isRoomFull || disableAfterSuccess}
      onClick={async () => {
        if (!joinRoom) return;
        try {
          await writeTxn(joinRoom());
          setDisableAfterSuccess(true);
          triggerMyRooms(prev => !prev);
        } catch (e: any) {
          const message = getParsedEthersError(e);
          notification.error(message);
        }
      }}
    >
      {!isJoinRoomLoading && (userJoinedRoom ? <> JOINED </> : isRoomFull ? <> FULL </> : <> JOIN </>)}
    </button>
  );

  /////////////////////////////////////////////
  /****************** RND ********************/
  /////////////////////////////////////////////
  useEffect(() => {
    if (!roomNo) {
      console.log(`RETURNING FROM useEffect BECAUSE roomNo is ${roomNo}`);
      return;
    }

    const rndLocalKey = currentAccount ? `${roomNo}_${currentAccount}` : "";
    const fromStorage = localStorage.getItem(rndLocalKey);
    if (fromStorage) {
      console.log(`RANDOM NUMBER FOUND IN STORAGE FOR GIVEN ROOMNO AND ACCOUNT: ${fromStorage}`);
      setForm(prev => {
        const hashRndNumberInputAndIndex = joinRoomFn.inputs
          .map((inp, idx) => [inp.name == "hashRndNumber" ? inp : undefined, idx])
          .filter(([inp]) => inp)[0];
        prev[
          getFunctionInputKey(
            joinRoomFn,
            hashRndNumberInputAndIndex[0] as ParamType,
            hashRndNumberInputAndIndex[1] as number,
          )
        ] = generateHalalHash(parseInt(fromStorage), currentAccount!, roomNo);
        return prev;
      });
    } else {
      const newRandStr = Math.trunc(Math.random() * (Number.MAX_SAFE_INTEGER - 1)).toString();
      const newRand = parseInt(newRandStr);

      console.log(`COULD NOT FIND RANDOM NUMBER IN STORAGE FOR GIVEN KEY. PUTTING: ${newRandStr}`);

      localStorage.setItem(rndLocalKey, newRandStr);
      setForm(prev => {
        const hashRndNumberInputAndIndex = joinRoomFn.inputs
          .map((inp, idx) => [inp.name == "hashRndNumber" ? inp : undefined, idx])
          .filter(([inp]) => inp)[0];
        prev[
          getFunctionInputKey(
            joinRoomFn,
            hashRndNumberInputAndIndex[0] as ParamType,
            hashRndNumberInputAndIndex[1] as number,
          )
        ] = generateHalalHash(newRand, currentAccount!, roomNo);
        return prev;
      });
    }
  }, [currentAccount]);

  //////////////////////////////////////////
  /********** Abolish Management **********/
  //////////////////////////////////////////
  const { writeAsync: abolishRoom, isLoading: isAbolishRoomLoading } = useScaffoldContractWrite({
    contractName: "HalalGamble",
    functionName: "abolishRoom",
    args: [ethers.BigNumber.from(roomNo)],
    onBlockConfirmation: txnReceipt => {
      triggerMyRooms(prev => !prev);
    },
  });

  const abolishButton = currentAccount == creatorAddress && (
    <button
      className={`bg-orange-100 btn btn-sm ${isAbolishRoomLoading ? "loading" : ""} bg`}
      disabled={writeDisabled || isAbolishRoomLoading || isRoomFull}
      onClick={async () => {
        if (!abolishRoom) return;
        try {
          await abolishRoom();
          triggerMyRooms(prev => !prev);
        } catch (e: any) {
          const message = getParsedEthersError(e);
          notification.error(message);
        }
      }}
    >
      {!isAbolishRoomLoading && <> ABOLISH </>}
    </button>
  );

  return (
    <div
      className={`flex items-center space-x-3 overflow-hidden h-20 px-3 rounded-3xl bg-gradient-to-r from-purple-500 to-green-600 ${
        userJoinedRoom ? "opacity-40" : "opacity-90"
      } border-primary`}
    >
      {joinButton}
      {abolishButton}

      <Address address={creatorAddress} disableAddressLink={true} />

      <span className="text-xl text-orange-100 text-center">
        {Array.from(participants).length} / {capacity} Participants
      </span>
      <div className="flex w-full justify-start">
        <span className="text-xl text-green-100 text-center">💸: {ethers.utils.formatEther(roomFee.toString())}</span>
      </div>
    </div>
  );
};
