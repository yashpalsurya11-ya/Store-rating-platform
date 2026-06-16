const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Secure all admin routes with authentication and role verification
router.use(authenticateToken, authorizeRoles('Admin'));

router.get('/stats', adminController.getDashboardStats);
router.post('/users', adminController.createUser);
router.post('/stores', adminController.createStore);
router.get('/users', adminController.getUsers);
router.get('/stores', adminController.getStores);
router.get('/users/:id', adminController.getUserDetails);

module.exports = router;
