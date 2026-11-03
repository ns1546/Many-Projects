import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const userSession = await getUserFromRequest(req);
    
    if (!userSession || userSession.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    await adminDb.collection('orders').doc(id).update({
      orderStatus: body.orderStatus || body.status,
      updatedAt: new Date().toISOString()
    });
    
    const updatedDoc = await adminDb.collection('orders').doc(id).get();
    
    return NextResponse.json({ success: true, data: { _id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const userSession = await getUserFromRequest(req);
    
    if (!userSession || userSession.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await adminDb.collection('orders').doc(id).delete();
    
    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
