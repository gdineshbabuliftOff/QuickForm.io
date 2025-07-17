import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

const SAVE_HISTORY_LIMIT = 50;

export async function GET(request: NextRequest, context: { params: { formId: string } }) {
    const { formId } = context.params;

    try {
        if (!formId) {
            return NextResponse.json({ error: 'Form ID is missing' }, { status: 400 });
        }

        const authorization = request.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid authorization header' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        const formDoc = await db.collection('users').doc(uid).collection('forms').doc(formId).get();

        if (!formDoc.exists) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        return NextResponse.json({ id: formDoc.id, ...formDoc.data() });
    } catch (error: any) {
        console.error(`Error fetching form ${formId}:`, error.message);
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return NextResponse.json({ error: 'Authentication token is invalid or has expired.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, context: { params: { formId: string } }) {
    const { formId } = context.params;

    try {
        if (!formId) {
            return NextResponse.json({ error: 'Form ID is missing' }, { status: 400 });
        }

        const authorization = request.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid authorization header' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        const formData = await request.json();
        
        if (!formData.title || !formData.pages || !formData.styles || !formData.settings) {
            return NextResponse.json({ error: 'Missing required form data fields (title, pages, styles, or settings)' }, { status: 400 });
        }

        const formRef = db.collection('users').doc(uid).collection('forms').doc(formId);
        const historyCollectionRef = formRef.collection('saveHistory');

        await db.runTransaction(async (transaction) => {
            const formUpdateData = {
                ...formData,
                updatedAt: Timestamp.now(),
            };
            
            const historyEntryData = {
                ...formData,
                savedAt: Timestamp.now(),
            };

            const historyQuery = historyCollectionRef.orderBy('savedAt', 'asc');
            const historySnapshot = await transaction.get(historyQuery);
            
            transaction.update(formRef, formUpdateData);

            const newHistoryRef = historyCollectionRef.doc();
            transaction.set(newHistoryRef, historyEntryData);

            if (historySnapshot.size >= SAVE_HISTORY_LIMIT) {
                const excessCount = historySnapshot.size - SAVE_HISTORY_LIMIT + 1;
                for (let i = 0; i < excessCount; i++) {
                    transaction.delete(historySnapshot.docs[i].ref);
                }
            }
        });

        return NextResponse.json({ message: 'Form updated and history saved successfully.' });

    } catch (error: any) {
        console.error(`Error updating form ${formId}:`, error.message);
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return NextResponse.json({ error: 'Authentication token is invalid or has expired.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}