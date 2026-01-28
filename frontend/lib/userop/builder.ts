import { concat, createPublicClient, encodeFunctionData, http, type Hex } from "viem";
import { base } from "viem/chains";
import SimpleAccountABI from "@/lib/abi/SimpleAccount.json";

// Standard ERC-4337 EntryPoint Address on Base Mainnet
export const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

export interface UserOperation {
  sender: Hex;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: Hex;
  signature: Hex;
}

export async function buildUserOp(
  sender: Hex,
  nonce: bigint,
  callData: Hex,
  initCode: Hex = "0x",
  verificationGasLimit = 100000n,
  callGasLimit = 100000n,
  preVerificationGas = 50000n,
): Promise<UserOperation> {
  const publicClient = createPublicClient({
    chain: base,
    transport: http()
  });

  const { maxFeePerGas, maxPriorityFeePerGas } = await publicClient.estimateFeesPerGas();

  return {
    sender,
    nonce,
    initCode,
    callData,
    callGasLimit,
    verificationGasLimit,
    preVerificationGas,
    maxFeePerGas: maxFeePerGas || 1000000000n,
    maxPriorityFeePerGas: maxPriorityFeePerGas || 1000000000n,
    paymasterAndData: "0x", // Initially empty, will be filled by Paymaster
    signature: "0x" // Placeholder
  };
}

export function encodeExecute(target: Hex, value: bigint, data: Hex): Hex {
  return encodeFunctionData({
    abi: SimpleAccountABI,
    functionName: "execute",
    args: [target, value, data]
  });
}
