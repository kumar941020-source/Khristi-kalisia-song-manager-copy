// ==========================================
// WORSHIP REPORTS
// ==========================================

import {
    choirs
} from "../script1.js";

import {
    db,
    ref,
    get
} from "../firebase.js";


// ==========================================
// LIMITS
// ==========================================

const LIMITS = {

    zoom: 30,

    saturday: 4,

    sunday: 4

};


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await waitForAppData();

            await loadWorshipReports();

        }
        catch (error) {

            console.error(
                "Reports error:",
                error
            );

        }

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
// GET ALL MEMBERS
// ==========================================

function getAllMembers() {

    const members = [];


    if (!Array.isArray(choirs)) {

        return members;

    }


    choirs.forEach(
        choir => {

            const list =
                Array.isArray(
                    choir.members
                )
                    ? choir.members
                    : [];


            list.forEach(
                memberName => {

                    members.push({

                        choirId:
                            choir.id,

                        choirName:
                            choir.name,

                        memberName:
                            memberName

                    });

                }
            );

        }
    );


    return members;

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
// LOAD REPORTS
// ==========================================

async function loadWorshipReports() {

    const snapshot =
        await get(
            ref(
                db,
                "attendance/currentCycle"
            )
        );


    if (!snapshot.exists()) {

        showNoData();

        return;

    }


    const data =
        snapshot.val();


    // ======================================
    // CYCLE NAME
    // ======================================

    const cycleName =
        document.getElementById(
            "reportCycleName"
        );


    if (cycleName) {

        cycleName.innerText =
            data.cycleName ||
            "Cycle 1";

    }


    // ======================================
    // MEMBERS
    // ======================================

    const members =
        getAllMembers();


    const membersElement =
        document.getElementById(
            "reportMembers"
        );


    if (membersElement) {

        membersElement.innerText =
            members.length;

    }


    // ======================================
    // SESSION DATA
    // ======================================

    const zoom =
        getSession(
            data,
            "zoom"
        );


    const saturday =
        getSession(
            data,
            "saturday"
        );


    const sunday =
        getSession(
            data,
            "sunday"
        );


    // ======================================
    // SUMMARY
    // ======================================

    setText(
        "reportZoom",
        `${zoom.records.length} / ${LIMITS.zoom}`
    );


    setText(
        "reportSaturday",
        `${saturday.records.length} / ${LIMITS.saturday}`
    );


    setText(
        "reportSunday",
        `${sunday.records.length} / ${LIMITS.sunday}`
    );


    // ======================================
    // MEMBER REPORT
    // ======================================

    const memberResults =
        members.map(
            member => {

                const key =
                    createMemberKey(
                        member
                    );


                const zoomResult =
                    calculateMember(
                        zoom.records,
                        key
                    );


                const saturdayResult =
                    calculateMember(
                        saturday.records,
                        key
                    );


                const sundayResult =
                    calculateMember(
                        sunday.records,
                        key
                    );


                const totalPresent =
                    zoomResult.present +
                    saturdayResult.present +
                    sundayResult.present;


                const totalSessions =
                    zoomResult.total +
                    saturdayResult.total +
                    sundayResult.total;


                const overall =
                    totalSessions > 0
                        ? Math.round(
                            (
                                totalPresent /
                                totalSessions
                            ) * 100
                        )
                        : 0;


                return {

                    ...member,

                    zoom:
                        zoomResult,

                    saturday:
                        saturdayResult,

                    sunday:
                        sundayResult,

                    overall:
                        overall,

                    totalPresent:
                        totalPresent,

                    totalSessions:
                        totalSessions

                };

            }
        );


    // ======================================
    // OVERALL
    // ======================================

    let totalPresent = 0;

    let totalSessions = 0;


    memberResults.forEach(
        member => {

            totalPresent +=
                member.totalPresent;

            totalSessions +=
                member.totalSessions;

        }
    );


    const overall =
        totalSessions > 0
            ? Math.round(
                (
                    totalPresent /
                    totalSessions
                ) * 100
            )
            : 0;


    setText(
        "reportOverall",
        overall + "%"
    );


    const progress =
        document.getElementById(
            "reportOverallProgress"
        );


    if (progress) {

        progress.style.width =
            overall + "%";

    }


    // ======================================
    // BEST MEMBER
    // ======================================

    displayBestMember(
        memberResults
    );


    // ======================================
    // CHOIR REPORT
    // ======================================

    displayChoirReports(
        memberResults
    );


    // ======================================
    // MEMBER TABLE
    // ======================================

    displayMemberReports(
        memberResults
    );

}


// ==========================================
// GET SESSION
// ==========================================

function getSession(
    data,
    type
) {

    const session =
        data.sessions?.[type];


    return {

        records:
            Array.isArray(
                session?.records
            )
                ? session.records
                : []

    };

}


// ==========================================
// CALCULATE MEMBER
// ==========================================

function calculateMember(
    records,
    memberKey
) {

    let present = 0;


    records.forEach(
        record => {

            if (
                Array.isArray(
                    record.present
                )

                &&

                record.present.includes(
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
// BEST MEMBER
// ==========================================

function displayBestMember(
    members
) {

    const box =
        document.getElementById(
            "bestMember"
        );


    if (!box) return;


    if (members.length === 0) {

        box.innerHTML = `

            <div class="best-member-icon">
                🏆
            </div>

            <div class="best-member-info">

                <strong>
                    No Data
                </strong>

                <span>
                    No worship members found
                </span>

            </div>

        `;

        return;

    }


    const sorted =
        [...members]
            .sort(
                (a, b) =>
                    b.overall -
                    a.overall
            );


    const best =
        sorted[0];


    box.innerHTML = `

        <div class="best-member-icon">
            🏆
        </div>

        <div class="best-member-info">

            <strong>
                ${escapeHTML(
                    best.memberName
                )}
            </strong>

            <span>
                ${escapeHTML(
                    best.choirName
                )}
                •
                ${best.overall}% attendance
                (${best.totalPresent}/${best.totalSessions})
            </span>

        </div>

    `;

}


// ==========================================
// CHOIR REPORTS
// ==========================================

function displayChoirReports(
    members
) {

    const box =
        document.getElementById(
            "choirReportList"
        );


    if (!box) return;


    if (!Array.isArray(choirs) || choirs.length === 0) {

        box.innerHTML = `

            <div class="report-empty">
                No worship teams found.
            </div>

        `;

        return;

    }


    box.innerHTML = "";


    choirs.forEach(
        choir => {

            const choirMembers =
                members.filter(
                    member =>
                        member.choirId ===
                        choir.id
                );


            let zoomPresent = 0;
            let zoomTotal = 0;

            let saturdayPresent = 0;
            let saturdayTotal = 0;

            let sundayPresent = 0;
            let sundayTotal = 0;

            let overallPresent = 0;
            let overallTotal = 0;


            choirMembers.forEach(
                member => {

                    zoomPresent +=
                        member.zoom.present;

                    zoomTotal +=
                        member.zoom.total;


                    saturdayPresent +=
                        member.saturday.present;

                    saturdayTotal +=
                        member.saturday.total;


                    sundayPresent +=
                        member.sunday.present;

                    sundayTotal +=
                        member.sunday.total;


                    overallPresent +=
                        member.totalPresent;

                    overallTotal +=
                        member.totalSessions;

                }
            );


            const overall =
                overallTotal > 0
                    ? Math.round(
                        (
                            overallPresent /
                            overallTotal
                        ) * 100
                    )
                    : 0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "choir-report-row";


            row.innerHTML = `

                <div class="choir-name">

                    <div class="choir-icon">
                        🎤
                    </div>

                    <div>

                        ${escapeHTML(
                            choir.name
                        )}

                        <small
                            style="
                                display:block;
                                color:#64748b;
                                font-size:11px;
                                margin-top:3px;
                            ">

                            ${choirMembers.length}
                            Members

                        </small>

                    </div>

                </div>


                <div class="choir-stat">

                    <span>
                        💻 Zoom
                    </span>

                    <strong>
                        ${zoomPresent}/${zoomTotal}
                    </strong>

                </div>


                <div class="choir-stat">

                    <span>
                        🎵 Saturday
                    </span>

                    <strong>
                        ${saturdayPresent}/${saturdayTotal}
                    </strong>

                </div>


                <div class="choir-stat">

                    <span>
                        ⛪ Sunday
                    </span>

                    <strong>
                        ${sundayPresent}/${sundayTotal}
                    </strong>

                </div>


                <div class="choir-stat">

                    <span>
                        📊 Overall
                    </span>

                    <strong>
                        ${overall}%
                    </strong>

                    <div class="report-progress">

                        <div
                            class="report-progress-fill"
                            style="width:${overall}%">

                        </div>

                    </div>

                </div>

            `;


            box.appendChild(
                row
            );

        }
    );

}


// ==========================================
// MEMBER REPORT
// ==========================================

function displayMemberReports(
    members
) {

    const body =
        document.getElementById(
            "memberReportBody"
        );


    if (!body) return;


    if (members.length === 0) {

        body.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="report-empty">

                        No worship members found.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML = "";


    members.forEach(
        member => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(
                            member.memberName
                        )}
                    </strong>

                </td>


                <td>
                    ${escapeHTML(
                        member.choirName
                    )}
                </td>


                <td>
                    ${member.zoom.present}
                    /
                    ${member.zoom.total}
                </td>


                <td>
                    ${member.saturday.present}
                    /
                    ${member.saturday.total}
                </td>


                <td>
                    ${member.sunday.present}
                    /
                    ${member.sunday.total}
                </td>


                <td>

                    <span class="
                        attendance-badge
                        ${getAttendanceClass(
                            member.overall
                        )}
                    ">

                        ${member.overall}%

                    </span>

                </td>

            `;


            body.appendChild(
                row
            );

        }
    );

}


// ==========================================
// ATTENDANCE BADGE
// ==========================================

function getAttendanceClass(
    percentage
) {

    if (percentage >= 75) {

        return "attendance-good";

    }


    if (percentage >= 50) {

        return "attendance-medium";

    }


    return "attendance-low";

}


// ==========================================
// SET TEXT
// ==========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.innerText =
            value;

    }

}


// ==========================================
// NO DATA
// ==========================================

function showNoData() {

    setText(
        "reportCycleName",
        "No Active Cycle"
    );


    setText(
        "reportMembers",
        "0"
    );


    setText(
        "reportZoom",
        "0 / 30"
    );


    setText(
        "reportSaturday",
        "0 / 4"
    );


    setText(
        "reportSunday",
        "0 / 4"
    );


    setText(
        "reportOverall",
        "0%"
    );


    const body =
        document.getElementById(
            "memberReportBody"
        );


    if (body) {

        body.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="report-empty">

                        No attendance data available.

                    </div>

                </td>

            </tr>

        `;

    }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}