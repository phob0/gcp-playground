const functions = require("firebase-functions");
const db = require("../../utils/db");

exports.listMessages = functions.https.onRequest(async (req, res) => {
    try {
      const pageSize = 10;
      const pageToken = req.query.nextPageToken;
      const previousPageToken = req.query.previousPageToken;
  
      // Get total count of messages
      const counterDoc = await db.collection("counters").doc("messages").get();
      const totalMessages = counterDoc.exists ? counterDoc.data().count : 0;
  
      let query = db.collection("messages").orderBy("__name__").limit(pageSize);
  
      if (pageToken) {
        // If pageToken is provided, paginate forward
        query = query.startAfter(pageToken);
      } else if (previousPageToken) {
        // If previousPageToken is provided, paginate backward
        query = query.endBefore(previousPageToken).limitToLast(pageSize);
      }
  
      // Execute query
      const snapshot = await query.get();
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Determine tokens
      const firstDoc = snapshot.docs[0];
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  
      const newPreviousPageToken = firstDoc ? firstDoc.id : null;
      const nextPageToken = lastDoc ? lastDoc.id : null;
  
      // Handle first page logic: If total messages < page size, both tokens should be null
      if (totalMessages <= pageSize) {
        return res.status(200).json({
          messages,
          nextPageToken: null,
          previousPageToken: null,
          totalMessages,
          currentPage: snapshot.docs.length,
        });
      }
  
      res.status(200).json({
        messages,
        nextPageToken,
        previousPageToken: pageToken ? newPreviousPageToken : null, // Return null if it's the first page
        totalMessages,
        currentPage: snapshot.docs.length,
      });
    } catch (error) {
      console.error("Error listing messages:", error);
      res.status(500).send({ error: "Internal server error." });
    }
  });
  