// ==========================================
// HISTORY PAGE
// ==========================================

function displaySundayHistory(){

    const table = document.getElementById("historyTable");
    const total = document.getElementById("historyCountCard");

    if(!table){
        return;
    }

    table.innerHTML = "";

    if(total){
        total.innerText = sundayHistory.length;
    }

    if(sundayHistory.length === 0){

        table.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;padding:25px;">
                No Sunday History Found
            </td>
        </tr>
        `;

        return;
    }

    sundayHistory.forEach((history,index)=>{

        table.innerHTML += `

        <tr>

            <td>${index+1}</td>

            <td>${history.date}</td>

    <td>
${history.fastSongs.map(song => 
    typeof song === "object" ? song.name : song
).join("<br>")}
</td>

<td>
${history.slowSongs.map(song => 
    typeof song === "object" ? song.name : song
).join("<br>")}
</td>

            <td>

                <button class="delete-btn"
                onclick="deleteHistory(${index})">

                🗑 Delete

                </button>
                <button class="select-btn"
onclick="viewHistory(${index})">

👁 View

</button>

            </td>

        </tr>

        `;

    });

}
// ==========================================
// DELETE SINGLE HISTORY
// ==========================================

function deleteHistory(index){

    let confirmDelete = confirm(
        "Delete this Sunday History?"
    );

    if(!confirmDelete){
        return;
    }

    sundayHistory.splice(index,1);

    saveData();

    displaySundayHistory();

    updateDashboard();

}



// ==========================================
// CLEAR ALL HISTORY
// ==========================================

function clearHistory(){

    let confirmClear = confirm(
        "Delete All Sunday History?"
    );

    if(!confirmClear){
        return;
    }

    sundayHistory = [];

    saveData();

    displaySundayHistory();

    updateDashboard();

    alert("All History Deleted Successfully.");

}



// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded",function(){

    displaySundayHistory();

});
// ==========================================
// SEARCH HISTORY
// ==========================================

function searchHistory(){

    const search = document
        .getElementById("searchHistory")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#historyTable tr");

    rows.forEach(row=>{

        if(row.innerText.toLowerCase().includes(search)){
            row.style.display="";
        }else{
            row.style.display="none";
        }

    });

}



// ==========================================
// SEARCH EVENT
// ==========================================

document.addEventListener("DOMContentLoaded",function(){

    const searchBox =
    document.getElementById("searchHistory");

    if(searchBox){

        searchBox.addEventListener(
            "keyup",
            searchHistory
        );

    }

});
// ==========================================
// VIEW HISTORY DETAILS
// ==========================================

function viewHistory(index){

    const history = sundayHistory[index];

    document.getElementById("historyDetails").style.display = "block";

    document.getElementById("historyDate").innerText =
        "📅 " + history.date;

    document.getElementById("historyFastSongs").innerHTML =
        history.fastSongs.map(song=>"🎵 "+song).join("<br>");

    document.getElementById("historySlowSongs").innerHTML =
        history.slowSongs.map(song=>"🎶 "+song).join("<br>");
console.log(history.fastSongs);
console.log(history.slowSongs);
}
document.addEventListener("DOMContentLoaded", function(){
let historyData = sundayHistory || [];

let totalSongs = 0;
let fastCount = 0;
let slowCount = 0;

historyData.forEach(day => {
    totalSongs += day.fastSongs.length + day.slowSongs.length;
    fastCount += day.fastSongs.length;
    slowCount += day.slowSongs.length;
});

document.getElementById("totalSongs").innerText = totalSongs;
document.getElementById("fastCount").innerText = fastCount;
document.getElementById("slowCount").innerText = slowCount;
document.getElementById("totalDays").innerText = historyData.length;
});
function updateMostPlayed(){

    let songCount = {};

    sundayHistory.forEach(day => {

        [...day.fastSongs, ...day.slowSongs].forEach(song => {

            let name = typeof song === "object" ? song.name : song;

            if(songCount[name]){
                songCount[name]++;
            }
            else{
                songCount[name] = 1;
            }

        });

    });


    let mostSong = "No Data";
    let max = 0;


    for(let song in songCount){

        if(songCount[song] > max){

            max = songCount[song];
            mostSong = song;

        }

    }


    document.getElementById("mostPlayed").innerText =
    mostSong + " (" + max + " times)";

}


document.addEventListener("DOMContentLoaded", function(){

    updateMostPlayed();

});