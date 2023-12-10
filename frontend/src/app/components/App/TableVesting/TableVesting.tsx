import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import { type FC } from 'react'
import { formatEther } from 'viem'

import { type Vesting } from '../../../../api/Api.ts'
import { Txt } from '../../../UIkit'
import { formatNumber } from '../../../utils/number'

interface TableVestingProps {
  title?: string
  vestings: Vesting[]
}

export const TableVesting: FC<TableVestingProps> = observer(({ title, vestings }) => {
  return (
    <TableContainer style={{ width: '100%', maxWidth: '600px', color: 'black', textAlign: 'left' }}>
      <Txt h5>{title}</Txt>
      <Table variant='striped' colorScheme='teal' style={{ width: '100%' }}>
        <Thead>
          <Tr>
            <Th style={{ width: '30%' }}>Unlock at</Th>
            <Th style={{ width: '30%' }}>Value</Th>
            <Th style={{ width: '30%' }}>Receiver</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vestings.map((item, index) => {
            return (
              <Tr key={index}>
                <Td style={{ width: '30%' }}>{DateTime.fromMillis(item.locked_until || 0).setLocale('en-US').toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}</Td>
                <Td style={{ width: '30%' }} >{formatNumber(formatEther(BigInt(item.value ?? '0')))}</Td>
                <Td style={{ width: '30%' }} >{formatNumber(formatEther(BigInt(item.received ?? '0')))}</Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </TableContainer>
  )
})
