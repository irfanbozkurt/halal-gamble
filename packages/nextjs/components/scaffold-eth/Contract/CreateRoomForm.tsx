import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRef } from "react";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { BigNumber, ethers } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import { useAccount, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import {
  ContractInput,
  IntegerInput,
  TxReceipt,
  generateHalalHash,
  getFunctionInputKey,
  getParsedContractFunctionArgs,
  getParsedEthersError,
} from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification, parseTxnValue } from "~~/utils/scaffold-eth";

const getInitialFormState = (functionFragment: FunctionFragment, account?: string, rnd?: number) =>
  functionFragment.inputs.reduce((acc, input, inputIndex) => {
    let val = "";
    if (input.name == "hashRndNumber" && account) val = generateHalalHash(account, rnd!);
    acc[getFunctionInputKey(functionFragment, input, inputIndex)] = val;
    return acc;
  }, {} as Record<string, any>);

type TCreateRoomFormProps = {
  functionFragment: FunctionFragment;
  contractAddress: string;
};

export const CreateRoomForm = ({ functionFragment, contractAddress }: TCreateRoomFormProps) => {
  /* */
  const { address: currentAccount } = useAccount();

  /* RND management */
  const rnd = useRef(Math.trunc(Math.random() * (Number.MAX_SAFE_INTEGER - 1)));

  /* set form */
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialFormState(functionFragment, currentAccount, rnd.current),
  );
  const [txValue, setTxValue] = useState<string | BigNumber>("");
  const { chain } = useNetwork();
  const writeTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  /* useContractWrite */
  const {
    data: result,
    isLoading,
    writeAsync,
  } = useContractWrite({
    address: contractAddress,
    functionName: functionFragment.name,
    abi: [functionFragment],
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
  const inputs = functionFragment.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(functionFragment, input, inputIndex);
    return (
      <ContractInput
        key={key}
        disabled={key.includes("hashRndNumber")}
        setForm={updatedFormValue => {
          setDisplayedTxResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });
  const zeroInputs = inputs.length === 0 && !functionFragment.payable;

  // Handle tx value respecting roomFee
  const feeKey = Object.keys(form).find(k => k.includes("roomFee"));
  const givenFee = feeKey && form[feeKey];
  if (txValue != givenFee) setTxValue(givenFee);

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1 w-2/3">
      <div className={`flex gap-3 ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <p className="font-medium my-0 break-words">{functionFragment.name}</p>

        {/* Function inputs */}
        {inputs}

        {/* Send button */}
        <div className="flex justify-between gap-2">
          {!zeroInputs && (
            <div className="flex-grow basis-0">
              {displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}
            </div>
          )}

          <div
            className={`flex ${
              writeDisabled &&
              "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
            }`}
            data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
          >
            <button
              className={`btn btn-secondary btn-sm ${isLoading ? "loading" : ""}`}
              disabled={writeDisabled}
              onClick={async () => {
                if (!writeAsync) return;
                try {
                  await writeTxn(writeAsync());
                } catch (e: any) {
                  const message = getParsedEthersError(e);
                  notification.error(message);
                }
              }}
            >
              Send 💸
            </button>
          </div>
        </div>
      </div>
      {zeroInputs && txResult ? (
        <div className="flex-grow basis-0">
          <TxReceipt txResult={txResult} />
        </div>
      ) : null}
    </div>
  );
};
