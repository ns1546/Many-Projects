import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const docRef = adminDb.collection('orders').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    const orderData = doc.data();
    
    // Strip sensitive info like payment/user id if needed, but it's mostly safe for tracking
    return NextResponse.json({ success: true, data: { _id: doc.id, ...orderData } });
  } catch (error: any) {
    return NextResponse.json({ message: 'Invalid tracking number or server error' }, { status: 500 });
  }
}
