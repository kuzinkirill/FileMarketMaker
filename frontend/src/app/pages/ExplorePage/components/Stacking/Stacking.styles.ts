import { styled } from '../../../../../styles'
import { StyledCollectionGrid } from './StackingCard/DealCard.styles.ts'

export const CollectionSectionStyled = styled('div', {
  width: '100%',
  overflowX: 'auto',
})

export const HeaderTable = styled(StyledCollectionGrid, {
  color: '#A9ADB1',
  marginBottom: '8px',
  padding: '16px',
  gridTemplateColumns: '400px 100px 100px 100px 150px',
  '@lg': {
    gridTemplateColumns: '260px 90px 90px 90px 150px',
  },
  '@sm': {
    gridTemplateColumns: '130px 90px 90px 90px 150px',
  },
})

export const CardsContainer = styled('div', {
  width: '100%',
  '@lg': {
    width: 'max-content',
  },
})

export const StyledStackingWrapperContent = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '100%',
})
