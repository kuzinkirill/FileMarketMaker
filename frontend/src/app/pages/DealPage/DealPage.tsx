import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'

import { Loading, PageLayout } from '../../UIkit'
import { Title } from '../../UIkit/PageLayout/Title/Title.tsx'
import { type Params } from '../../utils/router'
import { useActivatedStore } from '../../utils/store/activate-deactivate/useActivatedStore.ts'
import { StyledSectionContainer } from './DealPage.styles.ts'
import { LeftSection } from './section/LeftSection.tsx'
import { RightSection } from './section/RightSection.tsx'

export const DealPage = observer(() => {
  const { dealId } = useParams<Params>()

  const { dealStore } = useActivatedStore('dealStore', dealId)

  const { data } = dealStore

  return (
    <PageLayout>
      <Title>Deal info</Title>
      <Loading isLoading={dealStore.isLoading}>
        {data && (
          <StyledSectionContainer >
            <LeftSection deal={data} />
            <RightSection deal={data} />
          </StyledSectionContainer>

        )}
      </Loading>
    </PageLayout>
  )
})
