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
    const actor = 1000;

    const accounts = await hre.ethers.getSigners();
    console.log(accounts[0].address, actor);
    const factory = new ProfitCollateralLoan__factory(accounts[0]);
    const beneficiaryFactory = new Beneficiary__factory(accounts[0]);

    const priorityFee = await callRpc("eth_maxPriorityFeePerGas", "");
    console.log(priorityFee);

    const profitManager = await factory.deploy({maxPriorityFeePerGas: priorityFee});
    const profitManagerAddress = profitManager.address;
    console.log(profitManagerAddress, actor);
    const beneficiary = await beneficiaryFactory.deploy(actor, profitManagerAddress, accounts[0].address);
    const beneficiaryAddress = beneficiary.address;
    console.log(beneficiaryAddress)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});