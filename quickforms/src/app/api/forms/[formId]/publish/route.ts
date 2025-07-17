import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

const PUBLISH_HISTORY_LIMIT = 20;

export async function POST(request: NextRequest, context: { params: { formId: string } }) {
    const { formId } = context.params;

    if (!formId) {
        return NextResponse.json({ error: 'Form ID is missing' }, { status: 400 });
    }

    try {
        const authorization = request.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        const formState = await request.json();
        const { title, pages, styles, settings } = formState;

        if (!title || !pages || !styles || !settings) {
            return NextResponse.json({ error: 'Incomplete form data. Missing required fields.' }, { status: 400 });
        }
        
        const formRef = db.collection('users').doc(uid).collection('forms').doc(formId);
        const publicFormRef = db.collection('publishedForms').doc(formId);
        const historyCollectionRef = formRef.collection('publishHistory');

        await db.runTransaction(async (transaction) => {
            const historyQuery = historyCollectionRef.orderBy('publishedAt', 'asc');
            const historySnapshot = await transaction.get(historyQuery);
            
            const formUpdateData = {
                title,
                pages,
                styles,
                settings,
                updatedAt: Timestamp.now(),
                hasPublishedVersion: true,
                status: 'Published',
            };
            transaction.update(formRef, formUpdateData);

            const publishHistoryData = {
                title,
                pages,
                styles,
                settings,
                publishedAt: Timestamp.now(),
                status: 'Published',
            };
            const newHistoryRef = historyCollectionRef.doc();
            transaction.set(newHistoryRef, publishHistoryData);
            
            const publicFormData = {
                owner: uid,
                title,
                pages,
                styles,
                settings,
                publishedAt: Timestamp.now(),
                status: 'Published',
            };
            transaction.set(publicFormRef, publicFormData, { merge: true });
            
            if (historySnapshot.size >= PUBLISH_HISTORY_LIMIT) {
                const excessCount = historySnapshot.size - PUBLISH_HISTORY_LIMIT + 1;
                for (let i = 0; i < excessCount; i++) {
                    transaction.delete(historySnapshot.docs[i].ref);
                }
            }
        });
        
        return NextResponse.json({ message: 'Form published successfully' });

    } catch (error: any) {
        console.error(`Error publishing form ${formId}:`, error.message);
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return NextResponse.json({ error: 'Authentication token is invalid or has expired.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}