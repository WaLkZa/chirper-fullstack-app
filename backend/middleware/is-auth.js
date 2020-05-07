const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        throw new HttpError('Not authenticated.', 401);
    }

    const token = authHeader.split(' ')[1]; // Bearer  + token
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, 'somesupersecretsecret');
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        throw new HttpError('Not authenticated.', 401);
    }

    req.userId = decodedToken.userId;

    next();
};