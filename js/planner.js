// ==========================================
// SUNDAY PLANNER
// ==========================================

import {
    fastSongs,
    slowSongs,
    selectFastSong,
    selectSlowSong,
    saveSundayPlan,
    clearSelectedSongs
} from "../script1.js";


// ==========================================
// DISPLAY SELECTED SONGS
// ==========================================

function displayPlannerSongs() {

    displaySelectedFastSongs();

    displaySelectedSlowSongs();

    updateSelectedCounts();

}


// ==========================================
// SELECTED FAST SONGS
// ==========================================

function displaySelectedFastSongs() {

    const box =
        document.getElementById("plannerFastSongs");

    if (!box) return;


    box.innerHTML = "";


    const selectedFast =
        fastSongs.filter(
            song => song.selected === true
        );


    if (selectedFast.length === 0) {

        box.innerHTML = `
            <div class="empty-message">
                No Fast Song Selected
            </div>
        `;

        return;
    }


    selectedFast.forEach(song => {

        box.innerHTML += `

            <div class="song-item">

                <span>
                    ⚡ ${escapeHTML(song.name)}
                </span>

                <button
                    type="button"
                    class="btn-primary"
                    onclick="openLyrics('${song.id}', 'fast')"
                >
                    📖 Lyrics
                </button>

            </div>

        `;

    });

}


// ==========================================
// SELECTED SLOW SONGS
// ==========================================

function displaySelectedSlowSongs() {

    const box =
        document.getElementById("plannerSlowSongs");

    if (!box) return;


    box.innerHTML = "";


    const selectedSlow =
        slowSongs.filter(
            song => song.selected === true
        );


    if (selectedSlow.length === 0) {

        box.innerHTML = `
            <div class="empty-message">
                No Slow Song Selected
            </div>
        `;

        return;
    }


    selectedSlow.forEach(song => {

        box.innerHTML += `

            <div class="song-item">

                <span>
                    ❤️ ${escapeHTML(song.name)}
                </span>

                <button
                    type="button"
                    class="btn-primary"
                    onclick="openLyrics('${song.id}', 'slow')"
                >
                    📖 Lyrics
                </button>

            </div>

        `;

    });

}


// ==========================================
// COUNTS
// ==========================================

function updateSelectedCounts() {

    const fastCount =
        fastSongs.filter(
            song => song.selected === true
        ).length;


    const slowCount =
        slowSongs.filter(
            song => song.selected === true
        ).length;


    const fastElement =
        document.getElementById(
            "fastSelectedCount"
        );


    const slowElement =
        document.getElementById(
            "slowSelectedCount"
        );


    if (fastElement) {

        fastElement.innerText =
            `${fastCount} Songs Selected`;

    }


    if (slowElement) {

        slowElement.innerText =
            `${slowCount} Songs Selected`;

    }

}


// ==========================================
// FAST POPUP
// ==========================================

function openFastSongPopup() {

    const modal =
        document.getElementById(
            "fastSongModal"
        );


    const search =
        document.getElementById(
            "fastSongSearch"
        );


    if (!modal) return;


    if (search) {

        search.value = "";

    }


    displayFastPopupSongs();


    modal.style.display = "flex";

}


// ==========================================
// CLOSE FAST POPUP
// ==========================================

function closeFastSongPopup() {

    const modal =
        document.getElementById(
            "fastSongModal"
        );


    if (modal) {

        modal.style.display = "none";

    }

}


// ==========================================
// DISPLAY FAST POPUP SONGS
// ==========================================

function displayFastPopupSongs(
    searchValue = ""
) {

    const box =
        document.getElementById(
            "fastPopupList"
        );


    if (!box) return;


    const search =
        searchValue
            .trim()
            .toLowerCase();


    const songs =
        fastSongs.filter(song => {

            return song.name
                .toLowerCase()
                .includes(search);

        });


    box.innerHTML = "";


    if (songs.length === 0) {

        box.innerHTML = `
            <div class="empty-message">
                No Fast Songs Found
            </div>
        `;

        return;
    }


    songs.forEach(song => {

        const card =
            document.createElement("div");


        card.className =
            "popup-song-card" +
            (song.selected ? " selected" : "");


        card.innerHTML = `

            <div class="popup-song-left">

                <input
                    type="checkbox"
                    class="popup-checkbox"
                    ${song.selected ? "checked" : ""}
                >

                <span class="popup-song-name">
                    ⚡ ${escapeHTML(song.name)}
                </span>

            </div>


            <button
                type="button"
                class="popup-select-btn"
            >

                ${song.selected
                    ? "✓ Selected"
                    : "Select"}

            </button>

        `;


        const checkbox =
            card.querySelector(
                ".popup-checkbox"
            );


        const button =
            card.querySelector(
                ".popup-select-btn"
            );


        checkbox.addEventListener(
            "change",
            async () => {

                await toggleFastSong(song.id);

            }
        );


        button.addEventListener(
            "click",
            async () => {

                await toggleFastSong(song.id);

            }
        );


        box.appendChild(card);

    });

}


// ==========================================
// TOGGLE FAST
// ==========================================

async function toggleFastSong(id) {

    await selectFastSong(id);


    displayPlannerSongs();


    const search =
        document.getElementById(
            "fastSongSearch"
        );


    displayFastPopupSongs(
        search ? search.value : ""
    );

}


// ==========================================
// FAST SEARCH
// ==========================================

function searchFastSongPopup() {

    const search =
        document.getElementById(
            "fastSongSearch"
        );


    displayFastPopupSongs(
        search ? search.value : ""
    );

}


// ==========================================
// SLOW POPUP
// ==========================================

function openSlowSongPopup() {

    const modal =
        document.getElementById(
            "slowSongModal"
        );


    const search =
        document.getElementById(
            "slowSongSearch"
        );


    if (!modal) return;


    if (search) {

        search.value = "";

    }


    displaySlowPopupSongs();


    modal.style.display = "flex";

}


// ==========================================
// CLOSE SLOW POPUP
// ==========================================

function closeSlowSongPopup() {

    const modal =
        document.getElementById(
            "slowSongModal"
        );


    if (modal) {

        modal.style.display = "none";

    }

}


// ==========================================
// DISPLAY SLOW POPUP SONGS
// ==========================================

function displaySlowPopupSongs(
    searchValue = ""
) {

    const box =
        document.getElementById(
            "slowPopupList"
        );


    if (!box) return;


    const search =
        searchValue
            .trim()
            .toLowerCase();


    const songs =
        slowSongs.filter(song => {

            return song.name
                .toLowerCase()
                .includes(search);

        });


    box.innerHTML = "";


    if (songs.length === 0) {

        box.innerHTML = `
            <div class="empty-message">
                No Slow Songs Found
            </div>
        `;

        return;
    }


    songs.forEach(song => {

        const card =
            document.createElement("div");


        card.className =
            "popup-song-card" +
            (song.selected ? " selected" : "");


        card.innerHTML = `

            <div class="popup-song-left">

                <input
                    type="checkbox"
                    class="popup-checkbox"
                    ${song.selected ? "checked" : ""}
                >

                <span class="popup-song-name">
                    ❤️ ${escapeHTML(song.name)}
                </span>

            </div>


            <button
                type="button"
                class="popup-select-btn"
            >

                ${song.selected
                    ? "✓ Selected"
                    : "Select"}

            </button>

        `;


        const checkbox =
            card.querySelector(
                ".popup-checkbox"
            );


        const button =
            card.querySelector(
                ".popup-select-btn"
            );


        checkbox.addEventListener(
            "change",
            async () => {

                await toggleSlowSong(song.id);

            }
        );


        button.addEventListener(
            "click",
            async () => {

                await toggleSlowSong(song.id);

            }
        );


        box.appendChild(card);

    });

}


// ==========================================
// TOGGLE SLOW
// ==========================================

async function toggleSlowSong(id) {

    await selectSlowSong(id);


    displayPlannerSongs();


    const search =
        document.getElementById(
            "slowSongSearch"
        );


    displaySlowPopupSongs(
        search ? search.value : ""
    );

}


// ==========================================
// SLOW SEARCH
// ==========================================

function searchSlowSongPopup() {

    const search =
        document.getElementById(
            "slowSongSearch"
        );


    displaySlowPopupSongs(
        search ? search.value : ""
    );

}


// ==========================================
// SAVE PLAN
// ==========================================

async function savePlan() {

    await saveSundayPlan();

    displayPlannerSongs();

}


// ==========================================
// CLEAR PLAN
// ==========================================

async function clearPlan() {

    await clearSelectedSongs();

    displayPlannerSongs();

}


// ==========================================
// LYRICS
// ==========================================

function openLyrics(songId, type) {

    let song;


    if (type === "fast") {

        song =
            fastSongs.find(
                s => s.id === songId
            );

    } else {

        song =
            slowSongs.find(
                s => s.id === songId
            );

    }


    if (!song) return;


    const name =
        document.getElementById(
            "lyricsSongName"
        );


    const lyrics =
        document.getElementById(
            "lyricsText"
        );


    const modal =
        document.getElementById(
            "lyricsModal"
        );


    if (name) {

        name.innerText =
            song.name;

    }


    if (lyrics) {

        lyrics.value =
            song.lyrics ||
            "Lyrics not available.";

    }


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// ==========================================
// CLOSE LYRICS
// ==========================================

function closeLyrics() {

    const modal =
        document.getElementById(
            "lyricsModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const waitForApp =
            setInterval(() => {

                if (window.appReady === true) {

                    clearInterval(
                        waitForApp
                    );


                    displayPlannerSongs();

                }

            }, 100);

    }
);


// ==========================================
// CLOSE POPUPS WHEN CLICK OUTSIDE
// ==========================================

window.addEventListener(
    "click",
    function(event) {

        const fastModal =
            document.getElementById(
                "fastSongModal"
            );


        const slowModal =
            document.getElementById(
                "slowSongModal"
            );


        if (
            event.target === fastModal
        ) {

            closeFastSongPopup();

        }


        if (
            event.target === slowModal
        ) {

            closeSlowSongPopup();

        }

    }
);


// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.openFastSongPopup =
    openFastSongPopup;

window.closeFastSongPopup =
    closeFastSongPopup;

window.searchFastSongPopup =
    searchFastSongPopup;


window.openSlowSongPopup =
    openSlowSongPopup;

window.closeSlowSongPopup =
    closeSlowSongPopup;

window.searchSlowSongPopup =
    searchSlowSongPopup;


window.displayPlannerSongs =
    displayPlannerSongs;


window.savePlan =
    savePlan;

window.clearPlan =
    clearPlan;


window.openLyrics =
    openLyrics;

window.closeLyrics =
    closeLyrics;