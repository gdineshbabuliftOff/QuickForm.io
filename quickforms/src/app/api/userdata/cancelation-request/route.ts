import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebaseAdmin';
import { firestore } from 'firebase-admin';

export async function POST(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        
        const decodedToken = await auth.verifyIdToken(token);
        const uid = decodedToken.uid;
        const email = decodedToken.email || 'No email provided';

        const { reason } = await request.json();
        if (!reason || typeof reason !== 'string' || reason.length < 10) {
            return NextResponse.json({ message: 'A valid reason is required.' }, { status: 400 });
        }

        const requestRef = db.collection('cancellationRequests').doc();

        await requestRef.set({
            uid,
            email,
            reason,
            status: 'pending_review',
            requestedAt: firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, message: 'Your cancellation request has been submitted.' });

    } catch (error: any) {
        console.error("Cancellation Request API Error:", error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
