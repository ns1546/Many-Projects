import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAllMockProducts } from '@/lib/data';

export async function POST() {
  try {
    const products = getAllMockProducts();
    const batch = adminDb.batch();

    products.forEach((prod) => {
      // Create a specific doc ID or let Firestore generate it
      const docRef = adminDb.collection('products').doc(prod._id);
      
      const { _id, ...data } = prod;
      
      batch.set(docRef, {
        ...data,
        createdAt: prod.createdAt instanceof Date ? prod.createdAt.toISOString() : new Date().toISOString(),
      });
    });

    await batch.commit();

    return NextResponse.json({ success: true, message: `Successfully seeded ${products.length} products to Firestore` });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
