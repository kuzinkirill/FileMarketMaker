import { useConnectModal } from '@rainbow-me/rainbowkit'
import { observer } from 'mobx-react-lite'
import { type FC } from 'react'

import { Button } from '../../../../UIkit'

export interface ConnectButtonProps {
  fullWidth?: boolean
}
export const ConnectButton: FC<ConnectButtonProps> = observer(({ fullWidth }) => {
  const { openConnectModal } = useConnectModal()

  // onClick instead of onPress, cos web3modal closes when using onPress
  return (
    <Button
      small
      secondaryWithBlinds
      onClick={() => { openConnectModal?.() }}
      fullWidth={fullWidth}
    >
      Connect
    </Button>
  )
})
