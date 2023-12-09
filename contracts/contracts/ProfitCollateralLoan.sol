// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Context.sol";
import "filecoin-solidity-api/contracts/v0.8/types/CommonTypes.sol";
import "filecoin-solidity-api/contracts/v0.8/utils/FilAddresses.sol";
import "filecoin-solidity-api/contracts/v0.8/SendAPI.sol";
import "./Beneficiary.sol";

contract ProfitCollateralLoan is Context {
    error FilecoinCallFailed(int256 code, string reason);

    struct Loan {
        uint256[] giverSchedule;
        uint256[] giverValues;
        uint256[] giverWithdrawn;
        uint256[] minerSchedule;
        uint256[] minerValues;
        uint256[] minerWithdrawn;
        uint256 giverValue;
        uint256 minerValue;
        address giver;
        bool fundsReserved;
    }

    event MinerAdded(uint64 actorId, address beneficiary);
    event LoanPlaced(uint64 actorId, uint256 id, uint256[] giverSchedule, uint256[] giverValues, uint256[] minerSchedule, uint256[] minerValues);
    event LoanAccepted(uint64 actorId, uint256 id, address giver);
    event LoanCanceled(uint64 actorId, uint256 id);
    event LoanMinerWithdrawn(uint64 actorId, uint256 id, uint256 value);
    event LoanGiverWithdrawn(uint64 actorId, uint256 id, uint256 value);

    mapping(uint64 => Beneficiary) public miners;
    mapping(uint64 => uint256) public minerCounters;
    mapping(uint64 => mapping(uint256 => Loan)) public loans;
    mapping(uint64 => uint256) public lockedGiver;
    mapping(uint64 => uint256) public lockedMiner;

    modifier onlyActorOwner(uint64 actorId) {
        require(miners[actorId] != Beneficiary(payable(0)), "ProfitCollateralLoan: miner doesn't exists");
        require(miners[actorId].owner() == _msgSender(), "ProfitCollateralLoan: caller is not miner owner");
        _;
    }

    function addMiner(Beneficiary beneficiary) external {
        uint64 actorId = beneficiary.actorId();
        require(miners[actorId] == Beneficiary(payable(0)), "ProfitCollateralLoan: miner exists");
        require(beneficiary.beneficiaryInitialized(), "ProfitCollateralLoan: beneficiary uninitialized");
        require(beneficiary.loanManager() == address(this), "ProfitCollateralLoan: loan manager address unmatch");
        miners[actorId] = beneficiary;
        emit MinerAdded(actorId, address(beneficiary));
    }

    function placeLoan(
        uint64 actorId,
        uint256[] memory giverSchedule,
        uint256[] memory giverValues,
        uint256[] memory minerSchedule,
        uint256[] memory minerValues
    ) external onlyActorOwner(actorId) {
        require(giverSchedule.length == giverValues.length, "ProfitCollateralLoan: giver schedule and giver values lengths unmatched");
        require(minerSchedule.length == minerValues.length, "ProfitCollateralLoan: miner schedule and giver values lengths unmatched");
        require(giverValues.length > 0, "ProfitCollateralLoan: giver values empty");
        require(minerValues.length > 0, "ProfitCollateralLoan: miner values empty");

        uint256 giverValue = 0;
        uint256 minerValue = 0;
        for (uint256 i = 0; i < minerValues.length; i++) {
            require(minerValues[i] > 0, "ProfitCollateralLoan: zero miner value");
            if (i > 0) {
                require(minerSchedule[i-1] <= minerSchedule[i], "ProfitCollateralLoan: miner schedule unsorted");
            }
            minerValue += minerValues[i];
        }
        for (uint256 i = 0; i < giverValues.length; i++) {
            require(giverValues[i] > 0, "ProfitCollateralLoan: zero giver value");
            if (i > 0) {
                require(giverSchedule[i-1] <= giverSchedule[i], "ProfitCollateralLoan: giver schedule unsorted");
            }
            giverValue += giverValues[i];
        }

        uint256 id = minerCounters[actorId] + 1;
        minerCounters[actorId]++;
        loans[actorId][id] = Loan(
            giverSchedule,
            giverValues,
            new uint256[](giverSchedule.length),
            minerSchedule,
            minerValues,
            new uint256[](minerSchedule.length),
            giverValue,
            minerValue,
            address(0),
            false
        );
        emit LoanPlaced(actorId, id, giverSchedule, giverValues, minerSchedule, minerValues);
    }

    function acceptLoan(uint64 actorId, uint256 loanId) external payable {
        Loan storage loan = loans[actorId][loanId];
        require(loan.minerValue != 0 || loan.giverValue != 0, "ProfitCollateralLoan: loan doesn't exist");
        require(loan.giver == address(0), "");
        require(msg.value == loan.minerValue, "");
        loan.giver = _msgSender();
        lockedGiver[actorId] += loan.giverValue;
        lockedMiner[actorId] += loan.minerValue;
        emit LoanAccepted(actorId, loanId, _msgSender());
    }

    function cancelLoan(uint64 actorId, uint256 loanId) external {
        Loan storage loan = loans[actorId][loanId];
        require(loan.minerValue != 0 || loan.giverValue != 0, "ProfitCollateralLoan: loan doesn't exist");
        require(loan.giver == address(0), "");
        delete loans[actorId][loanId];
        emit LoanCanceled(actorId, loanId);
    }

    function withdraw(uint64 actorId, uint256 loanId, CommonTypes.FilAddress memory receiver, uint256 value) external {
        Loan storage loan = loans[actorId][loanId];
        require(loan.minerValue != 0 || loan.giverValue != 0, "ProfitCollateralLoan: loan doesn't exist");
        _withdraw(actorId, loanId, receiver, value);
    }

    function withdrawEthAddress(uint64 actorId, uint256 loanId, address receiver, uint256 value) external {
        Loan storage loan = loans[actorId][loanId];
        require(loan.minerValue != 0 || loan.giverValue != 0, "ProfitCollateralLoan: loan doesn't exist");
        _withdraw(actorId, loanId, FilAddresses.fromEthAddress(receiver), value);
    }

    function minerWithdraw(uint64 actorId, CommonTypes.FilAddress memory receiver, uint256 value) external onlyActorOwner(actorId) {
        _minerWithdraw(actorId, receiver, value);
    }

    function minerWithdrawEthAddress(uint64 actorId, address receiver, uint256 value) external onlyActorOwner(actorId) {
        _minerWithdraw(actorId, FilAddresses.fromEthAddress(receiver), value);
    }

    function reserveFunds(uint64 actorId, uint256[] memory loanIds) external onlyActorOwner(actorId) {
        uint256 balance = miners[actorId].availableBalance();
        uint256 toPay = 0;
        for (uint256 i = 0; i < loanIds.length; i++) {
            Loan storage loan = loans[actorId][loanIds[i]];
            require(loan.minerValue != 0 || loan.giverValue != 0, "ProfitCollateralLoan: loan doesn't exist");
            uint256 leftToPay = _loanLeftToPay(actorId, loanIds[i]);
            require(leftToPay <= balance, "ProfitCollateralLoan: insufficient balance");
            balance -= leftToPay;
            toPay += leftToPay;
            lockedGiver[actorId] -= leftToPay;
            loan.fundsReserved = true;
        }
        miners[actorId].takeProfit(toPay);
    }

    function replaceBeneficiary(uint64 actorId, CommonTypes.FilAddress memory newAddress, uint256 newQuota, int64 newEpoch) external onlyActorOwner(actorId) {
        require(lockedMiner[actorId] == 0, "ProfitCollateralLoan: there is locked funds for miner");
        require(lockedGiver[actorId] == 0, "ProfitCollateralLoan: there is locked funds for givers");
        miners[actorId].changeBeneficiary(newAddress, newQuota, newEpoch);
        miners[actorId] = Beneficiary(payable(0));
    }

    function replaceBeneficiaryEthAddress(uint64 actorId, address newAddress, uint256 newQuota, int64 newEpoch) external onlyActorOwner(actorId) {
        require(lockedMiner[actorId] == 0, "ProfitCollateralLoan: there is locked funds for miner");
        require(lockedGiver[actorId] == 0, "ProfitCollateralLoan: there is locked funds for givers");
        miners[actorId].changeBeneficiaryEthAddress(newAddress, newQuota, newEpoch);
        miners[actorId] = Beneficiary(payable(0));
    }

    receive() external payable {

    }

    function _withdraw(uint64 actorId, uint256 loanId, CommonTypes.FilAddress memory receiver, uint256 value) internal {
        Loan storage loan = loans[actorId][loanId];
        require(loan.minerValue != 0 || loan.giverValue != 0, "ProfitCollateralLoan: loan doesn't exist");
        if (_msgSender() == loan.giver) {
            _withdrawLoanGiver(actorId, loanId, receiver, value);
            emit LoanGiverWithdrawn(actorId, loanId, value);
        } else if (_msgSender() == miners[actorId].owner()) {
            _withdrawLoanMiner(actorId, loanId, receiver, value);
            emit LoanMinerWithdrawn(actorId, loanId, value);
        } else {
            revert("ProfitCollateralLoan: caller is not loan giver or beneficiary owner");
        }
    }

    function _withdrawLoanMiner(uint64 actorId, uint256 loanId, CommonTypes.FilAddress memory receiver, uint256 value) internal {
        Loan storage loan = loans[actorId][loanId];
        uint256 leftValue = value;
        for (uint256 i = 0; i < loan.minerSchedule.length; i++) {
            if (loan.minerSchedule[i] > block.timestamp) {
                break;
            }
            uint256 allowed = loan.minerValues[i] - loan.minerWithdrawn[i];
            if (allowed > leftValue) {
                loan.minerWithdrawn[i] += leftValue;
                leftValue = 0;
            } else {
                loan.minerWithdrawn[i] = loan.minerValues[i];
                leftValue -= allowed;
            }
        }
        require(leftValue == 0, "ProfitCollateralLoan: too much funds requested");
        int256 code = SendAPI.send(receiver, value);
        if (code != 0) {
            revert FilecoinCallFailed(code, "ProfitCollateralLoan: send");
        }
        lockedMiner[actorId] -= value;
    }

    function _withdrawLoanGiver(uint64 actorId, uint256 loanId, CommonTypes.FilAddress memory receiver, uint256 value) internal {
        Loan storage loan = loans[actorId][loanId];
        uint256 leftValue = value;
        for (uint256 i = 0; i < loan.giverSchedule.length; i++) {
            if (loan.giverSchedule[i] > block.timestamp) {
                break;
            }
            uint256 allowed = loan.giverValues[i] - loan.giverWithdrawn[i];
            if (allowed > leftValue) {
                loan.giverWithdrawn[i] += leftValue;
                leftValue = 0;
            } else {
                loan.giverWithdrawn[i] = loan.giverValues[i];
                leftValue -= allowed;
            }
        }
        require(leftValue == 0, "ProfitCollateralLoan: too much funds requested");
        if (loan.fundsReserved) {
            int256 code = SendAPI.send(receiver, value);
            if (code != 0) {
                revert FilecoinCallFailed(code, "ProfitCollateralLoan: send");
            }
        } else {
            require(value <= miners[actorId].availableBalance(), "ProfitCollateralLoan: insufficient miner balance");
            miners[actorId].takeProfit(value);
            int256 code = SendAPI.send(receiver, value);
            if (code != 0) {
                revert FilecoinCallFailed(code, "ProfitCollateralLoan: send");
            }
            lockedGiver[actorId] -= value;
        }
    }

    function _minerWithdraw(uint64 actorId, CommonTypes.FilAddress memory receiver, uint256 value) internal {
        uint256 balance = miners[actorId].availableBalance();
        require(value <= balance - lockedGiver[actorId], "ProfitCollateralLoan: insufficient miner balance");
        miners[actorId].takeProfit(value);
        int256 code = SendAPI.send(receiver, value);
        if (code != 0) {
            revert FilecoinCallFailed(code, "ProfitCollateralLoan: send");
        }
    }

    function _loanLeftToPay(uint64 actorId, uint256 loanId) internal view returns (uint256) {
        Loan storage loan = loans[actorId][loanId];
        uint256 res = 0;
        for (uint256 i = 0; i < loan.giverWithdrawn.length; i++) {
            res += loan.giverValues[i] - loan.giverWithdrawn[i];
        }
        return res;
    }
}