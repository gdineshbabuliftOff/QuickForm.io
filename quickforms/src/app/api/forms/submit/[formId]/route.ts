// Location: app/api/forms/submit/[formId]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(
    request: Request,
    { params }: { params: { formId: string } }
) {
    const { formId } = params;
    
    if (!formId) {
        return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    try {
        // --- Step 1: Find the form's owner ---
        const publicFormDoc = await db.collection('publishedForms').doc(formId).get();
        if (!publicFormDoc.exists) {
            return NextResponse.json({ error: 'Cannot submit to a form that is not published.' }, { status: 404 });
        }

        const ownerId = publicFormDoc.data()?.owner;
        if (!ownerId) {
            return NextResponse.json({ error: 'Form is misconfigured; owner information is missing.' }, { status: 500 });
        }

        // --- Step 2: Process incoming multipart form data ---
        const data = await request.formData();
        const formDataJson = data.get('formDataJson');
        
        if (!formDataJson || typeof formDataJson !== 'string') {
            return NextResponse.json({ error: 'Form data is missing or invalid.' }, { status: 400 });
        }

        const formData = JSON.parse(formDataJson);
        
        // Note: In a production app, file handling logic would go here.
        // You would extract files from the `data` object, upload them to a
        // storage service (like Firebase Storage), and save the resulting URL
        // in the `formData` object before saving to Firestore.

        // --- Step 3: Save the submission to the owner's private subcollection ---
        const submissionRef = await db
            .collection('users')
            .doc(ownerId)
            .collection('forms')
            .doc(formId)
            .collection('submissions')
            .add({
                formId: formId,
                submittedAt: Timestamp.now(),
                data: formData,
            });
        
        // --- Step 4: (Optional) Trigger a webhook if configured ---
        const formSettings = publicFormDoc.data()?.settings;
        if (formSettings?.postOnSubmit && formSettings?.postApiUrl) {
            fetch(formSettings.postApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    formId, 
                    submissionId: submissionRef.id, 
                    data: formData 
                }),
            }).catch(err => console.error(`Webhook failed for form ${formId}:`, err));
        }

        return NextResponse.json({ message: 'Submission received successfully.', submissionId: submissionRef.id }, { status: 201 });

    } catch (error: any) {
        console.error(`Error processing submission for form ${formId}:`, error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
