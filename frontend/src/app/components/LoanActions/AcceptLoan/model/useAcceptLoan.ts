import { useContractWrite } from 'wagmi'

import { contracts } from '../../../../config/contracts.ts'

export const useAcceptLoan = () => {
  return useContractWrite({
    address: contracts.loan.address,
    abi: contracts.loan.abi,
    functionName: 'acceptLoan',
  })
}

export type AcceptLoanMethod = ReturnType<typeof useAcceptLoan>['writeAsync']
