const abi = require('ethereumjs-abi')

const RealitioProxy = artifacts.require('RealitioProxy')
const Realitio = artifacts.require('IRealitio')
const ConditionalTokens = artifacts.require('IConditionalTokens')
const MockContract = artifacts.require('MockContract.sol')

contract('RealitioProxy', () => {
  describe('binary', () => {
    it('should revert if the question has not been finalized', async () => {
      const realitioMock = await MockContract.new()
      await realitioMock.givenAnyRevert()

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      let failed = false
      try {
        await realitioProxy.resolve('0x0', 0, 'question data', 2)
      } catch (e) {
        failed = true
      }

      assert(failed)
    })

    it('should succeed if the question has been finalized with 0', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 0 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000000']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )
      await realitioProxy.resolve(questionId, 0, 'question data', 2)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [1, 0])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })

    it('should succeed if the question has been finalized with 1', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 0 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000001']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )
      await realitioProxy.resolve(questionId, 0, 'question data', 2)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [0, 1])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })

    it('should revert if the answer is out of range', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 0 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000002']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      let failed = false
      try {
        await realitioProxy.resolve(questionId, 0, 'question data', 2)
      } catch (e) {
        failed = true
        assert(e.message.includes('Answer must be between 0 and numOutcomes'))
      }

      assert(failed)
    })

    it('should give even payouts if answer is invalid', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 0 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      await realitioProxy.resolve(questionId, 0, 'question data', 2)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [1, 1])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })
  })

  describe('single select', () => {
    it('should revert if the question has not been finalized', async () => {
      const realitioMock = await MockContract.new()
      await realitioMock.givenAnyRevert()

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      let failed = false
      try {
        await realitioProxy.resolve('0x0', 2, 'question data', 3)
      } catch (e) {
        failed = true
      }

      assert(failed)
    })

    it('should succeed if the question has been finalized with 0', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 2 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000000']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )
      await realitioProxy.resolve(questionId, 2, 'question data', 3)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [1, 0, 0])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })

    it('should succeed if the question has been finalized with 1', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 2 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000001']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )
      await realitioProxy.resolve(questionId, 2, 'question data', 3)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [0, 1, 0])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })

    it('should succeed if the question has been finalized with 2', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 2 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000002']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )
      await realitioProxy.resolve(questionId, 2, 'question data', 3)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [0, 0, 1])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })

    it('should revert if the answer is equal to the number of outcomes', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 2 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000003']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      let failed = false
      try {
        await realitioProxy.resolve(questionId, 2, 'question data', 3)
      } catch (e) {
        failed = true
        assert(e.message.includes('Answer must be between 0 and numOutcomes'))
      }

      assert(failed)
    })

    it('should revert if the answer is greater than the number of outcomes', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 2 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000004']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      let failed = false
      try {
        await realitioProxy.resolve(questionId, 2, 'question data', 3)
      } catch (e) {
        failed = true
        assert(e.message.includes('Answer must be between 0 and numOutcomes'))
      }

      assert(failed)
    })

    it('should give even payouts if answer is invalid', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 2 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      await realitioProxy.resolve(questionId, 2, 'question data', 3)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [1, 1, 1])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })
  })

  describe('nuanced binary', () => {
    it('should revert if the question has not been finalized', async () => {
      const realitioMock = await MockContract.new()
      await realitioMock.givenAnyRevert()

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      let failed = false
      try {
        await realitioProxy.resolve('0x0', 7, 'question data', 2)
      } catch (e) {
        failed = true
      }

      assert(failed)
    })

    it('should succeed if the question has been finalized with 0', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 7 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000000']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )
      await realitioProxy.resolve(questionId, 7, 'question data', 2)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [4, 0])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })

    it('should succeed if the question has been finalized with 1', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 7 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000001']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )
      await realitioProxy.resolve(questionId, 7, 'question data', 2)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [3, 1])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })

    it('should succeed if the question has been finalized with 2', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 7 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000002']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )
      await realitioProxy.resolve(questionId, 7, 'question data', 2)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [2, 2])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })

    it('should succeed if the question has been finalized with 3', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 7 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000003']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )
      await realitioProxy.resolve(questionId, 7, 'question data', 2)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [1, 3])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })

    it('should succeed if the question has been finalized with 4', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 7 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000004']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )
      await realitioProxy.resolve(questionId, 7, 'question data', 2)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [0, 4])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })

    it('should revert if the answer is out of range', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 7 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000005']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      let failed = false
      try {
        await realitioProxy.resolve(questionId, 7, 'question data', 2)
      } catch (e) {
        failed = true
        assert(e.message.includes('Answer must be between 0 and 4'))
      }

      assert(failed)
    })

    it('should give even payouts if answer is invalid', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 7 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      await realitioProxy.resolve(questionId, 7, 'question data', 2)

      const conditionalTokens = await ConditionalTokens.at(conditionalTokensMock.address)
      const reportPayoutsAbi = conditionalTokens.contract.methods
        .reportPayouts(questionId, [1, 1])
        .encodeABI()

      // check that report payouts was called only once
      const callCount = await conditionalTokensMock.invocationCountForMethod.call(reportPayoutsAbi)
      assert.equal(callCount.toString(), 1)

      // check that report payouts was called with the correct arguments
      const callWithArgsCount = await conditionalTokensMock.invocationCountForCalldata.call(
        reportPayoutsAbi
      )
      assert.equal(callWithArgsCount.toString(), 1)
    })
  })

  it('should revert if the templateId is not known', async () => {
      const questionId = '0x1234567890'
      const realitioMock = await MockContract.new()
      const realitio = await Realitio.at(realitioMock.address)

      const getContentHash = realitio.contract.methods.getContentHash('0x').encodeABI()
      const getOpeningTS = realitio.contract.methods.getOpeningTS('0x').encodeABI()
      const resultFor = realitio.contract.methods.resultFor('0x').encodeABI()

      await realitioMock.givenMethodReturn(
        getContentHash,
        abi.rawEncode(
          ['bytes32'],
          [web3.utils.soliditySha3(
            { t: 'uint256', v: 10 },
            { t: 'uint32', v: 0 },
            { t: 'string', v: 'question data' },
          )]
        )
      )

      await realitioMock.givenMethodReturn(
        getOpeningTS,
        abi.rawEncode(['uint32'], [0])
      )

      await realitioMock.givenMethodReturn(
        resultFor,
        abi.rawEncode(
          ['bytes32'],
          ['0x0000000000000000000000000000000000000000000000000000000000000000']
        )
      )

      const conditionalTokensMock = await MockContract.new()
      await conditionalTokensMock.givenAnyReturnBool(true)

      const realitioProxy = await RealitioProxy.new(
        conditionalTokensMock.address,
        realitioMock.address,
        7,
      )

      let failed = false
      try {
        await realitioProxy.resolve(questionId, 10, 'question data', 2)
      } catch (e) {
        failed = true
        assert(e.message.includes('Unknown templateId'))
      }

      assert(failed)
  })
})
