const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthdate: { type: Date },
  phone: { type: String },
  username: { type: String, unique: true },
  requests: { type: Array, default: [] },
  friends: { type: Array, default: [] },
  messages: {  type: Object}, // Define messages as an object
});

const User = mongoose.model('User', userSchema);

module.exports = User;
