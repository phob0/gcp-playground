const functions = require("firebase-functions");
const db = require("../../utils/db");

exports.createMessage = functions.https.onRequest(async (req, res) => {
  try {
    const messageData = req.body;

    if (!messageData.message) {
      return res.status(400).send({ error: "Message is required." });
    }

    // Add the message with timestamps
    const timestamp = new Date().toISOString();
    const docRef = await db.collection("messages").add({
      message: messageData.message,
      created_at: timestamp,
      updated_at: timestamp,
    });

    // Retrieve the newly created document
    const messageDoc = await docRef.get();
    const createdMessage = messageDoc.data();

    res.status(201).json({
      message: "Message created successfully.",
      data: { id: docRef.id, ...createdMessage },
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});