"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitOrder(tenantId: string, formData: any, items: any[]) {
  try {
    const customerId = `cust_${formData.email.replace(/[^a-zA-Z0-9]/g, '')}`;
    
    // Check if customer exists, if not create
    const existingCustomer = db.prepare('SELECT id FROM Customer WHERE id = ? AND tenantId = ?').get(customerId, tenantId);
    if (!existingCustomer) {
      db.prepare(`
        INSERT INTO Customer (id, tenantId, firstName, lastName, email, phone, address, city, country, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(customerId, tenantId, formData.firstName, formData.lastName, formData.email, formData.phone, formData.address, formData.city, 'USA');
    }
    
    // Calculate total
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
    const shipping = subtotal > 100 ? 0 : 10;
    const taxes = subtotal * 0.05;
    const total = subtotal + shipping + taxes;
    
    const orderId = `ord_${crypto.randomUUID().split('-')[0]}`;
    
    // Create order
    const insertOrder = db.prepare(`
      INSERT INTO Orders (id, tenantId, customerId, subtotal, tax, shippingCost, total, status, paymentMethod, paymentStatus, shippingAddress, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, 'UNPAID', ?, datetime('now'))
    `);

    // Create order items
    const insertItem = db.prepare(`
      INSERT INTO OrderItem (id, orderId, productId, productName, quantity, unitPrice, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const updateStock = db.prepare(`
      UPDATE Product SET stock = stock - ? WHERE id = ?
    `);

    // Run within transaction
    const transaction = db.transaction(() => {
      insertOrder.run(orderId, tenantId, customerId, subtotal, taxes, shipping, total, formData.paymentMethod || 'cod', formData.address);

      for (const item of items) {
        insertItem.run(crypto.randomUUID(), orderId, item.id, item.name, item.quantity, item.price, item.price * item.quantity);
        updateStock.run(item.quantity, item.id);
      }
    });
    transaction();

    // Revalidate paths for admin to see
    revalidatePath(`/tenant/${tenantId}/orders`);
    revalidatePath(`/tenant/${tenantId}`);
    
    return { success: true, orderId };
  } catch (error: any) {
    console.error("Order submission error:", error);
    return { success: false, error: error.message };
  }
}
