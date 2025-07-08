import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const formId = pathname.split('/').pop();

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

        const formDoc = await db.collection('users').doc(uid).collection('forms').doc(formId).get();

        if (!formDoc.exists) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        return NextResponse.json({ id: formDoc.id, ...formDoc.data() });
    } catch (error: any) {
        console.error(`Error fetching form:`, error.message);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Authentication token has expired.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const formId = pathname.split('/').pop();

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

        const body = await request.json();
        const { title, fields, styles, settings } = body;
        
        const formRef = db.collection('users').doc(uid).collection('forms').doc(formId);
        
        const batch = db.batch();

        // 1. Update the main form document
        const formUpdateData = {
            title,
            fields,
            styles,
            settings,
            updatedAt: Timestamp.now(),
        };
        batch.update(formRef, formUpdateData);

        // 2. Add a new document to the saveHistory subcollection
        const historyRef = formRef.collection('saveHistory').doc();
        batch.set(historyRef, {
            ...formUpdateData,
            savedAt: Timestamp.now()
        });
        
        await batch.commit();

        return NextResponse.json({ message: 'Form updated and history saved' });
    } catch (error: any) {
        console.error(`Error updating form:`, error.message);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Authentication token has expired.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}