// ==========================================
// SUNDAY PLANNER
// ==========================================

import {
    fastSongs,
    slowSongs,
    selectFastSong,
    selectSlowSong,
    saveSundayPlan,
    clearSelectedSongs,
    markFastSongUsed,
    markSlowSongUsed
} from "../script1.js";


// ==========================================
// PLANNER LOADER
// ==========================================

function showPlannerLoader() {

    let loader = document.getElementById("plannerLoader");

    if (!loader) {

        loader = document.createElement("div");

        loader.id = "plannerLoader";

        loader.innerHTML = `
            <div class="planner-loader-box">

                <div class="planner-loader-spinner"></div>

                <div class="planner-loader-title">
                    Loading Planner
                </div>

                <div class="planner-loader-text">
                    Loading worship songs...
                </div>

            </div>
        `;

        document.body.appendChild(loader);
    }

    loader.style.display = "flex";
}


// ==========================================
// HIDE PLANNER LOADER
// ==========================================

function hidePlannerLoader() {

    const loader =
        document.getElementById("plannerLoader");

    if (!loader) return;

    loader.classList.add("hide");

    setTimeout(() => {

        loader.style.display = "none";
        loader.classList.remove("hide");

    }, 250);
}


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

        const item =
            document.createElement("div");

        item.className = "song-item";


        item.innerHTML = `

            <span>
                ${escapeHTML(song.name)}
            </span>

            <button
                type="button"
                class="btn-primary planner-lyrics-btn"
            >
                Lyrics
            </button>

        `;


        const lyricsButton =
            item.querySelector(
                ".planner-lyrics-btn"
            );


        lyricsButton.addEventListener(
            "click",
            () => {

                openLyrics(song.id, "fast");

            }
        );


        box.appendChild(item);

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

        const item =
            document.createElement("div");

        item.className = "song-item";


        item.innerHTML = `

            <span>
                ${escapeHTML(song.name)}
            </span>

            <button
                type="button"
                class="btn-primary planner-lyrics-btn"
            >
                Lyrics
            </button>

        `;


        const lyricsButton =
            item.querySelector(
                ".planner-lyrics-btn"
            );


        lyricsButton.addEventListener(
            "click",
            () => {

                openLyrics(song.id, "slow");

            }
        );


        box.appendChild(item);

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

            return String(song.name || "")
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
                    ${escapeHTML(song.name)}
                </span>

            </div>


            <button
                type="button"
                class="popup-select-btn"
            >
                ${
                    song.selected
                        ? "✓ Selected"
                        : "Select"
                }
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

    // Selection remains active.
    // Nothing is cleared here.

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

            return String(song.name || "")
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
                    ${escapeHTML(song.name)}
                </span>

            </div>


            <button
                type="button"
                class="popup-select-btn"
            >
                ${
                    song.selected
                        ? "✓ Selected"
                        : "Select"
                }
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

    // Selection remains active.
    // Nothing is cleared here.

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

    // --------------------------------------
    // FIRST: REMEMBER SELECTED SONG IDs
    // --------------------------------------

    const selectedFastIds =
        fastSongs
            .filter(song => song.selected === true)
            .map(song => song.id);


    const selectedSlowIds =
        slowSongs
            .filter(song => song.selected === true)
            .map(song => song.id);


    // --------------------------------------
    // CHECK
    // --------------------------------------

    if (
        selectedFastIds.length === 0 &&
        selectedSlowIds.length === 0
    ) {

        alert(
            "Please select at least one song."
        );

        return;

    }


    try {

        // ----------------------------------
        // SAVE SUNDAY PLAN
        // ----------------------------------

        await saveSundayPlan();


        // ----------------------------------
        // USED +1 FOR FAST SONGS
        // ----------------------------------

        for (
            const songId of selectedFastIds
        ) {

            await markFastSongUsed(songId);

        }


        // ----------------------------------
        // USED +1 FOR SLOW SONGS
        // ----------------------------------

        for (
            const songId of selectedSlowIds
        ) {

            await markSlowSongUsed(songId);

        }


        // ----------------------------------
        // REFRESH PLANNER
        // ----------------------------------

        displayPlannerSongs();


        // ----------------------------------
        // CLOSE POPUPS
        // ----------------------------------

        closeFastSongPopup();
        closeSlowSongPopup();

    }

    catch (error) {

        console.error(
            "❌ Error saving Sunday Plan:",
            error
        );

        alert(
            "Unable to save Sunday Plan. Please try again."
        );

    }

}


// ==========================================
// CLEAR PLAN
// ==========================================

async function clearPlan() {

    await clearSelectedSongs();

    displayPlannerSongs();


    closeFastSongPopup();
    closeSlowSongPopup();

}


// ==========================================
// LYRICS
// ==========================================

function openLyrics(songId, type) {

    if (!songId) return;


    const safeType =
        type === "slow"
            ? "slow"
            : "fast";


    const url =
        `lyrics.html?id=${encodeURIComponent(songId)}&type=${safeType}`;


    window.location.href = url;

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

        // Show loader immediately
        showPlannerLoader();


        const waitForApp =
            setInterval(() => {

                if (window.appReady === true) {

                    clearInterval(
                        waitForApp
                    );


                    displayPlannerSongs();


                    // Small delay gives a smooth
                    // transition instead of flashing.

                    setTimeout(() => {

                        hidePlannerLoader();

                    }, 250);

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