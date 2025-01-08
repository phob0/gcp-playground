const functions = require("firebase-functions");

const { createMessage } = require("./collections/messages/createMessage");
const { getMessageById } = require("./collections/messages/getMessage");
const { listMessages } = require("./collections/messages/listMessage");
const { updateMessageById } = require("./collections/messages/updateMessage");
const { deleteMessageById } = require("./collections/messages/deleteMessage");
const { incrementMessageCount } = require("./collections/messages/counters/incrementMessageCount");
const { decrementMessageCount } = require("./collections/messages/counters/decrementMessageCount");

exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello, World!");
});

exports.createMessage = createMessage;
exports.getMessageById = getMessageById;
exports.listMessages = listMessages;
exports.updateMessageById = updateMessageById;
exports.deleteMessageById = deleteMessageById;

// Firestore Triggers (for maintaining the counter)
exports.incrementMessageCount = incrementMessageCount;
exports.decrementMessageCount = decrementMessageCount;