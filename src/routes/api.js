const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const planController = require('../controllers/planController');
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Plan Routes
router.get('/plans', authMiddleware, planController.getAllPlans);
router.post('/admin/plans', authMiddleware, checkRole('ADMIN'), planController.createPlan);
router.put('/admin/plans/:id', authMiddleware, checkRole('ADMIN'), planController.updatePlan);
router.delete('/admin/plans/:id', authMiddleware, checkRole('ADMIN'), planController.deletePlan);

// Subscription Routes
router.post('/subscriptions/subscribe', authMiddleware, subscriptionController.subscribe);
router.get('/subscriptions/my-subscription', authMiddleware, subscriptionController.getMySubscription);
router.post('/subscriptions/cancel', authMiddleware, subscriptionController.cancelSubscription);
router.get('/admin/subscriptions', authMiddleware, checkRole('ADMIN'), subscriptionController.getAllSubscriptions);

module.exports = router;
