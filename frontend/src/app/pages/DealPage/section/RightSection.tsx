import { observer } from 'mobx-react-lite'
import { type FC } from 'react'

import { type Deal } from '../../../../api/Api.ts'
import { TableVesting } from '../../../components/App/TableVesting/TableVesting.tsx'
import { Flex } from '../../../UIkit'

interface RightSectionProps {
  deal: Deal
}

export const RightSection: FC<RightSectionProps> = observer(({ deal }) => {
  const { miner_schedule, giver_schedule } = deal

  return (
    <Flex flexDirection={'column'} gap={'32px'} w100>
      <TableVesting vestings={miner_schedule || []} title={'Miner Schedule'} />
      <TableVesting vestings={giver_schedule || []} title={'Giver Schedule'} />
    </Flex>
  )
})
