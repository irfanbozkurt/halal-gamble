import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { FunctionFragment } from "ethers/lib/utils.js";
import { useEffectOnce, useLocalStorage } from "usehooks-ts";
import { useAccount, useContractWrite, useNetwork } from "wagmi";
import {
  Address,
  generateHalalHash,
  getParsedContractFunctionArgs,
  getParsedEthersError,
} from "~~/components/scaffold-eth";
import {
  useScaffoldContractRead,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
  useTransactor,
} from "~~/hooks/scaffold-eth";
import { Reveal, TMyRoomProps } from "~~/types/halalTypes";
import { getTargetNetwork, notification, parseTxnValue } from "~~/utils/scaffold-eth";

export const MyRoom = ({
  contractAddress,
  abolishRoomFn,
  revealFn,
  triggerRevealExpiryFn,
  roomNo,
  creatorAddress,
  setMyRooms,
  roomFee,
  capacity,
}: TMyRoomProps) => {
  /* User Account */
  const { address: currentAccount } = useAccount();

  /////////////////////////////////////////////
  /*********** Get Participants ************/
  /////////////////////////////////////////////

  const { data: participants } = useScaffoldContractRead({
    contractName: "HalalGamble",
    functionName: "getParticipants",
    args: [ethers.BigNumber.from(roomNo)],
  });

  /////////////////////////////////////////////
  /*********** Handle Abolish Events ************/
  /////////////////////////////////////////////
  const [abolished, setAbolished] = useState<boolean>(false);
  const { data: abolishedEvents } = useScaffoldEventHistory({
    contractName: "HalalGamble",
    eventName: "RoomAbolished",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
    filters: {
      roomNo: ethers.BigNumber.from(roomNo),
    },
    blockData: false,
  });
  useEffect(() => {
    if (abolishedEvents && abolishedEvents.length > 0) setAbolished(true);
  }, [abolishedEvents]);
  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "RoomAbolished",
    listener: _roomNo => {
      if (_roomNo.toString() != roomNo) return;
      setAbolished(true);
    },
  });
  if (abolished) return <>ROOM ABOLISHED. REFRESH PAGE</>;

  //////////////////////////////////////////
  /*********** Handle reveal events ********/
  //////////////////////////////////////////
  const { data: revealedEvents } = useScaffoldEventHistory({
    contractName: "HalalGamble",
    eventName: "Revealed",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
    filters: {
      roomNo: ethers.BigNumber.from(roomNo),
    },
    blockData: false,
  });

  const [revealed, setRevealed] = useState<{ [i: string]: Reveal }>({});

  useEffect(() => {
    setRevealed(
      revealedEvents?.reduce((acc, e) => {
        acc[e.args[1]] = {
          revealer: e.args[1],
          valid: e.args[2],
          rand: e.args[3],
        };
        return acc;
      }, {}),
    );
  }, [revealedEvents]);

  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "Revealed",
    listener: (_roomNo, revealer, valid, randomNumber) => {
      if (_roomNo.toString() != roomNo) return;
      setRevealed(prev => {
        prev[revealer] = {
          revealer: revealer,
          valid: valid,
          rand: randomNumber.toString(),
        };
        return prev;
      });
    },
  });

  //////////////////////////////////////////
  /*********** Handle reveal  *************/
  //////////////////////////////////////////

  const rndLocalKey = currentAccount ? `${roomNo}_${currentAccount}` : "";
  const [rnd] = useLocalStorage<number>(rndLocalKey, 0);

  // console.log("@@@@@@@@@@@@ myRoom");
  // console.log("rnd: " + rnd);
  // console.log(`roomNo: ${roomNo}`);
  // console.log(`creator: ${creatorAddress}`);
  // console.log(`fee: ${roomFee.toString()}`);
  // console.log(`capacity: ${capacity}`);
  // console.log(`participants: ${participants}`);

  /* set form */
  // const [form] = useState<Record<string, any>>(() => {
  //   return {
  //     roomNo: roomNo,
  //     hashRndNumber: currentAccount && generateHalalHash(currentAccount, rnd),
  //   } as Record<string, any>;
  // });
  // const [txValue] = useState<string | BigNumber>(roomFee);
  // const { chain } = useNetwork();
  // const writeTxn = useTransactor();
  // const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  // const { isLoading, writeAsync: joinRoom } = useContractWrite({
  //   address: contractAddress,
  //   functionName: joinRoomFn && joinRoomFn.name,
  //   abi: joinRoomFn && [joinRoomFn],
  //   args: getParsedContractFunctionArgs(form),
  //   mode: "recklesslyUnprepared",
  //   overrides: {
  //     value: typeof txValue === "string" ? parseTxnValue(txValue) : txValue,
  //   },
  // });

  return (
    <div
      className={`flex overflow-hidden h-20 px-3 rounded-3xl bg-gradient-to-r to-violet-500 from-fuchsia-500 border-primary`}
    >
      {/* <button
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
        </button> */}

      <span className="text-xl text-orange-100 text-center">
        @@@ {revealed && Array.from(Object.keys(revealed)).length} @@@@
      </span>
      <div className="flex w-full justify-start"></div>
    </div>
  );
};
