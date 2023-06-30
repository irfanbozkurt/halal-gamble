import { SetStateAction } from "react";
import { FunctionFragment } from "ethers/lib/utils.js";
import { ActiveRoom } from "~~/components/ActiveRoom";
import { TActiveRoomProps, TMyCandidateRoom } from "~~/types/halalTypes";

type TRoomListProps = {
  rooms: TActiveRoomProps[];
  contractAddress: string;
  joinRoomFn: FunctionFragment;
  triggerMyRooms: (value: SetStateAction<boolean>) => void;
};

export const ActiveRoomList = ({ triggerMyRooms, rooms, joinRoomFn, contractAddress }: TRoomListProps) => {
  rooms.sort((a, b) => {
    if (+a.roomNo > +b.roomNo) return -1;
    if (+a.roomNo < +b.roomNo) return 1;
    return 0;
  });
  return (
    <div className="w-full max-w-3xl flex flex-col overflow-hidden h-96 px-4 pt-3 opacity-80 rounded-3xl shadow-lg border-2 border-primary bg-gradient-to-l from-purple-800 to-green-800">
      <span className="text-6xl text-orange-100 pb-3">all active rooms</span>
      {(!rooms || rooms.length == 0) && <span className="text-4xl pt-10 text-red-200">no active room</span>}
      {rooms && rooms.length > 0 && (
        <ul className="flex flex-col h-full overflow-y-auto shadow-lg border-secondary px-2 py-2 rounded-3xl bg-blue-200 bg-opacity-10 ">
          {rooms.map((room, idx) => (
            <li className="pb-1" key={idx}>
              <ActiveRoom
                key={idx}
                triggerMyRooms={triggerMyRooms}
                joinRoomFn={joinRoomFn}
                contractAddress={contractAddress}
                roomNo={room.roomNo}
                creatorAddress={room.creatorAddress}
                roomFee={room.roomFee}
                capacity={room.capacity}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
