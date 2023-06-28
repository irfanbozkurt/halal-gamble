import { Dispatch, SetStateAction } from "react";
import { utils } from "ethers";
import {
  AddressInput,
  Bytes32Input,
  BytesInput,
  InputBase,
  IntegerInput,
  IntegerVariant,
} from "~~/components/scaffold-eth";

type ContractInputProps = {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any>;
  stateObjectKey: string;
  paramType: utils.ParamType;
  disabled?: boolean;
};

/**
 * Generic Input component to handle input's based on their function param type
 */
export const ContractInput = ({ setForm, form, stateObjectKey, paramType, disabled }: ContractInputProps) => {
  const inputProps = {
    name: stateObjectKey,
    value: form[stateObjectKey],
    placeholder: paramType.name ? `${paramType.type} ${paramType.name}` : paramType.type,
    onChange: disabled
      ? () => {}
      : (value: any) => {
          setForm(form => ({ ...form, [stateObjectKey]: value }));
        },
    disabled: disabled,
  };

  if (paramType.type === "address") {
    return <AddressInput {...inputProps} />;
  } else if (paramType.type === "bytes32") {
    return <Bytes32Input {...inputProps} />;
  } else if (paramType.type === "bytes") {
    return <BytesInput {...inputProps} />;
  } else if (paramType.type === "string") {
    return <InputBase {...inputProps} />;
  } else if (paramType.type.includes("int") && !paramType.type.includes("[")) {
    return <IntegerInput {...inputProps} variant={paramType.type as IntegerVariant} />;
  }

  return <InputBase {...inputProps} />;
};
