import { makeAutoObservable } from 'mobx'

import { type Deal } from '../../../api/Api.ts'
import { api } from '../../config/api.ts'
import { type PlaceLoanFormValues } from '../../pages/CreatePage/Deal/lib/PlaceLoanFormValues.ts'
import { formToPlaceLoanParams } from '../../pages/CreatePage/Deal/lib/PlaceLoanParams.ts'
import { type PlaceLoanMethod } from '../../pages/CreatePage/Deal/model/usePlaceLoan.ts'
import { getTxReceipt } from '../../utils/error/contract.ts'
import { storeRequest, type StoreRequester, storeReset } from '../../utils/store/store-requester/store-requester.ts'
import { type ErrorStore } from '../Error/ErrorStore.ts'
import { type RootStore } from '../RootStore.ts'

export class PlaceLoanStore implements StoreRequester {
  errorStore: ErrorStore

  currentRequest?: any
  requestCount: number = 0
  isLoading: boolean = false
  isLoaded: boolean = false

  data: Deal | undefined = undefined

  constructor({ errorStore }: RootStore) {
    this.errorStore = errorStore
    makeAutoObservable(this, {
      errorStore: false,
    })
  }

  request(
    method: PlaceLoanMethod,
    form: PlaceLoanFormValues, actorId: string | number | undefined | null,
    onSuccess?: (deal: Deal) => void,
    onError?: (error: unknown) => void,
  ): void {
    storeRequest(
      this,
      async () => {
        const params = formToPlaceLoanParams(form, actorId)
        if (!params) {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw 'Invalid form. Please fill the form correctly.'
        }
        const res = await method({
          args: [
            params?.actorId,
            params?.giverSchedule,
            params?.giverValues,
            params?.minerSchedule,
            params?.minerValues,
          ],
        })
        await getTxReceipt(res.hash)

        return api.deals.createCreate({ id: res.hash }, { format: 'json' })
      },
      (data) => {
        this.data = data
        onSuccess?.(data)
      },
      {
        onError,
      },
    )
  }

  reset() {
    this.data = undefined
    storeReset(this)
  }
}
