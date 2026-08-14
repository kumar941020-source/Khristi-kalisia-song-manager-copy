// ==========================================
// SUNDAY HISTORY PAGE
// ==========================================

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


// ==========================================
// DISPLAY SUNDAY HISTORY
// ==========================================

function displaySundayHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );

    if (!container) return;


    container.innerHTML = "";


    const history =
        [...getSundayHistory()].reverse();


    // ======================================
    // NO HISTORY
    // ======================================

    if (history.length === 0) {

        container.innerHTML = `

            <div class="cycle-empty">

                <div style="font-size:35px;">
                    📅
                </div>

                <h3>
                    No Sunday History Available
                </h3>

                <p>
                    Previous Sunday plans will appear here.
                </p>

            </div>

        `;

        return;

    }


    // ======================================
    // CREATE EACH SUNDAY CARD
    // ======================================

    history.forEach(plan => {

        const fastSongs =
            Array.isArray(plan.fastSongs)
                ? plan.fastSongs
                : [];


        const slowSongs =
            Array.isArray(plan.slowSongs)
                ? plan.slowSongs
                : [];


        // ==================================
        // FAST SONGS
        // ==================================

        let fastList = "";


        if (fastSongs.length > 0) {

            fastSongs.forEach(song => {

                const songName =
                    typeof song === "object"
                        ? song.name
                        : song;


                fastList += `

                    <div class="history-song">

                        <span>
                            🔥
                        </span>

                        <span>
                            ${escapeHTML(songName)}
                        </span>

                    </div>

                `;

            });

        }
        else {

            fastList = `

                <p class="history-empty">
                    No fast songs
                </p>

            `;

        }


        // ==================================
        // SLOW SONGS
        // ==================================

        let slowList = "";


        if (slowSongs.length > 0) {

            slowSongs.forEach(song => {

                const songName =
                    typeof song === "object"
                        ? song.name
                        : song;


                slowList += `

                    <div class="history-song">

                        <span>
                            ❤️
                        </span>

                        <span>
                            ${escapeHTML(songName)}
                        </span>

                    </div>

                `;

            });

        }
        else {

            slowList = `

                <p class="history-empty">
                    No slow songs
                </p>

            `;

        }


        // ==================================
        // SUNDAY CARD
        // ==================================

        container.innerHTML += `

            <div class="attendance-record-card history-card">

                <div class="history-header">

                    <div>

                        <h3>
                            ⛪ Sunday Worship
                        </h3>

                        <p>
                            📅 ${escapeHTML(plan.date || "-")}
                        </p>

                    </div>

                </div>


                <div class="attendance-record history-song-section">

                    <div>

                        <h4>
                            🔥 Fast Songs
                        </h4>

                        <div class="history-song-list">

                            ${fastList}

                        </div>

                    </div>

                </div>


                <div class="attendance-record history-song-section">

                    <div>

                        <h4>
                            ❤️ Slow Songs
                        </h4>

                        <div class="history-song-list">

                            ${slowList}

                        </div>

                    </div>

                </div>


                <div class="history-actions">

                    <button
                        class="btn-danger admin-only"
                        onclick="
                            deleteSundayHistory(
                                '${plan.id}'
                            )
                        ">

                        🗑 Delete

                    </button>

                </div>

            </div>

        `;

    });


    applyAdminPermission();

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
// ADMIN PERMISSION
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
// DELETE SUNDAY HISTORY
// ==========================================

async function deleteSundayHistory(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this Sunday history?"
        );


    if (!confirmed) return;


    try {

        await deleteHistory(id);


        displaySundayHistory();

    }
    catch (error) {

        console.error(
            "Delete history error:",
            error
        );


        alert(
            "❌ Unable to delete history."
        );

    }

}


// ==========================================
// LOAD ATTENDANCE CYCLE HISTORY
// ==========================================

async function loadAttendanceCycleHistory() {

    const container =
        document.getElementById(
            "attendanceCycleHistory"
        );


    if (!container) return;


    try {

        const historyRef =
            ref(
                db,
                "attendance/history"
            );


        const snapshot =
            await get(
                historyRef
            );


        if (!snapshot.exists()) {

            container.innerHTML = `

                <div class="cycle-empty">

                    <div style="font-size:35px;">
                        📊
                    </div>

                    <h3>
                        No Attendance Cycles
                    </h3>

                    <p>
                        Completed attendance cycles will appear here.
                    </p>

                </div>

            `;

            return;

        }


        const history =
            snapshot.val();


        const cycles =
            Object.entries(history)
                .map(
                    ([key, cycle]) => ({

                        key:
                            key,

                        ...cycle

                    })
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        (
                            b.cycleNumber || 0
                        ) -
                        (
                            a.cycleNumber || 0
                        )
                );


        container.innerHTML = "";


        cycles.forEach(
            cycle => {

                const summary =
                    cycle.summary || {};


                const zoom =
                    summary.zoom || {};


                const saturday =
                    summary.saturday || {};


                const sunday =
                    summary.sunday || {};


                const overall =
                    summary.overall || {};


                const completedDate =
                    cycle.completedAt
                        ? new Date(
                            cycle.completedAt
                        ).toLocaleDateString()
                        : "-";


                container.innerHTML += `

                    <div class="cycle-history-card">


                        <!-- HEADER -->

                        <div class="cycle-history-header">


                            <div class="cycle-history-name">

                                <div class="cycle-history-icon">

                                    🔄

                                </div>


                                <div>

                                    <h3>

                                        ${escapeHTML(
                                            cycle.cycleName ||
                                            "Attendance Cycle"
                                        )}

                                    </h3>


                                    <p>

                                        Completed:
                                        ${completedDate}

                                    </p>

                                </div>

                            </div>


                            <!-- DELETE -->

                            <button
                                type="button"
                                class="cycle-delete-btn admin-only"
                                onclick="
                                    deleteAttendanceCycle(
                                        '${cycle.key}'
                                    )
                                ">

                                🗑 Delete

                            </button>

                        </div>


                        <!-- SUMMARY -->

                        <div class="cycle-summary-grid">


                            <!-- ZOOM -->

                            <div class="cycle-summary-item">

                                <span>
                                    💻 Zoom
                                </span>

                                <strong>

                                    ${
                                        zoom.present || 0
                                    }
                                    /
                                    ${
                                        zoom.total || 0
                                    }

                                </strong>

                            </div>


                            <!-- SATURDAY -->

                            <div class="cycle-summary-item">

                                <span>
                                    🎵 Saturday
                                </span>

                                <strong>

                                    ${
                                        saturday.present || 0
                                    }
                                    /
                                    ${
                                        saturday.total || 0
                                    }

                                </strong>

                            </div>


                            <!-- SUNDAY -->

                            <div class="cycle-summary-item">

                                <span>
                                    ⛪ Sunday
                                </span>

                                <strong>

                                    ${
                                        sunday.present || 0
                                    }
                                    /
                                    ${
                                        sunday.total || 0
                                    }

                                </strong>

                            </div>


                            <!-- OVERALL -->

                            <div class="cycle-summary-item cycle-overall">

                                <span>
                                    📊 Overall
                                </span>

                                <strong>

                                    ${
                                        overall.percentage || 0
                                    }%

                                </strong>

                            </div>


                        </div>


                    </div>

                `;

            }
        );


        applyAdminPermission();

    }
    catch (error) {

        console.error(
            "Attendance cycle history error:",
            error
        );


        container.innerHTML = `

            <div class="cycle-empty">

                ❌ Unable to load attendance cycle history.

            </div>

        `;

    }

}


// ==========================================
// DELETE ATTENDANCE CYCLE
// ==========================================

async function deleteAttendanceCycle(
    cycleKey
) {

    const confirmed =
        confirm(

            "⚠️ Delete Attendance Cycle?\n\n" +

            "This will permanently delete this completed cycle from Attendance History.\n\n" +

            "This action cannot be undone."

        );


    if (!confirmed) return;


    try {

        const cycleRef =
            ref(
                db,
                "attendance/history/" +
                cycleKey
            );


        await remove(
            cycleRef
        );


        alert(
            "✅ Attendance cycle deleted successfully."
        );


        await loadAttendanceCycleHistory();

    }
    catch (error) {

        console.error(
            "Delete attendance cycle error:",
            error
        );


        alert(

            "❌ Unable to delete attendance cycle.\n\n" +
            error.message

        );

    }

}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        displaySundayHistory();

        await loadAttendanceCycleHistory();

    }
);


// ==========================================
// WINDOW FUNCTIONS
// ==========================================

window.displaySundayHistory =
    displaySundayHistory;


window.deleteSundayHistory =
    deleteSundayHistory;


window.loadAttendanceCycleHistory =
    loadAttendanceCycleHistory;


window.deleteAttendanceCycle =
    deleteAttendanceCycle;


window.deleteHistory =
    deleteHistory;