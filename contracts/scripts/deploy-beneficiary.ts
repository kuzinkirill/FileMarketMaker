import * as hre from "hardhat";
import {Beneficiary__factory, ProfitCollateralLoan__factory} from "../typechain-types";

const util = require("util");
const request = util.promisify(require("request"));

async function callRpc(method: string, params: string) {
    const network = process.env.HARDHAT_NETWORK;
    let url: string;
    if (network === 'filemarket') {
        url = 'https://lotus.filemarket.xyz/rpc/v1';
    } else {
        url = 'https://lotus.filemarket.xyz/rpc/v1';
    }
    const options = {
        method: "POST",
        url: url,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: method,
            params: [],
            id: 1,
        }),
    }
    console.log(options.body);
    const res = await request(options)
    return JSON.parse(res.body).result
}

async function main() {
    const investManagerAddress = "0x40F7fA19A7F6f27eC690768b4D99Ff46dB1bE18E";
    const actor = 1000;

    const accounts = await hre.ethers.getSigners();
    console.log(accounts[0].address, actor);
    const beneficiaryFactory = new Beneficiary__factory(accounts[0]);

    const priorityFee = await callRpc("eth_maxPriorityFeePerGas", "");
    console.log(priorityFee);

    const beneficiary = await beneficiaryFactory.deploy(actor, investManagerAddress, accounts[0].address);
    const beneficiaryAddress = beneficiary.address;
    console.log(beneficiaryAddress)
}

// HARDHAT_NETWORK=filemarket ts-node scripts/deploy-beneficiary.ts

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});