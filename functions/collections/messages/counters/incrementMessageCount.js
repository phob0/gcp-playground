const db = require("../../../utils/db");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// Increment message count on document creation
exports.incrementMessageCount = onDocumentCreated("messages/{messageId}", async (event) => {
    const counterRef = db.collection("counters").doc("messages");

    try {
        await db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists ? counterDoc.data().count : 0;
        const newCount = currentCount + 1;
        transaction.set(counterRef, { count: newCount });
        });
        console.log("Message count incremented.");
    } catch (error) {
        console.error("Error incrementing message count:", error);
    }
});