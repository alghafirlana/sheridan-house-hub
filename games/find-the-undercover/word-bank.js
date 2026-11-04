const FIREBASE_SDK_VERSION = "12.19.0";
const COLLECTION_NAME = "sheridan-openhouse";
const FIREBASE_CONFIG = Object.freeze({
  apiKey: "AIzaSyBzz28k956PafBpkqOiOqY9hzprNP_xoSU",
  authDomain: "findtheundercover-dea9c.firebaseapp.com",
  projectId: "findtheundercover-dea9c",
  storageBucket: "findtheundercover-dea9c.firebasestorage.app",
  messagingSenderId: "503099339526",
  appId: "1:503099339526:web:2b33b817ab4c3863212487",
});

let wordBankPromise;

function isValidWordPair(pair) {
  return (
    typeof pair.word1 === "string" &&
    typeof pair.word2 === "string" &&
    Array.isArray(pair["word1-clue"]) &&
    pair["word1-clue"].length >= 15 &&
    Array.isArray(pair["word2-clue"]) &&
    pair["word2-clue"].length >= 15 &&
    typeof pair.conclusion === "string"
  );
}

export function loadWordBank() {
  if (!wordBankPromise) {
    wordBankPromise = (async () => {
      const sdkBase = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
      const [appSdk, firestoreSdk] = await Promise.all([
        import(`${sdkBase}/firebase-app.js`),
        import(`${sdkBase}/firebase-firestore.js`),
      ]);
      const appName = "undercover-word-bank";
      const firebaseApp =
        appSdk.getApps().find((app) => app.name === appName) ||
        appSdk.initializeApp(FIREBASE_CONFIG, appName);
      const db = firestoreSdk.getFirestore(firebaseApp);
      const snapshot = await firestoreSdk.getDocs(
        firestoreSdk.collection(db, COLLECTION_NAME),
      );

      if (snapshot.empty) {
        throw new Error(`The ${COLLECTION_NAME} collection is empty.`);
      }

      const pairs = snapshot.docs.map((document) => {
        const data = document.data();
        const pair = { ...data, id: data.id || document.id };
        if (!isValidWordPair(pair)) {
          throw new Error(
            `Word pair "${document.id}" must include both words, 15 clues for each word, and a conclusion.`,
          );
        }
        return pair;
      });

      return pairs;
    })().catch((error) => {
      wordBankPromise = null;
      throw error;
    });
  }

  return wordBankPromise;
}
