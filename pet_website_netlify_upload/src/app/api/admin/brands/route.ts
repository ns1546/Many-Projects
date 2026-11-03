import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('brands').orderBy('createdAt', 'desc').get();
    const brands = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, imageUrl, description } = body;
    
    if (!name) {
      return NextResponse.json({ success: false, message: 'Brand name is required' }, { status: 400 });
    }
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if brand already exists
    const existing = await adminDb.collection('brands').where('slug', '==', slug).get();
    if (!existing.empty) {
      return NextResponse.json({ success: false, message: 'Brand already exists' }, { status: 400 });
    }

    const newBrand = {
      name,
      slug,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516714435131-44d6b64dc1a2?w=800&q=80',
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('brands').add(newBrand);

    return NextResponse.json({ 
      success: true, 
      data: { _id: docRef.id, ...newBrand }
    });
  } catch (error: any) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
