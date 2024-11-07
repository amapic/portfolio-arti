'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (response.ok) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Mot de passe incorrect')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center">Administration</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const [sections, setSections] = useState([])
  const [newSection, setNewSection] = useState({
    title: '',
    content: '',
    type: 'card'
  })

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault()
    // Ici vous ajouterez la logique pour sauvegarder la nouvelle section
    console.log('Nouvelle section:', newSection)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard Administration</h1>
        
        {/* Formulaire d'ajout de section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Ajouter une nouvelle section</h2>
          <form onSubmit={handleAddSection} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titre</label>
              <input
                type="text"
                value={newSection.title}
                onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contenu</label>
              <textarea
                value={newSection.content}
                onChange={(e) => setNewSection({...newSection, content: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={newSection.type}
                onChange={(e) => setNewSection({...newSection, type: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="card">Carte</option>
                <option value="section">Section</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Ajouter
            </button>
          </form>
        </div>

        {/* Liste des sections existantes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Sections existantes</h2>
          {sections.length === 0 ? (
            <p className="text-gray-500">Aucune section pour le moment</p>
          ) : (
            <div className="space-y-4">
              {/* Mapping des sections ici */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 