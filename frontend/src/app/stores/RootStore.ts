import { DialogStore } from './Dialog/DialogStore'
import { EmptyStore } from './Empty/EmptyStore.ts'
import { ErrorStore } from './Error/ErrorStore'

export class RootStore {
  dialogStore: DialogStore
  errorStore: ErrorStore
  emptyStore: EmptyStore
  constructor() {
    this.dialogStore = new DialogStore()
    this.errorStore = new ErrorStore(this)
    this.emptyStore = new EmptyStore()
  }
}

export const rootStore = new RootStore()
