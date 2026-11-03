import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    
    const tenant = db.prepare('SELECT id, name, domain, themeColor, currency, status FROM Tenant WHERE id = ?').get(tenantId)
    
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } })
    }

    if ((tenant as any).status !== 'ACTIVE') {
      return NextResponse.json({ error: "Store is currently unavailable." }, { status: 403, headers: { "Access-Control-Allow-Origin": "*" } })
    }

    const categories = db.prepare('SELECT * FROM Category WHERE tenantId = ?').all(tenantId)
    const products = db.prepare('SELECT * FROM Product WHERE tenantId = ? AND isActive = 1').all(tenantId)
    const banners = db.prepare('SELECT * FROM StoreBanner WHERE tenantId = ? AND isActive = 1').all(tenantId)

    return NextResponse.json({ tenant, categories, products, banners }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
  })
}
