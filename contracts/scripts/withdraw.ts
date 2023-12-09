import * as hre from "hardhat";
import {ProfitCollateralLoan__factory} from "../typechain-types";
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
    program.option("-id, --id <number>");
    program.parse();
    const args = program.opts();

    const accounts = await hre.ethers.getSigners();
    const factory = new ProfitCollateralLoan__factory(accounts[1]);

    const priorityFee = await callRpc("eth_maxPriorityFeePerGas", "");
    console.log(priorityFee);

    const instance = factory.attach(args.instance);
    const tx = await instance.withdrawEthAddress(
        1000,
        args.id,
        accounts[1].address,
        500,{
            maxPriorityFeePerGas: priorityFee,
            from: accounts[1].address
        });
    console.log(tx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});