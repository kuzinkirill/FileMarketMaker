import { type TabsProps } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { StyledMuiTabs } from './MuiTabs.styles'

/** Must pass value and onchange attributes */
export const MuiTabs: React.FC<TabsProps> = observer((props) => {
  return (
    <StyledMuiTabs
      allowScrollButtonsMobile
      variant='scrollable'
      {...props}
    />
  )
})
