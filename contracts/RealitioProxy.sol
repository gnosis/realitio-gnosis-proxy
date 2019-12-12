pragma solidity ^0.5.12;

contract ConditionalTokens {
    function reportPayouts(bytes32 questionId, uint256[] calldata payouts) external;
}

contract Realitio {
    function resultFor(bytes32 questionId) external view returns (bytes32);
}

contract RealitioProxy {
  ConditionalTokens public conditionalTokens;
  Realitio public realitio;

  constructor(ConditionalTokens _conditionalTokens, Realitio _realitio) public {
    conditionalTokens = _conditionalTokens;
    realitio = _realitio;
  }

  function resolveBinaryCondition(bytes32 questionId) public {
    uint256 answer = uint256(realitio.resultFor(questionId));

    uint256[] memory payouts = new uint256[](2);
    if (answer == 0) { // answer is no
      payouts[1] = 1;
    } else if (answer == 1) { // answer is yes
      payouts[0] = 1;
    } else {
      revert('Only binary answers are supported');
    }

    conditionalTokens.reportPayouts(questionId, payouts);
  }

  function resolveSingleSelectCondition(bytes32 questionId, uint256 numOutcomes) public {
    uint256 answer = uint256(realitio.resultFor(questionId));

    require(answer < numOutcomes, "Answer must be between 0 and numOutcomes");

    uint256[] memory payouts = new uint256[](numOutcomes);

    payouts[answer] = 1;

    conditionalTokens.reportPayouts(questionId, payouts);
  }
}
