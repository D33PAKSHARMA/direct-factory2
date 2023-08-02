const jwt = require('jsonwebtoken');
const config = require("../config/dbconfig");
const { } = require('../helpers');

verifyToken = async (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            if(decoded && decoded.user_type == 'client') {
                next();
            } else {
                return res.status(403).send({ status_code: 403, data: {}, message: 'Not authorized'});
            } 
        } else {
            return res.status(403).send({ status_code: 403, data: {}, message: 'Please login again'});
        }
    } else {
        return res.status(403).send({ status_code: 403, data: {}, message: 'Please login again'});
    } 
};

const auth = {
  verifyToken
};
module.exports = auth;