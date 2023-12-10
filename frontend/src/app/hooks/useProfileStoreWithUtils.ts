import { getAddress } from 'viem'
import { useAccount } from 'wagmi'

import { useActivatedStore } from '../utils/store/activate-deactivate/useActivatedStore.ts'

export const useProfileStoreWithUtils = (profileAddress: string | undefined | null) => {
  const { profileStore } = useActivatedStore('profileStore', profileAddress as string)
  const { address } = useAccount()
  const isMe = Boolean(address && getAddress(address) === profileStore.data?.address)
  const isMiner = Boolean(profileStore.data?.miner) && isMe

  return { isMe, isMiner, profileStore }
}
