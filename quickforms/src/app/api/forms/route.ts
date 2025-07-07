// src/app/api/forms/route.ts
import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { DocumentData, Timestamp } from 'firebase-admin/firestore';

// GET handler to fetch all forms for a user
export async function GET(req: NextRequest) {
    try {
        const authorization = req.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        const formsSnapshot = await db.collection('users').doc(uid).collection('forms').orderBy('createdAt', 'desc').get();
        if (formsSnapshot.empty) {
            return NextResponse.json([]);
        }

        const forms = formsSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() }));
        const submissionsSnapshot = await db.collection('submissions').where('userId', '==', uid).get();
        const submissions = submissionsSnapshot.docs.map(doc => doc.data());

        const submissionCounts = submissions.reduce((acc, submission) => {
            const formId = submission.formId;
            if (formId) {
                acc[formId] = (acc[formId] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const formsWithSubmissions = forms.map((form: any) => ({
            ...form,
            submissions: submissionCounts[form.id] || 0,
            status: form.status || 'Active',
            createdAt: form.createdAt.toDate().toLocaleDateString(),
        }));

        return NextResponse.json(formsWithSubmissions);
    } catch (error: any) {
        console.error('Error fetching forms:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler to create a new form
export async function POST(req: NextRequest) {
    try {
        const authorization = req.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        const { title } = await req.json();

        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return NextResponse.json({ error: 'Form title is required.' }, { status: 400 });
        }

        const newFormRef = db.collection('users').doc(uid).collection('forms').doc();

        await newFormRef.set({
            title: title.trim(),
            status: 'Draft',
            createdAt: Timestamp.now(),
            fields: [], // Initialize with an empty fields array
            submissionsCount: 0,
        });

        return NextResponse.json({ id: newFormRef.id, message: 'Form created successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating form:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
