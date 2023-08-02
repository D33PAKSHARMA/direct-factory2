const jwt = require('jsonwebtoken');
const models = require("../models");
const config = require("../config/dbconfig");
const { } = require('../helpers');

//Importing models
const Countries = models.Countries;

const allCountries = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        await Countries.find({is_trash: false}).lean().then(async(response) => {
            return res.status(200).send({ status_code: 200, data: response, message: 'Success' });
        })
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

const addCountry = async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const{name, currency_code, currency_symbol} = req.body;
        await Countries.findOne({name: name}).lean().then(async (response) => {
            if(response) {
                return res.status(400).send({ status_code: 400, data: '', message: 'Country by this name already added' });
            } else {
                const countryData = new Countries({
                    name: name,
                    currency_code: currency_code,
                    currency_symbol: currency_symbol,
                    created_by: decoded._id,
                    created_at: new Date().toISOString(),
                });
                const savedCountry = await Countries.create(countryData);
                return res.status(200).send({ status_code: 200, data: savedCountry, message: 'Country added successfully' });
            }
        });
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

const editCountry = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const{countryId} = req.params;
        await Countries.findOne({_id: countryId}).lean().then(async(response) => {
            if(!response) {
                return res.status(400).send({ status_code: 400, data: '', message: 'Country not found' });
            } else {
                return res.status(200).send({ status_code: 200, data: response, message: 'Success' });
            }
        });
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

const updateCountry = async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const{country_id, name, currency_code, currency_symbol} = req.body;
        await Countries.findOne({$and: [{ name: name }, { _id: { $ne: country_id }}]}).lean().then(async (response) => {
            if(response) {
                return res.status(200).send({ status_code: 200, data: '', message: 'Country by this name already exist' });
            } else {
                const filter = {_id: country_id};
                const update = {
                    $set: {
                        name: name,
                        currency_code: currency_code,
                        currency_symbol: currency_symbol,
                        modified_at: new Date().toISOString(),
                        modified_by: decoded._id
                    }
                };
                const options = {returnOriginal: false};
                await Countries.findOneAndUpdate(filter, update, options).then(async (updatedCountry) => {
                    return res.status(200).send({ status_code: 200, data: updatedCountry, message: 'Country updated successfully' });
                });                
            }
        });
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

const statusCountry = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const {status, countryId} = req.params;
        const filter = {_id: countryId};
        const options = {returnOriginal: false};
        let updatedCountry; let message;
        if (status == 'deactivate') {
            const update = {
                $set: {
                    status: false,
                    modified_at: new Date().toISOString()
                }
            };
            updatedCountry = await Countries.findOneAndUpdate(filter, update, options); 
            message = 'Country deactivated successfully';
        } else if (status == 'delete') {
            const update = {
                $set: {
                    status: false,
                    is_trash: true,
                    modified_at: new Date().toISOString()
                }
            };
            updatedCountry = await Countries.findOneAndUpdate(filter, update, options);
            message = 'Country deleted successfully';
        } else {
            const update = {
                $set: {
                    status: true,
                    modified_at: new Date().toISOString()
                }
            };
            updatedCountry = await Countries.findOneAndUpdate(filter, update, options);
            message = 'Country activated successfully';
        }
        return res.status(200).send({ status_code: 200, data: updatedCountry, message: message });
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

module.exports = {
    allCountries, addCountry, editCountry, updateCountry, statusCountry
}