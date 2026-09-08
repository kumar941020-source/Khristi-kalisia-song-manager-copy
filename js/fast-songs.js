// ==========================================
// FAST SONG PAGE
// ==========================================

import {
    fastSongs,
    addFastSong,
    markFastSongUsed,
    selectFastSong,
    editFastSong,
    deleteFastSong
} from "../script1.js";


let pendingAction = null;


// ==========================================
// SORT SONGS
// ==========================================

function getSortedSongs(songs) {

    return [...songs].sort((a, b) => {

        if (!a.lastSung && !b.lastSung) {
            return a.name.localeCompare(b.name);
        }

        if (!a.lastSung) return -1;

        if (!b.lastSung) return 1;

        return parseDate(a.lastSung) - parseDate(b.lastSung);

    });

}


function parseDate(date) {

    const parts = String(date || "").split("/");

    if (parts.length !== 3) {
        return 0;
    }

    return new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0])
    ).getTime();

}


// ==========================================
// CREATE SONG CARD
// ==========================================

function createSongCard(song, index) {

    const card =
        document.createElement("div");

    card.className =
        "fast-song-card";


    const header =
        document.createElement("div");

    header.className =
        "fast-song-header";


    const selectedBadge =
        song.selected
            ? `<span class="selected-badge">SELECTED</span>`
            : "";


    header.innerHTML = `

        <div class="fast-song-title-area">

            <div class="fast-song-number">
                ${index + 1}
            </div>

            <div>

                <h3 class="fast-song-title">
                    ${escapeHTML(song.name)}
                    ${selectedBadge}
                </h3>

                <div class="fast-song-meta">
                    ${song.lastSung
                        ? `Last sung ${escapeHTML(song.lastSung)}`
                        : "Not sung yet"}
                </div>

            </div>

        </div>

        <span class="fast-arrow">
            ▼
        </span>

    `;


    const details =
        document.createElement("div");

    details.className =
        "fast-song-details";


    details.innerHTML = `

        <div class="fast-details-grid">

            <div class="fast-info-box">

                <span class="fast-info-label">
                    Last Sung
                </span>

                <span class="fast-info-value">
                    ${escapeHTML(song.lastSung || "Not sung yet")}
                </span>

            </div>


            <div class="fast-info-box">

                <span class="fast-info-label">
                    Times Sung
                </span>

                <span class="fast-info-value">
                    ${song.timesSung || 0} times
                </span>

            </div>

        </div>


        <div class="fast-song-actions">

            <button
                type="button"
                class="used-btn admin-only">

                Used +1

            </button>


            <button
                type="button"
                class="select-btn admin-only">

                ${song.selected
                    ? "Unselect"
                    : "Select"}

            </button>


            <button
                type="button"
                class="lyrics-btn">

                Lyrics

            </button>


            <button
                type="button"
                class="edit-btn admin-only">

                Edit

            </button>


            <button
                type="button"
                class="delete-btn admin-only">

                Delete

            </button>

        </div>

    `;


    const usedBtn =
        details.querySelector(".used-btn");

    const selectBtn =
        details.querySelector(".select-btn");

    const lyricsBtn =
        details.querySelector(".lyrics-btn");

    const editBtn =
        details.querySelector(".edit-btn");

    const deleteBtn =
        details.querySelector(".delete-btn");


    usedBtn.addEventListener("click", event => {

        event.stopPropagation();

        confirmUsed(song);

    });


    selectBtn.addEventListener("click", async event => {

        event.stopPropagation();

        await selectFastSong(song.id);

    });


    lyricsBtn.addEventListener("click", event => {

        event.stopPropagation();

        openLyricsPage(song.id);

    });


    editBtn.addEventListener("click", event => {

        event.stopPropagation();

        confirmEdit(song);

    });


    deleteBtn.addEventListener("click", event => {

        event.stopPropagation();

        confirmDelete(song);

    });


    header.addEventListener("click", () => {

        const isOpen =
            card.classList.contains("open");


        document
            .querySelectorAll(".fast-song-card.open")
            .forEach(otherCard => {

                otherCard.classList.remove("open");

                const arrow =
                    otherCard.querySelector(".fast-arrow");

                if (arrow) {
                    arrow.innerText = "▼";
                }

            });


        if (!isOpen) {

            card.classList.add("open");

            const arrow =
                card.querySelector(".fast-arrow");

            if (arrow) {
                arrow.innerText = "▲";
            }

        }

    });


    card.appendChild(header);

    card.appendChild(details);

    return card;

}


// ==========================================
// DISPLAY
// ==========================================

function displayFastSongs(searchValue = "") {

    const box =
        document.getElementById("fastSongTable");

    if (!box) return;


    const search =
        searchValue
            .trim()
            .toLowerCase();


    const songs =
        fastSongs.filter(song =>
            String(song.name || "")
                .toLowerCase()
                .includes(search)
        );


    const sortedSongs =
        getSortedSongs(songs);


    box.innerHTML = "";


    const total =
        document.getElementById("fastTotalSongs");

    const listCount =
        document.getElementById("fastListCount");


    if (total) {
        total.innerText = fastSongs.length;
    }


    if (listCount) {

        listCount.innerText =
            `${sortedSongs.length} ${
                sortedSongs.length === 1
                    ? "Song"
                    : "Songs"
            }`;

    }


    if (sortedSongs.length === 0) {

        box.innerHTML = `

            <div class="fast-empty">

                <div style="font-size:40px;">
                    ♪
                </div>

                <h3>
                    No Fast Songs Found
                </h3>

                <p>
                    Try another search or add a new song.
                </p>

            </div>

        `;

        applyAdminPermission();

        return;

    }


    sortedSongs.forEach((song, index) => {

        box.appendChild(
            createSongCard(song, index)
        );

    });


    applyAdminPermission();

}


// ==========================================
// SEARCH
// ==========================================

function searchFast(value) {

    displayFastSongs(value);

}


function clearFastSearch() {

    const input =
        document.getElementById(
            "fastSearchInput"
        );

    if (input) {
        input.value = "";
    }

    displayFastSongs("");

}


// ==========================================
// ADMIN PERMISSION
// ==========================================

function applyAdminPermission() {

    if (
        document.body.classList.contains("visitor")
    ) {

        document
            .querySelectorAll(".admin-only")
            .forEach(element => {

                element.style.display = "none";

            });

    }

}


// ==========================================
// ADD
// ==========================================

async function addFast() {

    const nameInput =
        document.getElementById(
            "fastSongName"
        );

    const dateInput =
        document.getElementById(
            "fastSongDate"
        );


    const name =
        nameInput?.value.trim();


    const date =
        dateInput?.value;


    if (!name) {

        showSimpleMessage(
            "Please enter a song name."
        );

        return;

    }


    await addFastSong(
        name,
        date
    );


    if (nameInput) {
        nameInput.value = "";
    }

    if (dateInput) {
        dateInput.value = "";
    }

}


// ==========================================
// USED +1
// ==========================================

function confirmUsed(song) {

    openConfirmModal({

        title: "Mark Song as Used?",

        message:
            `Are you sure you want to mark <b>${escapeHTML(song.name)}</b> as used?`,

        buttonText: "Yes, Mark Used",

        icon: "✓",

        actionClass: "confirm-used",

        action: async () => {

            await markFastSongUsed(song.id);

        }

    });

}


// ==========================================
// EDIT
// ==========================================

function confirmEdit(song) {

    openConfirmModal({

        title: "Edit Song?",

        message:
            `Do you want to edit <b>${escapeHTML(song.name)}</b>?`,

        buttonText: "Continue",

        icon: "✎",

        actionClass: "confirm-edit",

        action: async () => {

            await editFastSong(song.id);

        }

    });

}


// ==========================================
// DELETE
// ==========================================

function confirmDelete(song) {

    openConfirmModal({

        title: "Delete Song?",

        message:
            `Are you sure you want to permanently delete <b>${escapeHTML(song.name)}</b>?<br><br>This action cannot be undone.`,

        buttonText: "Delete",

        icon: "!",

        actionClass: "confirm-delete",

        action: async () => {

            await deleteFastSong(song.id);

        }

    });

}


// ==========================================
// CONFIRM MODAL
// ==========================================

function openConfirmModal(options) {

    const modal =
        document.getElementById(
            "actionConfirmModal"
        );

    const title =
        document.getElementById(
            "confirmTitle"
        );

    const message =
        document.getElementById(
            "confirmMessage"
        );

    const actionBtn =
        document.getElementById(
            "confirmActionBtn"
        );

    const icon =
        document.getElementById(
            "confirmIcon"
        );


    if (!modal) return;


    title.innerText =
        options.title;


    message.innerHTML =
        options.message;


    actionBtn.innerText =
        options.buttonText;


    icon.innerText =
        options.icon;


    pendingAction =
        options.action;


    actionBtn.onclick =
        async () => {

            const action =
                pendingAction;

            closeConfirmModal();

            if (action) {
                await action();
            }

        };


    modal.style.display =
        "flex";

}


function closeConfirmModal() {

    const modal =
        document.getElementById(
            "actionConfirmModal"
        );

    if (modal) {
        modal.style.display = "none";
    }

    pendingAction = null;

}


// ==========================================
// LYRICS PAGE
// ==========================================

function openLyricsPage(songId) {

    window.location.href =
        `lyrics.html?id=${encodeURIComponent(songId)}&type=fast`;

}


// ==========================================
// SIMPLE MESSAGE
// ==========================================

function showSimpleMessage(message) {

    alert(message);

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
// MODAL EVENTS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const modal =
            document.getElementById(
                "actionConfirmModal"
            );


        const cancelBtn =
            document.getElementById(
                "confirmCancelBtn"
            );


        if (cancelBtn) {

            cancelBtn.addEventListener(
                "click",
                closeConfirmModal
            );

        }


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        closeConfirmModal();

                    }

                }
            );

        }


        const waitForApp =
            setInterval(() => {

                if (window.appReady === true) {

                    clearInterval(waitForApp);

                    displayFastSongs();

                }

            }, 100);

    }
);


// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.displayFastSongs =
    displayFastSongs;

window.searchFast =
    searchFast;

window.clearFastSearch =
    clearFastSearch;

window.addFast =
    addFast;

window.openLyricsPage =
    openLyricsPage;

window.closeConfirmModal =
    closeConfirmModal;