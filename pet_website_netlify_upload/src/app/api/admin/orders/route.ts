import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userSession = await getUserFromRequest(req);
    
    if (!userSession || userSession.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '1000');
    const lastId = req.nextUrl.searchParams.get('lastId');

    let query = adminDb.collection('orders').orderBy('createdAt', 'desc').limit(limit);

    if (lastId) {
      const lastDoc = await adminDb.collection('orders').doc(lastId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: orders, 
      hasMore: snapshot.docs.length === limit,
      lastId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
