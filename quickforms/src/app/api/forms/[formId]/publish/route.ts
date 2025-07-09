// In your file for the publish endpoint (e.g., /api/forms/[formId]/publish)
import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const formId = pathname.split('/')[3]; 

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

        const formState = await request.json(); 
        
        const formRef = db.collection('users').doc(uid).collection('forms').doc(formId);
        
        // --- ADD THIS LINE ---
        // Create a reference to the new public document
        const publicFormRef = db.collection('publishedForms').doc(formId);

        const batch = db.batch();

        // 1. Update the private form document (your existing logic)
        const formUpdateData = {
            ...formState,
            updatedAt: Timestamp.now(),
            hasPublishedVersion: true,
        };
        batch.update(formRef, formUpdateData);

        // 2. Add to private publishHistory (your existing logic)
        const historyRef = formRef.collection('publishHistory').doc();
        batch.set(historyRef, {
            ...formState,
            publishedAt: Timestamp.now()
        });
        
        // --- ADD THIS BLOCK ---
        // 3. Create/overwrite the document in the public collection
        const publicFormData = {
            owner: uid, // IMPORTANT: For linking submissions back to the owner
            title: formState.title,
            fields: formState.fields,
            styles: formState.styles,
            settings: formState.settings,
            publishedAt: Timestamp.now(),
        };
        batch.set(publicFormRef, publicFormData, { merge: true });
        
        await batch.commit();

        return NextResponse.json({ message: 'Form published successfully and public version created' });

    } catch (error: any) {
        console.error(`Error publishing form:`, error.message);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Authentication token has expired.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
