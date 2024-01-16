pragma solidity ^0.5.12;

interface IConditionalTokens {
    function reportPayouts(bytes32 questionId, uint256[] calldata payouts) external;
}

interface IRealitio {
    function getContentHash(bytes32 questionId) external view returns (bytes32);
    function getOpeningTS(bytes32 questionId) external view returns (uint32);
    function resultFor(bytes32 questionId) external view returns (bytes32);
    function resultForOnceSettled(bytes32 questionId) external view returns (bytes32);
    function isFinalized(bytes32 question_id) external view returns (bool);
    function isSettledTooSoon(bytes32 question_id) external view returns(bool);
    function reopened_questions(bytes32 question_id) external view returns(bytes32);
}
