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
        const formDoc = await db.collection('publishedForms').doc(formId).get();

        if (!formDoc.exists) {
            return NextResponse.json({ error: 'Form not found or is not published.' }, { status: 404 });
        }

        const formData = formDoc.data();
        if (!formData) {
            return NextResponse.json({ error: 'Form data is invalid.' }, { status: 500 });
        }

        const publicFormData = {
            id: formDoc.id,
            title: formData.title,
            pages: formData.pages || [],
            fields: formData.fields || [],
            styles: formData.styles || {},
            settings: { 
                postOnSubmit: formData.settings?.postOnSubmit || false,
                postApiUrl: formData.settings?.postApiUrl || '',
                submitSuccessMessage: formData.settings?.submitSuccessMessage || 'Form submitted successfully!',
                submitErrorMessage: formData.settings?.submitErrorMessage || 'There was an error submitting your form.',
                enableThankYouPage: formData.settings?.enableThankYouPage || false,
                thankYouPageContent: formData.settings?.thankYouPageContent || [],
                pageTracker: formData.settings?.pageTracker || 'none',
                pageTrackerColor: formData.settings?.pageTrackerColor || '#4F46E5',
                pageTrackerBgColor: formData.settings?.pageTrackerBgColor || '#E5E7EB',
                loader: formData.settings?.loader || {},
                submitLoader: formData.settings?.submitLoader || {},
            }
        };

        return NextResponse.json(publicFormData, { status: 200 });

    } catch (error: any) {
        console.error(`Error fetching public form ${formId}:`, error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}