import { AcceptLoanStore } from '../components/LoanActions/AcceptLoan/model/AcceptLoanStore.ts'
import { CancelLoanStore } from '../components/LoanActions/CancelLoan/model/CancelLoanStore.ts'
import { MinerWithdrawStore } from '../components/LoanActions/MinerWithdraw/model/MinerWithdrawStore.ts'
import { WithdrawStore } from '../components/LoanActions/Withdraw/model/WithdrawStore.ts'
import { DealsStore } from './Deal/DealStore.ts'
import { PlaceLoanStore } from './Deal/PlaceLoanStore.ts'
import { DealsListStore } from './DealsListStore/DealsListStore.ts'
import { DialogStore } from './Dialog/DialogStore'
import { ErrorStore } from './Error/ErrorStore'
import { ProfileStore } from './Profile/ProfileStore.ts'
import { ProfileDealsStore } from './ProfileDeals/ProfileDealsStore.ts'

export class RootStore {
  dialogStore: DialogStore
  errorStore: ErrorStore
  dealsListStore: DealsListStore
  dealStore: DealsStore

  profileStore: ProfileStore
  profileDealsStore: ProfileDealsStore
  placeLoanStore: PlaceLoanStore
  acceptLoanStore: AcceptLoanStore
  cancelLoanStore: CancelLoanStore
  minerWithdrawStore: MinerWithdrawStore
  withdrawStore: WithdrawStore

  constructor() {
    this.dialogStore = new DialogStore()
    this.errorStore = new ErrorStore(this)
    this.dealsListStore = new DealsListStore(this)
    this.profileStore = new ProfileStore(this)
    this.dealStore = new DealsStore(this)
    this.placeLoanStore = new PlaceLoanStore(this)
    this.acceptLoanStore = new AcceptLoanStore(this)
    this.cancelLoanStore = new CancelLoanStore(this)
    this.minerWithdrawStore = new MinerWithdrawStore(this)
    this.withdrawStore = new WithdrawStore(this)
    this.dealStore = new DealsStore(this)
    this.profileDealsStore = new ProfileDealsStore(this)
  }
}

export const rootStore = new RootStore()
