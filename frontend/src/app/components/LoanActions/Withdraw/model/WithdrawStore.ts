import { makeAutoObservable } from 'mobx'

import { type Deal } from '../../../../../api/Api.ts'
import { api } from '../../../../config/api.ts'
import { type DealsStore } from '../../../../stores/Deal/DealStore.ts'
import { type ErrorStore } from '../../../../stores/Error/ErrorStore.ts'
import { type RootStore } from '../../../../stores/RootStore.ts'
import { getTxReceipt } from '../../../../utils/error/contract.ts'
import { storeRequest, type StoreRequester, storeReset } from '../../../../utils/store/store-requester/store-requester.ts'
import { type WithdrawEthAddressMethod } from './useWithdrawEthAddress.ts'

/**
 * Same as MinerWithdrawStore but uses withdraw method and api.deals.claimCreate
 */
export class WithdrawStore implements StoreRequester {
  errorStore: ErrorStore
  dealStore: DealsStore

  currentRequest?: any
  requestCount: number = 0
  isLoading: boolean = false
  isLoaded: boolean = false
  data: Deal | undefined = undefined

  constructor({ errorStore, dealStore }: RootStore) {
    this.errorStore = errorStore
    this.dealStore = dealStore
    makeAutoObservable(this, {
      errorStore: false,
    })
  }

  request(
    method: WithdrawEthAddressMethod,
    deal: Deal,
    amount: bigint,
    receiver: `0x${string}`,
    onSuccess?: () => void,
    onError?: (error: unknown) => void,
  ): void {
    storeRequest(
      this,
      async () => {
        const res = await method({
          args: [
            BigInt(deal.miner?.actor_id || 0),
            BigInt(deal.deal_id || 0),
            receiver,
            amount,
          ],
        })
        await getTxReceipt(res.hash)

        return api.deals.claimCreate({ id: res.hash }, { format: 'json' })
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
