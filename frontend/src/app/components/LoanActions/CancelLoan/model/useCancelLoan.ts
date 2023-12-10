import { useContractWrite } from 'wagmi'

import { contracts } from '../../../../config/contracts.ts'

export const useCancelLoan = () => {
  return useContractWrite({
    address: contracts.loan.address,
    abi: contracts.loan.abi,
    functionName: 'cancelLoan',
  })
}

export type CancelLoanMethod = ReturnType<typeof useCancelLoan>['writeAsync']
