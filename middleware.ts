import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// MIDDLEWARE TEMPORAIREMENT DÉSACTIVÉ
// Car on utilise Firebase côté client pour l'instant
// TODO: Réactiver quand on aura migré vers JWT/cookies

export function middleware(request: NextRequest) {
  // Laisser passer toutes les requêtes pour l'instant
  return NextResponse.next()
}

/* 
// ANCIEN CODE DU MIDDLEWARE (à réactiver plus tard)
// Liste des routes protégées
const protectedRoutes = ['/admin']

// Liste des routes publiques (même sous /admin)
const publicRoutes = ['/admin/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) && !publicRoutes.includes(pathname)
  )

  if (isProtectedRoute) {
    // Vérifier le token d'authentification
    const token = request.cookies.get('auth-token')
    
    if (!token) {
      // Rediriger vers la page de login si pas de token
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Optionnel: Vérifier la validité du token ici
    // Vous pouvez ajouter une validation JWT ou autre
    try {
      // Pour l'instant, on accepte tous les tokens existants
      // TODO: Ajouter la validation JWT si nécessaire
      
      return NextResponse.next()
    } catch (error) {
      // Token invalide, rediriger vers login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('auth-token')
      return response
    }
  }

  return NextResponse.next()
}
*/

export const config = {
  matcher: [
    // Matcher pour toutes les routes admin sauf login
    '/admin/:path*',
    // Exclure les fichiers statiques
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}