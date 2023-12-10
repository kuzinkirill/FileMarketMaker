import { useConnectModal } from '@rainbow-me/rainbowkit'
import { observer } from 'mobx-react-lite'
import { type FC } from 'react'

import { Button } from '../../../../UIkit'

export const ConnectButton: FC = observer(() => {
  const { openConnectModal } = useConnectModal()

  // onClick instead of onPress, cos web3modal closes when using onPress
  return (
    <Button
      small
      secondaryWithBlinds
      onClick={() => { openConnectModal?.() }}
    >
      Connect
    </Button>
  )
})
