import { observer } from 'mobx-react-lite'
import { type FC } from 'react'

import { type Deal } from '../../../../api/Api.ts'
import { MinerBlock } from '../components/MinerBlock/MinerBlock.tsx'

interface LeftSectionProps {
  deal: Deal
}

export const LeftSection: FC<LeftSectionProps> = observer(({ deal }) => {
  const { miner, status } = deal

  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      <MinerBlock miner={miner || {}} dealStatus={status} />
    </div>
  )
})
