import { Slide, ThemeProvider, Tooltip } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatEther } from 'viem'

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

export const DealCard = observer(function DealCard({
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
        navigate(`/deal/${id}`)
      }}
    >
      <StyledCollectionGrid>
        <InsideContainer>
          <CollectionCardText>{miner?.beneficiary_owner}</CollectionCardText>
        </InsideContainer>
        <CollectionCardText>{isShowNumber ? formatEther(BigInt(miner_value ?? '0')) : cutNumber(formatEther(BigInt(miner_value ?? '0')))}</CollectionCardText>
        <CollectionCardText>{isShowNumber ? formatEther(BigInt(giver_value ?? '0')) : cutNumber(formatEther(BigInt(giver_value ?? '0')))}</CollectionCardText>
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
})
