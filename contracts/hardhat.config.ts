import { HardhatUserConfig } from "hardhat/config";
import { HttpNetworkUserConfig } from "hardhat/types/config";
import "@nomicfoundation/hardhat-toolbox";

const filecoinLocalConfig: HttpNetworkUserConfig = {
  chainId: 31415926,
  url: "https://lotus.filemarket.xyz/rpc/v1",
  accounts: ["35229d57e02b072b60a04a37f34657d0446748d79eec4c4efa72a7c24da37d4b", "b120f71f6a2d04a505997741e939319d027ee10ff9554757f1c7f03e0ea48b6e"]
}

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    filemarket: filecoinLocalConfig
  }
};

export default config;
