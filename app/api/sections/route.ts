import { NextResponse } from 'next/server'

// Simuler une base de données (à remplacer par une vraie BD plus tard)
let sections: any[] = []

export async function GET() {
  return NextResponse.json(sections)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newSection = {
    id: Date.now(),
    ...body,
    createdAt: new Date().toISOString()
  }
  
  sections.push(newSection)
  
  return NextResponse.json(newSection)
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  sections = sections.filter(section => section.id !== id)
  return NextResponse.json({ success: true })
} 