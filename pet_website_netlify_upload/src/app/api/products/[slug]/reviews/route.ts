import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { rating, comment, name } = await req.json();
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const snapshot = await adminDb.collection('products').where('slug', '==', slug).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const product = doc.data();

    const review = {
      name,
      rating: Number(rating),
      comment,
      date: new Date().toISOString()
    };

    const reviews = product.reviews || [];
    reviews.push(review);
    const numOfReviews = reviews.length;
    
    // Calculate new average rating
    const ratings = reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / reviews.length;

    await doc.ref.update({
      reviews,
      numOfReviews,
      ratings
    });

    return NextResponse.json({ success: true, message: 'Review added successfully', data: reviews }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
