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

export class DealsStore implements ActivateDeactivate, StoreRequester {
  data: Deal | undefined = undefined

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

  activate(id?: string): void {
    this.isActivated = true
    this.request(id)
  }

  deactivate(): void {
    this.reset()
    this.isActivated = false
  }

  private request(id?: string): void {
    if (id === undefined) return

    storeRequest(
      this,
      () => api.deals.byIdDetail(id, { format: 'json' }),
      (deal) => {
        this.data = deal
      },
    )
  }

  reset(): void {
    storeReset(this)
  }
}
