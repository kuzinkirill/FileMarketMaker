import { observer } from 'mobx-react-lite'

import { type Vesting } from '../../../../../../../api/Api.ts'
import { CollectionCardTooltipContentStyled } from './CollectionCardTooltipContent.styles'
import GiverSchedule from './section/GiverSchedule.tsx'
import MinerSchedule from './section/MinerSchedule.tsx'

interface ICollectionCardTooltipContent {
  minerSchedule?: Vesting[]
  giverSchedule?: Vesting[]
}

const CollectionCardTooltipContent = observer(({ minerSchedule, giverSchedule }: ICollectionCardTooltipContent) => {
  return (
    <CollectionCardTooltipContentStyled>
      <MinerSchedule minerSchedule={minerSchedule} />
      <GiverSchedule giverSchedule={giverSchedule} />
    </CollectionCardTooltipContentStyled>
  )
})

export default CollectionCardTooltipContent
