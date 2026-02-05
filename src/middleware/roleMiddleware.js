const checkRole = (role) => {
    return (req, res, next) => {
        if (req.userData && req.userData.role === role) {
            next();
        } else {
            return res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
        }
    };
};

module.exports = checkRole;
