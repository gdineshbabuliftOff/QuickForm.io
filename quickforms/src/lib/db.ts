import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore";
import { db } from './firebase';
import { User } from 'firebase/auth';

interface UserDocData {
    uid: string;
    email: string | null;
    displayName: string | null;
    createdAt: any;
    lastLogin: any;
    subscriptionTier: 'free' | 'pro' | 'premium';
    name?: string;
    paymentDetails?: {
        cardBrand: string;
        cardLast4: string;
    };
}

export const updateUserDocument = async (user: User, additionalData?: Partial<UserDocData>) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || additionalData?.displayName || null,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            subscriptionTier: additionalData?.subscriptionTier || 'free',
            ...additionalData,
            name: additionalData?.name || null,
        }, { merge: true });
    } else {
        const existingData = userDoc.data() as UserDocData;
        const updateData: Partial<UserDocData> = {
            lastLogin: serverTimestamp(),
        };

        if (additionalData?.displayName && existingData?.displayName !== additionalData.displayName) {
            updateData.displayName = additionalData.displayName;
        } else if (user.displayName && existingData?.displayName !== user.displayName) {
            updateData.displayName = user.displayName;
        }

        if (additionalData?.name && existingData?.name !== additionalData.name) {
            updateData.name = additionalData.name;
        }

        if (additionalData?.subscriptionTier && existingData?.subscriptionTier !== additionalData.subscriptionTier) {
            updateData.subscriptionTier = additionalData.subscriptionTier;
        }
        
        if (existingData?.subscriptionTier === undefined) {
            updateData.subscriptionTier = 'free';
        }

        if (additionalData?.paymentDetails) {
            updateData.paymentDetails = additionalData.paymentDetails;
        }
        
        if (Object.keys(updateData).length > 1) {
             await updateDoc(userRef, updateData);
        }
    }
};

export const getUserDocument = async (uid: string): Promise<UserDocData | null> => {
    if (!uid) return null;
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() as UserDocData : null;
};

export const checkUserExistsByEmail = async (email: string): Promise<boolean> => {
    if (!email) return false;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};
