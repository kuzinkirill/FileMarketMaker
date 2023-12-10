import { useContractWrite } from 'wagmi'

import { contracts } from '../../../../config/contracts.ts'

export const usePlaceLoan = () => {
  return useContractWrite({
    address: contracts.loan.address,
    abi: contracts.loan.abi,
    functionName: 'placeLoan',
  })
}

export type PlaceLoanMethod = ReturnType<typeof usePlaceLoan>['writeAsync']
