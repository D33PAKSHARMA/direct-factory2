const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const { connectToDatabase } = require("./app/config/db");
connectToDatabase();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Create an HTTP service.
const PORT = process.env.PORT || 3004;
var httpServer = http.createServer(app).listen(PORT, () => {
  console.log(`Server is listening on port ${PORT} for http`);
});
httpServer.timeout = 200000;

// importing routes
require("./app/routes/api")(app);
require("./app/routes/web")(app);
