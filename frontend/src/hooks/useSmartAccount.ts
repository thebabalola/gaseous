'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import SimpleAccountFactoryABI from '@/lib/abi/SimpleAccountFactory.json';
import SimpleAccountABI from '@/lib/abi/SimpleAccount.json';
import { getAddress } from 'viem';

// These should ideally be in environment variables
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000';

export function useSmartAccount() {
  const { address: eoaAddress, isConnected } = useAccount();
  const [smartAccountAddress, setSmartAccountAddress] = useState<`0x${string}` | null>(null);
  const [isDeployed, setIsDeployed] = useState(false);
  const publicClient = usePublicClient();

  const { data: predictedAddress } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: SimpleAccountFactoryABI,
    functionName: 'getAddress',
    args: eoaAddress ? [eoaAddress, BigInt(0)] : undefined,
    query: {
      enabled: !!eoaAddress,
    },
  });

  useEffect(() => {
    if (predictedAddress) {
      setSmartAccountAddress(predictedAddress as `0x${string}`);
      
      // Check if deployed
      const checkDeployment = async () => {
        const code = await publicClient?.getBytecode({ address: predictedAddress as `0x${string}` });
        setIsDeployed(!!code && code !== '0x');
      };
      
      checkDeployment();
    }
  }, [predictedAddress, publicClient]);

  const { writeContractAsync: createAccountTx } = useWriteContract();

  const createAccount = async () => {
    if (!eoaAddress) throw new Error("EOA not connected");
    return await createAccountTx({
      address: FACTORY_ADDRESS,
      abi: SimpleAccountFactoryABI,
      functionName: 'createAccount',
      args: [eoaAddress, BigInt(0)],
    });
  };

  return {
    smartAccountAddress,
    isDeployed,
    createAccount,
    isLoading: !predictedAddress && isConnected,
  };
}
