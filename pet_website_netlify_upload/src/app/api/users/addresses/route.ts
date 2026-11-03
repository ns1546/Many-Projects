import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userSession = await getUserFromRequest(req);
    if (!userSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const docRef = adminDb.collection('users').doc(userSession.id);
    const doc = await docRef.get();
    
    let addresses = [];
    if (doc.exists && doc.data()?.addresses) {
      addresses = doc.data()!.addresses;
    }
    
    const newAddress = {
      _id: 'addr_' + Date.now().toString(),
      ...body,
      isDefault: addresses.length === 0,
      createdAt: new Date().toISOString()
    };
    
    addresses.push(newAddress);
    await docRef.set({ addresses, updatedAt: new Date().toISOString() }, { merge: true });
    
    return NextResponse.json({ success: true, data: addresses }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
