import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { type Chain, configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

export const chain: Chain = {
  id: 31415926,
  name: 'Local filecoin',
  network: 'Filecoin - Local testnet',
  nativeCurrency: {
    name: 'TFIL',
    symbol: 'TFIL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://lotus.filemarket.xyz/rpc/v1',
      ],
    },
    public: {
      http: [
        'https://lotus.filemarket.xyz/rpc/v1',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Calibration filscan',
      url: 'https://calibration.filscan.io',
    },
  },
  testnet: true,
}

export const projectId = import.meta.env.VITE_WEB3_MODAL_PROJECT_ID

if (!projectId) {
  throw new Error('You need to provide VITE_WEB3_MODAL_PROJECT_ID env variable')
}

export const { chains, publicClient } = configureChains(
  [chain],
  [publicProvider()],
  { pollingInterval: 3_000 },
)

const { connectors } = getDefaultWallets({
  appName: 'FileMarketMaker',
  projectId,
  chains,
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})
