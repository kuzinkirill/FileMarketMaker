import { observer } from 'mobx-react-lite'
import React from 'react'
import { type Params, useNavigate, useParams } from 'react-router-dom'

import { styled } from '../../../../styles'
import { useProfileStoreWithUtils } from '../../../hooks/useProfileStoreWithUtils.ts'
import { Button, Loading, Txt } from '../../../UIkit'
import Plug from '../../../UIkit/Plug/Plug.tsx'
import { useActivatedStore } from '../../../utils/store/activate-deactivate/useActivatedStore.ts'
import Stacking from '../../ExplorePage/components/Stacking/Stacking.tsx'

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

  const { profileDealsStore } = useActivatedStore('profileDealsStore', profileAddress)

  return (
    <Loading isLoading={profileDealsStore.isLoading}>
      {(profileDealsStore.deals?.length ?? 0) > 0
        ? <Stacking deals={profileDealsStore.deals} />
        : (
          <NoNftContainer>
            <Plug
              header={(isMiner && 'You are MINER!') || (isMe && 'You are not a miner') || ('This account is empty')}
              mainText={(isMiner && 'Create your first LOAN!') || (isMe && 'But you could invest some money') || ('But you could invest some money')}
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
        )}
    </Loading>
  )
})

export default OwnedSection
