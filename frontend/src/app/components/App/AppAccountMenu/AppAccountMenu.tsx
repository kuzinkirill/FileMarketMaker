import { observer } from 'mobx-react-lite'
import { type FC, useCallback, useState } from 'react'
import { useAccount } from 'wagmi'

import { styled } from '../../../../styles'
import { Button, Popover, PopoverContent, PopoverTrigger } from '../../../UIkit'
import { AddressIcon, DisconnectButton } from '../Web3'
import { AccountButton } from './AccountButton'

const Spacer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  gap: '$3',
})

const IconWrapper = styled('div', {
  background: '$white',
  dflex: 'center',
  width: '100%',
  height: '100%',
})

export const AppAccountMenu: FC = observer(() => {
  const [isOpen, setIsOpen] = useState(false)
  const { address } = useAccount()
  const close = useCallback(() => { setIsOpen(false) }, [setIsOpen])

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          icon
          secondary
          small
          iconCover
          blueBorder
        >
          <IconWrapper>
            <AddressIcon
              address={address ?? ''}
              size={36}
            />
          </IconWrapper>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Spacer>
          <AccountButton address={address ?? ''} onPress={close} />
          <DisconnectButton onPress={close} />
        </Spacer>
      </PopoverContent>
    </Popover>
  )
})
