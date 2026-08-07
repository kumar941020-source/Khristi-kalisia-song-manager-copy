import {
    getSundayHistory,
    deleteHistory
} from "../script1.js";

function displaySundayHistory() {

    const container = document.getElementById("historyContainer");

    if (!container) return;

    container.innerHTML = "";

    const history = getSundayHistory().reverse();

    if (history.length === 0) {
        container.innerHTML = `
            <div class="song-item">
                No Sunday History Available
            </div>
        `;
        return;
    }
        

    history.forEach(plan => {

        let fastList = "";
        plan.fastSongs.forEach(song => {
            fastList += `<li>🔥 ${song.name}</li>`;
        });

        let slowList = "";
        plan.slowSongs.forEach(song => {
            slowList += `<li>❤️ ${song.name}</li>`;
        });
console.log(document.querySelectorAll(".admin-only").length);
        container.innerHTML += `
            <div class="section">

                <h3>📅 ${plan.date}</h3>

                <h4>Fast Songs</h4>
                <ul>${fastList}</ul>

                <h4>Slow Songs</h4>
                <ul>${slowList}</ul>

                <button class="btn-danger admin-only"
                    onclick="deleteHistory('${plan.id}')">
                    🗑 Delete
                </button>

            </div>
        `;
    });

}

document.addEventListener("DOMContentLoaded", () => {
    displaySundayHistory();
});

window.displaySundayHistory = displaySundayHistory;
window.deleteHistory = deleteHistory;