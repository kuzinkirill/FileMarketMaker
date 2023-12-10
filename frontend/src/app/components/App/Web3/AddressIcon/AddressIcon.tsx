import { observer } from 'mobx-react-lite'
import { type FC } from 'react'

import { getProfileImageUrl } from '../../../../utils/nfts'

export interface AddressIconProps {
  size?: number
  address: string
}

export const AddressIcon: FC<AddressIconProps> = observer(({ size = 20, address }) => {
  return (
    <img
      alt="Identicon"
      src={getProfileImageUrl(address, size)}
    />
  )
})
