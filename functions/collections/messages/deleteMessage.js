const functions = require("firebase-functions");
const db = require("../../utils/db");

exports.deleteMessageById = functions.https.onRequest(async (req, res) => {
    try {
      const messageId = req.query.messageId;
  
      if (!messageId || messageId.trim() === "") { // Check for empty or whitespace-only string
        return res.status(400).send({ error: "Message ID is required." });
      }
  
      const messageDocRef = db.collection("messages").doc(messageId);
      const messageDoc = await messageDocRef.get();
  
      if (!messageDoc.exists) {
        return res.status(404).send({ error: "Message not found." });
      }
  
      await messageDocRef.delete();
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).send({ error: "Internal server error." });
    }
  });