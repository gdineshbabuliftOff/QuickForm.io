// lib/db.ts
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from './firebase';
import { User } from 'firebase/auth';

export const updateUserDocument = async (user: User, additionalData?: { name?: string }) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            name: user.displayName || additionalData?.name || null,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            isPremium: false,
            ...additionalData
        }, { merge: true });
    } else {
        const updateData: { [key: string]: any } = {
            lastLogin: serverTimestamp(),
        };

        if (additionalData?.name && userDoc.data()?.name !== additionalData.name) {
            updateData.name = additionalData.name;
        }

        if (userDoc.data()?.isPremium === undefined) {
             updateData.isPremium = false;
        }
        
        await updateDoc(userRef, updateData);
    }
};

export const getUserDocument = async (uid: string) => {
    if (!uid) return null;
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
};
