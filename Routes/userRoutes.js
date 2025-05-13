const express = require("express");
const { addUser } = require("../Controller/user");
const router = express.Router();

router.post("/add-user", addUser);


module.exports = router 