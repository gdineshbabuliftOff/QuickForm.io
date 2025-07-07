import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/firebase";
import { confirmPasswordReset } from "firebase/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { oobCode, newPassword } = req.body;

  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    res.status(200).json({ message: "Password has been reset" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
