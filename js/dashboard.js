// ==========================================
// DASHBOARD SONGS
// ==========================================

import {
    db,
    ref,
    get
} from "../firebase.js";

let dashboardFastSongs = [];
let dashboardSlowSongs = [];


// ==========================================
// LOAD SONGS
// ==========================================

async function loadDashboardSongs() {

    try {

        const fastSnapshot =
            await get(ref(db, "fastSongs"));

        const slowSnapshot =
            await get(ref(db, "slowSongs"));


        dashboardFastSongs =
            fastSnapshot.exists()
                ? Object.values(fastSnapshot.val())
                : [];


        dashboardSlowSongs =
            slowSnapshot.exists()
                ? Object.values(slowSnapshot.val())
                : [];


        // Wait for script1.js to finish
        // its own rendering first
        setTimeout(() => {

            renderDashboardSongs();

        }, 300);

    }
    catch (error) {

        console.error(
            "Dashboard songs error:",
            error
        );

    }

}


// ==========================================
// RENDER DASHBOARD SONGS
// ==========================================

function renderDashboardSongs() {

    const box =
        document.getElementById(
            "selectedSongs"
        );

    if (!box) return;


    const selectedFast =
        dashboardFastSongs.filter(
            song => song.selected === true
        );


    const selectedSlow =
        dashboardSlowSongs.filter(
            song => song.selected === true
        );


    const songs = [

        ...selectedFast.map(song => ({
            ...song,
            type: "Fast"
        })),

        ...selectedSlow.map(song => ({
            ...song,
            type: "Slow"
        }))

    ];


    // ======================================
    // EMPTY
    // ======================================

    if (songs.length === 0) {

        box.innerHTML = `

            <div class="dashboard-empty">

                <div class="empty-icon-new">
                    <i class="fa-solid fa-music"></i>
                </div>

                <h3>
                    No songs selected
                </h3>

                <p>
                    Select songs from the Sunday Planner.
                </p>

                <a
                    href="pages/planner.html"
                    class="empty-button"
                >
                    Select Songs
                </a>

            </div>

        `;

        return;
    }


    // ======================================
    // SONG LIST
    // ======================================

    box.innerHTML = `

        <div class="selected-song-list">

            ${songs.map((song, index) => `

                <div
                    class="dashboard-song-item"
                    data-song-id="${escapeHTML(song.id)}"
                >

                    <div class="song-number">
                        ${String(index + 1).padStart(2, "0")}
                    </div>


                    <div class="song-info">

                        <h3>
                            ${escapeHTML(song.name)}
                        </h3>

                        <span class="song-type ${song.type.toLowerCase()}">
                            ${song.type} Song
                        </span>

                    </div>


                    <div class="song-action">

                        <span>
                            View Lyrics
                        </span>

                        <i class="fa-solid fa-chevron-right"></i>

                    </div>

                </div>

            `).join("")}

        </div>

    `;


    // ======================================
    // CLICK EVENTS
    // ======================================

    box
        .querySelectorAll(
            ".dashboard-song-item"
        )
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    openDashboardLyrics(
                        item.dataset.songId
                    );

                }
            );

        });

}


// ==========================================
// OPEN LYRICS
// ==========================================

function openDashboardLyrics(songId) {

    let song =
        dashboardFastSongs.find(
            s =>
                String(s.id) ===
                String(songId)
        );


    if (!song) {

        song =
            dashboardSlowSongs.find(
                s =>
                    String(s.id) ===
                    String(songId)
            );

    }


    if (!song) return;


    const modal =
        document.getElementById(
            "dashboardLyricsModal"
        );

    const title =
        document.getElementById(
            "dashboardLyricsSongName"
        );

    const lyrics =
        document.getElementById(
            "dashboardLyricsText"
        );


    if (
        !modal ||
        !title ||
        !lyrics
    ) {
        return;
    }


    title.textContent =
        song.name;


    lyrics.textContent =
        song.lyrics &&
        String(song.lyrics).trim()
            ? song.lyrics
            : "Lyrics are not available for this song.";


    modal.style.display = "flex";

    document.body.style.overflow =
        "hidden";

}


// ==========================================
// CLOSE LYRICS
// ==========================================

window.closeDashboardLyrics =
function() {

    const modal =
        document.getElementById(
            "dashboardLyricsModal"
        );

    if (!modal) return;


    modal.style.display = "none";

    document.body.style.overflow = "";

};


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboardSongs();

    }
);


// ==========================================
// CLOSE MODAL OUTSIDE
// ==========================================

document.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "dashboardLyricsModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            window.closeDashboardLyrics();

        }

    }
);


// ==========================================
// ESC
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            window.closeDashboardLyrics();

        }

    }
);