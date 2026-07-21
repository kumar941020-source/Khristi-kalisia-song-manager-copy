// ==========================================
// REPORTS PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", function(){

    // Total Counts
    document.getElementById("reportTotalSongs").innerText =
        fastSongs.length + slowSongs.length;

    document.getElementById("reportFastSongs").innerText =
        fastSongs.length;

    document.getElementById("reportSlowSongs").innerText =
        slowSongs.length;

    document.getElementById("reportSundays").innerText =
        sundayHistory.length;


    // ==========================
    // Most Sung Song
    // ==========================

    const mostSung = document.getElementById("reportMostSung");

    let allSongs = [...fastSongs, ...slowSongs];

    if(allSongs.length === 0){

        mostSung.innerText = "No Data";

        return;

    }

    let topSong = allSongs[0];

    allSongs.forEach(song=>{

        if((song.timesSung || 0) > (topSong.timesSung || 0)){
            topSong = song;
        }

    });

    mostSung.innerText =
        topSong.name + " (" + topSong.timesSung + " times)";

});