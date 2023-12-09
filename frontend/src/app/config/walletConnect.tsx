import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { w3mProvider } from '@web3modal/ethereum'
import { type Chain, configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

const chain: Chain = {
  id: 314159,
  name: 'FilecoinTestnet',
  network: 'Filecoin - Calibration testnet',
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
  [w3mProvider({ projectId }), publicProvider()],
  { pollingInterval: 3_000 },
)

const { connectors } = getDefaultWallets({
  appName: 'Filemarket',
  projectId,
  chains,
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})
