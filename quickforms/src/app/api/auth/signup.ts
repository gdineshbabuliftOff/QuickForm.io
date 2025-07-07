import type { NextApiRequest, NextApiResponse } from "next";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, name } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // optional: set displayName
    await updateProfile(user, { displayName: name });

    // Save extra user info to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      name,
      createdAt: new Date()
    });

    res.status(200).json({ message: "User created", uid: user.uid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
