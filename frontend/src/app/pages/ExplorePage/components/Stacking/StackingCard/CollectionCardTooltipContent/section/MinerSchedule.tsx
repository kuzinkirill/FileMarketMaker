import { observer } from 'mobx-react-lite'

import { type Vesting } from '../../../../../../../../api/Api.ts'
import { TableVesting } from '../../../../../../../components/App/TableVesting/TableVesting.tsx'
import { Txt } from '../../../../../../../UIkit/Txt/Txt.tsx'
import {
  CollectionCardSection,
  CollectionCardSectionContent,
  CollectionCardSectionHeader,
} from '../CollectionCardTooltipContent.styles'

const MinerSchedule = observer(({ minerSchedule }: { minerSchedule?: Vesting[] }) => {
  return (
    <CollectionCardSection>
      <CollectionCardSectionHeader>
        Miner schedule
      </CollectionCardSectionHeader>
      {(minerSchedule && minerSchedule.length > 0) ? (
        <CollectionCardSectionContent>
          <TableVesting vestings={minerSchedule} />
        </CollectionCardSectionContent>
      ) : <Txt primary1 style={{ color: 'black' }}>empty</Txt>}
    </CollectionCardSection>
  )
})

export default MinerSchedule
