const jwt = require('jsonwebtoken');
const config = require("../config/dbconfig");
const { getUsersFullDetails } = require('../helpers');
authentication = async (req, res, next) => {
    try {
        if(req.headers.authorization && req.headers.authorization.split(' ')[1]) {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, config.JWT_SECRET);
            let userDetail = await getUsersFullDetails(decoded._id);
            if (userDetail.is_active == true) {
                if (userDetail.user_type == 'super_admin') {
                    next();
                } else {
                    return res.status(403).send({ status_code: 403, data: {}, message: 'You are not autorized to access this route'});
                }
            } else {
                return res.status(403).send({ status_code: 403, data: {}, message: 'Account is not active'});
            }
        } else {
           return res.status(403).send({ status_code: 403, data: {}, message: 'Please login again'});
        }
    } catch(err) {
        return res.status(403).send({ status_code: 403, data: {}, message: 'Please login again'});
    }
};
const admin = {
    authentication
};
module.exports = admin