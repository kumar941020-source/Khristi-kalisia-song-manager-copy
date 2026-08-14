// ==========================================
// CHOIR ATTENDANCE SYSTEM
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


        // Attendance date
        if (dateInput) {

            dateInput.value =
                new Date()
                .toISOString()
                .split("T")[0];

        }


        // Wait for choir/member data
        await waitForAppData();


        // ==================================
        // NORMAL ATTENDANCE PAGE
        // ==================================

        if (
            document.getElementById(
                "attendanceMembers"
            )
        ) {

            displayMembers();

        }


        // ==================================
        // INDIVIDUAL ATTENDANCE PAGE
        // ==================================

        if (
            document.getElementById(
                "individualMembers"
            )
        ) {

            displayIndividualMembers();

        }


        // ==================================
        // OTHER ATTENDANCE DATA
        // ==================================

        loadCycleSummary();

        displayAttendanceRecords();

    }
);
// ==========================================
// WAIT FOR FIREBASE DATA
// ==========================================

async function waitForAppData() {

    let attempts = 0;

    while (
        (!window.appReady ||
        !Array.isArray(choirs)) &&
        attempts < 50
    ) {

        await new Promise(
            resolve =>
                setTimeout(resolve, 100)
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


    event.currentTarget.classList.add(
        "active"
    );


    const title =
        document.getElementById(
            "attendanceTitle"
        );


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

    let allMembers = [];


    choirs.forEach(choir => {

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

    });


    return allMembers;

}


// ==========================================
// DISPLAY MEMBERS
// ==========================================

function displayMembers() {

    const box =
        document.getElementById(
            "attendanceMembers"
        );


    if (!box) return;


    box.innerHTML = "";


    const members =
        getAllMembers();


    if (members.length === 0) {

        box.innerHTML = `

            <p>
                No choir members available.
            </p>

        `;

        return;

    }


    let lastChoir = "";


    members.forEach(
        (member, index) => {


            if (
                lastChoir !==
                member.choirName
            ) {

                box.innerHTML += `

                    <h3 class="choir-heading">

                        🎤
                        ${member.choirName}

                    </h3>

                `;


                lastChoir =
                    member.choirName;

            }


            box.innerHTML += `

                <div
                    class="attendance-member">

                    <div
                        class="member-info">

                        <span
                            class="member-name">

                            👤
                            ${member.memberName}

                        </span>

                        <span
                            class="member-choir">

                            ${member.choirName}

                        </span>

                    </div>


<div class="member-attendance-actions">

    <input
        type="checkbox"
        class="member-checkbox"
        data-index="${index}"
    >

    <button
        class="btn-primary"
        onclick="openMemberAttendance('${createMemberKey(member)}')">

        📊 Attendance

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

            checkbox.checked = true;

        }

    );

}


// ==========================================
// SAVE ATTENDANCE
// ==========================================

async function saveAttendance() {

    const date =
        document.getElementById(
            "attendanceDate"
        ).value;


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


    checkboxes.forEach(
        (checkbox, index) => {

            if (checkbox.checked) {

                presentMembers.push(
                    members[index]
                );

            }

        }
    );


    const absentMembers =
        members.filter(
            (_, index) =>
                !checkboxes[index].checked
        );


    const typeName =
        getTypeName(
            currentType
        );


    const confirmed =
        confirm(

            `${typeName}\n\n` +

            `Date: ${date}\n` +

            `Present: ${
                presentMembers.length
            }\n` +

            `Absent: ${
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


        // ----------------------------------
        // LIMIT CHECK
        // ----------------------------------

// ----------------------------------
// MAKE SURE SESSION EXISTS
// ----------------------------------

if (!data.sessions) {

    data.sessions = {};

}

if (!data.sessions[currentType]) {

    data.sessions[currentType] = {

        count: 0,

        records: []

    };

}

if (
    !Array.isArray(
        data.sessions[currentType].records
    )
) {

    data.sessions[currentType].records = [];

}


// ----------------------------------
// CURRENT SESSION COUNT
// ----------------------------------

const currentCount =
    data.sessions[currentType].records.length;


const limit =
    ATTENDANCE_LIMITS[currentType];


// ----------------------------------
// CURRENT TYPE ALREADY COMPLETE
// ----------------------------------

if (currentCount >= limit) {

    alert(

        `${typeName} has already reached ` +
        `${limit} sessions in this cycle.\n\n` +

        `Complete the other attendance types ` +
        `before starting the next cycle.`

    );

    return;

}


// ----------------------------------
// DUPLICATE DATE CHECK
// ----------------------------------

const sessions =
    data.sessions[currentType].records;


const alreadyTaken =
    sessions.some(
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


// ----------------------------------
// SAVE CURRENT ATTENDANCE
// ----------------------------------

data.sessions[currentType].records.push({

    date: date,

    present:
        presentMembers.map(
            member =>
                createMemberKey(member)
        ),

    absent:
        absentMembers.map(
            member =>
                createMemberKey(member)
        )

});


// Update count
data.sessions[currentType].count =
    data.sessions[currentType].records.length;
    // ==========================================
// CHECK WHETHER COMPLETE CYCLE IS FINISHED
// ==========================================


        // ----------------------------------
        // SAVE TO FIREBASE
        // ----------------------------------


        await set(
            attendanceRef,
            data
        );


        alert(
            "✅ Attendance saved successfully."
        );


        await loadCycleSummary();
        await displayAttendanceRecords();
        await loadAttendanceRecords();



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
            "❌ Attendance save failed."
        );

    }

}


// ==========================================
// CREATE NEW CYCLE
// ==========================================

function createNewCycle(cycleNumber = 1) {

    return {

        cycleName: "Cycle " + cycleNumber,

        cycleNumber: cycleNumber,

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
// TYPE NAME
// ==========================================

function getTypeName(type) {

    if (type === "zoom")
        return "💻 Zoom Attendance";


    if (type === "saturday")
        return "🎵 Saturday Practice";


    if (type === "sunday")
        return "⛪ Sunday Practice";


    return "Attendance";

}


// ==========================================
// LOAD CYCLE SUMMARY
// ==========================================

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
        // CHECK ELEMENTS EXIST
        // ==================================

        const cycleName =
            document.getElementById(
                "cycleName"
            );

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


        // ==================================
        // UPDATE ONLY IF ELEMENT EXISTS
        // ==================================

        if (cycleName) {

            cycleName.innerText =
                data.cycleName ||
                "Cycle 1";

        }


        const zoom =
            data.sessions?.zoom?.count ||
            0;


        const saturday =
            data.sessions?.saturday?.count ||
            0;


        const sunday =
            data.sessions?.sunday?.count ||
            0;


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
// MEMBER ATTENDANCE POPUP
// ==========================================
function updateMemberDonutChart(present, total) {

    const presentCount =
        Number(present || 0);

    const totalCount =
        Number(total || 0);

    const absentCount =
        Math.max(
            totalCount - presentCount,
            0
        );

    const percentage =
        totalCount > 0
            ? Math.round(
                (presentCount / totalCount) * 100
            )
            : 0;


    const chart =
        document.getElementById(
            "memberDonutChart"
        );

    const percentageText =
        document.getElementById(
            "donutPercentage"
        );

    const presentText =
        document.getElementById(
            "donutPresent"
        );

    const absentText =
        document.getElementById(
            "donutAbsent"
        );


    if (!chart) return;


    // Donut chart
    chart.style.setProperty(
        "--present-percent",
        percentage + "%"
    );


    chart.style.setProperty(
        "--absent-percent",
        (100 - percentage) + "%"
    );


    if (percentageText) {

        percentageText.innerText =
            percentage + "%";

    }


    if (presentText) {

        const presentPercentage =
            totalCount > 0
                ? Math.round(
                    (presentCount / totalCount) * 100
                )
                : 0;

        presentText.innerText =
            `${presentCount} (${presentPercentage}%)`;

    }


    if (absentText) {

        const absentPercentage =
            totalCount > 0
                ? Math.round(
                    (absentCount / totalCount) * 100
                )
                : 0;

        absentText.innerText =
            `${absentCount} (${absentPercentage}%)`;

    }

}
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
// CALCULATE ATTENDANCE
// ==========================================

function calculateMemberAttendance(
    data,
    type,
    memberKey
) {

    const records =
        data.sessions?.[
            type
        ]?.records || [];


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
                (present / total) * 100
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
// DISPLAY RESULT
// ==========================================

function displayMemberResult(
    type,
    result
) {

    if (type === "Zoom") {

        document.getElementById(
            "memberZoomPercentage"
        ).innerText =
            result.percentage + "%";


        document.getElementById(
            "memberZoomCount"
        ).innerText =

            `${result.present} / ${result.total}`;

    }


    if (type === "Saturday") {

        document.getElementById(
            "memberSaturdayPercentage"
        ).innerText =
            result.percentage + "%";


        document.getElementById(
            "memberSaturdayCount"
        ).innerText =

            `${result.present} / ${result.total}`;

    }


    if (type === "Sunday") {

        document.getElementById(
            "memberSundayPercentage"
        ).innerText =
            result.percentage + "%";


        document.getElementById(
            "memberSundayCount"
        ).innerText =

            `${result.present} / ${result.total}`;

    }

}


// ==========================================
// CLOSE POPUP
// ==========================================

function closeMemberAttendance() {

    document.getElementById(
        "memberAttendanceModal"
    ).style.display =
        "none";

}

// ==========================================
// DISPLAY ATTENDANCE RECORDS
// ==========================================
function applyAdminPermission() {

    const isVisitor =
        document.body.classList.contains("visitor");

    document
        .querySelectorAll(".admin-only")
        .forEach(element => {

            if (isVisitor) {

                element.style.display = "none";

            } else {

                element.style.display = "";

            }

        });

}
async function displayAttendanceRecords() {

    const box =
        document.getElementById(
            "attendanceRecords"
        );

    if (!box) return;

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "attendance/currentCycle"
                )
            );

        if (!snapshot.exists()) {

            box.innerHTML =
                "<p>No attendance records yet.</p>";

            return;

        }

        const data =
            snapshot.val();

        box.innerHTML = "";

        const allRecords = [];

        const types = [
            "zoom",
            "saturday",
            "sunday"
        ];

        types.forEach(type => {

            const records =
                data.sessions?.[type]?.records || [];

            records.forEach(
                (record, index) => {

                    allRecords.push({

                        type: type,

                        record: record,

                        index: index

                    });

                }
            );

        });


        if (allRecords.length === 0) {

            box.innerHTML =
                "<p>No attendance records yet.</p>";

            return;

        }


        // Newest first

        allRecords.reverse();


        allRecords.forEach(item => {

            const record =
                item.record;

            const type =
                getTypeName(item.type);


            const present =
                (record.present || []).length;

            const absent =
                (record.absent || []).length;


            box.innerHTML += `

                <div class="attendance-record">

                    <div>

                        <strong>
                            ${record.date}
                        </strong>

                        <div>
                            ${type}
                        </div>

                    </div>


                    <div class="attendance-record-stats">

                        <span>
                            ✅ ${present}
                        </span>

                        <span>
                            ❌ ${absent}
                        </span>

                    </div>


                    <button
                        class="btn-primary"
                        onclick="editAttendanceRecord(
                            '${item.type}',
                            ${item.index}
                        )">

                         view 

                    </button>

                </div>

            `;

        });
        applyAdminPermission();
// Apply admin/visitor permission to newly created buttons
if (document.body.classList.contains("visitor")) {

    document.querySelectorAll(".admin-only").forEach(el => {

        el.style.display = "none";

    });

}

    }
    catch (error) {

        console.error(
            "Attendance records error:",
            error
        );

        box.innerHTML =
            "<p>Unable to load attendance records.</p>";

    }

}

// ==========================================
// EDIT ATTENDANCE RECORD
// ==========================================

let editingAttendance = null;


async function editAttendanceRecord(type, recordIndex) {

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "attendance/currentCycle"
                )
            );

        if (!snapshot.exists()) {

            alert("Attendance record not found.");

            return;

        }

        const data = snapshot.val();

        const records =
            data.sessions?.[type]?.records || [];

        const record =
            records[recordIndex];

        if (!record) {

            alert("Attendance record not found.");

            return;

        }

        editingAttendance = {

            type: type,

            recordIndex: recordIndex

        };


        // Date

        document.getElementById(
            "editAttendanceDate"
        ).innerText = record.date;


        // Type

        document.getElementById(
            "editAttendanceType"
        ).innerText =
            getTypeName(type);


        const box =
            document.getElementById(
                "editAttendanceMembers"
            );

        box.innerHTML = "";


        const members =
            getAllMembers();


        members.forEach(member => {

            const memberKey =
                createMemberKey(member);


            const isPresent =
                (record.present || [])
                .includes(memberKey);


            box.innerHTML += `

                <div class="attendance-member">

                    <div class="member-info">

                        <span class="member-name">

                            👤 ${member.memberName}

                        </span>

                        <span class="member-choir">

                            ${member.choirName}

                        </span>

                    </div>


                    <input
                        type="checkbox"
                        class="edit-member-checkbox"
                        data-member-key="${memberKey}"
                        ${isPresent ? "checked" : ""}
                    >

                </div>

            `;

        });


        document.getElementById(
            "editAttendanceModal"
        ).style.display = "flex";


    }
    catch (error) {

        console.error(
            "Edit attendance error:",
            error
        );

        alert(
            "Unable to open attendance."
        );

    }

}
// ==========================================
// UPDATE ATTENDANCE RECORD
// ==========================================

async function updateAttendanceRecord() {

    if (!editingAttendance) return;


    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "attendance/currentCycle"
                )
            );


        if (!snapshot.exists()) {

            alert("Attendance record not found.");

            return;

        }


        const data =
            snapshot.val();


        const type =
            editingAttendance.type;


        const index =
            editingAttendance.recordIndex;


        const record =
            data.sessions?.[
                type
            ]?.records?.[
                index
            ];


        if (!record) {

            alert("Attendance record not found.");

            return;

        }


        const checkboxes =
            document.querySelectorAll(
                ".edit-member-checkbox"
            );


        const present = [];

        const absent = [];


        checkboxes.forEach(
            checkbox => {

                const memberKey =
                    checkbox.dataset.memberKey;


                if (checkbox.checked) {

                    present.push(memberKey);

                }
                else {

                    absent.push(memberKey);

                }

            }
        );


        record.present = present;

        record.absent = absent;


        await set(
            ref(
                db,
                "attendance/currentCycle"
            ),
            data
        );


        alert(
            "✅ Attendance updated successfully."
        );


        closeEditAttendance();


        displayAttendanceRecords();


        loadCycleSummary();


    }
    catch (error) {

        console.error(
            "Update attendance error:",
            error
        );

        alert(
            "❌ Attendance update failed."
        );

    }

}


// ==========================================
// CLOSE EDIT POPUP
// ==========================================

function closeEditAttendance() {

    document.getElementById(
        "editAttendanceModal"
    ).style.display = "none";


    editingAttendance = null;

}


window.editAttendanceRecord =
    editAttendanceRecord;

window.updateAttendanceRecord =
    updateAttendanceRecord;

window.closeEditAttendance =
    closeEditAttendance;
window.openMemberAttendance =
    openMemberAttendance;

window.closeMemberAttendance =
    closeMemberAttendance;
// ==========================================
// WINDOW FUNCTIONS
// ==========================================

window.selectAttendanceType =
    selectAttendanceType;

window.selectAllMembers =
    selectAllMembers;

window.saveAttendance =
    saveAttendance;
    // ==========================================
// ATTENDANCE RECORDS
// ==========================================

async function loadAttendanceRecords() {

    const box = document.getElementById("attendanceRecords");

    if (!box) return;

    box.innerHTML = "Loading attendance records...";

    try {

        const snapshot = await get(
            ref(db, "attendance/currentCycle")
        );

        if (!snapshot.exists()) {

            box.innerHTML = `
                <p>No attendance records yet.</p>
            `;

            return;
        }

        const data = snapshot.val();

        let allRecords = [];

        const types = [
            {
                key: "zoom",
                name: "💻 Zoom"
            },
            {
                key: "saturday",
                name: "🎵 Saturday Practice"
            },
            {
                key: "sunday",
                name: "⛪ Sunday Practice"
            }
        ];

        types.forEach(type => {

            const records =
                data.sessions?.[type.key]?.records || [];

            records.forEach((record, index) => {

                allRecords.push({

                    type: type.key,

                    typeName: type.name,

                    date: record.date,

                    present:
                        (record.present || []).length,

                    absent:
                        (record.absent || []).length,

                    index: index

                });

            });

        });


        if (allRecords.length === 0) {

            box.innerHTML = `
                <p>No attendance records yet.</p>
            `;

            return;
        }


        // Newest first

        allRecords.reverse();


        box.innerHTML = "";


        allRecords.forEach(record => {

            const total =
                record.present +
                record.absent;


            const percentage =
                total > 0
                    ? Math.round(
                        (record.present / total) * 100
                    )
                    : 0;


            box.innerHTML += `

                <div class="attendance-record-card">

                    <div>

                        <h3>
                            ${record.typeName}
                        </h3>

                        <p>
                            📅 ${record.date}
                        </p>

                        <p>

                            Present:
                            <b>${record.present}</b>

                            &nbsp; | &nbsp;

                            Absent:
                            <b>${record.absent}</b>

                        </p>

                        <p>
                            Attendance:
                            <b>${percentage}%</b>
                        </p>

                    </div>


                    <button
                        class="btn-primary"
                        onclick="editAttendanceRecord(
                            '${record.type}',
                            ${record.index}
                        )">

                         👁 View

                    </button>

                </div>

            `;

        });

    }
    catch (error) {

        console.error(
            "Attendance records error:",
            error
        );

        box.innerHTML = `
            <p>❌ Unable to load records.</p>
        `;

    }

}

// ==========================================
// START NEW ATTENDANCE CYCLE
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
        // CALCULATE CURRENT CYCLE
        // ==================================

        const zoomRecords =
            currentCycle.sessions?.zoom?.records || [];

        const saturdayRecords =
            currentCycle.sessions?.saturday?.records || [];

        const sundayRecords =
            currentCycle.sessions?.sunday?.records || [];


        const zoomPresent =
            zoomRecords.reduce(
                (total, record) =>
                    total +
                    (record.present || []).length,
                0
            );


        const zoomTotal =
            zoomRecords.reduce(
                (total, record) =>
                    total +
                    (record.present || []).length +
                    (record.absent || []).length,
                0
            );


        const saturdayPresent =
            saturdayRecords.reduce(
                (total, record) =>
                    total +
                    (record.present || []).length,
                0
            );


        const saturdayTotal =
            saturdayRecords.reduce(
                (total, record) =>
                    total +
                    (record.present || []).length +
                    (record.absent || []).length,
                0
            );


        const sundayPresent =
            sundayRecords.reduce(
                (total, record) =>
                    total +
                    (record.present || []).length,
                0
            );


        const sundayTotal =
            sundayRecords.reduce(
                (total, record) =>
                    total +
                    (record.present || []).length +
                    (record.absent || []).length,
                0
            );


        const totalPresent =
            zoomPresent +
            saturdayPresent +
            sundayPresent;


        const totalAttendance =
            zoomTotal +
            saturdayTotal +
            sundayTotal;


        const overallPercentage =
            totalAttendance > 0
                ? Math.round(
                    (
                        totalPresent /
                        totalAttendance
                    ) * 100
                )
                : 0;


        // ==================================
        // CONFIRMATION
        // ==================================

        const confirmed =
            confirm(

                `🔄 Start New Cycle?\n\n` +

                `${currentCycle.cycleName || "Current Cycle"}\n\n` +

                `💻 Zoom: ` +
                `${zoomPresent} / ${zoomTotal}\n` +

                `🎵 Saturday: ` +
                `${saturdayPresent} / ${saturdayTotal}\n` +

                `⛪ Sunday: ` +
                `${sundayPresent} / ${sundayTotal}\n\n` +

                `📊 Overall: ` +
                `${overallPercentage}%\n\n` +

                `This cycle will be saved to History ` +
                `and a new cycle will start.`

            );


        if (!confirmed) return;


        // ==================================
        // SAVE OLD CYCLE TO HISTORY
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
                "Cycle " + oldCycleNumber,

            cycleNumber:
                oldCycleNumber,

            completedAt:
                new Date().toISOString(),

            summary: {

                zoom: {

                    present:
                        zoomPresent,

                    total:
                        zoomTotal

                },

                saturday: {

                    present:
                        saturdayPresent,

                    total:
                        saturdayTotal

                },

                sunday: {

                    present:
                        sundayPresent,

                    total:
                        sundayTotal

                },

                overall: {

                    present:
                        totalPresent,

                    total:
                        totalAttendance,

                    percentage:
                        overallPercentage

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
        // CREATE NEW CYCLE
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

        await displayAttendanceRecords();
        await displayCycleHistory();


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
            "❌ Unable to start new cycle."
        );

    }

}

window.startNewCycle =
    startNewCycle;
// ==========================================
// EDIT ATTENDANCE
// ==========================================


// ==========================================
// DISPLAY CYCLE HISTORY
// ==========================================

async function displayCycleHistory() {

    const box =
        document.getElementById(
            "attendanceCycleHistory"
        );

    if (!box) return;

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "attendance/history"
                )
            );

        if (!snapshot.exists()) {

            box.innerHTML =
                "<p>No completed cycles yet.</p>";

            return;

        }

        const history =
            snapshot.val();

        box.innerHTML = "";

        const cycles =
            Object.values(history)
            .sort(
                (a, b) =>
                    (b.cycleNumber || 0) -
                    (a.cycleNumber || 0)
            );


        cycles.forEach(cycle => {

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


            box.innerHTML += `

                <div class="attendance-record">

                    <h3>
                        📋 ${
                            cycle.cycleName ||
                            "Cycle " +
                            cycle.cycleNumber
                        }
                    </h3>

                    <p>
                        💻 Zoom:
                        <strong>
                            ${zoom.present || 0}
                            /
                            ${zoom.total || 0}
                        </strong>
                    </p>

                    <p>
                        🎵 Saturday:
                        <strong>
                            ${saturday.present || 0}
                            /
                            ${saturday.total || 0}
                        </strong>
                    </p>

                    <p>
                        ⛪ Sunday:
                        <strong>
                            ${sunday.present || 0}
                            /
                            ${sunday.total || 0}
                        </strong>
                    </p>

                    <p>
                        📊 Overall:
                        <strong>
                            ${
                                overall.percentage || 0
                            }%
                        </strong>

                        (
                            ${overall.present || 0}
                            /
                            ${overall.total || 0}
                        )
                    </p>

                </div>

            `;

        });

    }
    catch (error) {

        console.error(
            "Cycle history error:",
            error
        );

        box.innerHTML =
            "<p>❌ Unable to load cycle history.</p>";

    }

}
// ==========================================
// INDIVIDUAL ATTENDANCE
// ==========================================

function displayIndividualMembers() {

    const box =
        document.getElementById(
            "individualMembers"
        );

    if (!box) return;

    const members =
        getAllMembers();

    box.innerHTML = "";

    if (members.length === 0) {

        box.innerHTML =
            "<p>No members available.</p>";

        return;

    }

    members.forEach(member => {

        const memberKey =
            createMemberKey(member);

        box.innerHTML += `

            <div class="attendance-member">

                <div class="member-info">

                    <span class="member-name">

                        👤 ${member.memberName}

                    </span>

                </div>

                <button
                    class="btn-primary"
                    onclick="viewIndividualAttendance('${memberKey}')">

                    📊 View Attendance

                </button>

            </div>

        `;

    });

}


// ==========================================
// VIEW INDIVIDUAL ATTENDANCE
// ==========================================



   async function viewIndividualAttendance(memberKey) {
        console.log(
    "Member Name:",
    document.getElementById("individualMemberName")
);

console.log(
    "Cycle Data:",
    document.getElementById("individualCycleData")
);

console.log(
    "Modal:",
    document.getElementById("individualAttendanceModal")
);

    try {

        const member = findMemberByKey(memberKey);

        if (!member) {
            alert("Member not found.");
            return;
        }

        const snapshot = await get(
            ref(db, "attendance")
        );

        if (!snapshot.exists()) {
            alert("No attendance data available.");
            return;
        }

        const attendance = snapshot.val();
        const history = attendance.history || {};

        document.getElementById(
            "individualMemberName"
        ).innerText = "👤 " + member.memberName;

        const box = document.getElementById(
            "individualCycleData"
        );

        box.innerHTML = "";

        const cycles = Object.values(history);

        if (cycles.length === 0) {

            box.innerHTML = `
                <div class="no-attendance">
                    📊 No completed attendance cycles available.
                </div>
            `;

        } else {

            cycles
                .sort(
                    (a, b) =>
                        (b.cycleNumber || 0) -
                        (a.cycleNumber || 0)
                )
                .forEach(cycle => {

                    const zoom =
                        calculateMemberAttendance(
                            cycle,
                            "zoom",
                            memberKey
                        );

                    const saturday =
                        calculateMemberAttendance(
                            cycle,
                            "saturday",
                            memberKey
                        );

                    const sunday =
                        calculateMemberAttendance(
                            cycle,
                            "sunday",
                            memberKey
                        );

                    const totalPresent =
                        zoom.present +
                        saturday.present +
                        sunday.present;

                    const total =
                        zoom.total +
                        saturday.total +
                        sunday.total;

                    const overall =
                        total > 0
                            ? Math.round(
                                (totalPresent / total) * 100
                            )
                            : 0;


                    box.innerHTML += `

                        <div class="attendance-cycle-card">

                            <div class="attendance-cycle-title">

                                📅
                                ${
                                    cycle.cycleName ||
                                    "Attendance Cycle"
                                }

                            </div>


                            ${createAttendanceStat(
                                "💻",
                                "Zoom",
                                zoom.present,
                                zoom.total,
                                "zoom-progress"
                            )}


                            ${createAttendanceStat(
                                "🎵",
                                "Saturday",
                                saturday.present,
                                saturday.total,
                                "saturday-progress"
                            )}


                            ${createAttendanceStat(
                                "⛪",
                                "Sunday",
                                sunday.present,
                                sunday.total,
                                "sunday-progress"
                            )}


                            <div class="attendance-overall">

                                <div class="attendance-overall-label">

                                    📊 Overall Attendance

                                </div>


                                <div class="attendance-overall-percent">

                                    ${overall}%

                                </div>


                                <div class="attendance-overall-count">

                                    ${totalPresent}
                                    /
                                    ${total}
                                    Present

                                </div>

                            </div>

                        </div>

                    `;

                });

        }


        document.getElementById(
            "individualAttendanceModal"
        ).style.display = "flex";

    }

catch (error) {

    console.error(
        "Individual attendance error:",
        error
    );

    alert(
        "Unable to load attendance:\n\n" +
        error.message
    );

}

}


// ==========================================
// CLOSE INDIVIDUAL ATTENDANCE
// ==========================================

function closeIndividualAttendance() {

    document.getElementById(
        "individualAttendanceModal"
    ).style.display = "none";

}


// ==========================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ==========================================

window.displayIndividualMembers =
    displayIndividualMembers;

window.viewIndividualAttendance =
    viewIndividualAttendance;

window.closeIndividualAttendance =
    closeIndividualAttendance;
// ==========================================
// ATTENDANCE NAVIGATION
// ==========================================

function openAttendancePage() {

    window.location.href =
        "take-attendance.html";

}


function openAttendanceRecords() {

    window.location.href =
        "attendance-records.html";

}


function openCycleHistory() {

    window.location.href =
        "attendance-cycle-history.html";

}


function openIndividualAttendance() {

    window.location.href =
        "individual-attendance.html";

}
window.openAttendancePage =
    openAttendancePage;

window.openAttendanceRecords =
    openAttendanceRecords;

window.openCycleHistory =
    openCycleHistory;

window.openIndividualAttendance =
    openIndividualAttendance;
// ==========================================
// UPDATE ATTENDANCE RECORD
// ==========================================
// ==========================================
// CLOSE EDIT POPUP
// ==========================================


// ==========================================
// LOAD RECORDS AFTER APP IS READY
// ==========================================
function createAttendanceStat(
    icon,
    name,
    present,
    total,
    progressClass
) {

    present = Number(present || 0);
    total = Number(total || 0);

    let percentage = total > 0
        ? Math.round((present / total) * 100)
        : 0;

    return `

        <div class="attendance-stat">

            <div class="attendance-stat-top">

                <span class="attendance-stat-name">
                    ${icon} ${name}
                </span>

                <span class="attendance-stat-number">
                    ${present} / ${total}
                </span>

            </div>


            <div class="attendance-progress">

                <div
                    class="attendance-progress-fill ${progressClass}"
                    style="width:${percentage}%">

                </div>

            </div>


            <span class="attendance-percent">
                ${percentage}% Attendance
            </span>

        </div>

    `;
}
function displayIndividualCycle(cycle) {

    const zoomPresent = cycle.zoomPresent || 0;
    const zoomTotal = cycle.zoomTotal || 0;

    const saturdayPresent = cycle.saturdayPresent || 0;
    const saturdayTotal = cycle.saturdayTotal || 0;

    const sundayPresent = cycle.sundayPresent || 0;
    const sundayTotal = cycle.sundayTotal || 0;


    const totalPresent =
        zoomPresent +
        saturdayPresent +
        sundayPresent;


    const totalClasses =
        zoomTotal +
        saturdayTotal +
        sundayTotal;


    const overall =
        totalClasses > 0
            ? Math.round(
                (totalPresent / totalClasses) * 100
            )
            : 0;


    return `

        <div class="attendance-cycle-card">

            <div class="attendance-cycle-title">

                📅 ${cycle.name || "Cycle 1"}

            </div>


            ${createAttendanceStat(
                "💻",
                "Zoom",
                zoomPresent,
                zoomTotal,
                "zoom-progress"
            )}


            ${createAttendanceStat(
                "🎵",
                "Saturday",
                saturdayPresent,
                saturdayTotal,
                "saturday-progress"
            )}


            ${createAttendanceStat(
                "⛪",
                "Sunday",
                sundayPresent,
                sundayTotal,
                "sunday-progress"
            )}


            <div class="attendance-overall">

                <div class="attendance-overall-label">
                    Overall Attendance
                </div>

                <div class="attendance-overall-percent">
                    ${overall}%
                </div>

                <div class="attendance-overall-count">
                    ${totalPresent} / ${totalClasses} Present
                </div>

            </div>

        </div>

    `;
}
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await waitForAppData();

        await loadAttendanceRecords();
        await displayCycleHistory();

    }
);