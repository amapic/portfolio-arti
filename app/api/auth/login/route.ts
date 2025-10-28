import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { setAuthCookie } from '../../../../lib/auth'

// Configuration Firebase pour le serveur
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialiser Firebase pour le serveur
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Authentification Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Déterminer le rôle (vous pouvez adapter cette logique)
    const role = email.includes('admin') ? 'admin' : 'viewer'

    // Créer le payload pour le JWT
    const authPayload = {
      uid: user.uid,
      email: user.email!,
      role: role as 'admin' | 'viewer',
      displayName: user.displayName || undefined,
    }

    // Créer le cookie d'authentification
    await setAuthCookie(authPayload)

    return NextResponse.json({
      success: true,
      user: authPayload
    })

  } catch (error: any) {
    console.error('Erreur de connexion:', error)
    
    let errorMessage = 'Erreur de connexion'
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Utilisateur non trouvé'
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Mot de passe incorrect'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide'
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}