import * as hre from "hardhat";
import {Beneficiary__factory} from "../typechain-types";
import { program } from "commander";

async function main() {
    program.option("-instance, --instance <string>");
    program.parse();
    const args = program.opts();

    const accounts = await hre.ethers.getSigners();
    const beneficiaryFactory = new Beneficiary__factory(accounts[0]);

    const instance = beneficiaryFactory.attach(args.instance);
    const value = await instance.availableBalance();
    console.log(value);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});