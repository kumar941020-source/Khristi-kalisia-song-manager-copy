import {
    getSundayHistory,
    deleteHistory
} from "../script1.js";

import {
    db,
    ref,
    get,
    remove
} from "../firebase.js";


// ===============================
// GLOBAL VARIABLES
// ===============================

let attendanceCycles = [];
let pendingDelete = null;


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// DATE NORMALIZE
// ===============================

function normalizeDate(date) {

    if (!date) return "";

    return String(date)
        .trim()
        .replace(/\//g, "-");

}


// ===============================
// WAIT FOR APP READY
// ===============================

function waitForAppReady(callback) {

    if (window.appReady === true) {
        callback();
        return;
    }

    const check = setInterval(() => {

        if (window.appReady === true) {

            clearInterval(check);
            callback();

        }

    }, 200);

}


// ===============================
// DISPLAY SUNDAY HISTORY
// ===============================

function displaySundayHistory(searchValue = "") {

    const container =
        document.getElementById("historyContainer");

    if (!container) return;


    const history = getSundayHistory() || [];

    const search =
        String(searchValue)
            .trim()
            .toLowerCase();


    let filteredHistory = history.filter(plan => {

        if (!search) return true;

        const date =
            normalizeDate(plan.date).toLowerCase();

        return date.includes(search);

    });


    // Latest first
    filteredHistory = [...filteredHistory].reverse();


    // ===============================
    // NO DATA
    // ===============================

    if (filteredHistory.length === 0) {

        container.innerHTML = `

            <div class="empty-history">

                <div class="empty-icon">
                    <i class="fa-solid fa-calendar-xmark"></i>
                </div>

                <h3>
                    No Sunday History Found
                </h3>

                <p>
                    ${
                        search
                        ? "No plan found for this date."
                        : "No Sunday plans have been saved yet."
                    }
                </p>

            </div>

        `;

        return;
    }


    // ===============================
    // RENDER HISTORY
    // ===============================

    container.innerHTML =
        filteredHistory.map(plan => {

            const fastSongs =
                Array.isArray(plan.fastSongs)
                    ? plan.fastSongs
                    : [];

            const slowSongs =
                Array.isArray(plan.slowSongs)
                    ? plan.slowSongs
                    : [];


            return `

                <div class="history-card">

                    <div class="history-card-header">

                        <div>

                            <span class="history-label">
                                SUNDAY PLAN
                            </span>

                            <h3>
                                <i class="fa-regular fa-calendar"></i>
                                ${escapeHTML(plan.date || "No Date")}
                            </h3>

                        </div>


                        <button
                            class="delete-history-btn admin-only"
                            onclick="requestDeleteSundayHistory(
                                '${escapeHTML(plan.id)}',
                                '${escapeHTML(plan.date || "")}'
                            )"
                            title="Delete History"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>


                    <div class="history-songs">

                        <!-- FAST SONGS -->

                        <div class="history-song-section fast-section">

                            <div class="song-section-title">

                                <span class="song-dot fast-dot"></span>

                                <strong>
                                    Fast Songs
                                </strong>

                                <span class="song-count">
                                    ${fastSongs.length}
                                </span>

                            </div>


                            <div class="history-song-list">

                                ${
                                    fastSongs.length
                                    ? fastSongs.map((song, index) => `

                                        <div class="history-song">

                                            <span class="song-number">
                                                ${index + 1}
                                            </span>

                                            <span class="song-name">
                                                ${escapeHTML(
                                                    typeof song === "string"
                                                    ? song
                                                    : song.name
                                                )}
                                            </span>

                                        </div>

                                    `).join("")
                                    : `

                                        <div class="no-songs">
                                            No Fast Songs
                                        </div>

                                    `
                                }

                            </div>

                        </div>


                        <!-- SLOW SONGS -->

                        <div class="history-song-section slow-section">

                            <div class="song-section-title">

                                <span class="song-dot slow-dot"></span>

                                <strong>
                                    Slow Songs
                                </strong>

                                <span class="song-count">
                                    ${slowSongs.length}
                                </span>

                            </div>


                            <div class="history-song-list">

                                ${
                                    slowSongs.length
                                    ? slowSongs.map((song, index) => `

                                        <div class="history-song">

                                            <span class="song-number">
                                                ${index + 1}
                                            </span>

                                            <span class="song-name">
                                                ${escapeHTML(
                                                    typeof song === "string"
                                                    ? song
                                                    : song.name
                                                )}
                                            </span>

                                        </div>

                                    `).join("")
                                    : `

                                        <div class="no-songs">
                                            No Slow Songs
                                        </div>

                                    `
                                }

                            </div>

                        </div>

                    </div>

                </div>

            `;

        }).join("");

}


// ===============================
// DELETE SUNDAY HISTORY REQUEST
// ===============================

function requestDeleteSundayHistory(id, date) {

    pendingDelete = {

        type: "sunday",

        id: id

    };


    openDeleteModal(

        "Delete Sunday Plan?",

        "Are you sure you really want to delete the Sunday plan of",

        date

    );

}


// ===============================
// OPEN DELETE MODAL
// ===============================

function openDeleteModal(title, message, itemName) {

    const modal =
        document.getElementById("deleteModal");

    if (!modal) {

        // Fallback
        if (confirm(`${message} ${itemName}?`)) {

            confirmDelete();

        }

        return;

    }


    const titleElement =
        document.getElementById("deleteModalTitle");

    const messageElement =
        document.getElementById("deleteModalMessage");

    const itemElement =
        document.getElementById("deleteItemName");


    if (titleElement) {

        titleElement.textContent = title;

    }


    if (messageElement) {

        messageElement.textContent = message;

    }


    if (itemElement) {

        itemElement.textContent = itemName;

    }


    modal.classList.add("show");

    modal.setAttribute("aria-hidden", "false");

}


// ===============================
// CLOSE DELETE MODAL
// ===============================

function closeDeleteModal() {

    const modal =
        document.getElementById("deleteModal");

    if (!modal) return;


    modal.classList.remove("show");

    modal.setAttribute("aria-hidden", "true");

    pendingDelete = null;

}


// ===============================
// CONFIRM DELETE
// ===============================

async function confirmDelete() {

    if (!pendingDelete) return;


    const deleteButton =
        document.getElementById("confirmDeleteBtn");


    if (deleteButton) {

        deleteButton.disabled = true;

        deleteButton.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;

    }


    try {

        // Sunday History
        if (pendingDelete.type === "sunday") {

            await deleteHistory(
                pendingDelete.id
            );

            displaySundayHistory(
                getSearchValue()
            );

        }


        // Attendance Cycle
        else if (pendingDelete.type === "attendance") {

            await remove(
                ref(
                    db,
                    "attendance/history/" +
                    pendingDelete.key
                )
            );

            await loadAttendanceCycleHistory();

        }


        closeDeleteModal();


    } catch (error) {

        console.error(
            "Delete Error:",
            error
        );

        alert(
            "Unable to delete. Please try again."
        );

    } finally {

        if (deleteButton) {

            deleteButton.disabled = false;

            deleteButton.innerHTML =
                `<i class="fa-solid fa-trash"></i> Delete`;

        }

    }

}
// ===============================
// LOAD ATTENDANCE CYCLE HISTORY
// ===============================

async function loadAttendanceCycleHistory() {

    const container =
        document.getElementById("attendanceCycleHistory");

    if (!container) return;


    try {

        const snapshot =
            await get(
                ref(db, "attendance/history")
            );


        if (!snapshot.exists()) {

            attendanceCycles = [];

            renderAttendanceCycles();

            return;

        }


        const data =
            snapshot.val();


        attendanceCycles =
            Object.entries(data).map(
                ([key, value]) => ({

                    key,

                    ...value

                })
            );


        // Latest cycle first
        attendanceCycles.sort(
            (a, b) =>
                Number(b.cycleNumber || 0) -
                Number(a.cycleNumber || 0)
        );


        renderAttendanceCycles();


    } catch (error) {

        console.error(
            "Attendance History Error:",
            error
        );


        container.innerHTML = `

            <div class="empty-history">

                <div class="empty-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>

                <h3>
                    Unable to Load Attendance History
                </h3>

                <p>
                    Please refresh the page.
                </p>

            </div>

        `;

    }

}


// ===============================
// RENDER ATTENDANCE CYCLES
// ===============================

function renderAttendanceCycles(
    searchValue = ""
) {

    const container =
        document.getElementById("attendanceCycleHistory");

    if (!container) return;


    const search =
        String(searchValue)
            .trim()
            .toLowerCase();


    const filteredCycles =
        attendanceCycles.filter(cycle => {

            if (!search) return true;


            const cycleName =
                String(
                    cycle.cycleName || ""
                ).toLowerCase();


            const completedDate =
                normalizeDate(
                    cycle.completedDate ||
                    cycle.endDate ||
                    cycle.date ||
                    ""
                ).toLowerCase();


            return (
                cycleName.includes(search) ||
                completedDate.includes(search)
            );

        });


    if (filteredCycles.length === 0) {

        container.innerHTML = `

            <div class="empty-history">

                <div class="empty-icon">

                    <i class="fa-solid fa-clipboard-list"></i>

                </div>

                <h3>
                    No Attendance History Found
                </h3>

                <p>
                    ${
                        search
                        ? "No attendance cycle found."
                        : "No attendance cycles have been completed yet."
                    }
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filteredCycles.map(cycle => {


            const zoom =
                cycle.sessions?.zoom || {};

            const saturday =
                cycle.sessions?.saturday || {};

            const sunday =
                cycle.sessions?.sunday || {};


            const zoomCount =
                Number(zoom.count || 0);

            const saturdayCount =
                Number(saturday.count || 0);

            const sundayCount =
                Number(sunday.count || 0);


            const totalSessions =
                zoomCount +
                saturdayCount +
                sundayCount;


            const cycleName =
                cycle.cycleName ||
                `Cycle ${cycle.cycleNumber || ""}`;


            const completedDate =
                cycle.completedDate ||
                cycle.endDate ||
                cycle.date ||
                "Date not available";


            return `

                <div class="attendance-history-card">

                    <div class="attendance-history-header">

                        <div>

                            <span class="history-label">
                                ATTENDANCE CYCLE
                            </span>

                            <h3>

                                <i class="fa-solid fa-calendar-check"></i>

                                ${escapeHTML(cycleName)}

                            </h3>

                            <p class="cycle-date">

                                <i class="fa-regular fa-calendar"></i>

                                ${escapeHTML(completedDate)}

                            </p>

                        </div>


                        <button
                            class="delete-history-btn admin-only"
                            onclick="requestDeleteAttendanceCycle(
                                '${escapeHTML(cycle.key)}',
                                '${escapeHTML(cycleName)}',
                                '${escapeHTML(completedDate)}'
                            )"
                            title="Delete Attendance Cycle"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>


                    <div class="attendance-summary-grid">


                        <div class="attendance-summary-box zoom-box">

                            <div class="attendance-icon">

                                <i class="fa-solid fa-video"></i>

                            </div>

                            <div>

                                <span>
                                    Zoom
                                </span>

                                <strong>
                                    ${zoomCount}
                                </strong>

                            </div>

                        </div>


                        <div class="attendance-summary-box saturday-box">

                            <div class="attendance-icon">

                                <i class="fa-solid fa-people-group"></i>

                            </div>

                            <div>

                                <span>
                                    Saturday
                                </span>

                                <strong>
                                    ${saturdayCount}
                                </strong>

                            </div>

                        </div>


                        <div class="attendance-summary-box sunday-box">

                            <div class="attendance-icon">

                                <i class="fa-solid fa-church"></i>

                            </div>

                            <div>

                                <span>
                                    Sunday
                                </span>

                                <strong>
                                    ${sundayCount}
                                </strong>

                            </div>

                        </div>


                    </div>


                    <div class="attendance-total">

                        <span>
                            Total Sessions
                        </span>

                        <strong>
                            ${totalSessions}
                        </strong>

                    </div>

                </div>

            `;

        }).join("");

}


// ===============================
// DELETE ATTENDANCE CYCLE
// ===============================

function requestDeleteAttendanceCycle(
    cycleKey,
    cycleName,
    completedDate
) {

    pendingDelete = {

        type: "attendance",

        key: cycleKey

    };


    openDeleteModal(

        "Delete Attendance Cycle?",

        "Are you sure you really want to delete",

        `${cycleName} (${completedDate})`

    );

}


// ===============================
// SEARCH
// ===============================

function getSearchValue() {

    const searchInput =
        document.getElementById("historySearch");

    if (!searchInput) return "";

    return searchInput.value.trim();

}


function searchHistory() {

    const value =
        getSearchValue();


    displaySundayHistory(value);

    renderAttendanceCycles(value);

}


function clearHistorySearch() {

    const searchInput =
        document.getElementById("historySearch");

    if (searchInput) {

        searchInput.value = "";

    }


    displaySundayHistory("");

    renderAttendanceCycles("");

}


// ===============================
// ADMIN PERMISSION
// ===============================

function applyAdminPermission() {

    const isVisitor =
        document.body.classList.contains("visitor");


    if (!isVisitor) return;


    document
        .querySelectorAll(".admin-only")
        .forEach(element => {

            element.style.display = "none";

        });

}


// ===============================
// PAGE INITIALIZATION
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const searchInput =
            document.getElementById("historySearch");


        const clearButton =
            document.getElementById("clearHistorySearch");


        const cancelButton =
            document.getElementById("cancelDeleteBtn");


        const confirmButton =
            document.getElementById("confirmDeleteBtn");


        const modal =
            document.getElementById("deleteModal");


        // Search
        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchHistory
            );

        }


        // Clear search
        if (clearButton) {

            clearButton.addEventListener(
                "click",
                clearHistorySearch
            );

        }


        // Cancel delete
        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeDeleteModal
            );

        }


        // Confirm delete
        if (confirmButton) {

            confirmButton.addEventListener(
                "click",
                confirmDelete
            );

        }


        // Close modal by clicking outside
        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        closeDeleteModal();

                    }

                }
            );

        }


        // Wait for Firebase/app data
        waitForAppReady(() => {

            displaySundayHistory();

            applyAdminPermission();

        });


        // Attendance history
        loadAttendanceCycleHistory();

    }
);


// ===============================
// WINDOW FUNCTIONS
// ===============================

window.displaySundayHistory =
    displaySundayHistory;

window.searchHistory =
    searchHistory;

window.clearHistorySearch =
    clearHistorySearch;

window.requestDeleteSundayHistory =
    requestDeleteSundayHistory;

window.requestDeleteAttendanceCycle =
    requestDeleteAttendanceCycle;

window.closeDeleteModal =
    closeDeleteModal;

window.confirmDelete =
    confirmDelete;

window.loadAttendanceCycleHistory =
    loadAttendanceCycleHistory;