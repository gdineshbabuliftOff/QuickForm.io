// src/app/api/submissions/chart/route.ts
import { db, auth } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
    try {
        const authorization = req.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        // --- WORKAROUND APPLIED ---
        // This query is less efficient as it fetches all submissions for the user.
        // The recommended solution is to create the Firestore index from the error link.
        const submissionsSnapshot = await db.collection('submissions')
            .where('userId', '==', uid)
            .get();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setHours(0, 0, 0, 0);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const submissionsByDay: Record<string, number> = {};
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = daysOfWeek[d.getDay()];
            submissionsByDay[dayName] = 0;
        }

        // Filter the documents in the code instead of in the query
        submissionsSnapshot.docs.forEach(doc => {
            const submissionDate = doc.data().createdAt.toDate();
            if (submissionDate >= sevenDaysAgo) {
                const dayName = daysOfWeek[submissionDate.getDay()];
                if (submissionsByDay.hasOwnProperty(dayName)) {
                     submissionsByDay[dayName]++;
                }
            }
        });
        
        const chartData = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayName = daysOfWeek[d.getDay()];
            return {
                name: dayName,
                submissions: submissionsByDay[dayName] || 0,
            };
        });

        return NextResponse.json(chartData);

    } catch (error: any) {
        console.error('Error fetching chart data:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
