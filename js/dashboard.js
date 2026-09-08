// ==========================================
// DASHBOARD
// ==========================================

import {
    db,
    ref,
    get
} from "../firebase.js";


// ==========================================
// DASHBOARD DATA
// ==========================================

let dashboardFastSongs = [];
let dashboardSlowSongs = [];
let dashboardHistory = [];


// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

async function loadDashboardData() {

    try {

        // ======================================
        // LOAD FAST SONGS
        // ======================================

        const fastSnapshot =
            await get(
                ref(db, "fastSongs")
            );


        dashboardFastSongs =
            fastSnapshot.exists()
                ? Object.values(
                    fastSnapshot.val()
                )
                : [];


        // ======================================
        // LOAD SLOW SONGS
        // ======================================

        const slowSnapshot =
            await get(
                ref(db, "slowSongs")
            );


        dashboardSlowSongs =
            slowSnapshot.exists()
                ? Object.values(
                    slowSnapshot.val()
                )
                : [];


        // ======================================
        // LOAD SUNDAY HISTORY
        // ======================================

        const historySnapshot =
            await get(
                ref(db, "sundayHistory")
            );


        dashboardHistory =
            historySnapshot.exists()
                ? Object.values(
                    historySnapshot.val()
                )
                : [];


        // ======================================
        // UPDATE HISTORY CARD
        // ======================================

        updateHistoryCount();


        // ======================================
        // RENDER SELECTED SONGS
        // ======================================

        renderDashboardSongs();

    }
    catch (error) {

        console.error(
            "Dashboard data error:",
            error
        );

    }

}


// ==========================================
// UPDATE HISTORY COUNT
// ==========================================

function updateHistoryCount() {

    const historyCount =
        document.getElementById(
            "historyCount"
        );


    if (!historyCount) {
        return;
    }


    historyCount.textContent =
        dashboardHistory.length;

}


// ==========================================
// RENDER DASHBOARD SONGS
// ==========================================

function renderDashboardSongs() {

    const box =
        document.getElementById(
            "selectedSongs"
        );


    if (!box) {
        return;
    }


    // ======================================
    // SELECTED FAST SONGS
    // ======================================

    const selectedFast =
        dashboardFastSongs.filter(
            song =>
                song.selected === true
        );


    // ======================================
    // SELECTED SLOW SONGS
    // ======================================

    const selectedSlow =
        dashboardSlowSongs.filter(
            song =>
                song.selected === true
        );


    // ======================================
    // COMBINE SONGS
    // ======================================

    const songs = [

        ...selectedFast.map(
            song => ({
                ...song,
                type: "Fast"
            })
        ),

        ...selectedSlow.map(
            song => ({
                ...song,
                type: "Slow"
            })
        )

    ];


    // ======================================
    // EMPTY STATE
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

            ${songs.map(
                (song, index) => `

                <div
                    class="dashboard-song-item"
                    data-song-id="${escapeHTML(song.id)}"
                >

                    <div class="song-number">
                        ${String(
                            index + 1
                        ).padStart(2, "0")}
                    </div>


                    <div class="song-info">

                        <h3>
                            ${escapeHTML(
                                song.name
                            )}
                        </h3>


                        <span
                            class="song-type ${song.type.toLowerCase()}"
                        >
                            ${song.type} Song
                        </span>

                    </div>


                    <div class="song-action">

                        <span>
                            View Lyrics
                        </span>

                        <i
                            class="fa-solid fa-chevron-right"
                        ></i>

                    </div>

                </div>

            `
            ).join("")}

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

function openDashboardLyrics(
    songId
) {

    // ======================================
    // SEARCH FAST SONG
    // ======================================

    let song =
        dashboardFastSongs.find(
            s =>
                String(s.id) ===
                String(songId)
        );


    // ======================================
    // SEARCH SLOW SONG
    // ======================================

    if (!song) {

        song =
            dashboardSlowSongs.find(
                s =>
                    String(s.id) ===
                    String(songId)
            );

    }


    // ======================================
    // SONG NOT FOUND
    // ======================================

    if (!song) {
        return;
    }


    // ======================================
    // GET MODAL ELEMENTS
    // ======================================

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


    // ======================================
    // SET SONG NAME
    // ======================================

    title.textContent =
        song.name;


    // ======================================
    // SET LYRICS
    // ======================================

    lyrics.textContent =
        song.lyrics &&
        String(
            song.lyrics
        ).trim()
            ? song.lyrics
            : "Lyrics are not available for this song.";


    // ======================================
    // SHOW MODAL
    // ======================================

    modal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";

}


// ==========================================
// CLOSE LYRICS MODAL
// ==========================================

window.closeDashboardLyrics =
function () {

    const modal =
        document.getElementById(
            "dashboardLyricsModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display =
        "none";


    document.body.style.overflow =
        "";

};


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboardData();

    }
);


// ==========================================
// CLOSE MODAL BY OUTSIDE CLICK
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
// CLOSE MODAL BY ESC
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