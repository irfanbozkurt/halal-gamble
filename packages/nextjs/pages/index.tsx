import { useEffect, useMemo, useState } from "react";
import { Abi } from "abitype";
import type { NextPage } from "next";
import { useAccount, useContract, useProvider } from "wagmi";
import { TRoomProps } from "~~/components/ActiveRoom";
import { MetaHeader } from "~~/components/MetaHeader";
import { RoomList } from "~~/components/RoomList";
import { getAllContractFunctions } from "~~/components/scaffold-eth";
import { CreateRoomForm } from "~~/components/scaffold-eth/Contract/CreateRoomForm";
import {
  useAccountBalance,
  useDeployedContractInfo,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

const Rooms: NextPage = () => {
  const provider = useProvider();

  //////////////////////////////////////////////////
  /*********** User account and balance ***********/
  //////////////////////////////////////////////////
  const { address: currentAccount } = useAccount();
  const { balance } = useAccountBalance(currentAccount);

  //////////////////////////////////////////////////
  /*********** Contract data management ***********/
  //////////////////////////////////////////////////
  const contractName = getContractNames()[0];
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const contract = useContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    signerOrProvider: provider,
  });
  const contractFunctions = useMemo(() => getAllContractFunctions(contract), [contract]);

  //////////////////////////////////////////
  /*********** Room  Management ***********/
  //////////////////////////////////////////
  const { data: roomCreatedEvents } = useScaffoldEventHistory({
    contractName: "HalalGamble",
    eventName: "RoomCreated",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
    blockData: false,
  });
  const { data: roomAbolishedEvents } = useScaffoldEventHistory({
    contractName: "HalalGamble",
    eventName: "RoomAbolished",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
    blockData: false,
  });
  const { data: roomEndedEvents } = useScaffoldEventHistory({
    contractName: "HalalGamble",
    eventName: "RoomEnded",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
    blockData: false,
  });

  const [allRooms, setAllRooms] = useState<TRoomProps[]>([]);
  const [abolishedRoomIds, setAbolishedRoomIds] = useState<Set<string>>(new Set());
  const [endedRooms, setEndedRooms] = useState<TRoomProps[]>([]);
  const [activeRooms, setActiveRooms] = useState<TRoomProps[]>([]);

  useEffect(() => {
    setAllRooms(
      roomCreatedEvents?.map(e => {
        return {
          roomNo: e.args[0].toString(),
          creatorAddress: e.args[1],
          roomFee: e.args[2],
          capacity: e.args[3],
        } as TRoomProps;
      }) as TRoomProps[],
    );
  }, [roomCreatedEvents]);

  useEffect(() => {
    setAbolishedRoomIds(new Set(roomAbolishedEvents?.map(e => e.args[0].toString()) as string[]));
  }, [roomAbolishedEvents]);

  useEffect(() => {
    setEndedRooms(
      roomEndedEvents?.map(e => {
        return {
          roomNo: e.args[0].toString(),
          winner: e.args[1],
          prize: e.args[2],
        } as TRoomProps;
      }) as TRoomProps[],
    );
  }, [roomEndedEvents]);

  useEffect(() => {
    setActiveRooms(
      (allRooms || [])
        .filter(
          r =>
            (!abolishedRoomIds || !abolishedRoomIds.has(r.roomNo)) &&
            !(endedRooms || []).some(er => er.roomNo == r.roomNo),
        )
        .reverse() as TRoomProps[],
    );
  }, [allRooms, abolishedRoomIds, endedRooms]);

  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "RoomCreated",
    listener: (roomNo, creator, roomFee, capacity) => {
      setAllRooms(prev => {
        const newRoomNo = roomNo.toString();
        if (prev.some(e => e.roomNo == newRoomNo)) return prev;

        const newRoom = {
          roomNo: newRoomNo,
          creatorAddress: creator,
          roomFee: roomFee.toString(),
          capacity: capacity,
        } as TRoomProps;
        return [newRoom, ...prev];
      });
    },
  });
  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "RoomAbolished",
    listener: roomNo => {
      setAbolishedRoomIds(prev => {
        prev.add(roomNo.toString());
        return prev;
      });
    },
  });
  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "RoomEnded",
    listener: (roomNo, winner, prize) => {
      setEndedRooms(prev => {
        const endedRoomNo = roomNo.toString();
        if (prev.some(e => e.roomNo == endedRoomNo)) return prev;

        const endedRoom: TRoomProps = {
          roomNo: endedRoomNo,
          winner: winner,
          prize: prize.toString(),
        } as TRoomProps;
        return [endedRoom, ...prev];
      });
    },
  });

  return (
    <>
      <MetaHeader />
      {/* We are importing the font this way to lighten the size of SE2. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />

      {contract && (
        <div className="flex">
          <div className="flex items-center flex-col pt-5 w-1/2">
            <CreateRoomForm
              createRoomFn={contractFunctions.find(f => f.name == "createRoom")!}
              contractAddress={contract.address}
            />
          </div>

          <div className="flex items-center flex-col pt-10 mx-10 w-1/2">
            <RoomList
              joinRoomFn={contractFunctions.find(f => f.name == "joinRoom")!}
              rooms={activeRooms}
              contractAddress={contract.address}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Rooms;
