import { observer } from 'mobx-react-lite'

import { Loading, PageLayout } from '../../UIkit'
import { Title } from '../../UIkit/PageLayout/Title/Title.tsx'
import { useActivatedStore } from '../../utils/store/activate-deactivate/useActivatedStore.ts'
import Stacking from './components/Stacking/Stacking.tsx'

export const ExplorePage = observer(() => {
  const { dealsListStore } = useActivatedStore('dealsListStore')

  return (
    <PageLayout>
      <Title>ПОДПИСЫВАЙТЕСЬ НА КАНАЛ СТАВЬТЕ ЛАЙКИ</Title>
      <Loading isLoading={dealsListStore.isLoading}>
        <Stacking deals={dealsListStore.data} />
      </Loading>

    </PageLayout>
  )
})
