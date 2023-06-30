import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useLocalStorage } from "usehooks-ts";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import { Address, Balance, getParsedEthersError } from "~~/components/scaffold-eth";
import {
  useScaffoldContractRead,
  useScaffoldContractWrite,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";
import { Reveal, TMyRoomProps } from "~~/types/halalTypes";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

export const MyRoom = ({
  contractAddress,
  getValidRevealersFn,
  abolishRoomFn,
  getCurrentXorFn,
  roomNo,
  setMyRooms,
  roomFee,
  capacity,
}: TMyRoomProps) => {
  /* User Account */
  const { address: currentAccount } = useAccount();

  /////////////////////////////////////////////
  /*********** Read Room Data ************/
  /////////////////////////////////////////////

  const { data: participantCount } = useScaffoldContractRead({
    contractName: "HalalGamble",
    functionName: "getCurrentParticipantCount",
    args: [ethers.BigNumber.from(roomNo)],
  }) as { data: ethers.BigNumber };

  ///////////////////////////////////////////
  /*********** Handle reveal events ********/
  ///////////////////////////////////////////
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

  const revealedCount = revealed ? Object.keys(revealed).length : 0;
  const validRevealCount = revealed
    ? Object.keys(revealed).reduce((acc, revealer) => {
        if (revealed[revealer].valid == true) return acc + 1;
        return acc;
      }, 0)
    : 0;
  const invalidRevealCount = revealedCount - validRevealCount;

  const { data: validRevealers, refetch: fetchValidRevealers } = useContractRead({
    chainId: getTargetNetwork().id,
    address: contractAddress,
    abi: [getValidRevealersFn],
    functionName: getValidRevealersFn.name,
    args: [roomNo],
    onError: error => {
      notification.error(error.message);
    },
  }) as { data: string[]; refetch: any };
  useEffect(() => {
    fetchValidRevealers();
  }, [validRevealCount, invalidRevealCount]);

  ///////////////////////////////////////////
  /*********** Read Latest XOR *************/
  ///////////////////////////////////////////
  const { data: xor, refetch: fetchXor } = useContractRead({
    chainId: getTargetNetwork().id,
    address: contractAddress,
    abi: [getCurrentXorFn],
    functionName: getCurrentXorFn.name,
    args: [roomNo],
    onError: error => {
      notification.error(error.message);
    },
  }) as { data: string[]; refetch: any };
  useEffect(() => {
    fetchXor();
  }, [validRevealCount, invalidRevealCount]);

  ///////////////////////////////////////////
  /******* Calculate current winner ********/
  ///////////////////////////////////////////

  const determineWinnerForCurrentStatusQuo = () => {
    if (!validRevealers || validRevealers.length == 0 || validRevealCount == 0) return "__distribute__fees";
    const winnerIndex = parseInt((BigInt((xor || 0).toString()) % BigInt(validRevealCount)).toString());
    return (
      <span>
        <Address address={validRevealers[winnerIndex]} />
      </span>
    );
  };
  const [currentWinner, setCurrentWinner] = useState<any>(determineWinnerForCurrentStatusQuo());
  useEffect(() => {
    setCurrentWinner(determineWinnerForCurrentStatusQuo());
  }, [validRevealCount]);

  ///////////////////////////////////////////
  /*********** Reveal tx handle ************/
  ///////////////////////////////////////////
  const rndLocalKey = currentAccount ? `${roomNo}_${currentAccount}` : "";
  const rnd = localStorage.getItem(rndLocalKey);

  const userRevelaedPreCheck = currentAccount && revealed ? Object.keys(revealed).includes(currentAccount) : false;
  const [userRevealed, setUserRevealed] = useState<boolean>(userRevelaedPreCheck);
  if (userRevelaedPreCheck != userRevealed) setUserRevealed(userRevelaedPreCheck);

  let { writeAsync: reveal, isLoading: revealLoading } = useScaffoldContractWrite({
    contractName: "HalalGamble",
    functionName: "reveal",
    args: [ethers.BigNumber.from(roomNo), ethers.BigNumber.from(rnd)],
    blockConfirmations: 0,
    onBlockConfirmation: () => {
      setUserRevealed(true);
    },
  });
  const { chain } = useNetwork();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  return (
    <div
      className={`min-w-fit flex flex-col overflow-hidden justify-around overflow-hidden h-48 px-3 rounded-3xl shadow-lg bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-800`}
    >
      <div className="w-full flex justify-between pt-2">
        <span className="text-xl text-orange-100 text-center">_room {roomNo}</span>

        <span className="text-xl text-orange-100 text-center">capacity: {capacity}</span>

        {participantCount && (
          <span className="text-xl text-orange-100 text-center">
            💸 {ethers.utils.formatEther(participantCount.mul(ethers.BigNumber.from(roomFee)).toString())} 💸
          </span>
        )}
      </div>
      <hr className="w-11/12 bg-neutral-800 opacity-10" />
      <div className="w-11/12 flex justify-around pt-2">
        <span className="text-xl text-orange-100">valid reveals: {validRevealCount}</span>
        <span className="text-xl text-orange-100">invalid reveals: {invalidRevealCount}</span>
      </div>
      <div className="w-full flex flex-col justify-around pt-2">
        <span className="text-xl text-orange-100 text-center">_current_xor_: {(xor || 0).toString()}</span>
        <div className="flex justify-center gap-5">
          <span className="text-xl text-orange-100 text-center">current 👑:</span>
          <div>{determineWinnerForCurrentStatusQuo()}</div>
        </div>
      </div>
      <div className="w-full flex justify-between pt-2">
        <span className="text-3xl text-orange-100">{rnd || "! rnd LOST !"}</span>
        <button
          className={`btn-sm ml-2`} // Modified (Removed "mr-10")
          disabled={writeDisabled || userRevealed || revealLoading}
          onClick={async () => {
            if (!reveal) return;
            try {
              await reveal();
            } catch (e: any) {
              const message = getParsedEthersError(e);
              notification.error(message);
            }
          }}
        >
          <span
            className={`text-3xl ${
              userRevealed ? "text-sky-100" : "text-orange-300 hover:text-lime-800 active:text-white"
            }`}
          >
            {!revealLoading && !writeDisabled && (userRevealed ? <> REVEALED </> : <> REVEAL </>)}
          </span>
        </button>
      </div>
      <div className="w-full"></div> {/* Added an empty div to maintain the positioning */}
    </div>
  );
};
