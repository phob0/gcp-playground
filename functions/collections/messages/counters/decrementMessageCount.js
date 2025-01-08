const db = require("../../../utils/db");
const { onDocumentDeleted } = require("firebase-functions/v2/firestore");

// Decrement message count on document deletion
exports.decrementMessageCount = onDocumentDeleted("messages/{messageId}", async (event) => {
    const counterRef = db.collection("counters").doc("messages");
  
    try {
      await db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists ? counterDoc.data().count : 0;
        const newCount = Math.max(0, currentCount - 1);
        transaction.set(counterRef, { count: newCount });
      });
      console.log("Message count decremented.");
    } catch (error) {
      console.error("Error decrementing message count:", error);
    }
});