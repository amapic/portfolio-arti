'use client'

import { useEffect, useState } from 'react'

interface NoSSRProps {
  children: React.ReactNode
}

/**
 * Composant qui empêche l'hydration côté serveur
 * Utile pour éviter les erreurs d'hydration sur les pages admin
 */
export default function NoSSR({ children }: NoSSRProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return <>{children}</>
}
