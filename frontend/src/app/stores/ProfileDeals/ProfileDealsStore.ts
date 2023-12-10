import { makeAutoObservable } from 'mobx'

import { type Deal } from '../../../api/Api.ts'
import { api } from '../../config/api.ts'
import { type ActivateDeactivate } from '../../utils/store/activate-deactivate/activate-deactivate.ts'
import {
  type RequestContext, storeRequest,
  type StoreRequester,
  storeReset,
} from '../../utils/store/store-requester/store-requester.ts'
import { type ErrorStore } from '../Error/ErrorStore.ts'
import { type RootStore } from '../RootStore.ts'

export class ProfileDealsStore implements StoreRequester, ActivateDeactivate {
  errorStore: ErrorStore

  isLoading: boolean = false
  isLoaded: boolean = false
  requestCount: number = 0
  currentRequest?: RequestContext
  isActivated: boolean = false

  deals: Deal[] | undefined = undefined

  constructor({ errorStore }: RootStore) {
    this.errorStore = errorStore
    makeAutoObservable(this, {
      errorStore: false,
    })
  }

  request(address?: string): void {
    if (!address) return

    storeRequest(
      this,
      () => api.deals.dealsDetail(address, { format: 'json' }),
      (response) => {
        this.deals = response
      },
    )
  }

  activate(address?: string): void {
    this.isActivated = true
    this.request(address)
  }

  deactivate(): void {
    this.isActivated = false
  }

  reset(): void {
    this.deals = undefined
    storeReset(this)
  }
}
