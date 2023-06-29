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
import { Reveal, TMyRoomProps, TRoomProps } from "~~/types/halalTypes";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

export const MyPastRoom = ({ roomNo, roomFee, capacity }: TRoomProps) => {
  /* User Account */
  const { address: currentAccount } = useAccount();

  /////////////////////////////////////////////
  /*********** Read Room Data ************/
  /////////////////////////////////////////////

  const { data: roomData } = useScaffoldContractRead({
    contractName: "HalalGamble",
    functionName: "rooms",
    args: [ethers.BigNumber.from(roomNo)],
  }) as { data: ethers.BigNumber };

  return (
    <div
      className={`min-w-fit flex flex-col overflow-hidden justify-around overflow-hidden h-48 px-3 rounded-3xl bg-violet-500 bg-opacity-10 border-primary`}
    >
      <div className="w-full flex justify-between pt-2">
        <div className="flex justify-start">
          <span className="text-xl text-orange-100 text-center">_room {roomNo}</span>
        </div>

        <div className="flex justify-start">
          <span className="text-xl text-orange-100 text-center">capacity: {capacity}</span>
        </div>
      </div>
      <div className="w-11/12 flex justify-around pt-2">
        <span className="text-xl text-orange-100">valid reveals:</span>
        <span className="text-xl text-orange-100">invalid reveals:</span>
      </div>
      <div className="w-full flex flex-col justify-around pt-2">
        <div className="flex justify-center gap-5">
          <span className="text-xl text-orange-100 text-center">winner:</span>
          <div>{}</div>
        </div>
      </div>
      <div className="w-full flex justify-between pt-2">
        <span className="text-3xl text-orange-100">your rnd:</span>
      </div>
    </div>
  );
};
