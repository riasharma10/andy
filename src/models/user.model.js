const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  cardNumber: { type: String, required: true },
  cardExp: { type: String, required: true },
  cardCVC: { type: String, required: true },
  refreshToken: { type: String, required: false },
});

module.exports = mongoose.model('User', UserSchema);