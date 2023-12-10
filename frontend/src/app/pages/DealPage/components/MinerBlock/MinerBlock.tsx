import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import { type FC } from 'react'
import { formatEther } from 'viem'

import { type Miner } from '../../../../../api/Api.ts'
import { Txt } from '../../../../UIkit'
import { PropertyList, type PropertyListRowData } from '../../../../UIkit/Property'
import { reduceAddress } from '../../../../utils/web3/reduceAddress.ts'

interface MinerBlockProps {
  miner: Miner
}

export const MinerBlock: FC<MinerBlockProps> = observer(({ miner }) => {
  const {
    address,
    workerAddress,
    ownerAddress,
    beneficiary_owner,
    beneficiary_contract,
    loan_contract,
    available_balance,
    creationTimestamp,
  } = miner

  const list: PropertyListRowData[] = [
    {
      key: 'Miner address',
      label: 'Miner address',
      value: (
        <Txt primary1 style={{ wordBreak: 'break-word' }}>
          {reduceAddress(address || '')}
        </Txt>
      ),
      hidden: !address,
    },
    {
      key: 'Worker address',
      label: 'Worker address',
      value: (
        <Txt primary1 style={{ wordBreak: 'break-word' }}>
          {reduceAddress(workerAddress || '')}
        </Txt>
      ),
      hidden: !workerAddress,
    },
    {
      key: 'Owner address',
      label: 'Owner address',
      value: (
        <Txt primary1 style={{ wordBreak: 'break-word' }}>
          {reduceAddress(ownerAddress || '')}
        </Txt>
      ),
    },
    {
      key: 'Beneficiary owner',
      label: 'Beneficiary owner',
      value: (
        <Txt primary1 style={{ wordBreak: 'break-word' }}>
          {reduceAddress(beneficiary_owner || '')}
        </Txt>
      ),
    },
    {
      key: 'Beneficiary contract',
      label: 'Beneficiary contract',
      value: (
        <Txt primary1 style={{ wordBreak: 'break-word' }}>
          {reduceAddress(beneficiary_contract || '')}
        </Txt>
      ),
    },
    {
      key: 'Loan contract',
      label: 'Loan contract',
      value: (
        <Txt primary1 style={{ wordBreak: 'break-word' }}>
          {reduceAddress(loan_contract || '')}
        </Txt>
      ),
      hidden: !loan_contract,
    },
    {
      key: 'Available Balance',
      label: 'Available Balance',
      value: (
        <Txt primary1 style={{ wordBreak: 'break-word' }}>
          {formatEther(BigInt(available_balance ?? '0'))}
        </Txt>
      ),
    },
    {
      key: 'Created at',
      label: 'Created at',
      value: (
        <Txt primary1 style={{ wordBreak: 'break-word' }}>
          {DateTime.fromMillis(creationTimestamp || 0).setLocale('en-US').toLocaleString(DateTime.DATE_FULL)}
        </Txt>
      ),
    },

  ]

  return (
    <div style={{ height: '300px' }}>
      <PropertyList list={list} spacing={8} />
    </div>
  )
})
