const { Plan, Subscription } = require('../models');

exports.createPlan = async (req, res) => {
    try {
        const plan = await Plan.create(req.body);
        res.status(201).json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true });
        res.status(200).json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findById(id);
        if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

        // Mongoose update
        Object.assign(plan, req.body);
        await plan.save();

        res.status(200).json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const activeSubscriptions = await Subscription.countDocuments({
            planId: id,
            status: 'ACTIVE'
        });

        if (activeSubscriptions > 0) {
            return res.status(400).json({ success: false, error: 'Cannot delete plan with active subscriptions' });
        }

        // Soft delete
        await Plan.findByIdAndUpdate(id, { isActive: false });
        res.status(200).json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
