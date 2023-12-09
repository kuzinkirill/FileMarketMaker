// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "node_modules/filecoin-solidity-api/contracts/v0.8/types/CommonTypes.sol";
import "node_modules/filecoin-solidity-api/contracts/v0.8/types/MinerTypes.sol";
import "node_modules/filecoin-solidity-api/contracts/v0.8/utils/FilAddresses.sol";
import "node_modules/filecoin-solidity-api/contracts/v0.8/utils/BigInts.sol";
import "node_modules/filecoin-solidity-api/contracts/v0.8/MinerAPI.sol";
import "node_modules/filecoin-solidity-api/contracts/v0.8/SendAPI.sol";

contract Beneficiary is Ownable {
    error FilecoinCallFailed(int256 code, string reason);

    uint64 public actorId;
    address public loanManager;
    bool public beneficiaryInitialized;

    modifier onlyLoanManager {
        require(_msgSender() == loanManager, "Beneficiary: caller is not loan manager");
        _;
    }

    constructor(
        uint64 _actorId,
        address _loanManager,
        address _owner
    ) {
        actorId = _actorId;
        loanManager = _loanManager;
        beneficiaryInitialized = false;
        _transferOwnership(_owner);
    }

    function takeProfit(uint256 value) external onlyLoanManager {
        require(beneficiaryInitialized, "Beneficiary: not initialized");
        require(value <= _availableBalance(), "Beneficiary: insufficient balance");
        _withdrawFromMiner(
            FilAddresses.fromEthAddress(loanManager),
            value
        );
    }

    function setupBeneficiary() external {
        _changeBeneficiary(FilAddresses.fromEthAddress(address(this)));
        beneficiaryInitialized = true;
    }

    function changeBeneficiary(CommonTypes.FilAddress memory newAddress) external onlyLoanManager {
        require(beneficiaryInitialized, "Beneficiary: not initialized");
        _changeBeneficiary(newAddress);
    }

    function changeBeneficiaryEthAddress(address newAddress) external onlyLoanManager {
        require(beneficiaryInitialized, "Beneficiary: not initialized");
        _changeBeneficiary(FilAddresses.fromEthAddress(newAddress));
    }

    function availableBalance() external returns (uint256) {
        return _availableBalance();
    }

    receive() external payable {

    }

    function _changeBeneficiary(CommonTypes.FilAddress memory newAddress) internal {
        int256 code = MinerAPI.changeBeneficiary(CommonTypes.FilActorId.wrap(actorId), MinerTypes.ChangeBeneficiaryParams(
            newAddress,
            BigInts.fromUint256(BigInts.MAX_UINT),
            CommonTypes.ChainEpoch.wrap(int64((2 ** 63) - 1))
        ));
        if (code != 0) {
            revert FilecoinCallFailed(code, "Beneficiary: change beneficiary");
        }
    }

    function _withdrawFromMiner(CommonTypes.FilAddress memory receiver, uint256 value) internal {
        (int256 code,) = MinerAPI.withdrawBalance(CommonTypes.FilActorId.wrap(actorId), BigInts.fromUint256(value));
        if (code != 0) {
            revert FilecoinCallFailed(code, "Beneficiary: withdraw");
        }
        code = SendAPI.send(receiver, value);
        if (code != 0) {
            revert FilecoinCallFailed(code, "Beneficiary: send");
        }
    }

    function _availableBalance() internal view returns (uint256) {
        (int256 exitCode, CommonTypes.BigInt memory res) = MinerAPI.getAvailableBalance(CommonTypes.FilActorId.wrap(actorId));
        if (exitCode != 0) {
            revert FilecoinCallFailed(exitCode, "Beneficiary: get available balance");
        }
        (uint256 resUint256,) = BigInts.toUint256(res);
        return resUint256;
    }
}