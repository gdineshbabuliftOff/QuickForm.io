import * as admin from 'firebase-admin';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

if (!serviceAccountJson) {
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_KEY_JSON is not set. Please check your .env.local file.'
  );
}

const serviceAccount = JSON.parse(serviceAccountJson);

// ✅ Fix the PEM format
if (typeof serviceAccount.private_key === 'string') {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
} else {
  throw new Error('serviceAccount.private_key is missing or invalid.');
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.error('🔥 Firebase Admin init error:', err);
    throw err;
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
