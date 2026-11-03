import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userSession = await getUserFromRequest(req);
    if (!userSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const docRef = adminDb.collection('users').doc(userSession.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      // User doesn't have a profile document yet
      return NextResponse.json({ success: true, data: { name: userSession.name, email: userSession.email } });
    }
    
    return NextResponse.json({ success: true, data: { _id: doc.id, ...doc.data() } });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userSession = await getUserFromRequest(req);
    if (!userSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const docRef = adminDb.collection('users').doc(userSession.id);
    
    await docRef.set({
      ...body,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    const updatedDoc = await docRef.get();
    
    return NextResponse.json({ success: true, data: { _id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userSession = await getUserFromRequest(req);
    if (!userSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await adminDb.collection('users').doc(userSession.id).delete();
    
    return NextResponse.json({ success: true, message: 'Profile deleted' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
