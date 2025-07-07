// src/app/api/forms/[formId]/route.ts
import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

// GET a single form by its ID
export async function GET(req: NextRequest, { params }: { params: { formId: string } }) {
    try {
        const { formId } = params;
        const authorization = req.headers.get('authorization');

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
        console.error(`Error fetching form ${params.formId}:`, error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// UPDATE a form by its ID
export async function PUT(req: NextRequest, { params }: { params: { formId: string } }) {
    try {
        const { formId } = params;
        const authorization = req.headers.get('authorization');
        
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        const body = await req.json();

        const formRef = db.collection('users').doc(uid).collection('forms').doc(formId);
        
        const docSnapshot = await formRef.get();
        if (!docSnapshot.exists) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        await formRef.update({
            ...body,
            updatedAt: Timestamp.now(),
        });

        return NextResponse.json({ message: 'Form updated successfully' });
    } catch (error: any) {
        console.error(`Error updating form ${params.formId}:`, error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
