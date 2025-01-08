const functions = require("firebase-functions");
const db = require("../../utils/db");

exports.getMessageById = functions.https.onRequest(async (req, res) => {
  try {
    const messageId = req.query.messageId; // Get the message ID from the URL path

    if (!messageId) {
        return res.status(400).send({ error: "Message ID is required." });
    }

    const messageDoc = await db.collection("messages").doc(messageId).get();

    if (!messageDoc.exists) {
      return res.status(404).send({ error: "Message not found." });
    }

    const messageData = messageDoc.data();
    res.status(200).json(messageData); // Send the message data as JSON
  } catch (error) {
    console.error("Error getting message:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});