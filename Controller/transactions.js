const buyOrder = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Error while buying order.", error });
    }
}


const sellOrder = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Error while selling order.", error });
    }
}

module.exports = {
    buyOrder,
    sellOrder,
}