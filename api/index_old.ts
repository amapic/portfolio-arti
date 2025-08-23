express =require('express');
cors  =require ('cors');
cookieParser  =require('cookie-parser');
// import loginHandler from './login';
bcrypt  =require('bcrypt');
jwt  =require('jsonwebtoken');

const app = express();
const HASHED_PASSWORD = process.env.HASHED_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// const HASHED_PASSWORD="$2b$10$74R0V4IWVDvjhRCvng07/OMveYqzncSzwAGtRDlr0.kGHRrbUOUga"
// const JWT_SECRET="ab0413ca82c913cc783d2394bbb9cd838debdd7d0dc2f5452a05cc665a3fb1be"

// Middleware

app.use(cors({credentials: true,origin: true}	));

app.use(express.json());
app.use(cookieParser());
// app.use(cors({
  // origin:  '*',
  // credentials: true,
  // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // allowedHeaders: [
    // 'X-CSRF-Token',
    // 'X-Requested-With',
    // 'Accept',
    // 'Accept-Version',
    // 'Content-Length',
    // 'Content-MD5',
    // 'Content-Type',
    // 'Date',
    // 'X-Api-Version'
  // ]
// }));
console.log("jggj",HASHED_PASSWORD,JWT_SECRET)
const loginHandler = async (req, res) => {
console.log("login")
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Le mot de passe est requis' });
    }

    const isPasswordValid = await bcrypt.compare(password, HASHED_PASSWORD);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { authenticated: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.setHeader('Set-Cookie', `auth_token=${token}; ${Object.entries(cookieOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}`);

    return res.status(200).json({ message: 'Connexion réussie' });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// Routes
app.post('/login', loginHandler);

// Route par défaut
app.get('/api', (req, res) => {
console.log("jggj",HASHED_PASSWORD,JWT_SECRET)
  res.json({ message: 'API is runningg' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// Pour Vercel, nous devons exporter l'application
module.exports = app;

// import { VercelRequest, VercelResponse } from '@vercel/node';

app.listen(5002, () => console.log(`🚀 Server ready at: 5002 ⭐️`))


// export default app;

// export default loginHandler;