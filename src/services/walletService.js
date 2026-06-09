const Wallet = require("../models/wallet.model");
const WalletTransaction = require("../models/walletTransaction.model");

class WalletService {

  async captureRecharge(transactionId) {

    const transaction =
      await WalletTransaction.findByPk(
        transactionId
      );

    if (!transaction) {
      return {
        success:false,
        message:"Transaction not found"
      };
    }

    const wallet =
      await Wallet.findByPk(
        transaction.wallet_id
      );

    wallet.balance =
      Number(wallet.balance) +
      Number(transaction.amount);

    await wallet.save();

    transaction.status =
      "completed";

    await transaction.save();

    return {
      success:true,
      message:"Wallet recharge successful"
    };
  }

}

module.exports =
  new WalletService();