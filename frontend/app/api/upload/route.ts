import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public/products folder
    const publicDir = path.join(process.cwd(), 'public', 'products')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // Clean up filename and append timestamp to avoid overwrites
    const ext = path.extname(file.name)
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const filename = `${baseName}_${Date.now()}${ext}`
    const filepath = path.join(publicDir, filename)

    fs.writeFileSync(filepath, buffer)

    const publicUrl = `/products/${filename}`
    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
