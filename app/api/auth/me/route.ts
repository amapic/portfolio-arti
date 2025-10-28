import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromCookie } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authData = await getAuthFromCookie()

    if (!authData) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: authData.uid,
        email: authData.email,
        role: authData.role,
        displayName: authData.displayName,
      }
    })

  } catch (error: any) {
    console.error('Erreur de vérification:', error)
    
    return NextResponse.json(
      { error: 'Erreur de vérification' },
      { status: 500 }
    )
  }
}