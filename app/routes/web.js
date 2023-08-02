const express = require('express');
const { admin } = require('../middlewares');
const { allServices, addService, editService, updateService, statusService, allCountries, addCountry, editCountry, updateCountry, statusCountry} = require("../controllers");

module.exports = function (app) {
    app.use(function(req, res, next) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    });

    const adminRouter = express.Router();

    app.use('/admin', adminRouter);
    
    //Services Management
    adminRouter.get("/all_services", allServices);
    adminRouter.post("/add_service", admin.authentication, addService);
    adminRouter.get("/edit_service/:serviceId", admin.authentication, editService);
    adminRouter.post("/update_service", admin.authentication, updateService);
    adminRouter.get("/status_service/:status/:serviceId", admin.authentication, statusService);

    //Country Management
    adminRouter.get("/all_countries", allCountries);
    adminRouter.post("/add_country", admin.authentication, addCountry);
    adminRouter.get("/edit_country/:countryId", admin.authentication, editCountry);
    adminRouter.post("/update_country", admin.authentication, updateCountry);
    adminRouter.get("/status_country/:status/:countryId", admin.authentication, statusCountry);

    adminRouter.all('*', (req, res) => {
        res.send('Invalid url');
        return;
    });
}