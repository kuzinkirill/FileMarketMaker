import { type SxProps, type Theme } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React, { type CSSProperties, type ReactNode } from 'react'

import { Flex } from '../../Flex'
import { Txt } from '../../Txt'
import { StyledUnderline } from './PropertyRow.styles'

export interface PropertyRowData {
  label: ReactNode
  value: ReactNode
  hidden?: boolean
  height?: CSSProperties['height']
}

export interface PropertyRowProps extends PropertyRowData {
  disableUnderline?: boolean
  alignItems?: CSSProperties['alignItems']
  sx?: SxProps<Theme>
}

export const PropertyRow: React.FC<PropertyRowProps> = observer(({
  label,
  value,
  hidden,
  disableUnderline,
}) => {
  if (hidden) return null

  return (
    <Flex
      w100
      gap={2}
      justifyContent="space-between"
    >
      <Txt>
        {label}
      </Txt>
      {!disableUnderline && <StyledUnderline />}
      <Txt
        style={{
          textAlign: 'center',
          display: 'inline-flex',
        }}
      >
        {value}
      </Txt>
    </Flex>
  )
})
