pragma solidity ^0.5.12;

interface IConditionalTokens {
    function reportPayouts(bytes32 questionId, uint256[] calldata payouts) external;
}

interface IRealitio {
    function getContentHash(bytes32 questionId) external view returns (bytes32);
    function getOpeningTS(bytes32 questionId) external view returns (uint32);
    function resultFor(bytes32 questionId) external view returns (bytes32);
}

contract RealitioProxy {
  IConditionalTokens public conditionalTokens;
  IRealitio public realitio;

  constructor(IConditionalTokens _conditionalTokens, IRealitio _realitio) public {
    conditionalTokens = _conditionalTokens;
    realitio = _realitio;
  }

  function resolve(
    bytes32 questionId,
    uint256 templateId,
    string calldata question,
    uint256 numOutcomes
  ) external {
    // check that the given templateId and question match the questionId
    bytes32 contentHash = keccak256(abi.encodePacked(templateId, realitio.getOpeningTS(questionId), question));
    require(contentHash == realitio.getContentHash(questionId), "Content hash mismatch");

    uint256[] memory payouts;

    if (templateId == 0 || templateId == 2) {
      // binary or single-select
      payouts = getSingleSelectPayouts(questionId, numOutcomes);
    } else {
      revert("Unknown templateId");
    }

    conditionalTokens.reportPayouts(questionId, payouts);
  }

  function getSingleSelectPayouts(bytes32 questionId, uint256 numOutcomes) internal view returns (uint256[] memory) {
    uint256[] memory payouts = new uint256[](numOutcomes);

    uint256 answer = uint256(realitio.resultFor(questionId));

    if (answer == uint256(-1)) {
      for (uint256 i = 0; i < numOutcomes; i++) {
        payouts[i] = 1;
      }
    } else {
      require(answer < numOutcomes, "Answer must be between 0 and numOutcomes");
      payouts[answer] = 1;
    }

    return payouts;
  }
}
