import { useEffect, useRef, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { FunctionFragment } from "ethers/lib/utils.js";
import { useAccount, useContractWrite, useNetwork } from "wagmi";
import {
  Address,
  generateHalalHash,
  getParsedContractFunctionArgs,
  getParsedEthersError,
} from "~~/components/scaffold-eth";
import { useScaffoldEventHistory, useScaffoldEventSubscriber, useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification, parseTxnValue } from "~~/utils/scaffold-eth";

export type TRoomProps = {
  roomNo: string;
  creatorAddress: string;
  roomFee: string;
  capacity: number;
  winner?: string;
  prize?: string;
  contractAddres?: string;
  joinRoomFn?: FunctionFragment;
};

type Reveal = {
  revealer: string;
  valid: boolean;
  rand: string;
};

export const ActiveRoom = ({
  contractAddres,
  joinRoomFn,
  roomNo,
  creatorAddress,
  roomFee,
  capacity,
  winner,
  prize,
}: TRoomProps) => {
  /* User Account */
  const { address: currentAccount } = useAccount();

  /* RND */
  const rnd = useRef(Math.trunc(Math.random() * (Number.MAX_SAFE_INTEGER - 1)));

  /////////////////////////////////////////////
  /*********** Join Room Logic ***************/
  /////////////////////////////////////////////
  /* set form */
  const [form] = useState<Record<string, any>>(() => {
    return {
      roomNo: roomNo,
      hashRndNumber: currentAccount && generateHalalHash(currentAccount, rnd.current),
    } as Record<string, any>;
  });
  const [txValue] = useState<string | BigNumber>(roomFee);
  const { chain } = useNetwork();
  const writeTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  const { isLoading, writeAsync: joinRoom } = useContractWrite({
    address: contractAddres,
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
    listener: (roomNo, entrar) => {
      setParticipants(prev => Array.from(new Set([entrar, ...prev])));
    },
  });
  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "Revealed",
    listener: (roomNo, revealer, valid, randomNumber) => {
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

  // console.log(`@@@@@@@@@@@@ roomNo: ${roomNo}`);
  // console.log(`creator: ${creatorAddress}`);
  // console.log(`fee: ${roomFee.toString()}`);
  // console.log(`capacity: ${capacity}`);
  // console.log(`participants: ${Array.from(participants)}`);
  // console.log(`revealed count: ${Array.from((revealed || new Map()).keys()).length}`);
  // console.log("@@@@@@@@@@@@");

  //////////////////////////////////////////
  /*********** Button Management **********/
  //////////////////////////////////////////
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
          disabled={writeDisabled || isLoading || userJoinedRoom || isRoomFull}
          onClick={async () => {
            if (!joinRoom) return;
            try {
              await writeTxn(joinRoom());
            } catch (e: any) {
              const message = getParsedEthersError(e);
              notification.error(message);
            }
          }}
        >
          {!isLoading && (userJoinedRoom ? <> JOINED </> : isRoomFull ? <> FULL </> : <> JOIN </>)}
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
