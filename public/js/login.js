/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: "post",
            url: "/api/v1/users/login",
            data: {
                email: email,
                password: password
            }
        });
        // console.log(res);

        if (res.data.status === "success") {
            showAlert(res.data.status, "Logged in successfully!");
            window.setTimeout(() => {
                // location.assign("/");
                location.href = "/";
            }, 1000);
        }
    } catch (error) {
        showAlert("error", error.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: "get",
            url: "/api/v1/users/logout"
        });

        if (res.data.status === "success") {
            showAlert(res.data.status, "Logged out successfully!");
            location.reload(true);
        }
    } catch (error) {
        showAlert("error", "Error Logged Out! Try again");
    }
};
