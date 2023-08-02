const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const models = require("../models");
const config = require("../config/dbconfig");
const { formatDate, formatDateTime, replaceNull } = require("../helpers");
const { ObjectId } = require("mongodb");

//Importing models
const User = models.User;
const ClientUserPermission = models.ClientUserPermission;
const Products = models.Products;
const ProductImages = models.ProductImages;
const ProductVariations = models.ProductVariations;
const StockHistory = models.StockHistory;
const StockVariationHistory = models.StockVariationHistory;
const Services = models.Services;
const ServicePurchaseHistory = models.ServicePurchaseHistory;
const UserDetails = models.UserDetails;
const Orders = models.Orders;
const OrderItems = models.OrderItems;

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, `image-${Date.now()}` + path.extname(file.originalname));
  },
});
const multerFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "application/octet-stream"
    ) {
      cb(null, true);
    } else {
      req.file_error =
        "Invalid file format. Only .png, .jpg, .jpeg & octet-stream format allowed!";
      return cb(null, false, req.file_error);
    }
  }
};
const product = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
const productUpload = product.any();

const register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      email,
      username,
      password,
      company_id,
      factory_id,
      user_type,
    } = req.body;
    await User.findOne({ $or: [{ email }, { username }] }).then(
      async (response) => {
        if (response && response.email == email) {
          return res
            .status(400)
            .send({
              status_code: 400,
              data: "",
              message: "Email already taken.",
            });
        } else if (response && response.username == username) {
          return res
            .status(400)
            .send({
              status_code: 400,
              data: "",
              message: "Username already taken.",
            });
        } else {
          const userData = new User({
            first_name: first_name,
            last_name: last_name,
            phone: phone,
            email: email,
            username: username,
            password: bcrypt.hashSync(password, 8),
            company_id: company_id,
            factory_id: factory_id,
            user_type: user_type,
          });
          const savedUser = await User.create(userData);
          return res
            .status(200)
            .send({ status_code: 200, data: savedUser, message: "Success" });
        }
      }
    );
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { usernameEmail, password } = req.body;
    if (!usernameEmail || !password) {
      return res
        .status(400)
        .send({
          status_code: 400,
          data: "",
          message: "Please enter valid credentials",
        });
    }
    await User.findOne({
      $or: [{ email: usernameEmail }, { username: usernameEmail }],
    })
      .lean()
      .then(async (response) => {
        if (!response) {
          return res
            .status(400)
            .send({
              status_code: 400,
              data: "",
              message: "Invalid credentials",
            });
        } else {
          const validatedUser = await bcrypt.compare(
            password,
            response.password
          );
          if (!validatedUser) {
            return res
              .status(400)
              .send({ status_code: 400, data: "", message: "Wrong password" });
          }
          const token = jwt.sign(response, config.JWT_SECRET, {});
          response.auth_token = token;
          return res
            .status(200)
            .send({ status_code: 200, data: response, message: "Success" });
        }
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const logout = async (req, res) => {
  mongoose.disconnect();
  return res
    .status(200)
    .send({ status_code: 200, data: "", message: "Logout successfully." });
};

const allClientUsers = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    await ClientUserPermission.find({ added_by: decoded._id })
      .lean()
      .then(async (response) => {
        for (let i = 0; i < response.length; i++) {
          await User.findOne({ _id: response[i].user_id })
            .lean()
            .then(async (resp) => {
              resp.permissions = response[i].permissions;
              response[i] = resp;
            });
        }
        return res
          .status(200)
          .send({ status_code: 200, data: response, message: "Success" });
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const addClientUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { first_name, email, phone, password, permissions } = req.body;
    await User.findOne({ email: email })
      .lean()
      .then(async (response) => {
        if (response && response.email == email) {
          return res
            .status(400)
            .send({
              status_code: 400,
              data: "",
              message: "Email already taken.",
            });
        } else {
          const userData = new User({
            first_name: first_name,
            phone: phone,
            email: email,
            password: bcrypt.hashSync(password, 8),
            company_id: decoded.company_id,
            factory_id: decoded.factory_id,
            user_type: "employee",
          });
          const savedUser = await User.create(userData);
          const userPermissions = new ClientUserPermission({
            user_id: savedUser.id,
            permissions: permissions,
            added_by: decoded._id,
          });
          await ClientUserPermission.create(userPermissions);
          return res
            .status(200)
            .send({
              status_code: 200,
              data: "",
              message: "User added successfully",
            });
        }
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const editClientUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { user_id } = req.params;
    await User.findOne({ _id: user_id })
      .lean()
      .then(async (response) => {
        if (!response) {
          return res
            .status(400)
            .send({ status_code: 400, data: "", message: "User not found" });
        } else {
          await ClientUserPermission.findOne({ user_id: user_id })
            .select("permissions")
            .lean()
            .then(async (resp) => {
              let usersPermissions = resp.permissions;
              response.permissions = usersPermissions;
              return res
                .status(200)
                .send({ status_code: 200, data: response, message: "Success" });
            });
        }
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const updateClientUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { user_id, first_name, email, phone, password, permissions } =
      req.body;
    await User.findOne({ $and: [{ email: email }, { _id: { $ne: user_id } }] })
      .lean()
      .then(async (response) => {
        if (response && response.email == email) {
          return res
            .status(200)
            .send({
              status_code: 200,
              data: "",
              message: "Email already taken.",
            });
        } else {
          const filter = { _id: user_id };
          const update = {
            $set: {
              first_name: first_name,
              phone: phone,
              email: email,
              company_id: decoded.company_id,
              factory_id: decoded.factory_id,
              updated_at: new Date().toISOString(),
            },
          };
          const options = { returnOriginal: false };
          await User.findOneAndUpdate(filter, update, options).then(
            async (updatedUser) => {
              const filterUserId = { user_id: updatedUser.id };
              const updatePermissions = {
                $set: {
                  permissions: permissions,
                  updated_at: new Date().toISOString(),
                },
              };
              await ClientUserPermission.updateOne(
                filterUserId,
                updatePermissions,
                options
              ).then(async (updatedPermissions) => {
                return res
                  .status(200)
                  .send({
                    status_code: 200,
                    data: "",
                    message: "User updated successfully",
                  });
              });
            }
          );
        }
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const statusClientUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { status, user_id } = req.params;
    const filter = { _id: user_id };
    const options = { returnOriginal: false };
    let updatedUser;
    let message;
    if (status == "deactivate") {
      const update = {
        $set: {
          is_active: false,
          updated_at: new Date().toISOString(),
        },
      };
      updatedUser = await User.findOneAndUpdate(filter, update, options);
      message = "User deactivated successfully";
    } else if (status == "delete") {
      const update = {
        $set: {
          is_trash: true,
          updated_at: new Date().toISOString(),
        },
      };
      updatedUser = await User.findOneAndUpdate(filter, update, options);
      message = "User deleted successfully";
    } else {
      const update = {
        $set: {
          is_active: true,
          updated_at: new Date().toISOString(),
        },
      };
      updatedUser = await User.findOneAndUpdate(filter, update, options);
      message = "User activated successfully";
    }
    return res
      .status(200)
      .send({ status_code: 200, data: updatedUser, message: message });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const allProducts = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    let productsList = await Products.aggregate([
      {
        $match: { factory_id: decoded.factory_id },
      },
      {
        $lookup: {
          from: "productvariations",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toObjectId: "$product_id" }, "$$productId"],
                },
              },
            },
          ],
          as: "variations",
        },
      },
      {
        $lookup: {
          from: "productimages",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toObjectId: "$product_id" }, "$$productId"],
                },
              },
            },
          ],
          as: "product_images",
        },
      },
    ]);
    const updatedResponse = productsList.map((product) => ({
      ...product,
      product_images: product.product_images.map((image) => ({
        ...image,
        image: config.APP_URL + "/images/" + image.image,
      })),
    }));
    return res
      .status(200)
      .send({ status_code: 200, data: updatedResponse, message: "Success" });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const {
      name,
      description,
      sku,
      unit,
      cost,
      sale_price,
      is_have_variation,
      factory_id,
      capacity,
      stock,
      variations,
    } = req.body;
    await Products.findOne({
      $and: [{ name: name }, { factory_id: decoded.factory_id }],
    })
      .lean()
      .then(async (response) => {
        if (response && response.name == name) {
          return res
            .status(400)
            .send({
              status_code: 400,
              data: "",
              message: "Product By this name already exist.",
            });
        } else {
          if (req.file_error) {
            return res
              .status(400)
              .send({ status_code: 400, data: "", message: req.file_error });
          } else {
            let productImages = [];
            req.files.map((file) => {
              if (file.fieldname == "image") {
                productImages.push(file.filename);
              }
              return;
            });
            const productData = new Products({
              name: name,
              description: description,
              sku: sku,
              unit: unit,
              cost: cost,
              sale_price: sale_price,
              is_have_variation: is_have_variation,
              factory_id: factory_id,
              capacity: capacity,
              stock: stock,
              created_by: decoded._id,
            });
            const savedProduct = await Products.create(productData);
            if (productImages.length > 0) {
              for (let i = 0; i < productImages.length; i++) {
                const productImg = new ProductImages({
                  product_id: savedProduct.id,
                  image: productImages[i],
                });
                await ProductImages.create(productImg);
              }
            }
            if (is_have_variation == "yes") {
              let variationsArray = variations ? JSON.parse(variations) : [];
              for (let i = 0; i < variationsArray.length; i++) {
                const productVariations = new ProductVariations({
                  name: variationsArray[i].name,
                  product_id: savedProduct.id,
                  cost_price: variationsArray[i].cost_price,
                  sale_price: variationsArray[i].sale_price,
                  sku: savedProduct.sku,
                  stock: variationsArray[i].stock,
                  created_by: decoded._id,
                });
                await ProductVariations.create(productVariations);
              }
            }
            return res
              .status(200)
              .send({
                status_code: 200,
                data: "",
                message: "Product added successfully",
              });
          }
        }
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const productDetail = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { product_id } = req.params;
    const imagePath = config.APP_URL + "/images/";
    let product_detail = await Products.aggregate([
      {
        $match: {
          _id: new ObjectId(product_id),
        },
      },
      {
        $lookup: {
          from: "productvariations",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toObjectId: "$product_id" }, "$$productId"],
                },
              },
            },
          ],
          as: "variations",
        },
      },
      {
        $lookup: {
          from: "productimages",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toObjectId: "$product_id" }, "$$productId"],
                },
              },
            },
          ],
          as: "product_images",
        },
      },
      {
        $addFields: {
          product_images: {
            $map: {
              input: "$product_images",
              as: "image",
              in: {
                $mergeObjects: [
                  "$$image",
                  {
                    image: { $concat: [imagePath, "$$image.image"] },
                  },
                ],
              },
            },
          },
        },
      },
    ]);
    let productDetail = product_detail.length > 0 ? product_detail[0] : {};
    return res
      .status(200)
      .send({ status_code: 200, data: productDetail, message: "Success" });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const {
      product_id,
      name,
      description,
      sku,
      unit,
      cost,
      sale_price,
      is_have_variation,
      factory_id,
      capacity,
      stock,
      variations,
    } = req.body;
    await Products.findOne({
      $and: [
        { _id: { $ne: product_id } },
        { name: name },
        { factory_id: decoded.factory_id },
      ],
    })
      .lean()
      .then(async (response) => {
        if (response) {
          return res
            .status(400)
            .send({
              status_code: 400,
              data: "",
              message: "Product By this name already exist.",
            });
        } else {
          if (req.file_error) {
            return res
              .status(400)
              .send({ status_code: 400, data: "", message: req.file_error });
          } else {
            let productImages = [];
            req.files.map((file) => {
              if (file.fieldname == "image") {
                productImages.push(file.filename);
              }
              return;
            });
            const filter = { _id: product_id };
            const update = {
              $set: {
                name: name,
                description: description,
                sku: sku,
                unit: unit,
                cost: cost,
                sale_price: sale_price,
                is_have_variation: is_have_variation,
                factory_id: factory_id,
                capacity: capacity,
                modified_at: new Date().toISOString(),
                modified_by: decoded._id,
              },
              $inc: {
                stock: parseInt(stock),
              },
            };
            const options = { returnOriginal: false };
            let updatedProduct = await Products.findOneAndUpdate(
              filter,
              update,
              options
            );
            if (productImages.length > 0) {
              for (let i = 0; i < productImages.length; i++) {
                const productImg = new ProductImages({
                  product_id: product_id,
                  image: productImages[i],
                });
                await ProductImages.create(productImg);
              }
            }
            if (is_have_variation == "yes") {
              let variationsArray = variations ? JSON.parse(variations) : [];
              const bulkOperations = [];
              for (let i = 0; i < variationsArray.length; i++) {
                if (variationsArray[i].variation_id) {
                  bulkOperations.push({
                    updateOne: {
                      filter: { _id: variationsArray[i].variation_id },
                      update: {
                        $set: {
                          name: variationsArray[i].name,
                          cost_price: variationsArray[i].cost_price,
                          sale_price: variationsArray[i].sale_price,
                          modified_at: new Date().toISOString(),
                          modified_by: decoded._id,
                        },
                        $inc: { stock: parseInt(variationsArray[i].stock) },
                      },
                    },
                  });
                } else {
                  bulkOperations.push({
                    insertOne: {
                      document: {
                        product_id: product_id,
                        name: variationsArray[i].name,
                        cost_price: variationsArray[i].cost_price,
                        sale_price: variationsArray[i].sale_price,
                        sku: updatedProduct.sku,
                        stock: variationsArray[i].stock,
                        created_by: decoded._id,
                      },
                    },
                  });
                }
              }
              await ProductVariations.bulkWrite(bulkOperations);
            }
            return res
              .status(200)
              .send({
                status_code: 200,
                data: "",
                message: "Product updated successfully",
              });
          }
        }
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const statusProduct = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { status, product_id } = req.params;
    const filter = { _id: product_id };
    const options = { returnOriginal: false };
    let updatedProduct;
    let message;
    if (status == "deactivate") {
      const update = {
        $set: {
          status: false,
          modified_at: new Date().toISOString(),
          modified_by: decoded._id,
        },
      };
      updatedProduct = await Products.findOneAndUpdate(filter, update, options);
      message = "Product unpublished successfully";
    } else if (status == "delete") {
      const update = {
        $set: {
          is_trash: true,
          trash_date: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          modified_by: decoded._id,
        },
      };
      updatedProduct = await Products.findOneAndUpdate(filter, update, options);
      message = "Product deleted successfully";
    } else {
      const update = {
        $set: {
          status: true,
          modified_at: new Date().toISOString(),
          modified_by: decoded._id,
        },
      };
      updatedProduct = await Products.findOneAndUpdate(filter, update, options);
      message = "Product is published successfully";
    }
    return res
      .status(200)
      .send({ status_code: 200, data: updatedProduct, message: message });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const addStockHistory = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { product_id, reception_date, quantity, total_price, variations } =
      req.body;
    if (parseInt(quantity) > 0) {
      const filter = { _id: product_id };
      const options = { returnOriginal: false };
      const stockHistoryData = new StockHistory({
        product_id: product_id,
        reception_date: reception_date,
        quantity: quantity,
        total_price: total_price,
        created_by: decoded._id,
        created_at: new Date().toISOString(),
      });
      const savedStockHistory = await StockHistory.create(stockHistoryData);
      const avgPrice = parseInt(total_price) / parseInt(quantity);
      const update = {
        $set: {
          sale_price: avgPrice,
          modified_at: new Date().toISOString(),
          modified_by: decoded._id,
        },
        $inc: {
          stock: parseInt(quantity),
        },
      };
      await Products.findOneAndUpdate(filter, update, options);
      if (variations) {
        let variationsArray = variations ? JSON.parse(variations) : [];
        const bulkOperations = [];
        const bulkVariatonUpdate = [];
        for (let i = 0; i < variationsArray.length; i++) {
          bulkOperations.push({
            insertOne: {
              document: {
                stock_history_id: savedStockHistory.id,
                variation_id: variationsArray[i].variation_id,
                quantity: variationsArray[i].quantity,
                created_by: decoded._id,
                created_at: new Date().toISOString(),
              },
            },
          });

          bulkVariatonUpdate.push({
            updateOne: {
              filter: { _id: variationsArray[i].variation_id },
              update: {
                $set: {
                  cost_price: variationsArray[i].cost_price,
                  sale_price: variationsArray[i].sale_price,
                  modified_at: new Date().toISOString(),
                  modified_by: decoded._id,
                },
                $inc: { stock: parseInt(variationsArray[i].quantity) },
              },
            },
          });
        }
        await StockVariationHistory.bulkWrite(bulkOperations);
        await ProductVariations.bulkWrite(bulkVariatonUpdate);
      }
      return res
        .status(200)
        .send({
          status_code: 200,
          data: "",
          message: "Stock added successfully",
        });
    } else {
      return res
        .status(400)
        .send({
          status_code: 400,
          data: "",
          message: "Please add sufficiant quantity",
        });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const getAllInventory = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const filter = { factory_id: decoded.factory_id };
    const options = {
      sort: { created_at: -1 },
      returnOriginal: false,
      limit: 5,
    };
    const projection1 = {
      _id: 1,
      name: 1,
      cost: 1,
      sale_price: 1,
      status: 1,
      is_approved: 1,
    };
    const projection2 = { _id: 1, name: 1, capacity: 1, stock: 1 };
    const products = await Products.find(filter)
      .select(projection1)
      .sort(options.sort)
      .limit(options.limit)
      .lean();
    const inventory = await Products.find(filter)
      .select(projection2)
      .sort(options.sort)
      .limit(options.limit)
      .lean();

    products.forEach((product) => {
      product._id = product._id.toString();
    });
    inventory.forEach((item) => {
      item._id = item._id.toString();
    });

    const productIds = products.map((product) => product._id);
    const stockHistories = await StockHistory.find({
      product_id: { $in: productIds },
    })
      .sort(options.sort)
      .limit(options.limit)
      .lean();

    stockHistories.forEach((history) => {
      const product = products.find(
        (product) => product._id === history.product_id
      );
      if (product) {
        history.product_name = product.name;
      }
    });
    let data = {
      products: products,
      inventory: inventory,
      stock_histories: stockHistories,
    };
    return res
      .status(200)
      .send({
        status_code: 200,
        data: data,
        message: "Stock added successfully",
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const purchaseServices = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { client_id, factory_id, services } = req.body;
    if (services) {
      let servicesArray = services ? JSON.parse(services) : [];
      const bulkOperations = [];
      for (let i = 0; i < servicesArray.length; i++) {
        bulkOperations.push({
          insertOne: {
            document: {
              client_id: client_id,
              factory_id: factory_id,
              service_id: servicesArray[i].service_id,
              purchase_price: servicesArray[i].offer_price,
              payment_status: "Paid",
              created_by: decoded._id,
              created_at: new Date().toISOString(),
            },
          },
        });
      }
      await ServicePurchaseHistory.bulkWrite(bulkOperations);
      return res
        .status(200)
        .send({
          status_code: 200,
          data: "",
          message: "Services purchased successfully",
        });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const clientAllPurchasedServices = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { client_id } = req.body;
    const purchaseHistory = await ServicePurchaseHistory.find({
      client_id: client_id,
    }).lean();
    const serviceIds = purchaseHistory.map((purchase) => purchase.service_id);
    const uniqueServiceIds = [...new Set(serviceIds)];
    let allPurchasedServices = await Services.find({
      _id: { $in: uniqueServiceIds },
    });

    const purchasedServicesWithHistory = [];
    allPurchasedServices.forEach((service) => {
      const serviceHistory = purchaseHistory.filter(
        (purchase) => purchase.service_id.toString() === service._id.toString()
      );
      const activeFrom = new Date(
        Math.min(
          ...serviceHistory.map((purchase) =>
            purchase.active_from ? new Date(purchase.active_from) : Infinity
          )
        )
      );
      const activeTo = new Date(
        Math.max(
          ...serviceHistory.map((purchase) =>
            purchase.active_to ? new Date(purchase.active_to) : -Infinity
          )
        )
      );
      const serviceWithHistory = {
        ...service.toObject(),
        active_from: isFinite(activeFrom) ? formatDate(activeFrom) : "",
        active_to: isFinite(activeTo) ? formatDate(activeTo) : "",
        purchase_history: serviceHistory,
      };
      purchasedServicesWithHistory.push(serviceWithHistory);
    });
    return res
      .status(200)
      .send({
        status_code: 200,
        data: purchasedServicesWithHistory,
        message: "Success",
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const clientAllPurchasedServicesHistory = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { client_id } = req.body;
    const purchaseHistory = await ServicePurchaseHistory.find({
      client_id: client_id,
    })
      .sort({ created_at: -1 })
      .lean();

    const purchasedServicesWithHistory = [];
    for (let i = 0; i < purchaseHistory.length; i++) {
      let serviceDetail = await Services.findOne({
        _id: purchaseHistory[i].service_id,
      });
      const serviceHistory = {
        ...purchaseHistory[i],
        service_name: serviceDetail.name,
        service_price: serviceDetail.price,
      };
      purchasedServicesWithHistory.push(serviceHistory);
    }
    return res
      .status(200)
      .send({
        status_code: 200,
        data: purchasedServicesWithHistory,
        message: "Success",
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const renewClientSubscription = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { client_id, factory_id, service_id } = req.body;
    let serviceDetail = await Services.findOne({ _id: service_id }).lean();

    const subscriptionData = new ServicePurchaseHistory({
      client_id: client_id,
      factory_id: factory_id,
      service_id: service_id,
      purchase_price: serviceDetail.offer_price,
      payment_status: "Paid",
      created_by: decoded._id,
      created_at: new Date().toISOString(),
    });
    const savedSubscription = await ServicePurchaseHistory.create(
      subscriptionData
    );
    return res
      .status(200)
      .send({
        status_code: 200,
        data: savedSubscription,
        message: "Subscription renewed successfully",
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const createClientCustomer = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { name, phone, address } = req.body;
    await User.findOne({ phone: phone })
      .lean()
      .then(async (response) => {
        if (response) {
          return res
            .status(400)
            .send({
              status_code: 400,
              data: "",
              message: "This phone number is already taken.",
            });
        } else {
          const customerData = new User({
            first_name: name,
            phone: phone,
            user_type: "customer",
            created_by: decoded._id,
            created_at: new Date().toISOString(),
          });
          const savedClientCustomer = await User.create(customerData);
          if (address) {
            const userDetail = new UserDetails({
              user_id: savedClientCustomer.id,
              address: address,
              created_by: decoded._id,
            });
            await UserDetails.create(userDetail);
          }
          return res
            .status(200)
            .send({
              status_code: 200,
              data: savedClientCustomer,
              message: "Customer added successfully",
            });
        }
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const allClientCustomers = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    let allCustomers = await User.aggregate([
      {
        $match: { user_type: "customer", created_by: decoded._id },
      },
      {
        $lookup: {
          from: "userdetails",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toObjectId: "$user_id" }, "$$userId"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                address: 1,
                created_by: 1,
                created_at: 1,
              },
            },
          ],
          as: "user_details",
        },
      },
    ]);
    for (let i = 0; i < allCustomers.length; i++) {
      allCustomers[i] = replaceNull(allCustomers[i]);
    }
    return res
      .status(200)
      .send({ status_code: 200, data: allCustomers, message: "Success" });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const clientCustomerDetail = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { customer_id } = req.params;
    let clientCustomerDetail = await User.aggregate([
      {
        $match: {
          _id: new ObjectId(customer_id),
          user_type: "customer",
          created_by: decoded._id,
        },
      },
      {
        $lookup: {
          from: "userdetails",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toObjectId: "$user_id" }, "$$userId"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                address: 1,
                created_by: 1,
                created_at: 1,
              },
            },
          ],
          as: "user_details",
        },
      },
    ]);
    let customerDetail =
      clientCustomerDetail.length > 0 ? clientCustomerDetail[0] : {};
    customerDetail = replaceNull(customerDetail);
    return res
      .status(200)
      .send({ status_code: 200, data: customerDetail, message: "Success" });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const createClientManualOrder = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const {
      customer_id,
      customer_name,
      customer_mobile,
      customer_address,
      total_order_price,
      gst,
      discount,
      shipping_charges,
      grand_total,
      orderItems,
    } = req.body;
    if (!orderItems) {
      return res
        .status(400)
        .send({
          status_code: 400,
          data: "",
          message: "Please add items to place order.",
        });
    }
    const orderData = new Orders({
      customer_id: customer_id,
      customer_name: customer_name,
      customer_mobile: customer_mobile,
      customer_address: customer_address,
      total_order_price: total_order_price,
      gst: gst,
      discount: discount,
      shipping_charges: shipping_charges,
      grand_total: grand_total,
      created_by: decoded._id,
      created_at: new Date().toISOString(),
    });
    const savedClientCustomerOrder = await Orders.create(orderData);
    let orderItemsArray = orderItems ? JSON.parse(orderItems) : [];
    const bulkOperations = [];
    for (let i = 0; i < orderItemsArray.length; i++) {
      const filter = { _id: orderItemsArray[i].product_id };
      const options = { returnOriginal: false };
      const update = {
        $set: { modified_at: new Date().toISOString() },
        $inc: { stock: -parseInt(orderItemsArray[i].quantity) },
      };
      await Products.findOneAndUpdate(filter, update, options);
      bulkOperations.push({
        insertOne: {
          document: {
            order_id: savedClientCustomerOrder.id,
            product_id: orderItemsArray[i].product_id,
            quantity: orderItemsArray[i].quantity,
            product_price: orderItemsArray[i].product_price,
            total_price: orderItemsArray[i].total_price,
            created_at: new Date().toISOString(),
          },
        },
      });
    }
    await OrderItems.bulkWrite(bulkOperations);
    return res
      .status(200)
      .send({
        status_code: 200,
        data: "",
        message: "Order placed successfully",
      });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const clientAllManualOrders = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const filter = { created_by: decoded._id };
    const options = { sort: { created_at: -1 }, returnOriginal: false };
    const projection = {
      _id: 1,
      customer_id: 1,
      customer_name: 1,
      customer_mobile: 1,
      grand_total: 1,
      payment_status: 1,
      order_status: 1,
      status: 1,
      created_at: 1,
    };
    const orders = await Orders.find(filter)
      .select(projection)
      .sort(options.sort)
      .lean();
    for (let i = 0; i < orders.length; i++) {
      orders[i].created_at = formatDateTime(orders[i].created_at);
    }
    return res
      .status(200)
      .send({ status_code: 200, data: orders, message: "Success" });
  } catch (error) {
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

const clientCustomerManualOrderDetail = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { order_id } = req.params;
    let orderDetails = await Orders.aggregate([
      {
        $match: {
          _id: new ObjectId(order_id),
        },
      },
      {
        $lookup: {
          from: "orderitems",
          let: { orderId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toObjectId: "$order_id" }, "$$orderId"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                order_id: 1,
                product_id: 1,
                product_price: 1,
                quantity: 1,
                total_price: 1,
                created_at: 1,
              },
            },
          ],
          as: "order_items",
        },
      },
    ]);
    let detail = orderDetails.length > 0 ? replaceNull(orderDetails[0]) : {};
    if (detail._id && detail._id instanceof ObjectId) {
      detail._id = detail._id.toString();
    }
    detail.created_at = formatDateTime(detail.created_at);
    for (let i = 0; i < detail.order_items.length; i++) {
      if (
        detail.order_items[i]._id &&
        detail.order_items[i]._id instanceof ObjectId
      ) {
        detail.order_items[i]._id = detail.order_items[i]._id.toString();
      }
      await Products.findOne({ _id: detail.order_items[i].product_id })
        .lean()
        .then(async (resp) => {
          detail.order_items[i].product_name = resp.name;
        });
      detail.order_items[i].created_at = formatDateTime(
        detail.order_items[i].created_at
      );
    }
    return res
      .status(200)
      .send({ status_code: 200, data: detail, message: "Success" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status_code: 500, data: "", message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  allClientUsers,
  addClientUser,
  editClientUser,
  updateClientUser,
  statusClientUser,
  allProducts,
  addProduct,
  productUpload,
  productDetail,
  updateProduct,
  statusProduct,
  addStockHistory,
  getAllInventory,
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
};
