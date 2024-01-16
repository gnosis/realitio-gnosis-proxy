pragma solidity ^0.5.12;

import { IConditionalTokens, IRealitio } from "./Interfaces.sol";

contract RealitioProxy {
  IConditionalTokens public conditionalTokens;
  IRealitio public realitio;
  uint256 public nuancedBinaryTemplateId;

  constructor(
    IConditionalTokens _conditionalTokens,
    IRealitio _realitio,
    uint256 _nuancedBinaryTemplateId
  ) public {
    conditionalTokens = _conditionalTokens;
    realitio = _realitio;
    nuancedBinaryTemplateId = _nuancedBinaryTemplateId;
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

    if(realitio.isFinalized(questionId) && realitio.isSettledTooSoon(questionId)) {
      bytes32 replacementId = realitio.reopened_questions(questionId);
      if (replacementId != bytes32(0)) {
        questionId = replacementId;
      }
    }

    uint256[] memory payouts;

    if (templateId == 0 || templateId == 2) {
      // binary or single-select
      payouts = getSingleSelectPayouts(questionId, numOutcomes);
    } else if (templateId == nuancedBinaryTemplateId) {
      payouts = getNuancedBinaryPayouts(questionId, numOutcomes);
    } else {
      revert("Unknown templateId");
    }

    conditionalTokens.reportPayouts(questionId, payouts);
  }

  function getSingleSelectPayouts(bytes32 questionId, uint256 numOutcomes) internal view returns (uint256[] memory) {
    uint256[] memory payouts = new uint256[](numOutcomes);

    uint256 answer = uint256(realitio.resultForOnceSettled(questionId));

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

  function getNuancedBinaryPayouts(bytes32 questionId, uint256 numOutcomes) internal view returns (uint256[] memory) {
    require(numOutcomes == 2, "Number of outcomes expected to be 2");
    uint256[] memory payouts = new uint256[](2);

    uint256 answer = uint256(realitio.resultForOnceSettled(questionId));

    if (answer == uint256(-1)) {
      payouts[0] = 1;
      payouts[1] = 1;
    } else {
      require(answer < 5, "Answer must be between 0 and 4");
      payouts[0] = 4 - answer;
      payouts[1] = answer;
    }

    return payouts;
  }
}
