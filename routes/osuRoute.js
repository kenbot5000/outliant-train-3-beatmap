require('dotenv').config();

const express = require('express');
const router = express.Router();

const osuController = require('../controllers/osuController');

// Middleware
const verifyAccessToken = require('../middleware/verifyAccessToken');
router.use(verifyAccessToken);

// Routes
// Resets parameters before every new API call
router.all('*', osuController.resetClient);
router.get('/all', osuController.getAllMaps);
router.get('/', osuController.getMap);
router.post('/', osuController.createMap);
router.patch('/', osuController.updateMap);
router.delete('/', osuController.deleteMap);

module.exports = router;
