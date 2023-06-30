import { useEffect, useMemo, useState } from "react";
import { Abi } from "abitype";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useAccount, useContract, useProvider } from "wagmi";
import { ActiveRoomList } from "~~/components/ActiveRoomList";
import { MetaHeader } from "~~/components/MetaHeader";
import { MyRoom } from "~~/components/MyRoom";
import { MyPastRoom } from "~~/components/PastRoom";
import { getAllContractFunctions } from "~~/components/scaffold-eth";
import { CreateRoomForm } from "~~/components/scaffold-eth/Contract/CreateRoomForm";
import {
  useAccountBalance,
  useDeployedContractInfo,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";
import { TActiveRoomProps, TEndedRoomProps, TMyCandidateRoom, TRoomProps } from "~~/types/halalTypes";
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
  const [activeRooms, setActiveRooms] = useState<TActiveRoomProps[]>([]);
  const [, setFetchTrigger] = useState(false);

  useEffect(() => {
    setAllRooms(
      roomCreatedEvents?.map(e => {
        return {
          roomNo: e.args[0].toString(),
          creatorAddress: e.args[1],
          roomFee: e.args[2],
          capacity: e.args[3],
        } as TActiveRoomProps;
      }) as TActiveRoomProps[],
    );
  }, [roomCreatedEvents, roomAbolishedEvents]);

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
        };
      }) as TEndedRoomProps[],
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
        .reverse() as TActiveRoomProps[],
    );
  }, [allRooms, abolishedRoomIds, endedRooms]);

  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "RoomCreated",
    listener: (roomNo, creator, roomFee, capacity) => {
      setAllRooms(prev => {
        const newRoomNo = roomNo.toString();
        if (!prev) prev = [];
        if (prev.some(e => e.roomNo == newRoomNo)) return prev;

        const newRoom = {
          roomNo: newRoomNo,
          creatorAddress: creator,
          participants: [creator],
          roomFee: roomFee.toString(),
          capacity: capacity,
        } as TActiveRoomProps;
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
      setAllRooms(prev => {
        return prev.filter(room => room.roomNo != roomNo.toString());
      });
    },
  });
  useScaffoldEventSubscriber({
    contractName: "HalalGamble",
    eventName: "RoomEnded",
    listener: (roomNo, winner, prize) => {
      setEndedRooms(prev => {
        const endedRoomNo = roomNo.toString();
        if (!prev) prev = [];
        if (prev.some(e => e.roomNo == endedRoomNo)) return prev;

        const endedRoom = {
          roomNo: endedRoomNo,
          winner: winner,
          prize: prize.toString(),
        } as TEndedRoomProps;
        return [endedRoom, ...prev];
      });
    },
  });

  //////////////////////////////////////////
  /*********** My Rooms (in play) *********/
  //////////////////////////////////////////

  const [myRooms, setMyRooms] = useState<TMyCandidateRoom[]>([]);
  const [myRoomTrigger, triggerMyRooms] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      if (!contract) return;
      const tempContr = contract.attach(contract.address);

      const participatedRoomNos = (
        await Promise.all(
          activeRooms.map(async room => {
            const isActiveParticipant = await (
              tempContr.callStatic as { isActiveParticipant: any }
            ).isActiveParticipant(room.roomNo, currentAccount);
            return isActiveParticipant ? room.roomNo : undefined;
          }),
        )
      ).filter(room => room != undefined);

      const saturatedRoomNos = new Set(
        (
          await Promise.all(
            participatedRoomNos.map(async roomNo => {
              if (!roomNo) return;
              const participantCount = parseInt(
                await (tempContr.callStatic as { getCurrentParticipantCount: any }).getCurrentParticipantCount(roomNo),
              );
              return participantCount == activeRooms.find(room => room.roomNo == roomNo)?.capacity ? roomNo : undefined;
            }),
          )
        ).filter(room => room != undefined),
      );

      setMyRooms(activeRooms.filter(room => saturatedRoomNos.has(room.roomNo)).map(room => room as TMyCandidateRoom));
    };
    run();
  }, [currentAccount, activeRooms, myRoomTrigger]);

  //////////////////////////////////////////
  /************ My Past Rooms *************/
  //////////////////////////////////////////
  const [myPastRooms, setMyPastRooms] = useState<TEndedRoomProps[]>([]);
  const [myPastRoomsTrigger, setMyPastRoomsTrigger] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      if (!contract) return;
      const tempContr = contract.attach(contract.address);

      const myPastRoomNos = new Set<string>(
        (
          await Promise.all(
            (endedRooms || []).map(async room => {
              const isParticipant = await (tempContr.callStatic as { isParticipant: any }).isParticipant(
                room.roomNo,
                currentAccount,
              );
              return isParticipant ? room.roomNo : undefined;
            }),
          )
        ).filter(room => room != undefined) as string[],
      );

      setMyPastRooms((endedRooms || []).filter(room => myPastRoomNos.has(room.roomNo)) as TEndedRoomProps[]);
    };
    run();
  }, [currentAccount, roomEndedEvents, endedRooms, myPastRoomsTrigger]);

  return (
    <>
      <MetaHeader />
      {/* We are importing the font this way to lighten the size of SE2. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />

      <div className="flex flex-col w-full items-center">
        {!contract && <span className="text-6xl text-orange-100 opacity-10 pt-24 pb-3">no deployment found</span>}
        {contract && (
          <>
            <div className="flex w-full">
              <div className="flex items-center flex-col pt-5 w-1/2">
                {currentAccount && (
                  <CreateRoomForm
                    createRoomFn={contractFunctions.find(f => f.name == "createRoom")!}
                    contractAddress={contract.address}
                  />
                )}
                {!currentAccount && (
                  <span className="text-6xl text-orange-100 text-center py-10">Connect to create rooms</span>
                )}
              </div>

              <div className="flex items-center flex-col pt-10 mx-10 w-1/2">
                <ActiveRoomList
                  triggerMyRooms={triggerMyRooms}
                  joinRoomFn={contractFunctions.find(f => f.name == "joinRoom")!}
                  rooms={activeRooms}
                  contractAddress={contract.address}
                />
              </div>
            </div>

            <hr className="w-11/12 my-10 h-0.5 bg-neutral-800 opacity-10" />

            <div className="w-full flex flex-col items-center">
              <span className="text-6xl text-orange-100 text-center pb-10">my live rooms</span>
              <div className="flex flex-col w-3/4 gap-2 w-11/12">
                {myRooms.map(
                  room =>
                    currentAccount && (
                      <MyRoom
                        setFetchTrigger={setFetchTrigger}
                        key={room.roomNo}
                        contractAddress={contract.address}
                        getValidRevealersFn={contractFunctions.find(f => f.name == "getValidRevealers")!}
                        getCurrentXorFn={contractFunctions.find(f => f.name == "getCurrentXor")!}
                        roomNo={room.roomNo}
                        creatorAddress={room.creatorAddress}
                        roomFee={room.roomFee}
                        capacity={room.capacity}
                      />
                    ),
                )}
              </div>
            </div>

            <hr className="w-11/12 my-10 h-0.5 bg-neutral-800 opacity-10" />

            <div className="w-full flex flex-col items-center pb-20">
              <span className="text-6xl text-orange-100 text-center pb-10">my past rooms</span>
              <div className="flex flex-col w-3/4 gap-2 w-11/12">
                {myPastRooms.map(room => currentAccount && <MyPastRoom roomNo={room.roomNo} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Rooms;
