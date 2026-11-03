import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ message: 'No items in order' }, { status: 400 });
    }
    if (!body.address?.street) {
      return NextResponse.json({ message: 'Shipping address is required' }, { status: 400 });
    }

    const authUser = await getUserFromRequest(req);

    const orderData = {
      user: authUser ? { id: authUser.id, name: authUser.name || '', email: authUser.email } : null,
      orderItems: body.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        product: item.id,
      })),
      shippingAddress: {
        firstName: body.address.firstName || '',
        lastName: body.address.lastName || '',
        street: body.address.street,
        city: body.address.city,
        state: body.address.state,
        zipCode: body.address.zip || body.address.zipCode || '',
        country: body.address.country || 'US',
        phone: body.address.phone || '',
        email: body.address.email || authUser?.email || '',
      },
      paymentMethod: 'COD',
      itemsPrice: body.itemsPrice,
      taxPrice: body.taxPrice || 0,
      shippingPrice: body.shippingPrice,
      totalPrice: body.totalPrice,
      isPaid: false,
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('orders').add(orderData);
    
    // --- Google Form Integration ---
    try {
      const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSea5_hVxvduAjVBxESu1RG5_E0alFmcbVqEMe8njAWL4vSbEQ/formResponse";
      const formData = new URLSearchParams();
      
      const productNames = orderData.orderItems.map((item: any) => item.name).join(', ');
      const productQuantities = orderData.orderItems.map((item: any) => item.quantity).join(', ');
      const fullAddress = `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}, ${orderData.shippingAddress.country}`;
      const customerEmail = body.address.email || orderData.user?.email || 'guest@example.com';
      const customerName = `${body.address.firstName || ''} ${body.address.lastName || ''}`.trim() || 'Guest';
      
      formData.append('entry.1481123914', docRef.id); // Order Number
      formData.append('entry.1806234540', customerName); // Customer Name
      formData.append('entry.947173490', orderData.shippingAddress.phone || 'N/A'); // Phone Number
      formData.append('entry.1688616107', customerEmail); // Email Address
      formData.append('entry.790964016', fullAddress); // Delivery Address
      formData.append('entry.798216068', productNames); // Product Name
      formData.append('entry.1270729637', productQuantities); // Product Quantity
      
      // Submit in background without blocking
      fetch(formUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      }).catch(err => console.error('Failed to submit Google Form:', err));
    } catch (formError) {
      console.error('Google Form preparation error:', formError);
    }
    // -------------------------------
    
    return NextResponse.json({ 
      success: true, 
      data: { _id: docRef.id, ...orderData } 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
  }
}
