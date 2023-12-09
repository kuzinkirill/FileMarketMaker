import { type Vesting } from '../../../../../../../../api/Api.ts'
import {
  CollectionCardSection,
  CollectionCardSectionContent,
  CollectionCardSectionHeader,
} from '../CollectionCardTooltipContent.styles'

const MinerSchedule = ({ minerSchedule }: { minerSchedule?: Vesting[] }) => {
  return (
    <CollectionCardSection>
      <CollectionCardSectionHeader>
        Miner schedule
      </CollectionCardSectionHeader>
      <CollectionCardSectionContent>
        Content
        {JSON.stringify(minerSchedule)}
      </CollectionCardSectionContent>
    </CollectionCardSection>
  )
}

export default MinerSchedule
