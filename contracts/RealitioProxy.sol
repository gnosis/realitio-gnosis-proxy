pragma solidity ^0.5.12;

contract ConditionalTokens {
    function reportPayouts(bytes32 questionId, uint[] calldata payouts) external;
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

  function resolveCondition(bytes32 questionId) public {
    uint answer = uint(realitio.resultFor(questionId));

    uint[] memory payouts = new uint[](2);
    if (answer == 0) {
      payouts[0] = 1;
    } else if (answer == 1) {
      payouts[1] = 1;
    } else {
      revert('Only binary answers are supported');
    }

    conditionalTokens.reportPayouts(questionId, payouts);
  }
}
