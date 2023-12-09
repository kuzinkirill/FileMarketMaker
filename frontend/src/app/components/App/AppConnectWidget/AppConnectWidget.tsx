import { observer } from 'mobx-react-lite'
import { type FC } from 'react'
import { useAccount } from 'wagmi'

import { AppAccountMenu } from '../AppAccountMenu'
import { ConnectButton } from '../Web3'

export const AppConnectWidget: FC = observer(() => {
  const { isConnected } = useAccount()

  return isConnected ? <AppAccountMenu /> : <ConnectButton />
})
