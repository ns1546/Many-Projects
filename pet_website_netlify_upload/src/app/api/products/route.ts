import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { MOCK_PRODUCTS } from '@/lib/data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    let queryRef: FirebaseFirestore.Query = adminDb.collection('products');
    if (category) {
      queryRef = queryRef.where('category.slug', '==', category);
    }
    
    // Default sort by createdAt descending
    queryRef = queryRef.orderBy('createdAt', 'desc');

    const snapshot = await queryRef.get();
    const products = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    console.error("Firebase error in /api/products, falling back to mock data:", error);
    return NextResponse.json({ success: true, count: MOCK_PRODUCTS.length, data: MOCK_PRODUCTS });
  }
}
