const User = require("../Model/userModel");

const addUser = async (req, res) => {
    try {
        const { name, eth_balance, usd_balance, } = req.body;
        const newUser = User({
            name, eth_balance, usd_balance
        });
        await newUser.save();
        return res.status(201).send({ success: true, message: "User added successfully.", data: newUser })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error while adding user.", error });
    }
}

module.exports = {
    addUser,
}