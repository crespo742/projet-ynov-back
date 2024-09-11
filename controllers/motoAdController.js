const MotoAd = require('../models/motoAdModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

// Créer une nouvelle annonce
exports.createMotoAd = async (req, res) => {
    try {
        const { title, description, pricePerDay, brand, model, year, mileage, location } = req.body;
        const imageUrl = req.file ? req.file.location : null;

        const motoAd = new MotoAd({
            title,
            description,
            pricePerDay,
            brand,
            model,
            year,
            mileage,
            location,  // Localisation ajoutée ici
            image: imageUrl ? [imageUrl] : [],
            user: req.user.id,
        });

        const savedMotoAd = await motoAd.save();

        sendEmail(req.user.email, 'Confirmation de publication d\'annonce', `Votre annonce "${title}" a été publiée avec succès !`);

        const user = await User.findById(req.user.id);
        user.motoAds.push(savedMotoAd._id);
        await user.save();
        res.status(201).json(savedMotoAd);
    } catch (error) {
        console.error('Error creating ad:', error);
        res.status(500).json({ message: 'Failed to create the ad', error });
    }
};




// Obtenir toutes les annonces
exports.getMotoAds = async (req, res) => {
    try {
        const motoAds = await MotoAd.find().populate('user', 'name email');
        res.status(200).json(motoAds);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch ads', error });
    }
};

// Obtenir toutes les annonces d'un utilisateur spécifique
exports.getUserMotoAds = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('motoAds');
        res.status(200).json(user.motoAds);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user ads', error });
    }
};

// Obtenir une annonce par ID
exports.getMotoAdById = async (req, res) => {
    try {
        const motoAd = await MotoAd.findById(req.params.id).populate('user', 'name email');
        if (!motoAd) {
            return res.status(404).json({ message: 'Ad not found' });
        }
        res.status(200).json(motoAd);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch the ad', error });
    }
};

// Mettre à jour une annonce
exports.updateMotoAd = async (req, res) => {
    try {
        const { pricePerDay, ...updateData } = req.body; // Extraire 'pricePerDay' et le reste des données

        const motoAd = await MotoAd.findByIdAndUpdate(req.params.id, { ...updateData, pricePerDay }, { new: true }); // Inclure 'pricePerDay' dans la mise à jour
        if (!motoAd) {
            return res.status(404).json({ message: 'Ad not found' });
        }
        res.status(200).json(motoAd);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update the ad', error });
    }
};


// Supprimer une annonce
exports.deleteMotoAd = async (req, res) => {
    try {
        const motoAd = await MotoAd.findByIdAndDelete(req.params.id);
        if (!motoAd) {
            return res.status(404).json({ message: 'Ad not found' });
        }
        res.status(200).json({ message: 'Ad deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete the ad', error });
    }
};

//filtres -->

// controllers/motoAdController.js
exports.getFilteredMotoAds = async (req, res) => {
    try {
      const { brand, year, minPrice, maxPrice, search, location } = req.query;
  
      const filters = {};
  
      if (brand) {
        filters.brand = brand;
      }
  
      if (year) {
        filters.year = year;
      }
  
      if (minPrice || maxPrice) {
        filters.pricePerDay = {};
        if (minPrice) {
          filters.pricePerDay.$gte = minPrice;
        }
        if (maxPrice) {
          filters.pricePerDay.$lte = maxPrice;
        }
      }
  
      if (search) {
        filters.title = { $regex: search, $options: 'i' };
      }
  
      if (location) {
        filters.location = { $regex: location, $options: 'i' }; // Recherche insensible à la casse
      }
  
      const motoAds = await MotoAd.find(filters);
      res.status(200).json(motoAds);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch moto ads', error });
    }
  };
  
