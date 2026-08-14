// ==========================================
// TAKE ATTENDANCE SYSTEM
// ==========================================

import {
    choirs
} from "../script1.js";

import {
    db,
    ref,
    get,
    set
} from "../firebase.js";


// ==========================================
// SETTINGS
// ==========================================

const ATTENDANCE_LIMITS = {

    zoom: 30,

    saturday: 4,

    sunday: 4

};


let currentType = "zoom";


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const dateInput =
            document.getElementById(
                "attendanceDate"
            );


        // Today's date
        if (dateInput) {

            dateInput.value =
                new Date()
                .toISOString()
                .split("T")[0];

        }


        await waitForAppData();


        displayMembers();


        await loadCycleSummary();

    }
);


// ==========================================
// WAIT FOR APP DATA
// ==========================================

async function waitForAppData() {

    let attempts = 0;


    while (

        (
            !window.appReady ||
            !Array.isArray(choirs)
        )

        &&

        attempts < 50

    ) {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );


        attempts++;

    }

}


// ==========================================
// SELECT ATTENDANCE TYPE
// ==========================================

function selectAttendanceType(type) {

    currentType = type;


    document
        .querySelectorAll(
            ".attendance-type"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const selectedButton =
        document.querySelector(
            `.attendance-type[data-type="${type}"]`
        );


    if (selectedButton) {

        selectedButton.classList.add(
            "active"
        );

    }


    const title =
        document.getElementById(
            "attendanceTitle"
        );


    if (!title) return;


    if (type === "zoom") {

        title.innerText =
            "💻 Zoom Attendance";

    }


    if (type === "saturday") {

        title.innerText =
            "🎵 Saturday Practice";

    }


    if (type === "sunday") {

        title.innerText =
            "⛪ Sunday Practice";

    }


    displayMembers();

}


// ==========================================
// GET ALL MEMBERS
// ==========================================

function getAllMembers() {

    const allMembers = [];


    if (!Array.isArray(choirs)) {

        return allMembers;

    }


    choirs.forEach(
        choir => {

            const members =
                choir.members || [];


            members.forEach(
                (member, index) => {

                    allMembers.push({

                        choirId:
                            choir.id,

                        choirName:
                            choir.name,

                        memberName:
                            member,

                        index:
                            index

                    });

                }
            );

        }
    );


    return allMembers;

}


// ==========================================
// MEMBER KEY
// ==========================================

function createMemberKey(member) {

    return (

        member.choirId +

        "_" +

        encodeURIComponent(
            member.memberName
        )

    );

}


// ==========================================
// DISPLAY MEMBERS
// ==========================================

// ==========================================
// DISPLAY MEMBERS
// ==========================================
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
function displayMembers() {

    const box =
        document.getElementById(
            "attendanceMembers"
        );

    if (!box) return;


    const members =
        getAllMembers();


    box.innerHTML = "";


    // ==================================
    // NO MEMBERS
    // ==================================

    if (members.length === 0) {

        box.innerHTML = `

            <div class="take-empty">

                <div class="take-empty-icon">
                    👥
                </div>

                <h3>
                    No Choir Members Found
                </h3>

                <p>
                    Please add members from the Choir page.
                </p>

            </div>

        `;

        return;

    }


    // ==================================
    // DISPLAY ALL MEMBERS
    // WITHOUT CHOIR HEADINGS
    // ==================================

    members.forEach(
        (member, index) => {

            box.innerHTML += `

                <div class="take-member-row">

                    <!-- MEMBER INFO -->
                    <div class="take-member-info">

                        <div class="take-member-avatar">
                            👤
                        </div>

                        <div>

                            <div class="take-member-name">

                                ${escapeHTML(
                                    member.memberName
                                )}

                            </div>

                        </div>

                    </div>


                    <!-- ACTIONS -->
                    <div class="take-member-actions">

                        <label class="take-check">

                            <input
                                type="checkbox"
                                class="member-checkbox"
                                data-index="${index}"
                            >

                            <span>
                                Present
                            </span>

                        </label>


                        <button
                            type="button"
                            class="member-view-btn"
                            onclick="openMemberAttendance(
                                '${createMemberKey(member)}'
                            )">

                            📊

                        </button>

                    </div>

                </div>

            `;

        }
    );

}


// ==========================================
// SELECT ALL
// ==========================================

function selectAllMembers() {

    const checkboxes =
        document.querySelectorAll(
            ".member-checkbox"
        );


    checkboxes.forEach(
        checkbox => {

            checkbox.checked =
                true;

        }
    );

}


// ==========================================
// SAVE ATTENDANCE
// ==========================================

async function saveAttendance() {

    const dateInput =
        document.getElementById(
            "attendanceDate"
        );


    const date =
        dateInput
            ? dateInput.value
            : "";


    if (!date) {

        alert(
            "Please select attendance date."
        );

        return;

    }


    const members =
        getAllMembers();


    if (members.length === 0) {

        alert(
            "No choir members available."
        );

        return;

    }


    const checkboxes =
        document.querySelectorAll(
            ".member-checkbox"
        );


    const presentMembers = [];


    const absentMembers = [];


    checkboxes.forEach(
        (checkbox, index) => {

            const member =
                members[index];


            if (!member) return;


            if (checkbox.checked) {

                presentMembers.push(
                    member
                );

            }
            else {

                absentMembers.push(
                    member
                );

            }

        }
    );


    const typeName =
        getTypeName(
            currentType
        );


    const confirmed =
        confirm(

            `${typeName}\n\n` +

            `Date: ${date}\n\n` +

            `✅ Present: ${
                presentMembers.length
            }\n` +

            `❌ Absent: ${
                absentMembers.length
            }\n\n` +

            `Save attendance?`

        );


    if (!confirmed) return;


    try {

        const attendanceRef =
            ref(
                db,
                "attendance/currentCycle"
            );


        const snapshot =
            await get(
                attendanceRef
            );


        let data =
            snapshot.exists()
                ? snapshot.val()
                : createNewCycle();


        // ==================================
        // MAKE SURE SESSIONS EXIST
        // ==================================

        if (!data.sessions) {

            data.sessions = {};

        }


        if (
            !data.sessions[currentType]
        ) {

            data.sessions[currentType] = {

                count: 0,

                records: []

            };

        }


        if (
            !Array.isArray(
                data
                    .sessions[
                        currentType
                    ]
                    .records
            )
        ) {

            data
                .sessions[
                    currentType
                ]
                .records = [];

        }


        // ==================================
        // CURRENT COUNT
        // ==================================

        const records =
            data
                .sessions[
                    currentType
                ]
                .records;


        const currentCount =
            records.length;


        const limit =
            ATTENDANCE_LIMITS[
                currentType
            ];


        // ==================================
        // LIMIT CHECK
        // ==================================

        if (
            currentCount >= limit
        ) {

            alert(

                `${typeName} has already reached ` +

                `${limit} sessions in this cycle.\n\n` +

                `Please complete the other ` +

                `attendance types before starting ` +

                `the next cycle.`

            );

            return;

        }


        // ==================================
        // DUPLICATE DATE
        // ==================================

        const alreadyTaken =
            records.some(
                session =>
                    session.date === date
            );


        if (alreadyTaken) {

            alert(

                `Attendance for ${date} ` +

                `has already been saved.`

            );

            return;

        }


        // ==================================
        // CREATE RECORD
        // ==================================

        const newRecord = {

            date: date,

            present:
                presentMembers.map(
                    member =>
                        createMemberKey(
                            member
                        )
                ),

            absent:
                absentMembers.map(
                    member =>
                        createMemberKey(
                            member
                        )
                )

        };


        records.push(
            newRecord
        );


        // ==================================
        // UPDATE COUNT
        // ==================================

        data
            .sessions[
                currentType
            ]
            .count =
                records.length;


        // ==================================
        // SAVE FIREBASE
        // ==================================

        await set(
            attendanceRef,
            data
        );


        alert(
            "✅ Attendance saved successfully."
        );


        // ==================================
        // UPDATE UI
        // ==================================

        await loadCycleSummary();


        checkboxes.forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );

    }
    catch (error) {

        console.error(
            "Attendance save error:",
            error
        );


        alert(

            "❌ Attendance save failed.\n\n" +

            error.message

        );

    }

}


// ==========================================
// CREATE NEW CYCLE
// ==========================================

function createNewCycle(
    cycleNumber = 1
) {

    return {

        cycleName:
            "Cycle " +
            cycleNumber,

        cycleNumber:
            cycleNumber,

        sessions: {

            zoom: {

                count: 0,

                records: []

            },

            saturday: {

                count: 0,

                records: []

            },

            sunday: {

                count: 0,

                records: []

            }

        }

    };

}


// ==========================================
// TYPE NAME
// ==========================================

function getTypeName(type) {

    if (type === "zoom") {

        return "💻 Zoom Attendance";

    }


    if (type === "saturday") {

        return "🎵 Saturday Practice";

    }


    if (type === "sunday") {

        return "⛪ Sunday Practice";

    }


    return "Attendance";

}


// ==========================================
// LOAD CYCLE SUMMARY
// ==========================================

async function loadCycleSummary() {

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "attendance/currentCycle"
                )
            );


        const data =
            snapshot.exists()
                ? snapshot.val()
                : createNewCycle();


        // ==================================
        // CYCLE NAME
        // ==================================

        const cycleName =
            document.getElementById(
                "cycleName"
            );


        if (cycleName) {

            cycleName.innerText =
                data.cycleName ||
                "Cycle 1";

        }


        // ==================================
        // COUNTS
        // ==================================

        const zoom =
            data.sessions
                ?.zoom
                ?.count || 0;


        const saturday =
            data.sessions
                ?.saturday
                ?.count || 0;


        const sunday =
            data.sessions
                ?.sunday
                ?.count || 0;


        const zoomCount =
            document.getElementById(
                "zoomCount"
            );


        const saturdayCount =
            document.getElementById(
                "saturdayCount"
            );


        const sundayCount =
            document.getElementById(
                "sundayCount"
            );


        if (zoomCount) {

            zoomCount.innerText =
                `${zoom} / 30`;

        }


        if (saturdayCount) {

            saturdayCount.innerText =
                `${saturday} / 4`;

        }


        if (sundayCount) {

            sundayCount.innerText =
                `${sunday} / 4`;

        }

    }
    catch (error) {

        console.error(
            "Cycle load error:",
            error
        );

    }

}


// ==========================================
// FIND MEMBER
// ==========================================

function findMemberByKey(memberKey) {

    const members =
        getAllMembers();


    return members.find(
        member =>
            createMemberKey(member)
            === memberKey
    );

}


// ==========================================
// CALCULATE MEMBER ATTENDANCE
// ==========================================

function calculateMemberAttendance(
    data,
    type,
    memberKey
) {

    const records =
        data
            .sessions
            ?.[
                type
            ]
            ?.records || [];


    const total =
        records.length;


    let present = 0;


    records.forEach(
        record => {

            if (
                (record.present || [])
                    .includes(memberKey)
            ) {

                present++;

            }

        }
    );


    const percentage =
        total > 0

            ? Math.round(
                (
                    present /
                    total
                ) * 100
            )

            : 0;


    return {

        present:
            present,

        total:
            total,

        percentage:
            percentage

    };

}

// ==========================================
// UPDATE MEMBER DONUT CHART
// ==========================================

function updateMemberDonutChart(present, total) {

    present = Number(present) || 0;
    total = Number(total) || 0;

    const absent = Math.max(total - present, 0);

    const percentage =
        total > 0
            ? Math.round((present / total) * 100)
            : 0;

    const chart =
        document.getElementById("memberDonutChart");

    const percentageText =
        document.getElementById("donutPercentage");

    const presentText =
        document.getElementById("donutPresent");

    const absentText =
        document.getElementById("donutAbsent");


    if (!chart) {
        console.error("❌ memberDonutChart not found");
        return;
    }


    // DONUT
    chart.style.background =
        `conic-gradient(
            #22c55e 0% ${percentage}%,
            #ef4444 ${percentage}% 100%
        )`;


    // CENTER
    if (percentageText) {
        percentageText.innerText =
            `${percentage}%`;
    }


    // PRESENT
    if (presentText) {

        const presentPercentage =
            total > 0
                ? Math.round((present / total) * 100)
                : 0;

        presentText.innerText =
            `${present} (${presentPercentage}%)`;
    }


    // ABSENT
    if (absentText) {

        const absentPercentage =
            total > 0
                ? Math.round((absent / total) * 100)
                : 0;

        absentText.innerText =
            `${absent} (${absentPercentage}%)`;
    }
}
// ==========================================
// OPEN MEMBER ATTENDANCE
// ==========================================

// ==========================================
// MEMBER ATTENDANCE POPUP
// ==========================================

// ==========================================
// OPEN MEMBER ATTENDANCE
// ==========================================

async function openMemberAttendance(memberKey) {

    try {

        // ==================================
        // GET CURRENT CYCLE
        // ==================================

        const snapshot =
            await get(
                ref(
                    db,
                    "attendance/currentCycle"
                )
            );


        if (!snapshot.exists()) {

            alert(
                "No attendance record available."
            );

            return;

        }


        const data =
            snapshot.val();


        // ==================================
        // FIND MEMBER
        // ==================================

        const member =
            findMemberByKey(memberKey);


        if (!member) {

            alert(
                "Member not found."
            );

            return;

        }


        // ==================================
        // MEMBER NAME
        // ==================================

        const nameElement =
            document.getElementById(
                "attendanceMemberName"
            );


        if (nameElement) {

            nameElement.innerText =
                "👤 " +
                member.memberName;

        }


        // ==================================
        // CALCULATE ATTENDANCE
        // ==================================

        const zoom =
            calculateMemberAttendance(
                data,
                "zoom",
                memberKey
            );


        const saturday =
            calculateMemberAttendance(
                data,
                "saturday",
                memberKey
            );


        const sunday =
            calculateMemberAttendance(
                data,
                "sunday",
                memberKey
            );


        // ==================================
        // UPDATE THREE ATTENDANCE CARDS
        // ==================================

        displayMemberResult(
            "Zoom",
            zoom
        );


        displayMemberResult(
            "Saturday",
            saturday
        );


        displayMemberResult(
            "Sunday",
            sunday
        );


        // ==================================
        // OVERALL ATTENDANCE
        // ==================================

        const totalPresent =
            zoom.present +
            saturday.present +
            sunday.present;


        const totalSessions =
            zoom.total +
            saturday.total +
            sunday.total;


        const overall =
            totalSessions > 0
                ? Math.round(
                    (
                        totalPresent /
                        totalSessions
                    ) * 100
                )
                : 0;


        // ==================================
        // UPDATE DONUT CHART
        // ==================================

        updateMemberDonutChart(
            totalPresent,
            totalSessions
        );


        // ==================================
        // UPDATE OVERALL %
        // ==================================

        const overallPercentage =
            document.getElementById(
                "memberOverallPercentage"
            );


        if (overallPercentage) {

            overallPercentage.innerText =
                overall + "%";

        }


        // ==================================
        // UPDATE OVERALL COUNT
        // ==================================

        const overallCount =
            document.getElementById(
                "memberOverallCount"
            );


        if (overallCount) {

            overallCount.innerText =
                `${totalPresent} / ${totalSessions} Present`;

        }


        // ==================================
        // UPDATE OVERALL PROGRESS
        // ==================================

        const overallProgress =
            document.getElementById(
                "memberOverallProgress"
            );


        if (overallProgress) {

            overallProgress.style.width =
                overall + "%";

        }


        // ==================================
        // OPEN MODAL
        // ==================================

        const modal =
            document.getElementById(
                "memberAttendanceModal"
            );


        if (!modal) {

            console.error(
                "❌ memberAttendanceModal not found"
            );

            return;

        }


        // Remove old state first
        modal.classList.remove(
            "take-modal-open"
        );


        // Clear old inline display
        modal.style.display = "";


        // Force browser to process the reset
        void modal.offsetWidth;


        // Open again
        modal.classList.add(
            "take-modal-open"
        );


        // Make sure it is visible
        modal.style.display = "flex";

    }

    catch (error) {

        console.error(
            "❌ Member attendance error:",
            error
        );


        alert(
            "Unable to load attendance.\n\n" +
            error.message
        );

    }

}


// ==========================================
// UPDATE ATTENDANCE CARD
// ==========================================

function updateAttendanceCard(
    percentageId,
    countId,
    progressId,
    result
) {

    const percentage =
        Number(result?.percentage) || 0;

    const present =
        Number(result?.present) || 0;

    const total =
        Number(result?.total) || 0;


    const percentageElement =
        document.getElementById(
            percentageId
        );


    const countElement =
        document.getElementById(
            countId
        );


    const progressElement =
        document.getElementById(
            progressId
        );


    if (percentageElement) {

        percentageElement.innerText =
            percentage + "%";

    }


    if (countElement) {

        countElement.innerText =
            `${present} / ${total}`;

    }


    if (progressElement) {

        progressElement.style.width =
            percentage + "%";

    }

}

// ==========================================
// DISPLAY MEMBER RESULT
// ==========================================

function displayMemberResult(
    type,
    result
) {

    let percentageId = "";

    let countId = "";

    let progressId = "";


    if (type === "Zoom") {

        percentageId =
            "memberZoomPercentage";

        countId =
            "memberZoomCount";

        progressId =
            "memberZoomProgress";

    }


    if (type === "Saturday") {

        percentageId =
            "memberSaturdayPercentage";

        countId =
            "memberSaturdayCount";

        progressId =
            "memberSaturdayProgress";

    }


    if (type === "Sunday") {

        percentageId =
            "memberSundayPercentage";

        countId =
            "memberSundayCount";

        progressId =
            "memberSundayProgress";

    }


    const percentage =
        document.getElementById(
            percentageId
        );


    const count =
        document.getElementById(
            countId
        );


    const progress =
        document.getElementById(
            progressId
        );


    if (percentage) {

        percentage.innerText =
            result.percentage + "%";

    }


    if (count) {

        count.innerText =
            `${result.present} / ${result.total}`;

    }


    if (progress) {

        progress.style.width =
            result.percentage + "%";

    }

}


// ==========================================
// CLOSE MEMBER ATTENDANCE
// ==========================================

// ==========================================
// CLOSE MEMBER ATTENDANCE
// ==========================================

function closeMemberAttendance() {

    const modal =
        document.getElementById(
            "memberAttendanceModal"
        );


    if (!modal) return;


    modal.classList.remove(
        "take-modal-open"
    );


    modal.style.display =
        "none";

}


// ==========================================
// START NEW CYCLE
// ==========================================

async function startNewCycle() {

    try {

        const attendanceRef =
            ref(
                db,
                "attendance/currentCycle"
            );


        const snapshot =
            await get(
                attendanceRef
            );


        if (!snapshot.exists()) {

            alert(
                "No current cycle available."
            );

            return;

        }


        const currentCycle =
            snapshot.val();


        // ==================================
        // CALCULATE SUMMARY
        // ==================================

        const summary =
            calculateCycleSummary(
                currentCycle
            );


        const confirmed =
            confirm(

                `🔄 Start New Cycle?\n\n` +

                `${currentCycle.cycleName || "Current Cycle"}\n\n` +

                `💻 Zoom: ` +
                `${summary.zoom.present} / ${summary.zoom.total}\n` +

                `🎵 Saturday: ` +
                `${summary.saturday.present} / ${summary.saturday.total}\n` +

                `⛪ Sunday: ` +
                `${summary.sunday.present} / ${summary.sunday.total}\n\n` +

                `📊 Overall: ` +
                `${summary.overall}%\n\n` +

                `Current cycle will be saved to history.`

            );


        if (!confirmed) return;


        // ==================================
        // SAVE HISTORY
        // ==================================

        const historyRef =
            ref(
                db,
                "attendance/history"
            );


        const historySnapshot =
            await get(
                historyRef
            );


        let history =
            historySnapshot.exists()
                ? historySnapshot.val()
                : {};


        if (
            !history ||
            typeof history !== "object"
        ) {

            history = {};

        }


        const oldCycleNumber =
            currentCycle.cycleNumber || 1;


        const historyId =
            "cycle_" +
            oldCycleNumber;


        history[historyId] = {

            cycleName:
                currentCycle.cycleName ||
                "Cycle " +
                oldCycleNumber,

            cycleNumber:
                oldCycleNumber,

            completedAt:
                new Date().toISOString(),

            summary: {

                zoom: {

                    present:
                        summary.zoom.present,

                    total:
                        summary.zoom.total

                },

                saturday: {

                    present:
                        summary.saturday.present,

                    total:
                        summary.saturday.total

                },

                sunday: {

                    present:
                        summary.sunday.present,

                    total:
                        summary.sunday.total

                },

                overall: {

                    present:
                        summary.totalPresent,

                    total:
                        summary.totalSessions,

                    percentage:
                        summary.overall

                }

            },

            sessions:
                currentCycle.sessions || {}

        };


        await set(
            historyRef,
            history
        );


        // ==================================
        // CREATE NEXT CYCLE
        // ==================================

        const nextCycleNumber =
            oldCycleNumber + 1;


        const newCycle =
            createNewCycle(
                nextCycleNumber
            );


        await set(
            attendanceRef,
            newCycle
        );


        // ==================================
        // UPDATE UI
        // ==================================

        await loadCycleSummary();


        const checkboxes =
            document.querySelectorAll(
                ".member-checkbox"
            );


        checkboxes.forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );


        alert(

            `✅ ${
                currentCycle.cycleName ||
                "Current Cycle"
            } saved to History.\n\n` +

            `🔄 Cycle ${
                nextCycleNumber
            } started.`

        );

    }
    catch (error) {

        console.error(
            "Start new cycle error:",
            error
        );


        alert(

            "❌ Unable to start new cycle.\n\n" +

            error.message

        );

    }

}


// ==========================================
// CYCLE SUMMARY CALCULATOR
// ==========================================

function calculateCycleSummary(
    cycle
) {

    const types = [
        "zoom",
        "saturday",
        "sunday"
    ];


    const result = {

        zoom: {
            present: 0,
            total: 0
        },

        saturday: {
            present: 0,
            total: 0
        },

        sunday: {
            present: 0,
            total: 0
        },

        totalPresent: 0,

        totalSessions: 0,

        overall: 0

    };


    types.forEach(
        type => {

            const records =
                cycle
                    .sessions
                    ?.[
                        type
                    ]
                    ?.records || [];


            records.forEach(
                record => {

                    const present =
                        (
                            record.present ||
                            []
                        ).length;


                    const absent =
                        (
                            record.absent ||
                            []
                        ).length;


                    result[type].present +=
                        present;


                    result[type].total +=
                        present +
                        absent;

                }
            );

        }
    );


    result.totalPresent =
        result.zoom.present +
        result.saturday.present +
        result.sunday.present;


    result.totalSessions =
        result.zoom.total +
        result.saturday.total +
        result.sunday.total;


    result.overall =
        result.totalSessions > 0

            ? Math.round(
                (
                    result.totalPresent /
                    result.totalSessions
                ) * 100
            )

            : 0;


    return result;

}


// ==========================================
// WINDOW FUNCTIONS
// ==========================================

window.selectAttendanceType =
    selectAttendanceType;


window.selectAllMembers =
    selectAllMembers;


window.saveAttendance =
    saveAttendance;


window.openMemberAttendance =
    openMemberAttendance;


window.closeMemberAttendance =
    closeMemberAttendance;


window.startNewCycle =
    startNewCycle;