import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Handles POST requests to update the live, published version of a form.
 * This is used for syncing changes without creating a new publish history entry.
 */
export async function POST(request: NextRequest, { params }: { params: { formId: string } }) {
    const { formId } = params;

    if (!formId) {
        return NextResponse.json({ error: 'Form ID is missing' }, { status: 400 });
    }

    try {
        // 1. Verify user authentication
        const authorization = request.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        // 2. Get and validate the incoming form data
        const formState = await request.json();
        const { title, pages, styles, settings } = formState;

        if (!title || !pages || !styles || !settings) {
            return NextResponse.json({ error: 'Incomplete form data. Missing required fields.' }, { status: 400 });
        }
        
        // 3. Perform security checks before updating
        const publicFormRef = db.collection('publishedForms').doc(formId);
        const publicFormDoc = await publicFormRef.get();

        // Check if a published version even exists
        if (!publicFormDoc.exists) {
            return NextResponse.json({ message: 'No live version to update. Please publish the form first.' }, { status: 404 });
        }

        // CRITICAL: Verify that the authenticated user is the owner of the form
        const publicFormData = publicFormDoc.data();
        if (publicFormData?.owner !== uid) {
            return NextResponse.json({ error: 'Forbidden: You do not own this form.' }, { status: 403 });
        }

        // 4. Prepare and execute the update
        const liveUpdateData = {
            ...formState, // Use all the latest data from the request
            owner: uid,   // Ensure the owner field is preserved
            updatedAt: Timestamp.now(), // Set the last updated timestamp
        };

        // Use set with merge:true to update the live document
        await publicFormRef.set(liveUpdateData, { merge: true });

        return NextResponse.json({ message: 'Live version updated successfully.' });

    } catch (error: any) {
        console.error(`Error updating live version for form ${formId}:`, error.message);
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return NextResponse.json({ error: 'Authentication token has expired.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to update live version.' }, { status: 500 });
    }
}