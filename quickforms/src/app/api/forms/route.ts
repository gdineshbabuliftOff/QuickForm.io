import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { DocumentData, Timestamp } from 'firebase-admin/firestore';
import { auth, db } from '@/lib/firebaseAdmin';

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

        // Use Promise.all to fetch submission counts for all forms concurrently
        const formsWithSubmissions = await Promise.all(
            formsSnapshot.docs.map(async (doc: DocumentData) => {
                const form = { id: doc.id, ...doc.data() };

                // Get the count of documents in the 'submissions' subcollection for each form
                const submissionsSnapshot = await doc.ref.collection('submissions').get();
                const submissionCount = submissionsSnapshot.size;

                let formattedCreatedAt = 'N/A';
                if (form.createdAt instanceof Timestamp) {
                    formattedCreatedAt = form.createdAt.toDate().toLocaleDateString();
                } else if (form.createdAt instanceof Date) {
                    formattedCreatedAt = form.createdAt.toLocaleDateString();
                }

                return {
                    ...form,
                    submissions: submissionCount,
                    status: form.status || 'Active',
                    createdAt: formattedCreatedAt,
                };
            })
        );

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
