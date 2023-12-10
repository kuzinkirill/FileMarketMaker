import { makeAutoObservable } from 'mobx'

import { type Deal } from '../../../../../api/Api.ts'
import { api } from '../../../../config/api.ts'
import { type DealsStore } from '../../../../stores/Deal/DealStore.ts'
import { type ErrorStore } from '../../../../stores/Error/ErrorStore.ts'
import { type RootStore } from '../../../../stores/RootStore.ts'
import { getTxReceipt } from '../../../../utils/error/contract.ts'
import {
  type RequestContext, storeRequest,
  type StoreRequester,
  storeReset,
} from '../../../../utils/store/store-requester/store-requester.ts'
import { type AcceptLoanMethod } from './useAcceptLoan.ts'

export class AcceptLoanStore implements StoreRequester {
  errorStore: ErrorStore
  dealStore: DealsStore

  currentRequest?: RequestContext
  isLoaded: boolean = false
  isLoading: boolean = false
  requestCount: number = 0
  data: Deal | undefined = undefined

  constructor({ errorStore, dealStore }: RootStore) {
    this.errorStore = errorStore
    this.dealStore = dealStore
    makeAutoObservable(this)
  }

  request(method: AcceptLoanMethod, deal: Deal, onSuccess?: () => void, onError?: (error: unknown) => void): void {
    storeRequest(
      this,
      async () => {
        const res = await method({
          value: BigInt(deal.miner_value || 0),
          args: [
            BigInt(deal.miner?.actor_id || 0),
            BigInt(deal.deal_id || 0),
          ],
        })
        await getTxReceipt(res.hash)

        return api.deals.acceptCreate({ id: res.hash }, { format: 'json' })
      },
      (data) => {
        this.data = data
        this.dealStore.data = data
        onSuccess?.()
      },
      { onError },
    )
  }

  reset(): void {
    this.data = undefined
    storeReset(this)
  }
}
