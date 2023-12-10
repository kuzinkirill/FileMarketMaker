import { action } from 'mobx'

import { type ErrorResponse, type HttpResponse } from '../../../../api/Api.ts'
import { type ErrorStore } from '../../../stores/Error/ErrorStore.ts'
import { errorResponseToMessage, stringifyError } from '../../error'
import { tap } from '../../structs'

/**
 * Used to type args of request methods
 */
export interface OnCompleteRequest<Req, Data> {
  req: Req
  onComplete?: (data: Data) => void
}

/**
 * Maintains request statuses. Prohibits concurrent requests.
 * Error is supposed to be shown through ErrorStore.
 */
export interface StoreRequester {
  isLoading: boolean // indicates, if the request is in process. Setting loading to false will cancel the request
  isLoaded: boolean
  errorStore: ErrorStore
  requestCount: number
  currentRequest?: RequestContext // current request. Helps to prevent concurrent request
  reset: () => void
}

export interface RequestContext {
  id: number
  req?: Promise<unknown>
}

export const storeRequestGeneric = <ResponseType>(
  target: StoreRequester,
  requester: () => Promise<ResponseType>,
  responseHandler: (response: ResponseType) => void,
  errorHandler: (error: unknown) => void,
  cancel?: boolean, // whether to cancel request that is in process
  onCancel?: () => void,
): void => {
  if (cancel || !target.currentRequest) {
    target.isLoading = true
    const context: RequestContext = {
      id: target.requestCount++,
    }
    const finish = (resultHandler: () => void) => {
      // handle result only if request is not replaced by another and not cancelled
      if (target.currentRequest?.id === context.id) {
        target.currentRequest = undefined
        target.isLoading = false
        resultHandler()
      } else {
        onCancel?.()
      }
      // check, if we need to handle request results
    }
    context.req = requester()
      .then(
        tap(
          action((data) => {
            finish(() => {
              responseHandler(data)
            })
          }),
        ),
      )
      .catch(
        action((error) => {
          finish(() => {
            errorHandler(error)
          })
        }),
      )
    target.currentRequest = context
  } else {
    onCancel?.()
  }
}

// Promise will fire void if the error is thrown and handled
export const storeRequest = <Data>(
  target: StoreRequester,
  requester: () => Promise<HttpResponse<Data, ErrorResponse>>,
  callback: (data: Data) => void,
  options?: {
    hideError?: boolean | ((error: unknown) => boolean)
    onError?: (error: unknown) => void
    cancel?: boolean // whether to cancel request that is processed in the same store
    onCancel?: () => void // called if request was cancelled due to a concurrent one
  },
): void => {
  const handleError = (err: string) => {
    if (!options?.hideError || (typeof options.hideError === 'function' && !options.hideError(err))) {
      target.errorStore.showError(err)
    }

    options?.onError?.(err)
  }
  storeRequestGeneric(
    target,
    requester,
    action((response: HttpResponse<Data, ErrorResponse>) => {
      console.log({ response })
      if (response.ok) {
        target.isLoaded = true
        callback(response.data)
      } else {
        handleError(errorResponseToMessage(response?.error))
      }
    }),
    action((error) => {
      if (error instanceof Response && 'error' in error) {
        handleError(errorResponseToMessage(error.error as ErrorResponse))
      } else {
        // This is somewhat unexpected error, so we should log it in full
        console.error(error)
        handleError(stringifyError(error))
      }
    }),
    options?.cancel,
    options?.onCancel,
  )
}

/**
 * Async wrap around storeRequest. Same error handling, but throws handled errors anyway.
 * You could ignore thrown errors safely, they are here just to indicate that request was not successful.
 * DOES NOT SUPPORT CONCURRENT REQUESTS - WILL THROW IF ANY.
 * Uses many callbacks, but anyway better to reuse old function than write a new one
 */
export const storeRequestAsync = <Data>(
  target: StoreRequester,
  requester: () => Promise<HttpResponse<Data, ErrorResponse>>,
  options?: {
    hideError?: boolean | ((error: unknown) => boolean)
    cancel?: boolean // whether to cancel request that is processed in the same store
  },
): Promise<Data> => {
  return new Promise((resolve, reject) => {
    storeRequest(target, requester, resolve, {
      ...options,
      onError: reject,
      onCancel: () => { reject(new Error('Request was cancelled')) }, // ensures that promise will always resolve
    })
  })
}

export const storeRequestFetch = <Data>(
  target: StoreRequester,
  requester: () => Promise<Data>,
  callback: (data: Data) => void,
  options?: {
    hideError?: boolean | ((error: unknown) => boolean)
    onError?: (error: unknown) => void
    cancel?: boolean // whether to cancel request that is processed in the same store
    onCancel?: () => void // called if request was cancelled due to a concurrent one
  },
): void => {
  const handleError = (err: string) => {
    if (!options?.hideError || (typeof options.hideError === 'function' && !options.hideError(err))) {
      target.errorStore.showError(err)
    }

    options?.onError?.(err)
  }
  storeRequestGeneric(
    target,
    requester,
    (response) => {
      target.isLoaded = true
      callback(response)
    },
    (error) => {
      handleError(stringifyError(error))
    },
    options?.cancel,
    options?.onCancel,
  )
}

export const storeReset = <Target extends StoreRequester>(target: Target) => {
  target.currentRequest = undefined // cancel current request
  target.isLoading = false
  target.isLoaded = false
}
