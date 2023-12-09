# Contracts

```bash
HARDHAT_NETWORK=filemarket ts-node scripts/deploy.ts
# 0x2E691A044caed86efAd088473e366C4eBaA7aa7c 0x13d8B6Fc9E4216edd72774fdBfe3c21cB729B244 
./lotus-miner actor propose-change-beneficiary --really-do-it --overwrite-pending-change t410fcpmln7e6iilo3vzhot637y6cds3stmseu2toj4y 1000000 1000000000000
HARDHAT_NETWORK=filemarket ts-node scripts/setup-beneficiary.ts --instance 0x13d8B6Fc9E4216edd72774fdBfe3c21cB729B244 HARDHAT_NETWORK=filemarket ts-node scripts/add-miner.ts --instance 0x2E691A044caed86efAd088473e366C4eBaA7aa7c --beneficiary 0x13d8B6Fc9E4216edd72774fdBfe3c21cB729B244 
HARDHAT_NETWORK=filemarket ts-node scripts/place-deal.ts --instance 0x2E691A044caed86efAd088473e366C4eBaA7aa7c
HARDHAT_NETWORK=filemarket ts-node scripts/accept-deal.ts --instance 0x2E691A044caed86efAd088473e366C4eBaA7aa7c --id 1 
HARDHAT_NETWORK=filemarket ts-node scripts/withdraw-miner.ts --instance 0x2E691A044caed86efAd088473e366C4eBaA7aa7c --id 1
HARDHAT_NETWORK=filemarket ts-node scripts/withdraw.ts --instance 0x2E691A044caed86efAd088473e366C4eBaA7aa7c --id 1
```