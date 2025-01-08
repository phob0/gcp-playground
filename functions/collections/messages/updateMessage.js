const functions = require("firebase-functions");
const db = require("../../utils/db");

exports.updateMessageById = functions.https.onRequest(async (req, res) => {
  try {
    const messageId = req.query.messageId;
    const updateData = req.body;

    if (!messageId) {
      return res.status(400).send({ error: "Message ID is required." });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({ error: "No data provided for update." });
    }

    const messageDocRef = db.collection("messages").doc(messageId);
    const messageDoc = await messageDocRef.get();

    if (!messageDoc.exists) {
      return res.status(404).send({ error: "Message not found." });
    }

    // Add the updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update the document
    await messageDocRef.update(updateData);

    // Get the updated document
    const updatedMessageDoc = await messageDocRef.get();
    const updatedMessageData = updatedMessageDoc.data();

    res.status(200).json({
      message: "Message updated successfully.",
      data: updatedMessageData,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});