// App.js fait appel aux différentes fonctions implémentées dans l'APi
const express = require('express');
// Pour gérer la demande POST provenant de l'application front-end, nous devrons être capables d'extraire l'objet JSON de la demande
const bodyParser = require('body-parser');
// Plugin Mongoose pour se connecter à la data base Mongo Db
const mongoose = require('mongoose');
// Plugin qui sert dans l'upload des images et permet de travailler avec les répertoires et chemin de fichier
const path = require ('path');
// utilisation du module 'helmet' pour la sécurité en protégeant l'application de certaines vulnérabilités
// il sécurise nos requêtes HTTP, sécurise les en-têtes et ajoute une protection XSS
const helmet = require('helmet');
//Plugin qui limite le nomrbe de requests par utilisateurs.
const rateLimit = require("express-rate-limit");

//pour avoir acces a la base de donnée
require('dotenv').config()

const saucesRoutes = require('./routes/sauces')
const userRoutes = require('./routes/user');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // limit each IP to 100 requests per windowMs
});



mongoose.connect(process.env.MONGO_LOG,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// Middleware Header pour contourner les erreurs en débloquant certains systèmes de sécurité CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Transforme les données arrivant de la requête POST en un objet JSON facilement exploitable
app.use(bodyParser.json());
// On utilise helmet pour plusieurs raisons notamment la mise en place du X-XSS-Protection afin d'activer le filtre de script intersites(XSS) dans les navigateurs web
app.use(helmet());

app.use(limiter);

// Midleware qui permet de charger les fichiers qui sont dans le repertoire images
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

// Export de l'application express pour déclaration dans server.js
module.exports = app;