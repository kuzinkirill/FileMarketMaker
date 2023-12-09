import { Slide, ThemeProvider, Tooltip } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { type Deal } from '../../../../../../api/Api.ts'
import { useMediaMui } from '../../../../../hooks'
import { cutNumber } from '../../../../../utils/number'
import CollectionCardTooltipContent from './CollectionCardTooltipContent/CollectionCardTooltipContent'
import {
  CollectionCardText,
  CollectionCardTypesText,
  InsideContainer,
  StyledCollectionCard,
  StyledCollectionGrid, StyledScheduleText,
  theme,
} from './DealCard.styles.ts'

export default function DealCard({
  id,
  giver_schedule,
  giver_value,
  miner,
  miner_schedule,
  miner_value,
  status,
}: Deal) {
  const [isShowNumber, setIsShowNumber] = useState<boolean>(false)
  const navigate = useNavigate()
  const { smValue, mdValue } = useMediaMui()

  const tooltipOffset: number = useMemo(() => {
    if (smValue) return 0
    if (mdValue) return 100

    return 250
  }, [smValue, mdValue])

  return (
    <StyledCollectionCard
      onMouseEnter={() => { setIsShowNumber(true) }}
      onMouseLeave={() => { setIsShowNumber(false) }}
      onMouseDown={() => { setIsShowNumber(true) }}
      onMouseUp={() => { setIsShowNumber(false) }}
      onClick={(e) => {
        e.preventDefault()
        navigate(`/miner/${id}`)
      }}
    >
      <StyledCollectionGrid>
        <InsideContainer>
          <CollectionCardText>{miner?.beneficiary_owner}</CollectionCardText>
        </InsideContainer>
        <CollectionCardText>{isShowNumber ? miner_value : cutNumber(miner_value)}</CollectionCardText>
        <CollectionCardText>{isShowNumber ? giver_value : cutNumber(giver_value)}</CollectionCardText>
        <CollectionCardTypesText>{status}</CollectionCardTypesText>
        <ThemeProvider theme={theme}>
          <Tooltip
            placement={'left'}
            title={(
              <CollectionCardTooltipContent
                minerSchedule={miner_schedule}
                giverSchedule={giver_schedule}
              />
            )}
            TransitionComponent={Slide}
            TransitionProps={{
              dir: 'right',
            }}
            PopperProps={{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, tooltipOffset],
                  },
                },
              ],
            }}

          >
            <StyledScheduleText onClick={(e) => {
              e.stopPropagation()
            }}
            >
              Schedule
            </StyledScheduleText>
          </Tooltip>
        </ThemeProvider>
      </StyledCollectionGrid>
    </StyledCollectionCard>
  )
}
