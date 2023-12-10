import { makeAutoObservable } from 'mobx'

import { type Account, type Miner } from '../../../api/Api.ts'
import { api } from '../../config/api.ts'
import { type ActivateDeactivate } from '../../utils/store/activate-deactivate/activate-deactivate.ts'
import {
  type RequestContext, storeRequest,
  type StoreRequester,
  storeReset,
} from '../../utils/store/store-requester/store-requester.ts'
import { type ErrorStore } from '../Error/ErrorStore.ts'
import { type RootStore } from '../RootStore.ts'

export class ProfileStore implements StoreRequester, ActivateDeactivate {
  errorStore: ErrorStore

  isLoading: boolean = false
  isLoaded: boolean = false
  requestCount: number = 0
  currentRequest?: RequestContext
  isActivated: boolean = false

  data: Account | undefined = undefined

  constructor({ errorStore }: RootStore) {
    this.errorStore = errorStore
    makeAutoObservable(this, {
      errorStore: false,
    })
  }

  setMiner(miner: Miner): void {
    if (this.data?.miner && this.data?.miner?.address === miner.address) {
      this.data.miner = miner
    }
  }

  request(address: string): void {
    storeRequest(
      this,
      () => api.accounts.accountsDetail(address, { format: 'json' }),
      (response) => {
        this.data = response
      },
    )
  }

  activate(address: string): void {
    this.isActivated = true
    this.request(address)
  }

  deactivate(): void {
    this.isActivated = false
  }

  reset(): void {
    this.data = undefined
    storeReset(this)
  }
}
