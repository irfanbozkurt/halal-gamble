import { useEffect, useRef, useState } from "react";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import { useAccount, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import {
  ContractInput,
  generateHalalHash,
  getFunctionInputKey,
  getParsedContractFunctionArgs,
  getParsedEthersError,
} from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification, parseTxnValue } from "~~/utils/scaffold-eth";

const getInitialFormState = (createRoomFn: FunctionFragment, account?: string, rnd?: number) =>
  createRoomFn.inputs.reduce((acc, input, inputIndex) => {
    let val = "";
    if (input.name == "hashRndNumber" && account) val = generateHalalHash(account, rnd!);
    acc[getFunctionInputKey(createRoomFn, input, inputIndex)] = val;
    return acc;
  }, {} as Record<string, any>);

type TCreateRoomFormProps = {
  createRoomFn: FunctionFragment;
  contractAddress: string;
};

export const CreateRoomForm = ({ createRoomFn, contractAddress }: TCreateRoomFormProps) => {
  /* User Account */
  const { address: currentAccount } = useAccount();

  /* RND */
  const rnd = useRef(Math.trunc(Math.random() * (Number.MAX_SAFE_INTEGER - 1)));

  /* set form */
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialFormState(createRoomFn, currentAccount, rnd.current),
  );
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

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransaction({
    hash: result?.hash,
  });
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

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
                await writeTxn(createRoom());
                setForm(getInitialFormState(createRoomFn, currentAccount, rnd.current));
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
