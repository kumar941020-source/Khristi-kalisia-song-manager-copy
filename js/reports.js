import {
    fastSongs,
    slowSongs,
    getSundayHistory
} from "../script1.js";

function loadReports() {

    const history = getSundayHistory();

    document.getElementById("totalSongs").innerText =
        fastSongs.length + slowSongs.length;

    document.getElementById("reportFast").innerText =
        fastSongs.length;

    document.getElementById("reportSlow").innerText =
        slowSongs.length;

    document.getElementById("totalPlans").innerText =
        history.length;

    const allSongs = [...fastSongs, ...slowSongs];

    if (allSongs.length > 0) {

        const mostPlayed = [...allSongs].sort(
            (a, b) => (b.timesSung || 0) - (a.timesSung || 0)
        )[0];

        document.getElementById("reportMostPlayed").innerText =
            mostPlayed.name;

        let totalUsage = 0;

        allSongs.forEach(song => {
            totalUsage += song.timesSung || 0;
        });

        document.getElementById("totalUsage").innerText =
            totalUsage;
    }
}

function waitForApp() {

    if (window.appReady) {
        loadReports();
    } else {
        setTimeout(waitForApp, 100);
    }

}

waitForApp();
console.log("Fast:", fastSongs);
console.log("Slow:", slowSongs);
console.log("History:", getSundayHistory());
console.log("Load Reports Called");