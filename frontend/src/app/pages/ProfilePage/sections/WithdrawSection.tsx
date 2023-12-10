import { observer } from 'mobx-react-lite'
import React from 'react'
import { type Params, useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'

import { styled } from '../../../../styles'
import { MinerWithdraw } from '../../../components/LoanActions/MinerWithdraw/ui/MinerWithdraw.tsx'
import { useProfileStoreWithUtils } from '../../../hooks/useProfileStoreWithUtils.ts'
import Plug from '../../../UIkit/Plug/Plug.tsx'

const NoNftContainer = styled('div', {
  gridColumn: '1/-1',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '$3',
  width: '100%',
})

export const OwnedSection: React.FC = observer(() => {
  const { profileAddress } = useParams<Params>()

  const { isMiner, isMe, profileStore } = useProfileStoreWithUtils(profileAddress)
  const { address } = useAccount()

  return (
    <NoNftContainer>
      <Plug
        header={(isMiner && 'You are MINER!') || (isMe && 'You are not a miner') || ('Not connected')}
        mainText={(isMiner && 'Withdraw your profits') || (isMe && 'This section is only for miners') || ('Please connect your wallet')}
        buttonsBlock={(
          <>
            {isMiner && address && (
              <MinerWithdraw address={address} miner={profileStore.data?.miner} isMiner={isMiner} />
            )}
          </>
        )}
      />
    </NoNftContainer>
  )
})

export default OwnedSection
