import { createTheme, ThemeProvider } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React, { PropsWithChildren } from 'react'

// Приходится некоторые компоненты оборачивать в ThemeProvider
// потому что ThirdwebProvider перезаписывает тему, и компоненты из mui ломаются
const theme = createTheme()

export const HackMuiThemeProvider: React.FC<PropsWithChildren> = observer(({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
})
