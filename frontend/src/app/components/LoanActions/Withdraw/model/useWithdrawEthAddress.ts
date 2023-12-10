import { useContractWrite } from 'wagmi'

import { contracts } from '../../../../config/contracts.ts'

export const useWithdrawEthAddress = () => {
  return useContractWrite({
    address: contracts.loan.address,
    abi: contracts.loan.abi,
    functionName: 'withdrawEthAddress',
  })
}

export type WithdrawEthAddressMethod = ReturnType<typeof useWithdrawEthAddress>['writeAsync']
