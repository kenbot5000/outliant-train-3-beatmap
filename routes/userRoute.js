const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.get('/all', userController.getAllUsers);
router.get('/', userController.getUser);
// Add PATCH endpoint
router.delete('/', userController.deleteUser);
router.delete('/clear', userController.deleteAllUsers);

module.exports = router;