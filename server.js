require('dotenv').config({ path: `${process.cwd()}/.env` });
const express = require("express");
const cors = require("cors");
const Connection = require('./DB/Connection');
const port = process.env.APP_PORT || 5000;
const userRoute = require("./Routes/userRoutes.js")
const orderRoute = require("./Routes/orderRoutes.js")
const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    Credential: true,
}));

Connection();

app.get("/", (req, res) => {
    res.send({ success: true, message: "Hello World! Welcome to Kaanch_transaction_app." })
});

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/order", orderRoute);

app.listen(port, () => {
    console.log(`Server listning at port  http://localhost:${port}`);
});