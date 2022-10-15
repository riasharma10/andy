const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
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

const User = mongoose.model('User', UserSchema);

module.exports = User