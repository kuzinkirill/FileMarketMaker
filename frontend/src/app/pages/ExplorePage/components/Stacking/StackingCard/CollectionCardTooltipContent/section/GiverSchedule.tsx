import { type Vesting } from '../../../../../../../../api/Api.ts'
import {
  CollectionCardSection,
  CollectionCardSectionContent,
  CollectionCardSectionHeader,
} from '../CollectionCardTooltipContent.styles'

const GiverSchedule = ({ giverSchedule }: { giverSchedule?: Vesting[] }) => {
  return (
    <CollectionCardSection>
      <CollectionCardSectionHeader>
        Giver schedule
      </CollectionCardSectionHeader>
      <CollectionCardSectionContent>
        Content
        {JSON.stringify(giverSchedule)}
      </CollectionCardSectionContent>
    </CollectionCardSection>
  )
}

export default GiverSchedule
