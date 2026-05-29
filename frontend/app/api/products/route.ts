import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.tax_rate, 
        p.stock_status, 
        p.sold, 
        p.rating, 
        p.variants,
        p.image_url,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = true
      ORDER BY p.id DESC
    `)

    // Transform DB rows to match the UI expectations
    const products = result.rows.map((row: any) => {
      // Parse variants to get custom fields like qty and image, else fallback
      let parsedVariants: any = {}
      try {
        if (typeof row.variants === 'string') {
          parsedVariants = JSON.parse(row.variants)[0] || {}
        } else if (Array.isArray(row.variants)) {
          parsedVariants = row.variants[0] || {}
        }
      } catch (e) { }

      return {
        id: row.id,
        name: row.name,
        category: row.category_name || 'Uncategorized',
        price: Number(row.price),
        tax: Number(row.tax_rate) || 5,
        sales: row.sold || 0,
        rating: Number(row.rating) || 0,
        stock: row.stock_status || 'In stock',
        qty: parsedVariants.qty !== undefined ? parsedVariants.qty : 0,
        image: row.image_url || parsedVariants.image || '📦'
      }
    })

    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, category, price, stock, qty } = body
    
    // Default image if none provided
    const image = body.image || '📦'

    // 1. Get or Create Category
    let categoryId = null
    if (category) {
      const catCheck = await query(`SELECT id FROM categories WHERE name = $1`, [category])
      if (catCheck.rows.length > 0) {
        categoryId = catCheck.rows[0].id
      } else {
        const newCat = await query(`INSERT INTO categories (name) VALUES ($1) RETURNING id`, [category])
        categoryId = newCat.rows[0].id
      }
    }

    // 2. Variants field usage for missing UI details
    const variantsData = JSON.stringify([{ qty, image }])
    const taxRate = 5 // standard default

    // 3. Insert Product
    const insertResult = await query(`
      INSERT INTO products (name, category_id, price, tax_rate, stock_status, variants, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, price, tax_rate, stock_status, sold, rating, variants, image_url
    `, [name, categoryId, price, taxRate, stock, variantsData, image])

    const row = insertResult.rows[0]

    // Construct the formatted item to send back immediately to the frontend
    const newProductUiInfo = {
      id: row.id,
      name: row.name,
      category: category || 'Uncategorized',
      price: Number(row.price),
      tax: Number(row.tax_rate),
      sales: row.sold || 0,
      rating: Number(row.rating) || 0,
      stock: row.stock_status,
      qty: qty || 0,
      image: row.image_url || image
    }

    return NextResponse.json(newProductUiInfo, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, name, category, price, stock, qty, image } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // 1. Get or Create Category
    let categoryId = null
    if (category) {
      const catCheck = await query(`SELECT id FROM categories WHERE name = $1`, [category])
      if (catCheck.rows.length > 0) {
        categoryId = catCheck.rows[0].id
      } else {
        const newCat = await query(`INSERT INTO categories (name) VALUES ($1) RETURNING id`, [category])
        categoryId = newCat.rows[0].id
      }
    }

    // 2. Variants field usage for quantity and image
    const variantsData = JSON.stringify([{ qty, image }])

    // 3. Update Product
    await query(`
      UPDATE products 
      SET name = $1, category_id = $2, price = $3, stock_status = $4, variants = $5, image_url = $6
      WHERE id = $7
    `, [name, categoryId, price, stock, variantsData, image, id])

    // 4. Return the updated product format
    const updatedProduct = {
      id,
      name,
      category: category || 'Uncategorized',
      price: Number(price),
      tax: 5,
      sales: 0,
      rating: 0,
      stock,
      qty,
      image
    }

    return NextResponse.json(updatedProduct)
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Soft-delete the product so we don't break order items foreign keys
    await query(`UPDATE products SET active = false WHERE id = $1`, [id])

    return NextResponse.json({ success: true, message: 'Product soft-deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
