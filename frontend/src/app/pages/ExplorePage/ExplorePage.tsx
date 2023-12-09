import { observer } from 'mobx-react-lite'

import { PageLayout } from '../../UIkit'
import { Title } from '../../UIkit/PageLayout/Title/Title.tsx'
import Stacking from "./components/Stacking/Stacking.tsx";

export const ExplorePage = observer(() => {
  return (
    <PageLayout>
      <Title>ПОДПИСЫВАЙТЕСЬ НА КАНАЛ СТАВЬТЕ ЛАЙКИ</Title>
        <Stacking/>
    </PageLayout>
  )
})
