import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const userSession = await getUserFromRequest(req);
    if (!userSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const docRef = adminDb.collection('users').doc(userSession.id);
    const doc = await docRef.get();
    
    if (doc.exists && doc.data()?.addresses) {
      const addresses = doc.data()!.addresses.filter((addr: any) => addr._id !== id);
      await docRef.update({ addresses, updatedAt: new Date().toISOString() });
      return NextResponse.json({ success: true, data: addresses });
    }
    
    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
