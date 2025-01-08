const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello, World!");
});

exports.createMessage = functions.https.onRequest(async (req, res) => {
  try {
    const messageData = req.body;

    if (!messageData.message) {
      return res.status(400).send({ error: "Message is required." });
    }

    const docRef = await db.collection("messages").add({ message: messageData.message }); // Get the DocumentReference

    const messageDoc = await docRef.get(); //Retrieve the document
    const createdMessage = messageDoc.data();

    res.status(201).json({ message: "Message created successfully.", data: { id: docRef.id, ...createdMessage } }); // Send the ID and data
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

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

    await messageDocRef.update(updateData); // Update the document

    // Get the updated document
    const updatedMessageDoc = await messageDocRef.get();
    const updatedMessageData = updatedMessageDoc.data();

    res.status(200).json({ message: "Message updated successfully.", data: updatedMessageData }); // Return updated data
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

exports.listMessages = functions.https.onRequest(async (req, res) => {
  try {
    const pageSize = 10;
    const pageToken = req.query.pageToken;
    const previousPageToken = req.query.previousPageToken; // Get previous page token

    const counterDoc = await db.collection("counters").doc("messages").get();
    const totalMessages = counterDoc.exists ? counterDoc.data().count : 0;

    let query = db.collection("messages").orderBy("__name__").limit(pageSize);
    if (pageToken) {
      query = query.startAfter(pageToken);
    } else if (previousPageToken){
        query = query.endBefore(previousPageToken).limitToLast(pageSize);
    }

    const snapshot = await query.get();
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    const firstDoc = snapshot.docs[0];
    const newPreviousPageToken = firstDoc ? firstDoc.id : null;

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextPageToken = lastDoc ? lastDoc.id : null;

    res.status(200).json({
        messages,
        nextPageToken,
        previousPageToken: newPreviousPageToken,
        totalMessages,
        currentPage: snapshot.docs.length
    });
  } catch (error) {
    console.error("Error listing messages:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

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

// Firestore Triggers (for maintaining the counter)
exports.incrementMessageCount = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snap, context) => {
        const counterRef = db.collection('counters').doc('messages');
        return db.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let newCount = 1;
            if (counterDoc.exists) {
                newCount = counterDoc.data().count + 1;
            }
            transaction.set(counterRef, { count: newCount });
        });
    });

exports.decrementMessageCount = functions.firestore
    .document('messages/{messageId}')
    .onDelete(async (snap, context) => {
        const counterRef = db.collection('counters').doc('messages');
        return db.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let newCount = 0;
            if (counterDoc.exists) {
                newCount = Math.max(0, counterDoc.data().count - 1);
            }
            transaction.set(counterRef, { count: newCount });
        });
    });