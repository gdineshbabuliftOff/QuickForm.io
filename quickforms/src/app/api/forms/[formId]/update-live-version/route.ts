// Location: app/api/forms/[formId]/update-live-version/route.ts
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

        // 1. Get a reference to the public document
        const publicFormRef = db.collection('publishedForms').doc(formId);
        const publicFormDoc = await publicFormRef.get();

        // 2. Check if the form has been published before
        if (!publicFormDoc.exists) {
            // If the form isn't published, there's no live version to update.
            // This is not an error, so we can return a success response.
            return NextResponse.json({ message: 'No live version to update.' });
        }

        // 3. Verify that the user making the request is the owner of the form
        const publicFormData = publicFormDoc.data();
        if (publicFormData?.owner !== uid) {
            return NextResponse.json({ error: 'Forbidden: You do not own this form.' }, { status: 403 });
        }

        // 4. Update the live version with the latest form state
        const liveUpdateData = {
            ...formState,
            owner: uid, // Ensure owner field is preserved
            updatedAt: Timestamp.now(), // Add/update an 'updatedAt' timestamp
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
