import { auth, db } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

// Helper function to format date into YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export async function GET(req: NextRequest) {
    try {
        const authorization = req.headers.get('authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const { uid } = decodedToken;

        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'week'; // Default to 'week'

        const now = new Date();
        let startDate: Date;
        let dataFormat: 'hour' | 'day' | 'month';

        switch (period) {
            case 'today':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                dataFormat = 'hour';
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                dataFormat = 'day';
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                dataFormat = 'month';
                break;
            case 'week':
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 6);
                startDate.setHours(0, 0, 0, 0);
                dataFormat = 'day';
                break;
        }
        
        const startTimestamp = Timestamp.fromDate(startDate);
        const formsSnapshot = await db.collection('users').doc(uid).collection('forms').get();
        const submissionsByDate: Record<string, number> = {};

        for (const formDoc of formsSnapshot.docs) {
            const submissionsSnapshot = await formDoc.ref.collection('submissions').where('createdAt', '>=', startTimestamp).get();
            submissionsSnapshot.forEach(doc => {
                const submissionDate = doc.data().createdAt.toDate();
                let key: string;

                if (dataFormat === 'hour') key = `${submissionDate.getHours()}:00`;
                else if (dataFormat === 'month') key = submissionDate.toLocaleString('default', { month: 'short' });
                else key = formatDate(submissionDate);
                
                submissionsByDate[key] = (submissionsByDate[key] || 0) + 1;
            });
        }

        let chartData = [];
        if (period === 'today') {
            for (let i = 0; i < 24; i++) {
                const key = `${i}:00`;
                chartData.push({ name: `${i % 12 === 0 ? 12 : i % 12}${i < 12 ? 'am' : 'pm'}`, submissions: submissionsByDate[key] || 0 });
            }
        } else if (period === 'year') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            chartData = monthNames.map(month => ({ name: month, submissions: submissionsByDate[month] || 0 }));
        } else { // week or month
            const days = period === 'week' ? 7 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 0; i < days; i++) {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + i);
                if (d > now) break;
                const key = formatDate(d);
                const name = period === 'week' ? dayNames[d.getDay()] : `${d.getDate()}`;
                chartData.push({ name, submissions: submissionsByDate[key] || 0 });
            }
        }

        return NextResponse.json(chartData);

    } catch (error: any) {
        console.error('Error fetching chart data:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
