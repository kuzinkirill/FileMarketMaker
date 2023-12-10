import { observer } from 'mobx-react-lite'
import React from 'react'
import { type Params, useNavigate, useParams } from 'react-router-dom'

import { styled } from '../../../../styles'
import { useProfileStoreWithUtils } from '../../../hooks/useProfileStoreWithUtils.ts'
import { Button, Txt } from '../../../UIkit'
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
  const navigate = useNavigate()

  const { isMiner, isMe } = useProfileStoreWithUtils(profileAddress)

  return (
    <NoNftContainer>
      <Plug
        header={(isMiner && 'You are MINER!') || (isMe && 'You are not a miner') || ('This account is empty')}
        mainText={(isMiner && 'Create your first LOAN!') || (isMe && 'But you could lend some money') || ('But you could lend come money')}
        buttonsBlock={(
          <>
            <Button primary onClick={() => { navigate('/market') }}>
              <Txt primary1>Explore</Txt>
            </Button>
            {isMiner && (
              <Button primary onClick={() => { navigate('/create') }}>
                <Txt primary1>Create</Txt>
              </Button>
            )}
          </>
        )}
      />
    </NoNftContainer>
  )
})

export default OwnedSection
