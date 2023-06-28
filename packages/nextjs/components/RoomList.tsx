import React from "react";
import { FunctionFragment } from "ethers/lib/utils.js";
import { ActiveRoom, TRoomProps } from "~~/components/ActiveRoom";

type TRoomListProps = {
  rooms: TRoomProps[];
  contractAddress: string;
  joinRoomFn: FunctionFragment;
};

export const RoomList = ({ rooms, joinRoomFn, contractAddress }: TRoomListProps) => {
  rooms.sort((a, b) => {
    if (+a.roomNo > +b.roomNo) return -1;
    if (+a.roomNo < +b.roomNo) return 1;
    return 0;
  });
  return (
    <div className="w-full max-w-3xl flex flex-col overflow-hidden h-96 px-4 pt-3 opacity-80 rounded-3xl shadow-lg border-2 border-primary bg-gradient-to-l from-purple-800 to-green-800">
      <span className="text-6xl text-orange-100 pb-3">active rooms</span>
      <ul className="flex flex-col overflow-y-auto shadow-lg border-secondary px-2 py-2 rounded-3xl bg-blue-200 bg-opacity-10 ">
        {rooms.map((room, idx) => (
          <li className="pb-1" key={idx}>
            <ActiveRoom
              joinRoomFn={joinRoomFn}
              contractAddres={contractAddress}
              roomNo={room.roomNo}
              creatorAddress={room.creatorAddress}
              roomFee={room.roomFee}
              capacity={room.capacity}
              winner={room.winner}
              prize={room.prize}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
