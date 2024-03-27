/* eslint-disable */
import "@babel/polyfill";
import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";

// DOM ELEMENT
const loginForm = document.querySelector(".form--login");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const logoutBtn = document.querySelector(".nav__el--logout");
const bookBtn = document.getElementById("book-tour");

if (loginForm) {
    loginForm.addEventListener("submit", event => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        login(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
}

if (userDataForm) {
    userDataForm.addEventListener("submit", event => {
        event.preventDefault();
        const form = new FormData();
        form.append("name", document.getElementById("name").value);
        form.append("email", document.getElementById("email").value);
        form.append("photo", document.getElementById("photo").files[0]);
        console.log("form", form);

        updateSettings(form, "data");
    });
}
if (userPasswordForm) {
    userPasswordForm.addEventListener("submit", async event => {
        event.preventDefault();
        document.querySelector(".btn--save-password").textContent =
            "Updating...";
        const passwordCurrent = document.getElementById("password-current")
            .value;
        const password = document.getElementById("password").value;
        const passwordConfirm = document.getElementById("password-confirm")
            .value;
        await updateSettings(
            { passwordCurrent, password, passwordConfirm },
            "password"
        );
        document.querySelector(".btn--save-password").textContent =
            "Save Password";
        document.getElementById("password-current").value = "";
        document.getElementById("password").value = "";
        document.getElementById("password-confirm").value = "";
    });
}

if (bookBtn) {
    bookBtn.addEventListener("click", e => {
        console.log(e.target.dataset);
        e.target.textContent = "Processing...";
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    });
}
