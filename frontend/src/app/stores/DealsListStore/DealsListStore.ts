import { makeAutoObservable } from 'mobx'

import { type Deal } from '../../../api/Api.ts'
import { api } from '../../config/api.ts'
import { type ActivateDeactivate } from '../../utils/store/activate-deactivate/activate-deactivate.ts'
import {
  type RequestContext,
  storeRequest,
  type StoreRequester,
  storeReset,
} from '../../utils/store/store-requester/store-requester.ts'
import { type ErrorStore } from '../Error/ErrorStore.ts'
import { type RootStore } from '../RootStore.ts'

export class DealsListStore implements ActivateDeactivate, StoreRequester {
  data: Deal[] | undefined = undefined

  errorStore: ErrorStore

  isLoading = false
  isLoaded = false
  isActivated = false
  currentRequest?: RequestContext
  requestCount = 0

  constructor({ errorStore }: RootStore) {
    this.errorStore = errorStore
    makeAutoObservable(this, {
      errorStore: false,
    })
  }

  activate(): void {
    this.isActivated = true
    this.request()
  }

  deactivate(): void {
    this.reset()
    this.isActivated = false
  }

  private request(): void {
    storeRequest(
      this,
      () => api.deals.dealsList({ format: 'json' }),
      (deals) => {
        console.log(deals)
        this.data = deals
      },
    )
  }

  reset(): void {
    storeReset(this)
  }

  getDealById(id: number): Deal | undefined {
    return this.data?.find(item => item.deal_id === id)
  }
}
