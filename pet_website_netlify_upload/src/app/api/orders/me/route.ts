import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userSession = await getUserFromRequest(req);
    
    if (!userSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Query Firestore for orders matching user ID
    const snapshot = await adminDb.collection('orders')
      .where('user.id', '==', userSession.id)
      .orderBy('createdAt', 'desc')
      .get();
      
    const orders = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    // If index is missing, firebase will throw an error with a URL to create it.
    // For now, if orderBy fails without index, we just fetch all user's orders and sort in JS
    try {
      const userSession = await getUserFromRequest(req);
      const snapshot = await adminDb.collection('orders')
        .where('user.id', '==', userSession!.id)
        .get();
        
      const orders = snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return NextResponse.json({ success: true, data: orders });
    } catch (e: any) {
      return NextResponse.json({ message: e.message || 'Error fetching orders' }, { status: 500 });
    }
  }
}
