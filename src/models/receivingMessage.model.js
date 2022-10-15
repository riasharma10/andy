import mongoose from 'mongoose';

const { Schema } = mongoose;

const ReceivedMessageSchema = new Schema({
  userId: { type: int, required: true },
  phoneNumber: { type: String, required: true },
  date: { type: Date, required: true },
  response: { type: String, required: true },
  value: { type: Number, required: false },
  alertType: { type: String, required: false }
});

const User = mongoose.model('ReceivedMessage', ReceivedMessageSchema);

export { ReceivedMessageSchema };