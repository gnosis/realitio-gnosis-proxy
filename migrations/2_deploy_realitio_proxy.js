const RealitioProxy = artifacts.require("RealitioProxy");

module.exports = function(deployer, network) {
  if (network === 'test') {
    return
  }
  const conditionalTokensAddress = process.env.CONDITIONAL_TOKENS_ADDRESS
  const realitioAddress = process.env.REALITIO_ADDRESS
  const nuancedBinaryTemplateId = process.env.NUANCED_BINARY_TEMPLATE_ID

  if (!conditionalTokensAddress) {
    throw new Error('No ConditionalTokens address')
  }
  if (!realitioAddress) {
    throw new Error('No Realitio address')
  }
  if (!nuancedBinaryTemplateId) {
    throw new Error('No nuanced binary template ID')
  }

  deployer.deploy(RealitioProxy, conditionalTokensAddress, realitioAddress, nuancedBinaryTemplateId);
};
