// Location: app/api/forms/public/[formId]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(
    request: Request,
    { params }: { params: { formId: string } }
) {
    const { formId } = params;

    if (!formId) {
        return NextResponse.json({ error: 'Form ID is missing' }, { status: 400 });
    }

    try {
        // Fetches the specified document from the public collection.
        const formDoc = await db.collection('publishedForms').doc(formId).get();

        // If no document is found, the form is not published or the ID is incorrect.
        if (!formDoc.exists) {
            return NextResponse.json({ error: 'Form not found or is not published.' }, { status: 404 });
        }

        const formData = formDoc.data();
        if (!formData) {
            return NextResponse.json({ error: 'Form data is invalid.' }, { status: 500 });
        }

        // Only expose the necessary fields to the public.
        // Sensitive data like the owner's UID is kept on the server.
        const publicFormData = {
            id: formDoc.id,
            title: formData.title,
            fields: formData.fields,
            styles: formData.styles,
            settings: { 
                postOnSubmit: formData.settings?.postOnSubmit || false,
                postApiUrl: formData.settings?.postApiUrl || '',
            }
        };

        return NextResponse.json(publicFormData, { status: 200 });

    } catch (error: any) {
        console.error(`Error fetching public form ${formId}:`, error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
