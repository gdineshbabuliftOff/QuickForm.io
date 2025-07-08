import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const formId = pathname.split('/').pop();

    if (!formId) {
        return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    try {
        // 1. Get token from the Authorization header
        const authorization = request.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }
        const token = authorization.split('Bearer ')[1];

        // 2. Verify the token using Firebase Admin and get the user's UID
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        // 3. Fetch the specific form from the user's sub-collection in Firestore
        const formRef = db.collection('users').doc(uid).collection('forms').doc(formId);
        const formDoc = await formRef.get();

        // 4. Check if the form exists for that user
        if (!formDoc.exists) {
            return NextResponse.json(
                { error: 'Form not found or you do not have access' },
                { status: 404 }
            );
        }

        // 5. Return the form data for the preview
        return NextResponse.json({ id: formDoc.id, ...formDoc.data() });

    } catch (error: any) {
        console.error(`Error fetching form preview for ${formId}:`, error.message);
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
