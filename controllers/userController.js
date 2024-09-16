const User = require('../models/userModel');
const MotoAd = require('../models/motoAdModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }        

        user = new User({
            name,
            email,
            password,
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        // Envoyer l'e-mail de bienvenue
        const subject = 'Bienvenue sur notre plateforme !';
        const message = `Bonjour ${user.name},\n\nMerci de vous être inscrit sur notre plateforme. Nous espérons que vous apprécierez notre service.\n\nCordialement,\nL'équipe`;

        sendEmail(user.email, subject, message);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isModo: user.isModo,
                isAdmin: user.isAdmin,
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isModo: user.isModo,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });  // Trie par date de création décroissante
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error });
    }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error });
    }
};

// Supprimer un utilisateur par ID
exports.deleteUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error });
    }
};

// Définir un utilisateur comme modérateur
exports.setModerator = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isModo = true;
        await user.save();

        res.status(200).json({ message: 'User is now a moderator', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to set moderator', error });
    }
};

// Récupérer le profil de l'utilisateur connecté, incluant ses annonces de motos
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('motoAds', 'title price brand model year');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user profile', error });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const motoAds = await MotoAd.find({ user: req.user.id });
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      res.status(200).json({ user, motoAds });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du profil utilisateur', error });
    }
  };