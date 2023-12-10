import { observer } from 'mobx-react-lite'
import React from 'react'
import { getAddress } from 'viem'
import { useAccount } from 'wagmi'

import { type Deal } from '../../../api/Api.ts'
import { styled } from '../../../styles'
import { useProfileStoreWithUtils } from '../../hooks/useProfileStoreWithUtils.ts'
import { Button, Txt } from '../../UIkit'
import { ConnectButton } from '../App/Web3'
import { AcceptLoan } from './AcceptLoan/ui/AcceptLoan.tsx'
import { CancelLoan } from './CancelLoan/ui/CancelLoan.tsx'
import { Withdraw } from './Withdraw/ui/Withdraw.tsx'

const Container = styled('div', {
  width: '100%',
  maxWidth: '600px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  alignItems: 'center',
})

export interface LoanActionsProps {
  deal?: Deal
}

export const LoanActions: React.FC<LoanActionsProps> = observer(({ deal }) => {
  const { address } = useAccount()
  const { isMiner } = useProfileStoreWithUtils(address)
  const isMinerOfTheDeal = deal?.miner?.beneficiary_owner &&
    address && getAddress(address) === getAddress(deal.miner?.beneficiary_owner)
  const isGiver = deal?.giver && address && getAddress(address) === getAddress(deal.giver)
  if (address && deal) {
    return (
      <Container>
        {isMinerOfTheDeal && (<Txt h5>You are Miner of the deal</Txt>)}
        {isGiver && (<Txt h5>You are Factor of the deal</Txt>)}
        <AcceptLoan address={address} isMiner={isMiner} deal={deal} />
        <CancelLoan address={address} isMiner={isMiner} deal={deal} />
        <Withdraw address={address} isMiner={isMiner} deal={deal} />
      </Container>
    )
  }

  if (!address) {
    return (
      <Container>
        <ConnectButton fullWidth />
      </Container>
    )
  }

  return (
    <Container>
      <Button isDisabled fullWidth>Loading...</Button>
    </Container>
  )
})
