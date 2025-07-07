import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

/**
 * Creates or updates a user document in the Firestore 'users' collection.
 * @param {User} user - The Firebase user object.
 * @param {object} additionalData - Optional additional data to merge into the document.
 */
export const updateUserDocument = async (user: User, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    const data = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        lastLogin: serverTimestamp(),
        ...additionalData
    };

    return await setDoc(userRef, data, { merge: true });
};
