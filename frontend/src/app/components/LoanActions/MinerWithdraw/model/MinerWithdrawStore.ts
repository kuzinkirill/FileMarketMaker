import { makeAutoObservable } from 'mobx'

import { type Miner } from '../../../../../api/Api.ts'
import { api } from '../../../../config/api.ts'
import { type ErrorStore } from '../../../../stores/Error/ErrorStore.ts'
import { type ProfileStore } from '../../../../stores/Profile/ProfileStore.ts'
import { type RootStore } from '../../../../stores/RootStore.ts'
import { getTxReceipt } from '../../../../utils/error/contract.ts'
import { storeRequest, type StoreRequester, storeReset } from '../../../../utils/store/store-requester/store-requester.ts'
import { type MinerWithdrawEthAddressMethod } from './useMinerWithdrawEthAddress.ts'

/**
 * same as AcceptLoanStore, but uses minerWithdraw method and api.miners.withdrawCreate
 */
export class MinerWithdrawStore implements StoreRequester {
  errorStore: ErrorStore
  profileStore: ProfileStore

  currentRequest?: any
  requestCount: number = 0
  isLoading: boolean = false
  isLoaded: boolean = false
  data: Miner | undefined = undefined

  constructor({ errorStore, profileStore }: RootStore) {
    this.errorStore = errorStore
    this.profileStore = profileStore
    makeAutoObservable(this, {
      errorStore: false,
    })
  }

  request(
    method: MinerWithdrawEthAddressMethod,
    miner: Miner,
    receiver: `0x${string}`,
    onSuccess?: () => void,
    onError?: (error: unknown) => void,
  ): void {
    storeRequest(
      this,
      async () => {
        const res = await method({
          args: [
            BigInt(miner?.actor_id || 0),
            receiver,
            BigInt(miner.available_balance || 0),
          ],
        })
        await getTxReceipt(res.hash)

        return api.miners.withdrawCreate({ id: res.hash }, { format: 'json' })
      },
      (data) => {
        this.data = data
        this.profileStore.setMiner(data)
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
