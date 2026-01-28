import { type Hex, createClient, http } from "viem";
import { base } from "viem/chains";
import { UserOperation, ENTRY_POINT_ADDRESS } from "@/lib/userop/builder";

// Bundler RPC URL (using Alchemy or similar provider)
const BUNDLER_RPC_URL = process.env.NEXT_PUBLIC_BUNDLER_RPC_URL || "https://api.pimlico.io/v1/base/rpc?apikey=YOUR_API_KEY";

export async function sendUserOperation(userOp: UserOperation): Promise<Hex> {
  const bundlerClient = createClient({
    chain: base,
    transport: http(BUNDLER_RPC_URL)
  });

  // Convert BigInts to hex strings for JSON-RPC
  const formattedOp = {
    sender: userOp.sender,
    nonce: "0x" + userOp.nonce.toString(16),
    initCode: userOp.initCode,
    callData: userOp.callData,
    callGasLimit: "0x" + userOp.callGasLimit.toString(16),
    verificationGasLimit: "0x" + userOp.verificationGasLimit.toString(16),
    preVerificationGas: "0x" + userOp.preVerificationGas.toString(16),
    maxFeePerGas: "0x" + userOp.maxFeePerGas.toString(16),
    maxPriorityFeePerGas: "0x" + userOp.maxPriorityFeePerGas.toString(16),
    paymasterAndData: userOp.paymasterAndData,
    signature: userOp.signature
  };

  try {
    const userOpHash = await bundlerClient.request({
      method: "eth_sendUserOperation",
      params: [formattedOp, ENTRY_POINT_ADDRESS]
    });
    return userOpHash as Hex;
  } catch (error) {
    console.error("Bundler Error:", error);
    throw error;
  }
}
