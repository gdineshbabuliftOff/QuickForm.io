import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const formId = pathname.split('/')[3]; // Extracts formId from /api/forms/[formId]/publish

        if (!formId) {
            return NextResponse.json({ error: 'Form ID is missing' }, { status: 400 });
        }

        const authorization = request.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        // The frontend will now send the full form state on publish
        const formState = await request.json(); 
        
        const formRef = db.collection('users').doc(uid).collection('forms').doc(formId);
        
        const batch = db.batch();

        // 1. Update the main form document with the latest state
        const formUpdateData = {
            ...formState,
            updatedAt: Timestamp.now(),
            hasPublishedVersion: true,
        };
        batch.update(formRef, formUpdateData);

        // 2. Add a new document to the publishHistory subcollection
        const historyRef = formRef.collection('publishHistory').doc();
        batch.set(historyRef, {
            ...formState,
            publishedAt: Timestamp.now()
        });
        
        await batch.commit();

        return NextResponse.json({ message: 'Form published successfully and history saved' });
    } catch (error: any) {
        console.error(`Error publishing form:`, error.message);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Authentication token has expired.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}