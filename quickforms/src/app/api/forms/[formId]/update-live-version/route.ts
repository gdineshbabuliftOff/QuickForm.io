import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest, { params }: { params: { formId: string } }) {
    const { formId } = params;

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
        
        const publicFormRef = db.collection('publishedForms').doc(formId);
        const publicFormDoc = await publicFormRef.get();

        if (!publicFormDoc.exists) {
            return NextResponse.json({ message: 'No live version to update. Please publish the form first.' }, { status: 404 });
        }

        const publicFormData = publicFormDoc.data();
        if (publicFormData?.owner !== uid) {
            return NextResponse.json({ error: 'Forbidden: You do not own this form.' }, { status: 403 });
        }

        const liveUpdateData = {
            owner: uid,
            title,
            pages,
            styles,
            settings,
            updatedAt: Timestamp.now(),
        };

        await publicFormRef.set(liveUpdateData, { merge: true });

        return NextResponse.json({ message: 'Live version updated successfully.' });

    } catch (error: any) {
        console.error(`Error updating live version for form ${formId}:`, error.message);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Authentication token has expired.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to update live version.' }, { status: 500 });
    }
}