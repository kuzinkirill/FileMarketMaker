import { observer } from 'mobx-react-lite'
import { type FC } from 'react'
import { useDisconnect } from 'wagmi'

import { Link } from '../../../../UIkit'

export interface DisconnectButtonProps {
  onPress?: () => void
}

export const DisconnectButton: FC<DisconnectButtonProps> = observer(({ onPress }) => {
  const { disconnect } = useDisconnect()

  return (
    <Link
      type="button"
      style={{
        color: '#D81B60',
      }}
      onPress={() => {
        disconnect()
        onPress?.()
      }}
    >
      Disconnect
    </Link>
  )
})
