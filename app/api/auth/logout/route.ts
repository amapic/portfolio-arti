import { NextRequest, NextResponse } from 'next/server'
import { removeAuthCookie } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Supprimer le cookie d'authentification
    await removeAuthCookie()

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    })

  } catch (error: any) {
    console.error('Erreur de déconnexion:', error)
    
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    )
  }
}