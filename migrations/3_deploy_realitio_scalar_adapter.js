const RealitioScalarAdapter = artifacts.require("RealitioScalarAdapter");

module.exports = function(deployer, network) {
  if (network === 'test') {
    return
  }
  const conditionalTokensAddress = process.env.CONDITIONAL_TOKENS_ADDRESS
  const realitioAddress = process.env.REALITIO_ADDRESS

  if (!conditionalTokensAddress) {
    throw new Error('No ConditionalTokens address')
  }
  if (!realitioAddress) {
    throw new Error('No Realitio address')
  }

  deployer.deploy(RealitioScalarAdapter, conditionalTokensAddress, realitioAddress);
};
