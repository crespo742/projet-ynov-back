const express = require('express');
const router = express.Router();
const { createMotoAd, getMotoAds, getMotoAdById, updateMotoAd, deleteMotoAd, getUserMotoAds, getFilteredMotoAds } = require('../controllers/motoAdController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Créer une annonce
router.post('/create', authMiddleware, upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }]), createMotoAd);

// Obtenir toutes les annonces
router.get('/', getMotoAds);

// Obtenir toutes les annonces
router.get('/filter', getFilteredMotoAds);

// Obtenir une annonce par ID
router.get('/:id', getMotoAdById);

// Obtenir les annonces de motos de l'utilisateur connecté
router.get('/my-ads', authMiddleware, getUserMotoAds);

// Mettre à jour une annonce
router.put('/:id', authMiddleware, updateMotoAd);

// Supprimer une annonce
router.delete('/:id', authMiddleware, deleteMotoAd);

module.exports = router;
