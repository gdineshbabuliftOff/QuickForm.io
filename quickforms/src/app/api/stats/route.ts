
import { auth, db } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const authorization = req.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        const formsRef = db.collection('users').doc(uid).collection('forms');
        const formsSnapshot = await formsRef.get();
        
        const totalForms = formsSnapshot.size;
        let totalSubmissions = 0;

        // Iterate over each form to count its submissions
        for (const formDoc of formsSnapshot.docs) {
            const submissionsSnapshot = await formDoc.ref.collection('submissions').get();
            totalSubmissions += submissionsSnapshot.size;
        }
        
        // Placeholder for conversion rate logic. You might calculate this based on form views vs submissions.
        const conversionRate = totalForms > 0 ? '42.3%' : '0.0%';

        return NextResponse.json({
            totalForms,
            totalSubmissions: totalSubmissions.toLocaleString(),
            conversionRate,
        });
    } catch (error: any) {
        console.error('Error fetching stats:', error.message);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Token expired' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
