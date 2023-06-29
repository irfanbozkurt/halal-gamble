import { Dispatch, SetStateAction } from "react";
import { FunctionFragment } from "ethers/lib/utils.js";

export type TRoomProps = {
  roomNo: string;
  creatorAddress?: string;
  roomFee: string;
  capacity: number;
};

export type TActiveRoomProps = TRoomProps & {
  participants?: string[];
  contractAddress?: string;
  joinRoomFn: FunctionFragment;
  triggerMyRooms: (value: SetStateAction<boolean>) => void;
};

export type TMyCandidateRoom = TRoomProps & {
  contractAddress: string;
  participants: string[];
};

export type TMyRoomProps = TRoomProps & {
  setMyRooms: Dispatch<SetStateAction<TMyCandidateRoom[]>>;
  contractAddress: string;
  getValidRevealersFn: FunctionFragment;
  abolishRoomFn: FunctionFragment;
  getCurrentXorFn: FunctionFragment;
};

export type Reveal = {
  revealer: string;
  valid: boolean;
  rand: string;
};

export type TEndedRoomProps = TRoomProps & {
  contractAddress?: string;
  winner: string;
  prize: string;
};
