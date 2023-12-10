import { observer } from 'mobx-react-lite'

import { type Vesting } from '../../../../../../../../api/Api.ts'
import { TableVesting } from '../../../../../../../components/App/TableVesting/TableVesting.tsx'
import { Txt } from '../../../../../../../UIkit'
import {
  CollectionCardSection,
  CollectionCardSectionContent,
  CollectionCardSectionHeader,
} from '../CollectionCardTooltipContent.styles'

const GiverSchedule = observer(({ giverSchedule }: { giverSchedule?: Vesting[] }) => {
  return (
    <CollectionCardSection>
      <CollectionCardSectionHeader>
        Giver schedule
      </CollectionCardSectionHeader>
      {(giverSchedule && giverSchedule?.length > 0) ? (
        <CollectionCardSectionContent>
          <TableVesting vestings={giverSchedule} />
        </CollectionCardSectionContent>
      ) : <Txt primary1 style={{ color: 'black' }}> empty </Txt>}
    </CollectionCardSection>
  )
})

export default GiverSchedule
