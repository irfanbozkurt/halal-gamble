import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const MyPastRoom = ({ roomNo }: { roomNo: string }) => {
  /* User Account */
  const { address: currentAccount } = useAccount();

  /////////////////////////////////////////////
  /*********** Read Room Data ************/
  /////////////////////////////////////////////

  const { data: roomData } = useScaffoldContractRead({
    contractName: "HalalGamble",
    functionName: "rooms",
    args: [ethers.BigNumber.from(roomNo)],
  }) as Object as {
    data: {
      startTime: any;
      endTime: any;
      createdBy: any;
      winner: any;
      capacity: any;
      prize: any;
    };
  };

  if (!roomData) return null;

  const createdBy = <Address address={roomData.createdBy} size="lg" />;
  const capacity = parseInt(roomData.capacity);

  const startTime = new Date(parseInt(roomData.startTime) * 1000).toLocaleString();
  const endTime = roomData.endTime ? new Date(parseInt(roomData.endTime) * 1000).toLocaleString() : "";

  const winner =
    roomData.winner != currentAccount ? (
      <Address address={roomData.winner} size="lg" />
    ) : (
      <span className="text-3xl text-center">YOU</span>
    );
  const prize = roomData.prize;

  return (
    <div
      className={`flex flex-col overflow-hidden justify-around items-center overflow-hidden h-48 px-3 rounded-3xl ${
        roomData.winner == currentAccount ? "bg-lime-300 bg-opacity-30" : "bg-red-400 bg-opacity-30"
      } text-blue-200`}
    >
      <div className="w-full flex justify-between">
        <span className="text-3xl text-center">_room {roomNo}</span>
        <div className="flex gap-2">
          <span className="text-3xl text-center">by</span>
          {createdBy}
        </div>
        <span className="text-3xl text-center">capacity: {capacity}</span>
      </div>

      <hr className="w-11/12 bg-neutral-800 opacity-10" />

      <div className="w-full flex items-center justify-around">
        <div className="flex gap-5">
          <span className="text-3xl text-center">🕒</span>
          <span className="text-2xl text-center">{startTime}</span>
        </div>

        <span className="text-3xl text-center"> {"< --- >"} </span>

        <div className="flex gap-5">
          <span className="text-2xl text-center">{endTime}</span>
          <span className="text-3xl text-center">🕒</span>
        </div>
      </div>

      <hr className="w-11/12 bg-neutral-800 opacity-10" />

      <div className="w-full flex items-start justify-around">
        <div className="flex gap-5">
          <span className="text-3xl text-center">👑</span>
          {winner}
          <span className="text-3xl text-center">👑</span>
        </div>

        <div className="flex gap-5">
          <span className="text-3xl text-center">💸</span>

          <span className="text-3xl text-center">{ethers.utils.formatEther(prize)}</span>
          <span className="text-3xl text-center">💸</span>
        </div>
      </div>

      <div className="w-full"></div>
    </div>
  );
};
