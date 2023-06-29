import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useLocalStorage } from "usehooks-ts";
import { useAccount, useContractWrite, useNetwork } from "wagmi";
import {
  Address,
  generateHalalHash,
  getParsedContractFunctionArgs,
  getParsedEthersError,
} from "~~/components/scaffold-eth";
import { useScaffoldEventHistory, useScaffoldEventSubscriber, useTransactor } from "~~/hooks/scaffold-eth";
import { TActiveRoomProps, TMyCandidateRoom } from "~~/types/halalTypes";
import { getTargetNetwork, notification, parseTxnValue } from "~~/utils/scaffold-eth";

type Reveal = {
  revealer: string;
  valid: boolean;
  rand: string;
};

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

  /* RND */
  const rndLocalKey = currentAccount ? `${roomNo}_${currentAccount}` : "";
  const [rnd, setRnd] = useLocalStorage<number>(rndLocalKey, Math.trunc(Math.random() * (Number.MAX_SAFE_INTEGER - 1)));

  /////////////////////////////////////////////
  /*********** Join Room Logic ***************/
  /////////////////////////////////////////////
  /* set form */
  const [form, setForm] = useState<Record<string, any>>(() => {
    return {
      roomNo: roomNo,
      hashRndNumber: currentAccount && generateHalalHash(currentAccount, rnd),
    };
  });

  if (!form || !form.roomNo || form.roomNo != roomNo)
    setForm({
      roomNo: roomNo,
      hashRndNumber: currentAccount && generateHalalHash(currentAccount, rnd),
    });

  const [txValue, setTxValue] = useState<string>(roomFee);
  if (txValue.toString() != roomFee) setTxValue(roomFee);

  const { chain } = useNetwork();
  const writeTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  const { isLoading, writeAsync: joinRoom } = useContractWrite({
    address: contractAddress,
    functionName: joinRoomFn && joinRoomFn.name,
    abi: joinRoomFn && [joinRoomFn],
    args: getParsedContractFunctionArgs(form),
    mode: "recklesslyUnprepared",
    overrides: {
      value: typeof txValue === "string" ? parseTxnValue(txValue) : txValue,
    },
  });

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
  const { data: revealedEvents } = useScaffoldEventHistory({
    contractName: "HalalGamble",
    eventName: "Revealed",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
    filters: {
      roomNo: ethers.BigNumber.from(roomNo),
    },
    blockData: false,
  });

  const [participants, setParticipants] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<Map<string, Reveal>>(new Map());

  useEffect(() => {
    setParticipants(
      enterRoomEvents == undefined || enterRoomEvents.length == 0 ? [] : enterRoomEvents?.map(e => e.args[1] as string),
    );
  }, [enterRoomEvents]);
  useEffect(() => {
    setRevealed(
      revealedEvents?.reduce((acc, e) => {
        acc.set(e.args[1], {
          revealer: e.args[1],
          valid: e.args[2],
          rand: e.args[3],
        });
        return acc;
      }, new Map<string, Reveal>()),
    );
  }, [revealedEvents]);

  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "EnterRoom",
    listener: (_roomNo, entrar) => {
      if (_roomNo.toString() != roomNo) return;
      setParticipants(prev => Array.from(new Set([entrar, ...prev])));
      triggerMyRooms(prev => !prev);
    },
  });
  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "Revealed",
    listener: (_roomNo, revealer, valid, randomNumber) => {
      if (_roomNo.toString() != roomNo) return;
      setRevealed(prev => {
        prev.set(revealer, {
          revealer: revealer,
          valid: valid,
          rand: randomNumber.toString(),
        });
        return prev;
      });
    },
  });

  // console.log(`@@@@@@@@@@@@ activeRoom: ${roomNo}`);
  // console.log(`creator: ${creatorAddress}`);
  // console.log(`fee: ${roomFee.toString()}`);
  // console.log(`capacity: ${capacity}`);
  // console.log(`participants: ${Array.from(participants)}`);
  // console.log(`revealed count: ${Array.from((revealed || new Map()).keys()).length}`);
  // console.log("@@@@@@@@@@@@");

  //////////////////////////////////////////
  /*********** Button Management **********/
  //////////////////////////////////////////
  const [disableAfterSuccess, setDisableAfterSuccess] = useState(false);
  let buttonText = "";
  let userJoinedRoom = false;
  if (!isLoading)
    if (currentAccount)
      if (participants.includes(currentAccount)) {
        buttonText = "JOINED";
        userJoinedRoom = true;
      } else buttonText = "JOIN";

  const isRoomFull = Array.from(participants).length == capacity;

  return (
    <div
      className={`flex overflow-hidden h-20 px-3 rounded-3xl bg-gradient-to-r from-purple-500 to-green-600 ${
        userJoinedRoom ? "opacity-40" : "opacity-90"
      } border-primary`}
    >
      <div className="flex items-center space-x-3 ">
        <button
          className={`bg-orange-100 btn btn-sm ${isLoading ? "loading" : ""} bg`}
          disabled={writeDisabled || isLoading || userJoinedRoom || isRoomFull || disableAfterSuccess}
          onClick={async () => {
            if (!joinRoom) return;
            try {
              await writeTxn(joinRoom());
              setDisableAfterSuccess(true);
              triggerMyRooms(prev => !prev);
              setRnd(Math.trunc(Math.random() * (Number.MAX_SAFE_INTEGER - 1)));
            } catch (e: any) {
              const message = getParsedEthersError(e);
              notification.error(message);
            }
          }}
        >
          {!isLoading &&
            (userJoinedRoom ? (
              <> JOINED </>
            ) : isRoomFull ? (
              <> FULL </>
            ) : disableAfterSuccess ? (
              <>JOINED</>
            ) : (
              <> JOIN </>
            ))}
        </button>

        <Address address={creatorAddress} disableAddressLink={true} />

        <span className="text-xl text-orange-100 text-center">
          {Array.from(participants).length} / {capacity} Participants
        </span>
        <div className="flex w-full justify-start">
          <span className="text-xl text-green-100 text-center">💸: {ethers.utils.formatEther(roomFee.toString())}</span>
        </div>
      </div>
    </div>
  );
};
