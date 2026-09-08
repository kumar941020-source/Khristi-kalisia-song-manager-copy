// ==========================================
// WORSHIP LYRICS PAGE
// ==========================================

import {
    db,
    ref,
    get
} from "../firebase.js";


let currentFontSize = 20;


// ==========================================
// GET URL PARAMETERS
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );


const songId =
    params.get("id");


const songType =
    params.get("type") || "fast";


// ==========================================
// LOAD SONG
// ==========================================

async function loadLyrics() {

    const title =
        document.getElementById(
            "songTitle"
        );

    const heading =
        document.getElementById(
            "lyricsHeading"
        );

    const content =
        document.getElementById(
            "lyricsContent"
        );

    const typeBadge =
        document.getElementById(
            "songType"
        );

    const lastSung =
        document.getElementById(
            "lastSung"
        );

    const timesSung =
        document.getElementById(
            "timesSung"
        );

    const category =
        document.getElementById(
            "category"
        );

    const status =
        document.getElementById(
            "lyricsStatus"
        );

    const description =
        document.getElementById(
            "metaDescription"
        );


    if (!songId) {

        showError(
            "Song not found."
        );

        return;

    }


    try {

        const path =
            songType === "slow"
                ? "slowSongs"
                : "fastSongs";


        const songRef =
            ref(
                db,
                `${path}/${songId}`
            );


        const snapshot =
            await get(songRef);


        if (!snapshot.exists()) {

            showError(
                "This song could not be found."
            );

            return;

        }


        const song =
            snapshot.val();


        // ==================================
        // TITLE
        // ==================================

        const songName =
            song.name || "Untitled Song";


        document.title =
            `${songName} Lyrics | Khristi Kalisiya`;


        if (description) {

            description.setAttribute(
                "content",
                `${songName} worship song lyrics from Khristi Kalisiya.`
            );

        }


        if (title) {

            title.innerText =
                songName;

        }


        if (heading) {

            heading.innerText =
                songName;

        }


        // ==================================
        // TYPE
        // ==================================

        const categoryName =
            songType === "slow"
                ? "Slow Song"
                : "Fast Song";


        if (typeBadge) {

            typeBadge.innerText =
                categoryName.toUpperCase();

        }


        if (category) {

            category.innerText =
                categoryName;

        }


        // ==================================
        // SONG DATA
        // ==================================

        if (lastSung) {

            lastSung.innerText =
                song.lastSung || "Not sung yet";

        }


        if (timesSung) {

            timesSung.innerText =
                song.timesSung || 0;

        }


        // ==================================
        // LYRICS
        // ==================================

        const lyrics =
            String(
                song.lyrics || ""
            ).trim();


        if (!lyrics) {

            content.innerHTML = `

                <div class="no-lyrics">

                    <div class="no-lyrics-icon">
                        ♪
                    </div>

                    <h3>
                        Lyrics Not Available
                    </h3>

                    <p>
                        Lyrics for this song have not been added yet.
                    </p>

                </div>

            `;

            if (status) {
                status.innerText =
                    "Lyrics unavailable";
            }

            return;

        }


        // Use textContent so lyrics
        // cannot inject HTML.

        content.textContent =
            lyrics;


        content.classList.add(
            "has-lyrics"
        );


        if (status) {

            status.innerText =
                "Lyrics Available";

        }


    } catch (error) {

        console.error(
            "Lyrics loading error:",
            error
        );


        showError(
            "Unable to load lyrics. Please try again."
        );

    }

}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    const title =
        document.getElementById(
            "songTitle"
        );

    const heading =
        document.getElementById(
            "lyricsHeading"
        );

    const content =
        document.getElementById(
            "lyricsContent"
        );


    if (title) {

        title.innerText =
            "Song Not Found";

    }


    if (heading) {

        heading.innerText =
            "Song Not Found";

    }


    if (content) {

        content.innerHTML = `

            <div class="no-lyrics">

                <div class="no-lyrics-icon">
                    !
                </div>

                <h3>
                    ${escapeHTML(message)}
                </h3>

                <p>
                    Please check the song link.
                </p>

            </div>

        `;

    }

}


// ==========================================
// FONT SIZE
// ==========================================

function changeFontSize(amount) {

    currentFontSize += amount;


    if (currentFontSize < 15) {

        currentFontSize = 15;

    }


    if (currentFontSize > 32) {

        currentFontSize = 32;

    }


    const content =
        document.getElementById(
            "lyricsContent"
        );


    if (content) {

        content.style.fontSize =
            `${currentFontSize}px`;

    }

}


// ==========================================
// READING MODE
// ==========================================

function toggleReadingMode() {

    document.body.classList.toggle(
        "reading-mode"
    );

}


// ==========================================
// FULLSCREEN
// ==========================================

function toggleFullscreen() {

    const card =
        document.querySelector(
            ".lyrics-card"
        );


    if (!card) return;


    card.classList.toggle(
        "fullscreen"
    );


    const button =
        document.getElementById(
            "fullscreenButton"
        );


    if (button) {

        button.innerText =
            card.classList.contains("fullscreen")
                ? "Exit Full Screen"
                : "Full Screen";

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
// BUTTON EVENTS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const decrease =
            document.getElementById(
                "decreaseFont"
            );


        const increase =
            document.getElementById(
                "increaseFont"
            );


        const theme =
            document.getElementById(
                "themeButton"
            );


        const fullscreen =
            document.getElementById(
                "fullscreenButton"
            );


        if (decrease) {

            decrease.addEventListener(
                "click",
                () => changeFontSize(-2)
            );

        }


        if (increase) {

            increase.addEventListener(
                "click",
                () => changeFontSize(2)
            );

        }


        if (theme) {

            theme.addEventListener(
                "click",
                toggleReadingMode
            );

        }


        if (fullscreen) {

            fullscreen.addEventListener(
                "click",
                toggleFullscreen
            );

        }


        loadLyrics();

    }
);