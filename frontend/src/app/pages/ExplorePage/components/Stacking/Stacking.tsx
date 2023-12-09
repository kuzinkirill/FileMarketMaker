import { observer } from 'mobx-react-lite'

import { type Deal } from '../../../../../api/Api.ts'
import { Txt } from '../../../../UIkit'
import { CardsContainer, CollectionSectionStyled, HeaderTable, StyledStackingWrapperContent } from './Stacking.styles.ts'
import DealCard from './StackingCard/DealCard.tsx'

const StackingDate: Deal[] = [{
  id: 0,
  deal_id: 0,
  miner: {
    beneficiary_owner: '0xTiAbobusNetTiAbobus',
  },
  status: 'Created',
  miner_value: '1000',
  giver_value: '1200',
  miner_schedule: [],
  giver_schedule: [],
},
{
  id: 1,
  deal_id: 0,
  miner: {
    beneficiary_owner: '0xHype',
  },
  status: 'Accepted',
  miner_value: '1234',
  giver_value: '1234',
  miner_schedule: [],
  giver_schedule: [],
},
{
  id: 2,
  deal_id: 0,
  miner: {
    beneficiary_owner: '0xUstinovich',
  },
  status: 'Finished',
  miner_value: '4321',
  giver_value: '4323',
  miner_schedule: [],
  giver_schedule: [],
}, {
  id: 3,
  deal_id: 0,
  miner: {
    beneficiary_owner: '0xCapibebra',
  },
  status: 'Cancelled',
  miner_value: '8642',
  giver_value: '9932',
  miner_schedule: [],
  giver_schedule: [],
}]

const Stacking = observer(() => {
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
        <StyledStackingWrapperContent>
          {
            StackingDate.map((item) => {
              return (
                <DealCard
                  {...item}
                  key={item.id}
                />
              )
            })
          }
        </StyledStackingWrapperContent>
      </CardsContainer>
    </CollectionSectionStyled>
  )
})

export default Stacking
