const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require('path');
const models = require("../models");
const config = require("../config/dbconfig");
const { } = require('../helpers');

const ClientBusiness = models.ClientBusiness;

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        cb(null, `business-${ Date.now() }` + path.extname(file.originalname))
    }
});
const multerFilter = (req, file, cb) => {
    if(file.fieldname === "logo") {
        if (
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'application/octet-stream'
       ) {
            cb(null, true);
        } else {
            req.file_error = 'Invalid file format. Only .png, .jpg, .jpeg & octet-stream format allowed!';
            return cb(null, false, req.file_error);
        }
    }
};
const logo = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
const businessLogoUpload = logo.fields([{ name: 'logo', maxCount: 1 }]);

const editClientBusiness = async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const {client_id} = req.params;
        await ClientBusiness.findOne({$and: [{_id: client_id}, {created_by: decoded._id}]}).lean().then(async (response) => {
            if(!response) {
                return res.status(400).send({ status_code: 400, data: '', message: 'No data found.' });
            } else {
                if (response.logo) {
                    response.logo = config.APP_URL+'/images/'+response.logo;
                }
                return res.status(400).send({ status_code: 400, data: response, message: 'Success' });
            }
        });
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

const updateClientBusiness = async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const{client_id, business_name, phone_no, address, director_first_name, director_last_name, director_phone, director_email, contact_person_first_name, contact_person_last_name, contact_person_phone, contact_person_email, contact_person_address, website, establishment_type, product_type, no_of_employees, existing_market, last_year_selling, selling_country, business_category} = req.body;
        await ClientBusiness.findOne({$and: [{ business_name: business_name }, { _id: { $ne: client_id }}, {created_by: decoded._id}]}).lean().then(async (response) => {
            if(response) {
                return res.status(200).send({ status_code: 200, data: '', message: 'This Business name already exist' });
            } else {
                if (req.file_error) {
                    return res.status(400).send({ status_code: 400, data: '', message: req.file_error, error: true });
                } else {
                    const filter = {_id: client_id};
                    const update = {
                        $set: {
                            business_name: business_name,
                            phone_no: phone_no,
                            address: address,
                            director_first_name: director_first_name,
                            director_last_name: director_last_name,
                            director_phone: director_phone,
                            director_email: director_email,
                            contact_person_first_name: contact_person_first_name,
                            contact_person_last_name: contact_person_last_name,
                            contact_person_phone: contact_person_phone,
                            contact_person_email: contact_person_email,
                            contact_person_address: contact_person_address,
                            website: website,
                            establishment_type: establishment_type,
                            product_type: product_type,
                            no_of_employees: no_of_employees,
                            existing_market: existing_market,
                            last_year_selling: last_year_selling,
                            selling_country: selling_country,
                            business_category: business_category,
                            modified_by: decoded._id,
                            modified_at: new Date().toISOString()
                        }
                    };

                    const options = {returnOriginal: false};
                    await ClientBusiness.findOneAndUpdate(filter, update, options).then(async (updatedClient) => {
                        const filterUserId = {_id: updatedClient.id};
                        let logoImg = req.files && req.files.logo ? req.files.logo[0].filename : updatedClient.profile;
                        const updateLogo = {
                            $set: {
                                logo: logoImg,
                            }
                        };
                        await ClientBusiness.findOneAndUpdate(filterUserId, updateLogo, options).then(async (resp) => {
                            return res.status(200).send({ status_code: 200, data: "", message: 'Business detail updated successfully' });
                        });
                    });
                }                
            }
        });
    } catch (error) {
        return res.status(500).send({ status_code: 500, data: '', message: error.message });
    }
}

module.exports = {
    editClientBusiness,
    businessLogoUpload,
    updateClientBusiness
}