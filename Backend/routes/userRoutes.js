const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Secure all user routes with authentication and role verification
router.use(authenticateToken, authorizeRoles('User'));

router.get('/stores', userController.getStores);
router.post('/rating', userController.submitRating);

module.exports = router;
