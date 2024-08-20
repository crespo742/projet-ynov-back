const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Charger les variables d'environnement
dotenv.config();

// Connecter à MongoDB
connectDB();

const app = express();

// Middleware pour parser le corps des requêtes JSON
app.use(express.json());

// Définir des routes simples pour tester
app.get('/', (req, res) => {
  res.send('API is running...');
});

// // Importer les routes utilisateurs
// const userRoutes = require('./routes/userRoutes');
// app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
