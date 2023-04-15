const Dai = artifacts.require("Dai.sol");
const PaymentProcessor = artifacts.require("PaymentProcessor.sol");

module.exports = async function (deployer, network, addresses) {
  const [admin, payer, _] = addresses;

  if (network === "development") {
    await deployer.deploy(Dai);
    const dai = await Dai.deployed();
    await dai.faucet(payer, web3.utils.toWei("10000"));

    await deployer.deploy(PaymentProcessor, admin, dai.address);
  }
};
