import { useMemo } from "react";
import { Abi } from "abitype";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import type { NextPage } from "next";
import { useAccount, useContract, useProvider } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import {
  getAllContractFunctions,
  getContractReadOnlyMethodsWithParams,
  getContractWriteMethods,
} from "~~/components/scaffold-eth";
import { CreateRoomForm } from "~~/components/scaffold-eth/Contract/CreateRoomForm";
import { useAccountBalance, useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

const Home: NextPage = () => {
  const provider = useProvider();

  const { address: currentAccount } = useAccount();
  const { balance } = useAccountBalance(currentAccount);

  /* Contract data management */
  const contractName = getContractNames()[0];
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const contract = useContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    signerOrProvider: provider,
  });
  const contractFunctions = useMemo(() => getAllContractFunctions(contract), [contract]);

  const contractMethodsDisplay = useMemo(
    () => getContractReadOnlyMethodsWithParams(contract, contractFunctions),
    [contract, contractFunctions],
  );
  const contractWriteMethods = useMemo(
    () => getContractWriteMethods(contract, contractFunctions, () => {}),
    [contract, contractFunctions],
  );

  console.log(contractFunctions);
  console.log(contractMethodsDisplay);
  console.log(contractWriteMethods);

  return (
    <>
      <MetaHeader />

      {balance && (
        <div className="flex flex-col w-full justify-center items-center pb-10">
          {contract && (
            <div className="flex items-center flex-col flex-grow p-10 w-full">
              <CreateRoomForm
                functionFragment={contractFunctions.find(f => f.name == "createRoom")!}
                contractAddress={contract.address}
              />
            </div>
          )}

          <div className="flex flex-row space-x-4 justify-center w-3/4 pb-3 ">
            {balance >= 0.008 ? (
              <button
                type="button"
                onClick={async e => {
                  e.preventDefault();

                  // await contractFuncs.buyTicket(1);
                }}
                className={`bg-transparent hover:bg-green-900 font-bold border-2 border-green-400 p-3 flex-auto rounded-xl h-15`}
              >
                <p className={`text-green-200 text-lg`}>Enter Full for {0.008} Ether</p>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className={`:disabled bg-transparent hover:bg-red-900 font-bold border-2 border-red-200 p-3 flex-auto rounded-xl h-15`}
              >
                <p className={`text-red-200 text-lg`}>
                  Deposit{" "}
                  {formatEther(parseEther("0.008").sub(parseEther(balance ? balance.toString() : "0"))).toString()} for
                  Full
                </p>
              </button>
            )}

            {balance >= 0.004 ? (
              <button
                type="button"
                onClick={async e => {
                  e.preventDefault();
                  // await contractFuncs.buyTicket(2);
                }}
                className={`bg-transparent hover:bg-green-900 font-bold border-2 border-green-400 p-3 flex-auto rounded-xl h-15`}
              >
                <p className={`text-green-200 text-lg`}>Enter Half for {0.004} Ether</p>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className={`bg-transparent hover:bg-red-900 font-bold border-2 border-red-200 p-3 flex-auto rounded-xl h-15`}
              >
                <p className={`text-red-200 text-lg`}>
                  Deposit{" "}
                  {formatEther(parseEther("0.004").sub(parseEther(balance ? balance.toString() : "0"))).toString()} for
                  Half
                </p>
              </button>
            )}

            {balance >= 0.002 ? (
              <button
                type="button"
                onClick={async e => {
                  e.preventDefault();
                  // await contractFuncs.buyTicket(3);
                }}
                className={`bg-transparent hover:bg-green-900 font-bold border-2 border-green-400 p-3 flex-auto rounded-xl h-15`}
              >
                <p className={`text-green-200 text-lg`}>Enter Quarter for {0.002} Ether</p>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className={`bg-transparent hover:bg-red-900 font-bold border-2 border-red-200 p-3 flex-auto rounded-xl h-15`}
              >
                <p className={`text-red-200 text-lg`}>
                  Deposit{" "}
                  {formatEther(parseEther("0.002").sub(parseEther(balance ? balance.toString() : "0"))).toString()} for
                  Quarter
                </p>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
