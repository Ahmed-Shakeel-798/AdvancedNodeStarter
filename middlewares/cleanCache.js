const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    await next(); // route handler runs first, we wait for it to do its job

    clearHash(req.user.id);
}