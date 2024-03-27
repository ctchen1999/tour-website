const axios = require("axios");

const testAPI = async (req, res) => {
    try {
        const data = await axios.post(
            "http://127.0.0.1:3000/api/v1/users/login",
            {
                data: {
                    email: "admin@gmail.com",
                    password: "00000000"
                }
            }
        );
    } catch (error) {
        console.log(error);
    }
};

testAPI();
