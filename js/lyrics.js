import { db, ref, get, update } from "../firebase.js";

let currentFontSize = 20;
let currentSong = null;

const params = new URLSearchParams(window.location.search);

const songId = params.get("id");
const songType = params.get("type") || "fast";


// =====================================================
// LOAD LYRICS
// =====================================================

async function loadLyrics() {

    const title = document.getElementById("songTitle");
    const heading = document.getElementById("lyricsHeading");
    const content = document.getElementById("lyricsContent");
    const typeBadge = document.getElementById("songType");
    const lastSung = document.getElementById("lastSung");
    const timesSung = document.getElementById("timesSung");
    const category = document.getElementById("category");
    const status = document.getElementById("lyricsStatus");
    const description = document.getElementById("metaDescription");

    if (!songId) {
        showError("Song not found.");
        return;
    }

    try {

        const path =
            songType.toLowerCase() === "slow"
                ? "slowSongs"
                : "fastSongs";

        const songRef = ref(
            db,
            `${path}/${songId}`
        );

        const snapshot = await get(songRef);

        if (!snapshot.exists()) {
            showError("This song could not be found.");
            return;
        }

        currentSong = snapshot.val();

        const songName =
            currentSong.name || "Untitled Song";

        document.title =
            `${songName} Lyrics | Khristi Kalisiya`;

        if (description) {
            description.setAttribute(
                "content",
                `${songName} worship song lyrics from Khristi Kalisiya.`
            );
        }

        if (title) {
            title.innerText = songName;
        }

        if (heading) {
            heading.innerText = songName;
        }

        const categoryName =
            songType.toLowerCase() === "slow"
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

        if (lastSung) {
            lastSung.innerText =
                currentSong.lastSung || "Not sung yet";
        }

        if (timesSung) {
            timesSung.innerText =
                currentSong.timesSung || 0;
        }

        const lyrics =
            String(currentSong.lyrics || "").trim();

        if (lyrics) {
            showLyrics(lyrics);
        } else {
            showNoLyrics();
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


// =====================================================
// SHOW LYRICS
// =====================================================

function showLyrics(lyrics) {

    const content =
        document.getElementById("lyricsContent");

    const status =
        document.getElementById("lyricsStatus");

    if (!content) {
        return;
    }

    content.textContent = lyrics;

    content.classList.add("has-lyrics");

    if (status) {
        status.innerText =
            "Lyrics Available";
    }
}


// =====================================================
// NO LYRICS
// =====================================================

function showNoLyrics() {

    const content =
        document.getElementById("lyricsContent");

    const status =
        document.getElementById("lyricsStatus");

    if (!content) {
        return;
    }

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
}


// =====================================================
// UPDATE BUTTON
// =====================================================

function setupUpdateButton() {

    const button =
        document.getElementById(
            "updateLyricsButton"
        );

    if (!button) {

        console.log(
            "Update Lyrics button not found."
        );

        return;
    }

    console.log(
        "Update Lyrics button found."
    );

    button.onclick = () => {

        console.log(
            "Update Lyrics button clicked."
        );

        openLyricsEditor();
    };
}


// =====================================================
// OPEN EDITOR
// =====================================================

function openLyricsEditor() {

    console.log(
        "🔵 Update Lyrics: START"
    );

    // ---------------------------------------------
    // ADMIN CHECK
    // ---------------------------------------------

    if (!document.body.classList.contains("admin")) {

        alert(
            "Please login as admin first."
        );

        console.log(
            "❌ User is not admin."
        );

        return;
    }


    // ---------------------------------------------
    // SONG CHECK
    // ---------------------------------------------

    if (!currentSong) {

        alert(
            "Song is still loading. Please try again."
        );

        console.log(
            "❌ Current song not found."
        );

        return;
    }


    console.log(
        "🟢 Admin and current song OK"
    );


    // ---------------------------------------------
    // CHECK EXISTING MODAL
    // ---------------------------------------------

    let modal =
        document.getElementById(
            "lyricsEditorModal"
        );

    if (modal) {

        console.log(
            "🟡 Existing modal found."
        );

        const textarea =
            document.getElementById(
                "lyricsEditor"
            );

        if (textarea) {
            textarea.value =
                currentSong.lyrics || "";
            textarea.focus();
        }

        modal.style.display =
            "flex";

        return;
    }


    // ---------------------------------------------
    // CREATE MODAL
    // ---------------------------------------------

    modal =
        document.createElement("div");

    modal.id =
        "lyricsEditorModal";

    modal.className =
        "lyrics-editor-modal";


    modal.innerHTML = `

        <div class="lyrics-editor-box">

            <div class="lyrics-editor-header">

                <div>

                    <span>
                        KHRISTI KALISIYA
                    </span>

                    <h2>
                        ✏️ Update Lyrics
                    </h2>

                </div>

                <button
                    type="button"
                    id="closeLyricsEditorBtn"
                    class="lyrics-editor-close">

                    ×

                </button>

            </div>


            <div class="lyrics-editor-body">

                <p class="lyrics-editor-song">
                    ${escapeHTML(
                        currentSong.name ||
                        "Worship Song"
                    )}
                </p>

                <label for="lyricsEditor">
                    Song Lyrics
                </label>

                <textarea
                    id="lyricsEditor"
                    class="lyrics-editor-textarea"
                    placeholder="Enter song lyrics here..."
                    rows="15"
                ></textarea>

            </div>


            <div class="lyrics-editor-footer">

                <button
                    type="button"
                    id="cancelLyricsEditorBtn"
                    class="lyrics-editor-cancel">

                    Cancel

                </button>


                <button
                    type="button"
                    id="saveLyricsEditorBtn"
                    class="lyrics-editor-save">

                    💾 Save Lyrics

                </button>

            </div>

        </div>

    `;


    console.log(
        "🟢 Modal HTML created"
    );


    // ---------------------------------------------
    // ADD TO PAGE
    // ---------------------------------------------

    document.body.appendChild(modal);


    console.log(
        "🟢 Modal added to DOM"
    );


    // ---------------------------------------------
    // TEXTAREA
    // ---------------------------------------------

    const textarea =
        document.getElementById(
            "lyricsEditor"
        );

    if (textarea) {

        textarea.value =
            currentSong.lyrics || "";

        textarea.focus();
    }


    // ---------------------------------------------
    // CLOSE BUTTON
    // ---------------------------------------------

    const closeButton =
        document.getElementById(
            "closeLyricsEditorBtn"
        );

    if (closeButton) {

        closeButton.onclick =
            closeLyricsEditor;
    }


    // ---------------------------------------------
    // CANCEL BUTTON
    // ---------------------------------------------

    const cancelButton =
        document.getElementById(
            "cancelLyricsEditorBtn"
        );

    if (cancelButton) {

        cancelButton.onclick =
            closeLyricsEditor;
    }


    // ---------------------------------------------
    // SAVE BUTTON
    // ---------------------------------------------

    const saveButton =
        document.getElementById(
            "saveLyricsEditorBtn"
        );

    if (saveButton) {

        saveButton.onclick =
            saveUpdatedLyrics;
    }


    // ---------------------------------------------
    // SHOW MODAL
    // ---------------------------------------------

    modal.style.display =
        "flex";

    console.log(
        "🟢 Update Lyrics modal ready"
    );
}


// =====================================================
// SAVE UPDATED LYRICS
// =====================================================

async function saveUpdatedLyrics() {

    console.log(
        "🟡 Save Lyrics clicked"
    );


    // ---------------------------------------------
    // ADMIN CHECK
    // ---------------------------------------------

    if (!document.body.classList.contains("admin")) {

        alert(
            "Only admin can update lyrics."
        );

        return;
    }


    // ---------------------------------------------
    // SONG CHECK
    // ---------------------------------------------

    if (!currentSong || !songId) {

        alert(
            "Song information not found."
        );

        console.log(
            "❌ Song ID/current song missing."
        );

        return;
    }


    // ---------------------------------------------
    // TEXTAREA
    // ---------------------------------------------

    const textarea =
        document.getElementById(
            "lyricsEditor"
        );


    if (!textarea) {

        console.log(
            "❌ Lyrics textarea not found."
        );

        alert(
            "Lyrics editor not found."
        );

        return;
    }


    // ---------------------------------------------
    // GET LYRICS
    // ---------------------------------------------

    const newLyrics =
        textarea.value.trim();


    if (!newLyrics) {

        alert(
            "Please enter lyrics."
        );

        textarea.focus();

        return;
    }


    // ---------------------------------------------
    // SAVE BUTTON
    // ---------------------------------------------

    const saveButton =
        document.getElementById(
            "saveLyricsEditorBtn"
        );


    try {

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.innerText =
                "Saving...";
        }


        // -----------------------------------------
        // FIREBASE PATH
        // -----------------------------------------

        const path =
            songType.toLowerCase() === "slow"
                ? "slowSongs"
                : "fastSongs";


        console.log(
            "📌 Firebase path:",
            path
        );

        console.log(
            "📌 Song ID:",
            songId
        );


        const songRef =
            ref(
                db,
                `${path}/${songId}`
            );


        console.log(
            "🟡 Updating Firebase..."
        );


        // -----------------------------------------
        // UPDATE FIREBASE
        // -----------------------------------------

        await update(
            songRef,
            {
                lyrics: newLyrics
            }
        );


        console.log(
            "✅ Firebase lyrics updated successfully"
        );


        // -----------------------------------------
        // UPDATE LOCAL SONG
        // -----------------------------------------

        currentSong.lyrics =
            newLyrics;


        // -----------------------------------------
        // UPDATE SCREEN
        // -----------------------------------------

        showLyrics(
            newLyrics
        );


        // -----------------------------------------
        // CLOSE MODAL
        // -----------------------------------------

        closeLyricsEditor();


        alert(
            "Lyrics Updated Successfully ✅"
        );


    } catch (error) {

        console.error(
            "❌ Firebase lyrics update error:",
            error
        );

        alert(
            "Lyrics update failed.\n\n" +
            error.message
        );


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerText =
                "💾 Save Lyrics";
        }
    }
}


// =====================================================
// CLOSE EDITOR
// =====================================================

function closeLyricsEditor() {

    const modal =
        document.getElementById(
            "lyricsEditorModal"
        );

    if (modal) {

        modal.remove();

        console.log(
            "🟢 Lyrics editor closed"
        );
    }
}


// =====================================================
// ERROR
// =====================================================

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


// =====================================================
// FONT SIZE
// =====================================================

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


// =====================================================
// READING MODE
// =====================================================

function toggleReadingMode() {

    document.body.classList.toggle(
        "reading-mode"
    );
}


// =====================================================
// FULL SCREEN
// =====================================================

function toggleFullscreen() {

    const card =
        document.querySelector(
            ".lyrics-card"
        );


    if (!card) {
        return;
    }


    card.classList.toggle(
        "fullscreen"
    );


    const button =
        document.getElementById(
            "fullscreenButton"
        );


    if (button) {

        button.innerText =
            card.classList.contains(
                "fullscreen"
            )
                ? "Exit Full Screen"
                : "Full Screen";
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =====================================================
// MODAL BACKDROP CLICK
// =====================================================

document.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "lyricsEditorModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeLyricsEditor();
        }
    }
);


// =====================================================
// ESCAPE KEY
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            const modal =
                document.getElementById(
                    "lyricsEditorModal"
                );

            if (modal) {

                closeLyricsEditor();
            }
        }
    }
);


// =====================================================
// INITIALIZE
// =====================================================

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


        // -----------------------------------------
        // FONT DECREASE
        // -----------------------------------------

        if (decrease) {

            decrease.onclick =
                () => changeFontSize(-2);
        }


        // -----------------------------------------
        // FONT INCREASE
        // -----------------------------------------

        if (increase) {

            increase.onclick =
                () => changeFontSize(2);
        }


        // -----------------------------------------
        // READING MODE
        // -----------------------------------------

        if (theme) {

            theme.onclick =
                toggleReadingMode;
        }


        // -----------------------------------------
        // FULL SCREEN
        // -----------------------------------------

        if (fullscreen) {

            fullscreen.onclick =
                toggleFullscreen;
        }


        // -----------------------------------------
        // LOAD SONG
        // -----------------------------------------

        loadLyrics();


        // -----------------------------------------
        // UPDATE BUTTON
        // -----------------------------------------

        setupUpdateButton();

    }
);