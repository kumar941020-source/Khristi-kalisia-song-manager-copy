// ==========================================
// FAST SONG PAGE
// ==========================================

import {
    fastSongs,
    addFastSong,
    markFastSongUsed,
    selectFastSong,
    editFastSong,
    deleteFastSong,
    saveSongLyrics
} from "../script1.js";


let currentSongId = "";


// ==========================================
// SORT SONGS
// OLDEST LAST-SUNG FIRST
// ==========================================

function getSortedSongs(songs) {

    return [...songs].sort((a, b) => {

        // Never sung songs first
        if (!a.lastSung && !b.lastSung) {
            return 0;
        }

        if (!a.lastSung) {
            return -1;
        }

        if (!b.lastSung) {
            return 1;
        }


        function parseDate(date) {

            const parts =
                date.split("/");

            if (parts.length !== 3) {
                return 0;
            }

            return new Date(
                parts[2],
                parts[1] - 1,
                parts[0]
            ).getTime();

        }


        return (
            parseDate(a.lastSung) -
            parseDate(b.lastSung)
        );

    });

}


// ==========================================
// CREATE SONG CARD
// ==========================================

function createSongCard(song) {

    const card =
        document.createElement("div");


    card.className =
        "attendance-record-card";


    // ======================================
    // SONG HEADER
    // ======================================

    const songHeader =
        document.createElement("div");


    songHeader.className =
        "song-card-header";


    songHeader.innerHTML = `

        <h3>

            🎵 ${song.name}

            ${song.selected ? " ⭐" : ""}

        </h3>

        <span class="song-arrow">
            ▼
        </span>

    `;


    // ======================================
    // INNER DETAILS
    // ======================================

    const details =
        document.createElement("div");


    details.className =
        "song-card-details";


    details.style.display =
        "none";


    details.innerHTML = `

        <div class="attendance-record">

            <div>

                <p>

                    📅 Last Sung:

                    <b>
                        ${song.lastSung || "-"}
                    </b>

                </p>


                <p>

                    🎵 Times Sung:

                    <b>
                        ${song.timesSung || 0}
                    </b>

                </p>

            </div>


            <!-- ==================================
                 ACTION BUTTONS
            ================================== -->

            <div class="attendance-record-stats">


                <button
                    class="btn-success admin-only"
                    onclick="
                        event.stopPropagation();
                        markFastSongUsed('${song.id}');
                    ">

                    ✔ Used

                </button>


                <button
                    class="btn-primary admin-only"
                    onclick="
                        event.stopPropagation();
                        selectFastSong('${song.id}');
                    ">

                    ⭐ Select

                </button>


                <button
                    class="btn-primary"
                    onclick="
                        event.stopPropagation();
                        openLyrics('${song.id}');
                    ">

                    📖 Lyrics

                </button>


                <button
                    class="btn-primary admin-only"
                    onclick="
                        event.stopPropagation();
                        editFastSong('${song.id}');
                    ">

                    ✏ Edit

                </button>


                <button
                    class="btn-danger admin-only"
                    onclick="
                        event.stopPropagation();
                        deleteFastSong('${song.id}');
                    ">

                    🗑 Delete

                </button>


            </div>

        </div>

    `;


    // ======================================
    // CLICK SONG TO OPEN / CLOSE
    // ======================================

    songHeader.addEventListener(
        "click",
        function () {

            const isOpen =
                details.style.display !== "none";


            // Close all other songs
            document
                .querySelectorAll(
                    ".song-card-details"
                )
                .forEach(otherDetails => {

                    otherDetails.style.display =
                        "none";

                });


            document
                .querySelectorAll(
                    ".song-arrow"
                )
                .forEach(arrow => {

                    arrow.innerText =
                        "▼";

                });


            // Open clicked song
            if (!isOpen) {

                details.style.display =
                    "block";


                const arrow =
                    songHeader.querySelector(
                        ".song-arrow"
                    );


                if (arrow) {

                    arrow.innerText =
                        "▲";

                }

            }

        }
    );


    card.appendChild(
        songHeader
    );


    card.appendChild(
        details
    );


    return card;

}


// ==========================================
// DISPLAY FAST SONGS
// ==========================================

function displayFastSongs() {

    const box =
        document.getElementById(
            "fastSongTable"
        );


    if (!box) return;


    box.innerHTML = "";


    const sortedSongs =
        getSortedSongs(
            fastSongs
        );


    sortedSongs.forEach(song => {

        box.appendChild(
            createSongCard(song)
        );

    });


    applyAdminPermission();

}


// ==========================================
// SEARCH FAST SONG
// ==========================================

function searchFast(value) {

    const box =
        document.getElementById(
            "fastSongTable"
        );


    if (!box) return;


    const search =
        value
            .toLowerCase()
            .trim();


    const filteredSongs =
        fastSongs.filter(song => {

            return (
                song.name || ""
            )
            .toLowerCase()
            .includes(search);

        });


    box.innerHTML = "";


    const sortedSongs =
        getSortedSongs(
            filteredSongs
        );


    sortedSongs.forEach(song => {

        box.appendChild(
            createSongCard(song)
        );

    });


    applyAdminPermission();

}


// ==========================================
// ADMIN / VISITOR PERMISSION
// ==========================================

function applyAdminPermission() {

    if (
        document.body.classList.contains(
            "visitor"
        )
    ) {

        document
            .querySelectorAll(
                ".admin-only"
            )
            .forEach(element => {

                element.style.display =
                    "none";

            });

    }

}


// ==========================================
// ADD FAST SONG
// ==========================================

async function addFast() {

    const name =
        document
            .getElementById(
                "fastSongName"
            )
            .value
            .trim();


    const date =
        document
            .getElementById(
                "fastSongDate"
            )
            .value;


    if (!name) {

        alert(
            "Enter song name"
        );

        return;

    }


    await addFastSong(
        name,
        date
    );


    document
        .getElementById(
            "fastSongName"
        )
        .value = "";


    document
        .getElementById(
            "fastSongDate"
        )
        .value = "";

}


// ==========================================
// OPEN LYRICS
// ==========================================

function openLyrics(songId) {

    currentSongId =
        songId;


    const song =
        fastSongs.find(
            song =>
                song.id === songId
        );


    if (!song) return;


    document
        .getElementById(
            "lyricsSongName"
        )
        .innerText =
            song.name;


    document
        .getElementById(
            "lyricsText"
        )
        .value =
            song.lyrics || "";


    document
        .getElementById(
            "lyricsModal"
        )
        .style.display =
            "flex";

}


// ==========================================
// CLOSE LYRICS
// ==========================================

function closeLyrics() {

    document
        .getElementById(
            "lyricsModal"
        )
        .style.display =
            "none";

}


// ==========================================
// SAVE LYRICS
// ==========================================

async function saveLyrics() {

    const lyrics =
        document
            .getElementById(
                "lyricsText"
            )
            .value;


    await saveSongLyrics(
        currentSongId,
        lyrics
    );


    alert(
        "Lyrics Saved Successfully ✅"
    );


    closeLyrics();

}


// ==========================================
// WINDOW FUNCTIONS
// ==========================================

window.displayFastSongs =
    displayFastSongs;

window.searchFast =
    searchFast;

window.addFast =
    addFast;

window.openLyrics =
    openLyrics;

window.closeLyrics =
    closeLyrics;

window.saveLyrics =
    saveLyrics;

window.markFastSongUsed =
    markFastSongUsed;

window.selectFastSong =
    selectFastSong;

window.editFastSong =
    editFastSong;

window.deleteFastSong =
    deleteFastSong;