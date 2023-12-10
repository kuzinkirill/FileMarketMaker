import { observer } from 'mobx-react-lite'
import { type FC } from 'react'

import { type Deal } from '../../../../../api/Api.ts'
import { Txt } from '../../../../UIkit'
import { CardsContainer, CollectionSectionStyled, HeaderTable, StyledStackingWrapperContent } from './Stacking.styles.ts'
import { DealCard } from './StackingCard/DealCard.tsx'

interface StackingProps {
  deals?: Deal[]
}

const Stacking: FC<StackingProps> = observer(({ deals }) => {
  return (
    <CollectionSectionStyled>
      <CardsContainer>
        <HeaderTable>
          <Txt>Miner address</Txt>
          <Txt>Miner value</Txt>
          <Txt>Giver value</Txt>
          <Txt>Status</Txt>
          <Txt>Schedule</Txt>
        </HeaderTable>
        {deals && (
          <StyledStackingWrapperContent>
            {
              deals?.map((item) => {
                return (
                  <DealCard
                    {...item}
                    key={item.id}
                  />
                )
              })
            }
          </StyledStackingWrapperContent>
        )}
      </CardsContainer>
    </CollectionSectionStyled>
  )
})

export default Stacking
