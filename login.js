import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(auth, email, password);

        localStorage.setItem("isAdmin", "true");

        alert("Login Successful!");

        window.location.href = "index.html";

    } catch (error) {

        document.getElementById("loginMessage").innerText = error.message;

    }

});