import { auth } from "../firebase.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function updateAdminControls(isAdmin) {

    document.body.classList.toggle("admin", isAdmin);
    document.body.classList.toggle("visitor", !isAdmin);

    document.querySelectorAll(".admin-only").forEach(el => {
        el.style.display = isAdmin ? "" : "none";
    });
}

function refreshPages() {

    if (window.displayFastSongs) window.displayFastSongs();
    if (window.displaySlowSongs) window.displaySlowSongs();
    if (window.displayPlannerSongs) window.displayPlannerSongs();
    if (window.displaySundayHistory) window.displaySundayHistory();

    requestAnimationFrame(() => {
        const isAdmin = document.body.classList.contains("admin");

        document.querySelectorAll(".admin-only").forEach(el => {
            el.style.display = isAdmin ? "" : "none";
        });
    });
}

onAuthStateChanged(auth, (user) => {

    const isAdmin = !!user;

    console.log(isAdmin ? "Admin Login" : "Visitor");

    updateAdminControls(isAdmin);

    refreshPages();

});

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await signOut(auth);

        alert("Logged Out Successfully");

        window.location.href = "../index.html";

    });

}