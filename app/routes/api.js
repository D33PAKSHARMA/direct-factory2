const router = require("express").Router();
const { auth } = require("../middlewares/index");
const {
  register,
  login,
  logout,
  allClientUsers,
  addClientUser,
  editClientUser,
  updateClientUser,
  statusClientUser,
  allProducts,
  productUpload,
  addProduct,
  productDetail,
  updateProduct,
  statusProduct,
  addStockHistory,
  getAllInventory,
  editClientBusiness,
  businessLogoUpload,
  updateClientBusiness,
  purchaseServices,
  clientAllPurchasedServices,
  clientAllPurchasedServicesHistory,
  renewClientSubscription,
  createClientCustomer,
  allClientCustomers,
  clientCustomerDetail,
  createClientManualOrder,
  clientAllManualOrders,
  clientCustomerManualOrderDetail,
} = require("../controllers");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  app.post("/api/register", register);
  app.post("/api/login", login);
  app.get("/api/logout", logout);

  // Client User Management
  app.get("/api/all_client_user", auth.verifyToken, allClientUsers);
  app.post("/api/add_client_user", auth.verifyToken, addClientUser);
  app.get("/api/edit_client_user/:user_id", auth.verifyToken, editClientUser);
  app.post("/api/update_client_user", auth.verifyToken, updateClientUser);
  app.get(
    "/api/status_client_user/:status/:user_id",
    auth.verifyToken,
    statusClientUser
  );

  //Products Managment
  app.get("/api/all_products", auth.verifyToken, allProducts);
  app.post("/api/add_product", auth.verifyToken, productUpload, addProduct);
  app.get("/api/product_detail/:product_id", auth.verifyToken, productDetail);
  app.post(
    "/api/update_product",
    auth.verifyToken,
    productUpload,
    updateProduct
  );
  app.get(
    "/api/status_product/:status/:product_id",
    auth.verifyToken,
    statusProduct
  );

  // Inventory tab
  app.get("/api/get_all_inventory", auth.verifyToken, getAllInventory);

  //Stock History Management
  app.post("/api/add_stock_history", auth.verifyToken, addStockHistory);

  //Client Business
  app.get(
    "/api/edit_client_business/:client_id",
    auth.verifyToken,
    editClientBusiness
  );
  app.post(
    "/api/update_client_business",
    auth.verifyToken,
    businessLogoUpload,
    updateClientBusiness
  );

  //Purchase services
  app.post("/api/purchase_services", auth.verifyToken, purchaseServices);
  app.post(
    "/api/client_all_purchased_services",
    auth.verifyToken,
    clientAllPurchasedServices
  );
  app.post(
    "/api/client_all_purchased_services_history",
    auth.verifyToken,
    clientAllPurchasedServicesHistory
  );
  app.post(
    "/api/renew_client_subscription",
    auth.verifyToken,
    renewClientSubscription
  );

  //Manual orders
  app.post(
    "/api/create_client_customer",
    auth.verifyToken,
    createClientCustomer
  );
  app.get("/api/all_client_customers", auth.verifyToken, allClientCustomers);
  app.get(
    "/api/client_customer_detail/:customer_id",
    auth.verifyToken,
    clientCustomerDetail
  );
  app.post(
    "/api/create_client_manual_order",
    auth.verifyToken,
    createClientManualOrder
  );
  app.get(
    "/api/client_all_manual_orders",
    auth.verifyToken,
    clientAllManualOrders
  );
  app.get(
    "/api/client_customer_manual_order_detail/:order_id",
    auth.verifyToken,
    clientCustomerManualOrderDetail
  );
};
