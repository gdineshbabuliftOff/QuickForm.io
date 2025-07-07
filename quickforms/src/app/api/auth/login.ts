import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    res.status(200).json({ message: "Logged in", uid: user.uid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
