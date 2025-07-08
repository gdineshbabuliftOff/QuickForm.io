import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { formId: string } }) {
    try {
        const { formId } = params;
        
        const authorization = request.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const { uid } = await auth.verifyIdToken(token);

        const historySnapshot = await db.collection('users').doc(uid).collection('forms').doc(formId)
            .collection('publishHistory')
            .orderBy('publishedAt', 'desc')
            .limit(20) // Limit to the last 20 publishes
            .get();

        const history = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(history);
    } catch (error: any) {
        console.error(`Error fetching publish history:`, error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}