import { useContractWrite } from 'wagmi'

import { contracts } from '../../../../config/contracts.ts'

export const useMinerWithdrawEthAddress = () => {
  return useContractWrite({
    address: contracts.loan.address,
    abi: contracts.loan.abi,
    functionName: 'minerWithdrawEthAddress',
  })
}

export type MinerWithdrawEthAddressMethod = ReturnType<typeof useMinerWithdrawEthAddress>['writeAsync']
