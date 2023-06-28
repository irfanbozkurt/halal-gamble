import { useCallback } from "react";
import { ethers } from "ethers";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";

export const Bytes32Input = ({ value, onChange, name, placeholder, className, disabled }: CommonInputProps) => {
  const convertStringToBytes32 = useCallback(() => {
    if (!value) {
      return;
    }
    onChange(
      ethers.utils.isHexString(value)
        ? ethers.utils.parseBytes32String(value)
        : ethers.utils.formatBytes32String(value),
    );
  }, [onChange, value]);

  return (
    <InputBase
      name={name}
      disabled={disabled}
      value={value}
      placeholder={placeholder}
      className={className}
      onChange={disabled ? () => {} : onChange}
      suffix={
        !disabled && (
          <div
            className="self-center cursor-pointer text-xl font-semibold px-4 text-accent"
            onClick={convertStringToBytes32}
          >
            #
          </div>
        )
      }
    />
  );
};
