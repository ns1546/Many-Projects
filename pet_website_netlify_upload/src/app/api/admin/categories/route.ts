import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb.collection('categories').get();
    const categories = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userSession = await getUserFromRequest(req);
    if (!userSession || userSession.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, slug } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ message: 'Name and Slug are required' }, { status: 400 });
    }

    const newCategory = { name, slug, count: 0, createdAt: new Date().toISOString() };
    const docRef = await adminDb.collection('categories').add(newCategory);

    return NextResponse.json({ success: true, data: { _id: docRef.id, ...newCategory } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
