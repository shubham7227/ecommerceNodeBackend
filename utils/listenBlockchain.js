const { ethers } = require("ethers");
const paymentContract = require("../blockchain/build/PaymentProcessor.json");
const paymentModel = require("../models/paymentModel");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.GANACHE_NETWORK_URL);

const paymentProcessor = new ethers.Contract(
  paymentContract.networks[process.env.GANACHE_NETWORK_ID].address,
  paymentContract.abi,
  provider
);

const handlePaymentDone = async (
  clientAddress,
  totalAmount,
  paymentId,
  blockHash,
  timestamp
) => {
  console.log(`
       from ${clientAddress}
       totalAmount ${ethers.formatEther(totalAmount)}
       paymentId ${paymentId}
       BLOCKHASH ${blockHash}
       date ${new Date(Number(timestamp) * 1000).toLocaleString()}
      `);
  const paymentData = await paymentModel.findById(paymentId);

  if (paymentData && !paymentData.processed) {
    paymentData.processed = true;
    paymentData.totalDAI = ethers.formatEther(totalAmount);
    paymentData.clientAddress = clientAddress;
    paymentData.blockHash = blockHash;

    await paymentData.save();
  }
};

paymentProcessor.on("PaymentDone", handlePaymentDone);

console.log("listening ethereum blockchain");
