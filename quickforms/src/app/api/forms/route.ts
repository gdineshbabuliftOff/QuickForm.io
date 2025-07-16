import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { DocumentData, Timestamp } from 'firebase-admin/firestore';

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

        const formsWithSubmissions = forms.map((form: any) => {
            let formattedCreatedAt = '';
            if (form.createdAt instanceof Timestamp) {
                formattedCreatedAt = form.createdAt.toDate().toLocaleDateString();
            } else if (form.createdAt instanceof Date) {
                formattedCreatedAt = form.createdAt.toLocaleDateString();
            } else {
                console.warn(`Unexpected type for createdAt for form ${form.id}:`, typeof form.createdAt);
                formattedCreatedAt = 'N/A';
            }

            return {
                ...form,
                submissions: submissionCounts[form.id] || 0,
                status: form.status || 'Active',
                createdAt: formattedCreatedAt,
            };
        });

        return NextResponse.json(formsWithSubmissions);
    } catch (error: any) {
        console.error('Error fetching forms:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

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
            fields: [],
            submissionsCount: 0,
        });

        return NextResponse.json({ id: newFormRef.id, message: 'Form created successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating form:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}