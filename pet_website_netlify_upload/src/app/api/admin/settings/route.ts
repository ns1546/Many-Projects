import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const doc = await adminDb.collection('settings').doc('global').get();
    if (!doc.exists) {
      // Default settings
      return NextResponse.json({
        success: true,
        data: { storeName: 'Petopia', supportEmail: 'support@petopia.com', description: 'Your one-stop shop for high-quality pet food, toys, and accessories.', currency: 'USD', shippingRate: 5.99 }
      });
    }
    return NextResponse.json({ success: true, data: doc.data() });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userSession = await getUserFromRequest(req);
    if (!userSession || userSession.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const settingsData = await req.json();
    await adminDb.collection('settings').doc('global').set(settingsData, { merge: true });

    return NextResponse.json({ success: true, data: settingsData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
