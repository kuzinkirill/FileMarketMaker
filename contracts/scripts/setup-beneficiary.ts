import * as hre from "hardhat";
import {Beneficiary__factory} from "../typechain-types";
import { program } from "commander";

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
    program.option("-instance, --instance <string>");
    program.parse();
    const args = program.opts();

    const accounts = await hre.ethers.getSigners();
    const beneficiaryFactory = new Beneficiary__factory(accounts[0]);

    const priorityFee = await callRpc("eth_maxPriorityFeePerGas", "");
    console.log(priorityFee);

    const instance = beneficiaryFactory.attach(args.instance);
    const tx = await instance.setupBeneficiary("1000000000000000000000000", "1000000000000", {
        maxPriorityFeePerGas: priorityFee
    });
    console.log(tx.hash);
}

// HARDHAT_NETWORK=filemarket ts-node scripts/setup-beneficiary.ts --instance 0x3642104624e2A6ecD33fb8ae6b410EfC022aDbE8

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});