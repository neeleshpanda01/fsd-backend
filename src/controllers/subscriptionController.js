const { Subscription, Plan, User } = require('../models');

exports.subscribe = async (req, res) => {
    try {
        const { userId } = req.userData;
        const { planId } = req.body;

        // Critical Business Rule: Single Active Subscription
        const activeSubscription = await Subscription.findOne({
            userId,
            status: 'ACTIVE',
            endDate: { $gte: new Date() }
        });

        if (activeSubscription) {
            return res.status(409).json({
                success: false,
                error: 'You already have an active subscription. Please cancel it before subscribing to a new plan.'
            });
        }

        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.duration);

        const subscription = await Subscription.create({
            userId,
            planId,
            startDate,
            endDate,
            status: 'ACTIVE'
        });

        res.status(201).json({
            success: true,
            subscription: {
                ...subscription.toJSON(),
                planName: plan.name
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMySubscription = async (req, res) => {
    try {
        const { userId } = req.userData;
        const subscription = await Subscription.findOne({
            userId,
            status: 'ACTIVE',
            endDate: { $gte: new Date() }
        }).populate('planId', 'name price features duration');

        if (!subscription) {
            return res.status(200).json({ success: true, subscription: null });
        }

        const today = new Date();
        const end = new Date(subscription.endDate);
        const diffTime = Math.abs(end - today);
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Map planId to plan for frontend compatibility
        const subJSON = subscription.toJSON();
        subJSON.plan = subJSON.planId;
        delete subJSON.planId;

        res.status(200).json({
            success: true,
            subscription: {
                ...subJSON,
                daysRemaining
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.cancelSubscription = async (req, res) => {
    try {
        const { userId } = req.userData;
        const subscription = await Subscription.findOne({
            userId,
            status: 'ACTIVE',
            endDate: { $gte: new Date() }
        });

        if (!subscription) {
            return res.status(404).json({ success: false, error: 'No active subscription found' });
        }

        subscription.status = 'CANCELLED';
        subscription.endDate = new Date();
        await subscription.save();

        res.status(200).json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate('userId', 'email fullName')
            .populate('planId', 'name price')
            .sort({ createdAt: -1 });

        // Transform for frontend compatibility (userId -> User, planId -> Plan)
        const formattedSubs = subscriptions.map(sub => {
            const s = sub.toJSON();
            s.User = s.userId;
            s.Plan = s.planId;
            delete s.userId;
            delete s.planId;
            return s;
        });

        res.status(200).json({
            success: true,
            subscriptions: formattedSubs,
            total: subscriptions.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
