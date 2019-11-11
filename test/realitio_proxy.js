const abi = require('ethereumjs-abi')

const RealitioProxy = artifacts.require('RealitioProxy');
const ConditionalTokens = artifacts.require('ConditionalTokens');
const MockContract = artifacts.require('MockContract.sol')

contract('RealitioProxy', () => {
  it('should revert if the question has not been finalized', async () => {
    const realitioMock = await MockContract.new()
    await realitioMock.givenAnyRevert();

    const conditionalTokensMock = await MockContract.new()
    await conditionalTokensMock.givenAnyReturnBool(true)

    const realitioProxy = await RealitioProxy.new(conditionalTokensMock.address, realitioMock.address)

    let failed = false
    try {
      await realitioProxy.resolveCondition('0x0')
    } catch (e) {
      failed = true
    }

    assert(failed)
  })

  it('should succeed if the question has been finalized with yes', async () => {
    const questionId = '0x1234567890'
    const realitioMock = await MockContract.new()
    await realitioMock.givenAnyReturn(abi.rawEncode(['bytes32'], ['0x0000000000000000000000000000000000000000000000000000000000000001']));

    const conditionalTokensMock = await MockContract.new()
    await conditionalTokensMock.givenAnyReturnBool(true)

    const realitioProxy = await RealitioProxy.new(conditionalTokensMock.address, realitioMock.address)
    await realitioProxy.resolveCondition(questionId)

    const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
    const reportPayoutsAbi = conditionalTokens.contract.methods.reportPayouts(questionId, [1, 0]).encodeABI()

    // check that report payouts was called only once
    const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
    assert.equal(callCount.toString(), 1)

    // check that report payouts was called with the correct arguments
    const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(reportPayoutsAbi)
    assert.equal(callWithArgsCount.toString(), 1)
  });

  it('should succeed if the question has been finalized with no', async () => {
    const questionId = '0x1234567890'
    const realitioMock = await MockContract.new()
    await realitioMock.givenAnyReturn(abi.rawEncode(['bytes32'], ['0x0']));

    const conditionalTokensMock = await MockContract.new()
    await conditionalTokensMock.givenAnyReturnBool(true)

    const realitioProxy = await RealitioProxy.new(conditionalTokensMock.address, realitioMock.address)
    await realitioProxy.resolveCondition(questionId)

    const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
    const reportPayoutsAbi = conditionalTokens.contract.methods.reportPayouts(questionId, [0, 1]).encodeABI()

    // check that report payouts was called only once
    const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
    assert.equal(callCount.toString(), 1)

    // check that report payouts was called with the correct arguments
    const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(reportPayoutsAbi)
    assert.equal(callWithArgsCount.toString(), 1)
  });

  it('should revert if the answer is neither 0 nor 1', async () => {
    const questionId = '0x1234567890'
    const realitioMock = await MockContract.new()
    await realitioMock.givenAnyReturn(abi.rawEncode(['bytes32'], ['0x0000000000000000000000000000000000000000000000000000000000000002']));

    const conditionalTokensMock = await MockContract.new()
    await conditionalTokensMock.givenAnyReturnBool(true)

    const realitioProxy = await RealitioProxy.new(conditionalTokensMock.address, realitioMock.address)

    let failed = false
    try {
      await realitioProxy.resolveCondition(questionId)
    } catch (e) {
      failed = true
    }

    assert(failed)
  });
});
