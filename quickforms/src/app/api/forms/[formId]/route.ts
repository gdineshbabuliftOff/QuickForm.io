import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

// GET a single form by its ID
export async function GET(request: NextRequest) {
    try {
        const { searchParams, pathname } = request.nextUrl;

        // extract formId from URL
        const segments = pathname.split('/');
        const formId = segments[segments.length - 1]; 

        const authorization = request.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        const formDoc = await db
            .collection('users')
            .doc(uid)
            .collection('forms')
            .doc(formId)
            .get();

        if (!formDoc.exists) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        return NextResponse.json({ id: formDoc.id, ...formDoc.data() });
    } catch (error: any) {
        console.error(`Error fetching form:`, error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// UPDATE a form by its ID
export async function PUT(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;

        const segments = pathname.split('/');
        const formId = segments[segments.length - 1]; 

        const authorization = request.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        const body = await request.json();
        const { title, fields, styles, settings } = body;

        const formRef = db
            .collection('users')
            .doc(uid)
            .collection('forms')
            .doc(formId);

        const docSnapshot = await formRef.get();
        if (!docSnapshot.exists) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        await formRef.update({
            title,
            fields,
            styles,
            settings,
            updatedAt: Timestamp.now(),
        });

        return NextResponse.json({ message: 'Form updated successfully' });
    } catch (error: any) {
        console.error(`Error updating form:`, error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
