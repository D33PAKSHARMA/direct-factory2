require('dotenv').config();
module.exports = {
    APP_URL: process.env.APP_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    DB_URI: process.env.DB_URI,
    DB_NAME: process.env.DB_NAME,
}