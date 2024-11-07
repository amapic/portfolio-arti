import { NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'votre_mot_de_passe_par_defaut'

export async function POST(request: Request) {
  const body = await request.json()
  
  if (body.password === ADMIN_PASSWORD) {
    return NextResponse.json({ success: true })
  }
  
  return NextResponse.json(
    { success: false, message: 'Mot de passe incorrect' },
    { status: 401 }
  )
} 