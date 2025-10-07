// Migration example: Comment remplacer l'ancien AuthProvider par Firebase

// AVANT (dans app/layout.tsx) :
/*
import { AuthProvider } from './components/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
*/

// APRÈS (dans app/layout.tsx) :
/*
import { AuthProvider } from './components/FirebaseAuthProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
*/

// UTILISATION dans les composants (reste identique) :
/*
import { useAuth } from '../components/FirebaseAuthProvider';

function MonComposant() {
  const { user, isLoggedIn, hasWriteAccess, logout, setShowLoginModal } = useAuth();
  
  // hasWriteAccess est true si user.role === 'admin'
  // isLoggedIn est true si l'utilisateur est connecté via Firebase
  
  if (!isLoggedIn) {
    return (
      <button onClick={() => setShowLoginModal(true)}>
        Se connecter
      </button>
    );
  }
  
  return (
    <div>
      <p>Connecté en tant que : {user?.email}</p>
      <p>Rôle : {user?.role}</p>
      {hasWriteAccess && <p>Vous avez les droits d'écriture</p>}
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}
*/