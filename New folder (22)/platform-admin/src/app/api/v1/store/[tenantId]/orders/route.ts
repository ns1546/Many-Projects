import { NextResponse } from "next/server"
import db from "@/lib/db"
import crypto from "crypto"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    const body = await request.json()
    // items is array of { productId, productName, quantity, unitPrice }
    const { items, customer, paymentMethod, shippingAddress, subtotal, tax, shippingCost, total } = body

    const customerId = "cust_" + crypto.randomBytes(8).toString("hex")

    db.prepare(`
      INSERT INTO Customer (id, firstName, lastName, email, phone, address, city, country, tenantId, totalOrders, totalSpent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(customerId, customer.firstName, customer.lastName, customer.email, customer.phone || null, customer.address || null, customer.city || null, customer.country || null, tenantId, total)

    const orderId = "ord_" + crypto.randomBytes(8).toString("hex")

    db.prepare(`
      INSERT INTO Orders (id, customerId, subtotal, tax, shippingCost, total, status, paymentMethod, paymentStatus, shippingAddress, tenantId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, customerId, subtotal, tax, shippingCost, total, 'PENDING', paymentMethod, 'UNPAID', shippingAddress, tenantId)

    const stmt = db.prepare(`
      INSERT INTO OrderItem (id, orderId, productId, productName, quantity, unitPrice, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    db.transaction(() => {
      for (const item of items) {
        stmt.run("item_" + crypto.randomBytes(8).toString("hex"), orderId, item.productId, item.productName, item.quantity, item.unitPrice, item.quantity * item.unitPrice)
        // Deduct stock
        db.prepare('UPDATE Product SET stock = stock - ? WHERE id = ?').run(item.quantity, item.productId)
      }
    })()

    return NextResponse.json({ success: true, orderId }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
  })
}
