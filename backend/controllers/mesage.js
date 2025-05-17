const Message = require("../models/Message");

const send_message = async (sender, body) => {
  const { receiver, content } = body;
  const message = new Message({ sender, receiver, content });
  await message.save();
  return message
};

module.exports = {
    send_message,
}