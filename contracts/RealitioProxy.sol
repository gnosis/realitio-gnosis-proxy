pragma solidity ^0.5.12;

interface IConditionalTokens {
    function reportPayouts(bytes32 questionId, uint256[] calldata payouts) external;
}

interface IRealitio {
    function resultFor(bytes32 questionId) external view returns (bytes32);
}

contract RealitioProxy {
  IConditionalTokens public conditionalTokens;
  IRealitio public realitio;

  constructor(IConditionalTokens _conditionalTokens, IRealitio _realitio) public {
    conditionalTokens = _conditionalTokens;
    realitio = _realitio;
  }

  function resolveSingleSelectCondition(bytes32 questionId, uint256 numOutcomes) public {
    uint256 answer = uint256(realitio.resultFor(questionId));

    require(answer < numOutcomes, "Answer must be between 0 and numOutcomes");

    uint256[] memory payouts = new uint256[](numOutcomes);

    payouts[answer] = 1;

    conditionalTokens.reportPayouts(questionId, payouts);
  }
}
