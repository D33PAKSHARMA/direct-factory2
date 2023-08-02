const jwt = require('jsonwebtoken');
const models = require("../models");
const config = require("../config/dbconfig");
const { } = require('../helpers');

//Importing models
const Services = models.Services;

const allServices = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        await Services.find({is_trash: false}).lean().then(async(response) => {
            return res.status(200).send({ status_code: 200, data: response, message: 'Success' });
        })
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

const addService = async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const{name, department, price, offer_price, validity, description} = req.body;
        await Services.findOne({name: name}).lean().then(async (response) => {
            if(response) {
                return res.status(400).send({ status_code: 400, data: '', message: 'Service by this name already added' });
            } else {
                const serviceData = new Services({
                    name: name,
                    department: department,
                    price: price,
                    offer_price: offer_price,
                    validity: validity,
                    description, description,
                    created_by: decoded._id,
                    created_at: new Date().toISOString(),
                });
                const savedService = await Services.create(serviceData);
                return res.status(200).send({ status_code: 200, data: savedService, message: 'Service added successfully' });
            }
        });
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

const editService = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const{serviceId} = req.params;
        await Services.findOne({_id: serviceId}).lean().then(async(response) => {
            if(!response) {
                return res.status(400).send({ status_code: 400, data: '', message: 'Service not found' });
            } else {
                return res.status(200).send({ status_code: 200, data: response, message: 'Success' });
            }
        });
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

const updateService = async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const{service_id, name, department, price, offer_price, validity, description} = req.body;
        await Services.findOne({$and: [{ name: name }, { _id: { $ne: service_id }}]}).lean().then(async (response) => {
            if(response) {
                return res.status(200).send({ status_code: 200, data: '', message: 'Service by this name already exist' });
            } else {
                const filter = {_id: service_id};
                const update = {
                    $set: {
                        name: name,
                        department: department,
                        price: price,
                        offer_price: offer_price,
                        validity: validity,
                        description: description,
                        modified_at: new Date().toISOString(),
                        modified_by: decoded._id
                    }
                };
                const options = {returnOriginal: false};
                await Services.findOneAndUpdate(filter, update, options).then(async (updatedService) => {
                    return res.status(200).send({ status_code: 200, data: updatedService, message: 'Service updated successfully' });
                });                
            }
        });
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

const statusService = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const {status, serviceId} = req.params;
        const filter = {_id: serviceId};
        const options = {returnOriginal: false};
        let updatedService; let message;
        if (status == 'deactivate') {
            const update = {
                $set: {
                    status: false,
                    modified_at: new Date().toISOString(),
                    modified_by: decoded._id,
                }
            };
            updatedService = await Services.findOneAndUpdate(filter, update, options); 
            message = 'Service deactivated successfully';
        } else if (status == 'delete') {
            const update = {
                $set: {
                    status: false,
                    is_trash: true,
                    modified_at: new Date().toISOString(),
                    modified_by: decoded._id,
                }
            };
            updatedService = await Services.findOneAndUpdate(filter, update, options);
            message = 'Service deleted successfully';
        } else {
            const update = {
                $set: {
                    status: true,
                    modified_at: new Date().toISOString(),
                    modified_by: decoded._id,
                }
            };
            updatedService = await Services.findOneAndUpdate(filter, update, options);
            message = 'Service activated successfully';
        }
        return res.status(200).send({ status_code: 200, data: updatedService, message: message });
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

module.exports = {
    allServices, addService, editService, updateService, statusService
}