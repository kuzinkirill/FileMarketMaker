import { observer } from 'mobx-react-lite'
import React, { type CSSProperties, type Key, type ReactNode } from 'react'

import { Flex } from '../../Flex'
import { Txt } from '../../Txt'
import { PropertyRow, type PropertyRowData, type PropertyRowProps } from '../Row'

export interface PropertyListRowData extends PropertyRowData {
  key: Key
}

interface PropertyListProps extends Pick<PropertyRowProps, 'disableUnderline' | 'alignItems'> {
  title?: ReactNode
  list: PropertyListRowData[]
  maxWidth?: CSSProperties['maxWidth']
  spacing?: number
  className?: string
  rowHeight?: CSSProperties['height']
}

export const PropertyList: React.FC<PropertyListProps> = observer(({
  title,
  list,
  disableUnderline,
  alignItems,
  spacing = 4,
  rowHeight,
  className,
}) => {
  return (
    <Flex
      w100
      h100
      flexDirection="column"
      gap={5}
      className={className}
      alignItems={'center'}
      css={{ height: '300px' }}
    >
      {title && (
        <Txt style={{ fontWeight: '700' }} >
          {title}
        </Txt>
      )}
      <Flex
        w100
        h100
        flexDirection="column"
        gap={spacing}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        {list.map(({ key, height, ...data }) => (
          <PropertyRow
            key={key}
            {...data}
            height={rowHeight || height}
            disableUnderline={disableUnderline}
            alignItems={alignItems}
          />
        ))}
      </Flex>
    </Flex>
  )
})
