// ==========================================
// SUNDAY PLANNER
// ==========================================

import {
    fastSongs,
    slowSongs,
    saveSundayPlan,
    clearSelectedSongs
} from "../script1.js";

// ==========================================
// DISPLAY PLANNER SONGS
// ==========================================

function displayPlannerSongs() {

    const fastBox = document.getElementById("plannerFastSongs");
    const slowBox = document.getElementById("plannerSlowSongs");

    if (fastBox) {
        fastBox.innerHTML = "";

        const selectedFast = fastSongs.filter(song => song.selected);

        if (selectedFast.length === 0) {
            fastBox.innerHTML = "No Fast Song Selected";
        } else {
            selectedFast.forEach(song => {
    fastBox.innerHTML += `
        <div class="song-item">
            <span>🎵 ${song.name}</span>

            <button
                class="btn-primary"
                onclick="openLyrics('${song.id}','fast')">

                📖 Lyrics

            </button>
        </div>
    `;
});
        }
    }

    if (slowBox) {
        slowBox.innerHTML = "";

        const selectedSlow = slowSongs.filter(song => song.selected);

        if (selectedSlow.length === 0) {
            slowBox.innerHTML = "No Slow Song Selected";
        } else {
            selectedSlow.forEach(song => {
    slowBox.innerHTML += `
        <div class="song-item">
            <span>🎵 ${song.name}</span>

            <button
                class="btn-primary"
                onclick="openLyrics('${song.id}','slow')">

                📖 Lyrics

            </button>
        </div>
    `;
});
        }
    }
}

// ==========================================
// SAVE PLAN
// ==========================================

async function savePlan() {
    await saveSundayPlan();
    window.displayPlannerSongs();
}

// ==========================================
// CLEAR PLAN
// ==========================================

async function clearPlan() {
    await clearSelectedSongs();
    window.displayPlannerSongs();
}

// ==========================================
// LYRICS VIEW
// ==========================================

function openLyrics(songId, type) {

    let song;

    if (type === "fast") {
        song = fastSongs.find(s => s.id === songId);
    } else {
        song = slowSongs.find(s => s.id === songId);
    }

    if (!song) return;

    document.getElementById("lyricsSongName").innerText =
        song.name;

    document.getElementById("lyricsText").value =
        song.lyrics || "Lyrics not available.";

    document.getElementById("lyricsModal").style.display =
        "flex";
}

function closeLyrics() {

    document.getElementById("lyricsModal").style.display =
        "none";

}

// ==========================================
// INITIAL LOAD
// ==========================================


document.addEventListener("DOMContentLoaded", async () => {
    setTimeout(() => {
        displayPlannerSongs();
    }, 300);
});
// ==========================================
// GLOBAL FUNCTIONS
// ==========================================
window.openLyrics = openLyrics;
window.closeLyrics = closeLyrics;
window.displayPlannerSongs = displayPlannerSongs;
window.savePlan = savePlan;
window.clearPlan = clearPlan;