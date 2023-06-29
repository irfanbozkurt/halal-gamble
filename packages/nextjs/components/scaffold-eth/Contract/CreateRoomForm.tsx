import { useEffect, useState } from "react";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";
import { FunctionFragment, ParamType } from "ethers/lib/utils";
import { useLocalStorage } from "usehooks-ts";
import { useAccount, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import {
  ContractInput,
  generateHalalHash,
  getFunctionInputKey,
  getParsedContractFunctionArgs,
  getParsedEthersError,
} from "~~/components/scaffold-eth";
import { useScaffoldContractRead, useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification, parseTxnValue } from "~~/utils/scaffold-eth";

const getInitialFormState = (createRoomFn: FunctionFragment) =>
  createRoomFn.inputs.reduce((acc, input, inputIndex) => {
    acc[getFunctionInputKey(createRoomFn, input, inputIndex)] = "";
    return acc;
  }, {} as Record<string, any>);

type TCreateRoomFormProps = {
  createRoomFn: FunctionFragment;
  contractAddress: string;
};

export const CreateRoomForm = ({ createRoomFn, contractAddress }: TCreateRoomFormProps) => {
  /* User Account */
  const { address: currentAccount } = useAccount();

  /////////////////////////////////////////////
  /*********** Get next room no ***************/
  /////////////////////////////////////////////
  // Because we'll store the generated random number in local storage,
  // and we'll use 'roomNo' in the storage key.
  const { data: roomNoBignum } = useScaffoldContractRead({
    contractName: "HalalGamble",
    functionName: "roomCount",
  });
  const roomNo = roomNoBignum?.toString();

  /////////////////////////////////////////////
  /*********** Create room tx prepare **********/
  /////////////////////////////////////////////
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(createRoomFn));
  const [txValue, setTxValue] = useState<string | BigNumber>("");
  const { chain } = useNetwork();
  const writeTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  /* useContractWrite */
  const {
    data: result,
    isLoading,
    writeAsync: createRoom,
  } = useContractWrite({
    address: contractAddress,
    functionName: createRoomFn.name,
    abi: [createRoomFn],
    args: getParsedContractFunctionArgs(form),
    mode: "recklesslyUnprepared",
    overrides: {
      value: typeof txValue === "string" ? parseTxnValue(txValue) : txValue,
    },
  });
  const [, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransaction({
    hash: result?.hash,
  });
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

  /////////////////////////////////////////////
  /****************** RND ********************/
  /////////////////////////////////////////////

  useEffect(() => {
    if (!roomNo) {
      console.log(`RETURNING FROM useEffect BECAUSE roomNo is ${roomNo}`);
      return;
    }

    const rndLocalKey = currentAccount ? `${roomNo}_${currentAccount}` : "";
    const fromStorage = localStorage.getItem(rndLocalKey);
    if (fromStorage) {
      console.log(`RANDOM NUMBER FOUND IN STORAGE FOR GIVEN ROOMNO AND ACCOUNT: ${fromStorage}`);

      setForm(prev => {
        const hashRndNumberInputAndIndex = createRoomFn.inputs
          .map((inp, idx) => [inp.name == "hashRndNumber" ? inp : undefined, idx])
          .filter(([inp]) => inp)[0];
        prev[
          getFunctionInputKey(
            createRoomFn,
            hashRndNumberInputAndIndex[0] as ParamType,
            hashRndNumberInputAndIndex[1] as number,
          )
        ] = generateHalalHash(parseInt(fromStorage), currentAccount!, roomNo);
        return prev;
      });
    } else {
      const newRandStr = Math.trunc(Math.random() * (Number.MAX_SAFE_INTEGER - 1)).toString();
      const newRand = parseInt(newRandStr);

      console.log(`COULD NOT FIND RANDOM NUMBER IN STORAGE FOR GIVEN KEY. PUTTING: ${newRandStr}`);

      localStorage.setItem(rndLocalKey, newRandStr);
      setForm(prev => {
        const hashRndNumberInputAndIndex = createRoomFn.inputs
          .map((inp, idx) => [inp.name == "hashRndNumber" ? inp : undefined, idx])
          .filter(([inp]) => inp)[0];
        prev[
          getFunctionInputKey(
            createRoomFn,
            hashRndNumberInputAndIndex[0] as ParamType,
            hashRndNumberInputAndIndex[1] as number,
          )
        ] = generateHalalHash(newRand, currentAccount!, roomNo);
        return prev;
      });
    }
  }, [roomNo, currentAccount]);

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
  const inputs = createRoomFn.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(createRoomFn, input, inputIndex);
    return (
      <ContractInput
        key={key}
        disabled={key.includes("hashRndNumber")}
        setForm={updatedFormValue => {
          setDisplayedTxResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        className="font-bai-jamjuree w-full bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border-primary text-lg sm:text-2xl placeholder-black text-black"
        stateObjectKey={key}
        paramType={input}
      />
    );
  });
  const zeroInputs = inputs.length === 0 && !createRoomFn.payable;

  // Handle tx value respecting roomFee
  const feeKey = Object.keys(form).find(k => k.includes("roomFee"));
  const givenFee = feeKey && form[feeKey];
  if (txValue != givenFee) setTxValue(givenFee);

  return (
    <div className="max-w-screen-sm w-5/6 flex flex-col mt-6 px-7 py-3 opacity-80 rounded-3xl shadow-lg border-2 border-primary">
      <div className={`flex ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <span className="text-3xl sm:text-6xl text-orange-100">create a room_</span>

        {/* Function inputs */}
        <div className="mt-8 flex flex-col sm:flex-col gap-2 sm:gap-5">{inputs}</div>

        {/* Send button */}
        <div className="flex justify-between mt-4 gap-2">
          <button
            className={`bg-orange-100 w-3/5 btn btn-sm ${isLoading ? "loading" : ""} bg`}
            disabled={writeDisabled || isLoading}
            onClick={async () => {
              if (!createRoom) return;
              try {
                console.log("~~~~~ SENDING createRoom TX WITH following form:");
                console.log(form);
                await writeTxn(createRoom());
              } catch (e: any) {
                const message = getParsedEthersError(e);
                notification.error(message);
              }
            }}
          >
            {!isLoading && <> Send </>}
          </button>
        </div>
      </div>
    </div>
  );
};
