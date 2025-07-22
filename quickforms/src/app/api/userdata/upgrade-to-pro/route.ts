import { auth, db } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const decodedToken = await auth.verifyIdToken(token);
        const uid = decodedToken.uid;
        const userRef = db.collection('users').doc(uid);

        const { cardLast4, cardBrand } = await request.json();
        if (!cardLast4 || !cardBrand) {
             return NextResponse.json({ message: 'Missing payment details' }, { status: 400 });
        }

        await userRef.update({
            subscriptionTier: 'pro',
            paymentDetails: {
                cardBrand: cardBrand,
                cardLast4: cardLast4,
            },
        });

        return NextResponse.json({ success: true, message: 'Successfully upgraded to Pro!' });

    } catch (error: any) {
        console.error("Upgrade to Pro API Error:", error);
        if (error.code === 'auth/id-token-expired') {
             return NextResponse.json({ message: 'Authentication token has expired.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
