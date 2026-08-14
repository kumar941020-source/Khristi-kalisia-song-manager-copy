// ==========================================
// INDIVIDUAL ATTENDANCE
// KHRISTI KALISIA
// ==========================================

import {
    db,
    ref,
    get
} from "../firebase.js";


// ==========================================
// CREATE MEMBER KEY
// ==========================================

function createMemberKey(choirId, memberName) {

    return (
        choirId +
        "_" +
        encodeURIComponent(memberName)
    );

}


// ==========================================
// LOAD CHOIR MEMBERS DIRECTLY FROM FIREBASE
// ==========================================

async function loadChoirMembers() {

    const box =
        document.getElementById(
            "individualMembers"
        );

    if (!box) return;


    box.innerHTML = `
        <div class="loading-attendance">
            ⏳ Loading choir members...
        </div>
    `;


    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "choirs"
                )
            );


        if (!snapshot.exists()) {

            box.innerHTML = `
                <div class="no-attendance">
                    👥 No choir members available.
                </div>
            `;

            return;

        }


        const choirs =
            snapshot.val();


        const members = [];


        Object.values(choirs).forEach(
            choir => {

                const choirMembers =
                    choir.members || [];


                choirMembers.forEach(
                    member => {

                        let memberName = "";


                        if (
                            typeof member ===
                            "string"
                        ) {

                            memberName =
                                member;

                        } else {

                            memberName =
                                member.memberName ||
                                member.name ||
                                "";

                        }


                        if (
                            memberName.trim() !== ""
                        ) {

                            members.push({

                                choirId:
                                    choir.id,

                                choirName:
                                    choir.name ||
                                    "Choir",

                                memberName:
                                    memberName

                            });

                        }

                    }
                );

            }
        );


        if (members.length === 0) {

            box.innerHTML = `
                <div class="no-attendance">
                    👥 No choir members found.
                </div>
            `;

            return;

        }


        box.innerHTML = "";


        members.forEach(
            member => {

                const memberKey =
                    createMemberKey(
                        member.choirId,
                        member.memberName
                    );


                box.innerHTML += `

                    <div class="attendance-member">

                        <div class="member-info">

                            <div class="member-name">
                                👤 ${member.memberName}
                            </div>

                            <div class="member-choir">
                                🎤 ${member.choirName}
                            </div>

                        </div>


                        <button
                            class="btn-primary attendance-view-btn"
                            onclick="viewIndividualAttendance('${memberKey}')">

                            📊 View Attendance

                        </button>

                    </div>

                `;

            }
        );

    }

    catch (error) {

        console.error(
            "Choir members loading error:",
            error
        );


        box.innerHTML = `
            <div class="no-attendance">
                ❌ Unable to load choir members.
            </div>
        `;

    }

}


// ==========================================
// CALCULATE MEMBER ATTENDANCE
// ==========================================

function calculateMemberAttendance(
    cycle,
    type,
    memberKey
) {

    const records =
        cycle?.sessions?.[type]?.records || [];


    let present = 0;


    records.forEach(
        record => {

            const presentList =
                Array.isArray(
                    record.present
                )
                    ? record.present
                    : [];


            if (
                presentList.includes(
                    memberKey
                )
            ) {

                present++;

            }

        }
    );


    const total =
        records.length;


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
// CREATE ATTENDANCE STAT
// ==========================================

function createAttendanceStat(
    icon,
    name,
    result,
    progressClass
) {

    return `

        <div class="attendance-stat">

            <div class="attendance-stat-top">

                <span class="attendance-stat-name">

                    ${icon}
                    ${name}

                </span>


                <span class="attendance-stat-number">

                    ${result.present}
                    /
                    ${result.total}

                </span>

            </div>


            <div class="attendance-progress">

                <div
                    class="
                        attendance-progress-fill
                        ${progressClass}
                    "
                    style="
                        width:${result.percentage}%
                    ">

                </div>

            </div>


            <div class="attendance-percent">

                ${result.percentage}%
                Attendance

            </div>

        </div>

    `;

}


// ==========================================
// VIEW INDIVIDUAL ATTENDANCE
// ==========================================

async function viewIndividualAttendance(
    memberKey
) {

    try {

        // ==================================
        // GET ATTENDANCE DATA
        // ==================================

        const snapshot =
            await get(
                ref(
                    db,
                    "attendance"
                )
            );


        if (!snapshot.exists()) {

            alert(
                "No attendance data available."
            );

            return;

        }


        const attendance =
            snapshot.val();


        // ==================================
        // GET CURRENT CYCLE
        // ==================================

        const currentCycle =
            attendance.currentCycle ||
            null;


        // ==================================
        // GET HISTORY
        // ==================================

        const history =
            attendance.history ||
            {};


        // ==================================
        // FIND MEMBER NAME FROM FIREBASE
        // ==================================

        const choirSnapshot =
            await get(
                ref(
                    db,
                    "choirs"
                )
            );


        let memberName =
            "Member";


        if (
            choirSnapshot.exists()
        ) {

            const choirs =
                choirSnapshot.val();


            Object.values(choirs)
                .forEach(
                    choir => {

                        (choir.members || [])
                            .forEach(
                                member => {

                                    let name =
                                        typeof member ===
                                        "string"
                                            ? member
                                            : (
                                                member.memberName ||
                                                member.name ||
                                                ""
                                            );


                                    const key =
                                        createMemberKey(
                                            choir.id,
                                            name
                                        );


                                    if (
                                        key ===
                                        memberKey
                                    ) {

                                        memberName =
                                            name;

                                    }

                                }
                            );

                    }
                );

        }


        // ==================================
        // MEMBER NAME
        // ==================================

        const nameElement =
            document.getElementById(
                "individualMemberName"
            );


        if (nameElement) {

            nameElement.innerText =
                "👤 " + memberName;

        }


        // ==================================
        // CONTENT BOX
        // ==================================

        const box =
            document.getElementById(
                "individualCycleData"
            );


        if (!box) {

            console.error(
                "individualCycleData element not found."
            );

            return;

        }


        box.innerHTML = "";


        // ==================================
        // CREATE CYCLE ARRAY
        // ==================================

        const cycles = [];


        Object.values(history)
            .forEach(
                cycle => {

                    cycles.push(
                        cycle
                    );

                }
            );


        // Current cycle भी दिखाएँ
        if (currentCycle) {

            cycles.push(
                currentCycle
            );

        }


        // ==================================
        // NO DATA
        // ==================================

        if (cycles.length === 0) {

            box.innerHTML = `

                <div class="no-attendance">

                    📊 No attendance records
                    available.

                </div>

            `;

        }


        // ==================================
        // SORT CYCLES
        // ==================================

        cycles.sort(
            (a, b) => {

                return (
                    Number(
                        b.cycleNumber || 0
                    )
                    -
                    Number(
                        a.cycleNumber || 0
                    )
                );

            }
        );


        // ==================================
        // DISPLAY EACH CYCLE
        // ==================================

        cycles.forEach(
            cycle => {


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


                // ==================================
                // OVERALL
                // ==================================

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
                            (
                                totalPresent /
                                total
                            ) * 100
                        )
                        : 0;


                // ==================================
                // CYCLE CARD
                // ==================================

                box.innerHTML += `

                    <div class="attendance-cycle-card">


                        <div
                            class="
                                attendance-cycle-title
                            ">

                            📅

                            ${
                                cycle.cycleName ||
                                (
                                    "Cycle " +
                                    (
                                        cycle.cycleNumber ||
                                        ""
                                    )
                                )
                            }

                        </div>


                        ${createAttendanceStat(
                            "💻",
                            "Zoom",
                            zoom,
                            "zoom-progress"
                        )}


                        ${createAttendanceStat(
                            "🎵",
                            "Saturday",
                            saturday,
                            "saturday-progress"
                        )}


                        ${createAttendanceStat(
                            "⛪",
                            "Sunday",
                            sunday,
                            "sunday-progress"
                        )}


                        <div
                            class="
                                attendance-overall
                            ">


                            <div
                                class="
                                    attendance-overall-label
                                ">

                                📊
                                Overall Attendance

                            </div>


                            <div
                                class="
                                    attendance-overall-percent
                                ">

                                ${overall}%

                            </div>


                            <div
                                class="
                                    attendance-overall-count
                                ">

                                ${totalPresent}
                                /
                                ${total}
                                Present

                            </div>


                        </div>


                    </div>

                `;

            }
        );


        // ==================================
        // OPEN MODAL
        // ==================================

        const modal =
            document.getElementById(
                "individualAttendanceModal"
            );


        if (!modal) {

            console.error(
                "individualAttendanceModal not found."
            );

            return;

        }


        modal.style.display =
            "flex";


    }

    catch (error) {

        console.error(
            "Individual attendance error:",
            error
        );


        alert(
            "Unable to load attendance."
        );

    }

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeIndividualAttendance() {

    const modal =
        document.getElementById(
            "individualAttendanceModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ==========================================
// CLOSE WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "individualAttendanceModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeIndividualAttendance();

        }

    }
);


// ==========================================
// ESC KEY
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeIndividualAttendance();

        }

    }
);


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadChoirMembers();

    }
);


// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.viewIndividualAttendance =
    viewIndividualAttendance;


window.closeIndividualAttendance =
    closeIndividualAttendance;


window.displayIndividualMembers =
    loadChoirMembers;