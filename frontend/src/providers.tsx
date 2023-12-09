import { ChakraProvider } from '@chakra-ui/react'
import { NextUIProvider } from '@nextui-org/react'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { type FC, type PropsWithChildren } from 'react'
import { WagmiConfig } from 'wagmi'

import { DialogManager } from './app/components/DialogManager'
import { chains, wagmiConfig } from './app/config/walletConnect.tsx'
import { StoreProvider } from './app/hooks/useStores.tsx'
import { StitchesProvider } from './styles'

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <StitchesProvider>
          <NextUIProvider disableBaseline>
            <ChakraProvider>
              <StoreProvider>
                {children}
                <DialogManager />
              </StoreProvider>
            </ChakraProvider>
          </NextUIProvider>
        </StitchesProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
