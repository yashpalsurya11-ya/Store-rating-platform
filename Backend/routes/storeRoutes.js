const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Secure store routes with authentication and role verification
router.use(authenticateToken, authorizeRoles('StoreOwner'));

router.get('/dashboard', storeController.getStoreDashboard);

module.exports = router;
