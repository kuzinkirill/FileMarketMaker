import { type PressEvent } from '@react-types/shared/src/events'
import { observer } from 'mobx-react-lite'
import { type FC } from 'react'

import { NavLink } from '../../../UIkit'

export interface AccountButtonProps {
  address: string
  onPress?: (e: PressEvent) => void
}

export const AccountButton: FC<AccountButtonProps> = observer(({ address, onPress }) => {
  return (
    <NavLink
      to={`/profile/${address}`}
      onPress={onPress}
    >
      View account
    </NavLink>
  )
})
