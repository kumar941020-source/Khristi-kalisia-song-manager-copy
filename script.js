/* ==========================================
   Khristi Kalisia Worship Song Manager
   SCRIPT.JS - PART 1
========================================== */

// ==========================================
// Today's Date
// ==========================================
function showTodayDate() {

    const today = new Date();

    const options = {
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    const formattedDate = today.toLocaleDateString("en-GB", options);

    const dateBox = document.getElementById("todayDate");

    if(dateBox){

        dateBox.innerHTML = formattedDate;

    }

}

showTodayDate();


// ==========================================
// Default Data
// ==========================================

let fastSongs = [];

let slowSongs = [];

let sundayHistory = [];


// ==========================================
// Local Storage Load
// ==========================================

if(localStorage.getItem("fastSongs")){

    fastSongs = JSON.parse(localStorage.getItem("fastSongs"));

}

if(localStorage.getItem("slowSongs")){

    slowSongs = JSON.parse(localStorage.getItem("slowSongs"));

}

if(localStorage.getItem("sundayHistory")){

    sundayHistory = JSON.parse(localStorage.getItem("sundayHistory"));

}


// ==========================================
// Dashboard Count
// ==========================================

/*function updateDashboard(){

    document.getElementById("fastCount").innerText = fastSongs.length;

    document.getElementById("slowCount").innerText = slowSongs.length;

    document.getElementById("historyCount").innerText = sundayHistory.length;

    document.getElementById("totalSongs").innerText =
    fastSongs.length + slowSongs.length;

}*/
function parseDate(dateString){

    if(!dateString || dateString === "Never"){
        return new Date(0);
    }

    const parts = dateString.split("/");

    return new Date(parts[2], parts[1]-1, parts[0]);

}
function updateDashboard(){

    const fast = document.getElementById("fastCount");
    const slow = document.getElementById("slowCount");
    const history = document.getElementById("historyCount");
    const total = document.getElementById("totalSongs");

    if(fast){
        fast.innerText = fastSongs.length;
    }

    if(slow){
        slow.innerText = slowSongs.length;
    }

    if(history){
        history.innerText = sundayHistory.length;
    }

    if(total){
        total.innerText = fastSongs.length + slowSongs.length;
    }
    const fastTotal = document.getElementById("fastSongTotal");

if(fastTotal){
    fastTotal.innerText = fastSongs.length;
}
const slowTotal = document.getElementById("slowSongTotal");

if(slowTotal){
    slowTotal.innerText = slowSongs.length;
}
// Most Sung Song

const mostSung = document.getElementById("mostSungSong");

if(mostSung){

    let allSongs = [...fastSongs, ...slowSongs];

    if(allSongs.length === 0){

        mostSung.innerText = "No Data";

    }else{

        let topSong = allSongs[0];

        allSongs.forEach(song => {

            if((song.timesSung || 0) > (topSong.timesSung || 0)){
                topSong = song;
            }

        });

        mostSung.innerText =
        topSong.name + " (" + (topSong.timesSung || 0) + " times)";

    }

}
const longTimeSong = document.getElementById("longTimeSong");

if(longTimeSong){

    let allSongs = [...fastSongs, ...slowSongs];

    if(allSongs.length === 0){

        longTimeSong.innerText = "No Data";

    }else{

        let oldest = allSongs[0];

        allSongs.forEach(song => {

if(parseDate(song.lastSung) < parseDate(oldest.lastSung)){   
                 oldest = song;
            }

        });

        longTimeSong.innerText =
        oldest.name + " (" + (oldest.lastSung || "Never") + ")";
    }

}
const recentSong = document.getElementById("recentSong");

if(recentSong){

    let allSongs = [...fastSongs, ...slowSongs];

    if(allSongs.length === 0){

        recentSong.innerText = "No Data";

    }else{

        let latest = allSongs[0];

        allSongs.forEach(song => {

if(parseDate(song.lastSung) > parseDate(latest.lastSung)){             
       latest = song;
            }

        });

        recentSong.innerText =
        latest.name + " (" + (latest.lastSung || "Never") + ")";

    }

}
}
function displayFastSongs(){

    const table = document.getElementById("fastSongTable");

    if(!table){
        return;
    }

    table.innerHTML = "";

    if(fastSongs.length === 0){

        table.innerHTML = `
        <tr>
        <td colspan="5" style="text-align:center;padding:25px;">
        No Fast Songs Added Yet
        </td>
        </tr>
        `;

        return;
    }


    fastSongs.forEach((song,index)=>{

        table.innerHTML += `

        <tr>

        <td>${index+1}</td>
        <td>
    ${song.name}
    ${song.selected ? '<span class="used-badge">⭐ Selected</span>' : ''}
</td>

        <td>${song.lastSung || "Never"}</td>

        <td>${song.timesSung || 0}</td>

<td>

<button class="used-btn" onclick="markSongUsed(${index})">
✔ Used
</button>

<button class="edit-btn" onclick="editFastSong(${index})">
✏ Edit
</button>

<button class="delete-btn" onclick="deleteFastSong(${index})">
🗑 Delete
</button>


<button class="select-btn" onclick="selectFastSong(${index})">
⭐ Select
</button>
</td>
        </tr>

        `;

    });

}

updateDashboard();
displayFastSongs();
displaySelectedSongs();


// ==========================================
// Console Message
// ==========================================

console.log("Khristi Kalisia Worship Song Manager Loaded Successfully");
/* ==========================================
   SCRIPT.JS - PART 2
   Song Functions
========================================== */

// Save Data
function saveData() {

    localStorage.setItem("fastSongs", JSON.stringify(fastSongs));
    localStorage.setItem("slowSongs", JSON.stringify(slowSongs));
    localStorage.setItem("sundayHistory", JSON.stringify(sundayHistory));

}

// Add Song
function addSong(songName, category, lastSung = "Never") {

    songName = songName.trim();

    if (songName === "") {
        alert("Please enter a song name.");
        return;
    }

    let song = {
        name: songName,
        lastSung: lastSung,
        timesSung: 0,
        selected:false
    };

    if (category === "fast") {

        let exists = fastSongs.some(
            s => s.name.toLowerCase() === songName.toLowerCase()
        );

        if (exists) {
            alert("Fast song already exists!");
            return;
        }

        fastSongs.push(song);

    } else {

        let exists = slowSongs.some(
            s => s.name.toLowerCase() === songName.toLowerCase()
        );

        if (exists) {
            alert("Slow song already exists!");
            return;
        }

        slowSongs.push(song);

    }

    saveData();
    updateDashboard();

    console.log(songName + " added successfully.");

}
/* ==========================================
   PART 7 - FAST SONGS PAGE
========================================== */

const addSongBtn = document.getElementById("addSongBtn");
const songModal = document.getElementById("songModal");
const closeModal = document.getElementById("closeModal");
const saveSongBtn = document.getElementById("saveSongBtn");

if(addSongBtn){
    addSongBtn.onclick = () => {
        songModal.style.display = "flex";
    };
}

if(closeModal){
    closeModal.onclick = () => {
        songModal.style.display = "none";
    };
}

window.onclick = function(e){
    if(e.target === songModal){
        songModal.style.display = "none";
    }
};

/*if(saveSongBtn){

saveSongBtn.onclick = function(){

const name = document.getElementById("songName").value.trim();
const date = document.getElementById("lastSungDate").value;

if(name==""){
alert("Please enter song name");
return;
}

fastSongs.push({
name:name,
lastSung:date,
times:0
});

localStorage.setItem("fastSongs",JSON.stringify(fastSongs));

alert("Song Added Successfully!");

songModal.style.display="none";

location.reload();

};

}*/

 /*   <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Fast Songs | Khristi Kalisia Worship Song Manager</title>

    <link rel="stylesheet" href="../style.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">

    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">

</head>

<body>

<div class="main">

    <div class="top-header">

        <div>

            <h1>🎵 Fast Worship Songs</h1>

            <p>
                Manage all fast worship songs used in church.
            </p>

        </div>

        <a href="../index.html">
            <button>⬅ Dashboard</button>
        </a>

    </div>

    <div class="statistics-section">

        <div class="section-title">

            <h2>Fast Songs Library</h2>

            <p>Add, search, edit and manage fast worship songs.</p>

        </div>

    </div>
    <!-- ========================= -->
<!-- Search & Add Section -->
<!-- ========================= -->

<div class="song-toolbar">

    <input
        type="text"
        id="searchSong"
        placeholder="🔍 Search Fast Song...">

    <button id="addFastSongBtn">
        ➕ Add New Song
    </button>

</div>

<!-- ========================= -->
<!-- Total Songs Card -->
<!-- ========================= -->

<div class="song-summary">

    <div class="summary-card">

        <h3>Total Fast Songs</h3>

        <h1 id="fastSongTotal">0</h1>

    </div>

</div>

<!-- ========================= -->
<!-- Songs Table -->
<!-- ========================= -->

<div class="song-table">

<table>

<thead>

<tr>

<th>S.No</th>

<th>Song Name</th>

<th>Last Sung</th>

<th>Times Sung</th>

<th>Action</th>

</tr>

</thead>

<tbody id="fastSongTable">

<tr>

<td colspan="5" style="text-align:center; padding:25px;">
No Fast Songs Added Yet
</td>

</tr>

</tbody>

</table>

</div>
<!-- ==========================================
     Add Song Modal
========================================== -->
<button id="addSongBtn">Add New Song</button>

<div id="songModal" class="song-modal">

    <div class="modal-content">

        <div class="modal-header">
            <h2>➕ Add Fast Worship Song</h2>
            <span class="close-modal" id="closeModal">&times;</span>
        </div>

        <div class="modal-body">

            <label>Song Name</label>
            <input
                type="text"
                id="songName"
                placeholder="Enter song name">

            <label>Last Sung Date</label>
            <input
                type="date"
                id="lastSungDate">

            <button id="saveSongBtn">
                💾 Save Song
            </button>

        </div>

    </div>

</div>
</div>
<script src="../script.js"></script>
</body>
</html>*/
document.addEventListener("DOMContentLoaded", function(){

const addSongBtn = document.getElementById("addSongBtn");
const songModal = document.getElementById("songModal");
const closeModal = document.getElementById("closeModal");
const saveSongBtn = document.getElementById("saveSongBtn");


if(addSongBtn){
    addSongBtn.onclick = function(){
        songModal.style.display = "flex";
    };
}


if(closeModal){
    closeModal.onclick = function(){
        songModal.style.display = "none";
    };
}


if(saveSongBtn){

saveSongBtn.onclick = function(){

let name = document.getElementById("songName").value;
let date = document.getElementById("lastSungDate").value;


if(name.trim()==""){
alert("Enter song name");
return;
}


fastSongs.push({
name:name,
lastSung:date,
timesSung:0,
selected:false
});


localStorage.setItem("fastSongs", JSON.stringify(fastSongs));
updateDashboard();
displayFastSongs();
alert("Song Added Successfully");


songModal.style.display="none";

//location.reload();

};
}
const searchBox = document.getElementById("searchSong");

if(searchBox){

    searchBox.addEventListener("keyup", searchFastSongs);

}
const sortBox = document.getElementById("sortSongs");

if(sortBox){
    sortBox.addEventListener("change", sortFastSongs);
}
});
function deleteFastSong(index){

    let confirmDelete = confirm("Delete this song?");

    if(confirmDelete){

        fastSongs.splice(index,1);

        localStorage.setItem(
            "fastSongs",
            JSON.stringify(fastSongs)
        );

        updateDashboard();
        displayFastSongs();

    }

}
function markSongUsed(index){

    const today = new Date().toLocaleDateString("en-GB");

    fastSongs[index].lastSung = today;

    fastSongs[index].timesSung++;

    localStorage.setItem(
        "fastSongs",
        JSON.stringify(fastSongs)
    );

    updateDashboard();
    displayFastSongs();

}
function editFastSong(index){

    let newName = prompt("Edit Song Name", fastSongs[index].name);

    if(newName == null){
        return;
    }

    let newDate = prompt("Edit Last Sung Date", fastSongs[index].lastSung);

    if(newDate == null){
        return;
    }

    fastSongs[index].name = newName;
    fastSongs[index].lastSung = newDate;

    localStorage.setItem("fastSongs", JSON.stringify(fastSongs));

    displayFastSongs();
}
function selectFastSong(index){

    fastSongs[index].selected = !fastSongs[index].selected;

    localStorage.setItem(
        "fastSongs",
        JSON.stringify(fastSongs)
    );

    displayFastSongs();

}
function searchFastSongs(){

    const search = document
        .getElementById("searchSong")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#fastSongTable tr");

    rows.forEach(row => {

        if(row.innerText.toLowerCase().includes(search)){
            row.style.display = "";
        }else{
            row.style.display = "none";
        }

    });

}
function sortFastSongs(){

    const type = document.getElementById("sortSongs").value;

    if(type === "az"){
        fastSongs.sort((a,b)=>a.name.localeCompare(b.name));
    }

    if(type === "za"){
        fastSongs.sort((a,b)=>b.name.localeCompare(a.name));
    }

    localStorage.setItem(
        "fastSongs",
        JSON.stringify(fastSongs)
    );

    displayFastSongs();
}
function displaySelectedSongs(){

    const box = document.getElementById("selectedSongList");

    if(!box){
        return;
    }

let selected = [
    ...fastSongs.filter(song => song.selected),
    ...slowSongs.filter(song => song.selected)
];
    if(selected.length === 0){

        box.innerHTML = "No Song Selected";

        return;
    }


    box.innerHTML = "";

    selected.forEach((song,index)=>{

        box.innerHTML += `

        <div class="selected-card">

            <h3>⭐ ${song.name}</h3>

            <p>
            Last Sung: ${song.lastSung || "Never"}
            </p>

            <button onclick="markSelectedUsed(${index})">
            ✔ Used This Sunday
            </button>

        </div>

        `;

    });

}
function markSelectedUsed(index){

    let selected = [
        ...fastSongs.filter(song => song.selected),
        ...slowSongs.filter(song => song.selected)
    ];

    let song = selected[index];

    const today = new Date().toLocaleDateString("en-GB");

    let fastIndex = fastSongs.indexOf(song);

    if(fastIndex !== -1){
        fastSongs[fastIndex].lastSung = today;
        fastSongs[fastIndex].timesSung++;
        fastSongs[fastIndex].selected = false;
    }

    let slowIndex = slowSongs.indexOf(song);

    if(slowIndex !== -1){
        slowSongs[slowIndex].lastSung = today;
        slowSongs[slowIndex].timesSung++;
        slowSongs[slowIndex].selected = false;
    }

    saveData();

    displayFastSongs();
    displaySlowSongs();
    displaySelectedSongs();
    updateDashboard();

}
// ==========================================
// SLOW SONGS DISPLAY
// ==========================================

function displaySlowSongs(){

    const table = document.getElementById("slowSongTable");

    if(!table){
        return;
    }

    table.innerHTML = "";

    if(slowSongs.length === 0){

        table.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;padding:25px;">
                No Slow Songs Added Yet
            </td>
        </tr>
        `;

        return;
    }

    slowSongs.forEach((song,index)=>{

        table.innerHTML += `

        <tr>

            <td>${index+1}</td>

            <td>
                ${song.name}
                ${song.selected ? '<span class="used-badge">⭐ Selected</span>' : ''}
            </td>

            <td>${song.lastSung || "Never"}</td>

            <td>${song.timesSung || 0}</td>
j
            <td>

                <button class="used-btn" onclick="markSlowSongUsed(${index})">
                    ✔ Used
                </button>

                <button class="edit-btn" onclick="editSlowSong(${index})">
                    ✏ Edit
                </button>

                <button class="delete-btn" onclick="deleteSlowSong(${index})">
                    🗑 Delete
                </button>

                <button class="select-btn" onclick="selectSlowSong(${index})">
                    ⭐ Select
                </button>

            </td>

        </tr>

        `;

    });

}
// ==========================================
// SLOW SONGS PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", function(){

const addSlowSongBtn = document.getElementById("addSlowSongBtn");
const songModal = document.getElementById("songModal");
const closeModal = document.getElementById("closeModal");
const saveSlowSongBtn = document.getElementById("saveSlowSongBtn");


if(addSlowSongBtn){
    addSlowSongBtn.onclick = function(){
        songModal.style.display = "flex";
    };
}


if(closeModal){
    closeModal.onclick = function(){
        songModal.style.display = "none";
    };
}


if(saveSlowSongBtn){

saveSlowSongBtn.onclick = function(){

let name = document.getElementById("songName").value;
let date = document.getElementById("lastSungDate").value;


if(name.trim()==""){
alert("Enter song name");
return;
}


slowSongs.push({
name:name,
lastSung:date,
timesSung:0,
selected:false
});


localStorage.setItem("slowSongs", JSON.stringify(slowSongs));

updateDashboard();
displaySlowSongs();

alert("Slow Song Added Successfully");

songModal.style.display="none";

};

}

const searchBox = document.getElementById("searchSlowSong");

if(searchBox){

    searchBox.addEventListener("keyup", searchSlowSongs);

}

const sortBox = document.getElementById("sortSlowSongs");

if(sortBox){

    sortBox.addEventListener("change", sortSlowSongs);

}

displaySlowSongs();

});
// ==========================================
// SLOW SONG FUNCTIONS
// ==========================================

function deleteSlowSong(index){

    let confirmDelete = confirm("Delete this song?");

    if(confirmDelete){

        slowSongs.splice(index,1);

        localStorage.setItem(
            "slowSongs",
            JSON.stringify(slowSongs)
        );

        updateDashboard();
        displaySlowSongs();

    }

}


function markSlowSongUsed(index){

    const today = new Date().toLocaleDateString("en-GB");

    slowSongs[index].lastSung = today;

    slowSongs[index].timesSung++;

    localStorage.setItem(
        "slowSongs",
        JSON.stringify(slowSongs)
    );

    updateDashboard();
    displaySlowSongs();

}


function editSlowSong(index){

    let newName = prompt(
        "Edit Song Name",
        slowSongs[index].name
    );

    if(newName == null){
        return;
    }

    let newDate = prompt(
        "Edit Last Sung Date",
        slowSongs[index].lastSung
    );

    if(newDate == null){
        return;
    }

    slowSongs[index].name = newName;
    slowSongs[index].lastSung = newDate;

    localStorage.setItem(
        "slowSongs",
        JSON.stringify(slowSongs)
    );

    displaySlowSongs();

}


function selectSlowSong(index){

    slowSongs[index].selected =
    !slowSongs[index].selected;

    localStorage.setItem(
        "slowSongs",
        JSON.stringify(slowSongs)
    );

    displaySlowSongs();

}


function searchSlowSongs(){

    const search = document
        .getElementById("searchSlowSong")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#slowSongTable tr");

    rows.forEach(row => {

        if(row.innerText.toLowerCase().includes(search)){
            row.style.display = "";
        }else{
            row.style.display = "none";
        }

    });

}


function sortSlowSongs(){

    const type = document.getElementById("sortSlowSongs").value;

    if(type === "az"){
        slowSongs.sort((a,b)=>a.name.localeCompare(b.name));
    }

    if(type === "za"){
        slowSongs.sort((a,b)=>b.name.localeCompare(a.name));
    }

    localStorage.setItem(
        "slowSongs",
        JSON.stringify(slowSongs)
    );

    displaySlowSongs();

}
function displayPlanner(){

    const fastBox = document.getElementById("selectedFastSongs");
    const slowBox = document.getElementById("selectedSlowSongs");

    if(!fastBox || !slowBox){
        return;
    }

    const selectedFast = fastSongs.filter(song => song.selected);
    const selectedSlow = slowSongs.filter(song => song.selected);

    document.getElementById("fastSelectedCount").innerText =
        selectedFast.length + " / 4";

    document.getElementById("slowSelectedCount").innerText =
        selectedSlow.length + " / 3";

    if(selectedFast.length==0){
        fastBox.innerHTML="No Fast Song Selected";
    }else{
        fastBox.innerHTML=selectedFast
        .map(song=>"🎵 "+song.name)
        .join("<br>");
    }

    if(selectedSlow.length==0){
        slowBox.innerHTML="No Slow Song Selected";
    }else{
        slowBox.innerHTML=selectedSlow
        .map(song=>"🎵 "+song.name)
        .join("<br>");
    }

}
document.addEventListener("DOMContentLoaded",function(){

    displayPlanner();

});
function saveSundayPlan(){

    const selectedFast = fastSongs.filter(song => song.selected);

    const selectedSlow = slowSongs.filter(song => song.selected);

    if(selectedFast.length != 4){

        alert("Please select exactly 4 Fast Songs");

        return;

    }

    if(selectedSlow.length != 3){

        alert("Please select exactly 3 Slow Songs");

        return;

    }

    const today = new Date().toLocaleDateString("en-GB");

    sundayHistory.push({

        date: today,

        fastSongs: selectedFast,

        slowSongs: selectedSlow

    });

    localStorage.setItem(
        "sundayHistory",
        JSON.stringify(sundayHistory)
    );

    alert("Sunday Plan Saved Successfully!");

}
const saveBtn = document.getElementById("saveSundayPlanBtn");

if(saveBtn){

    saveBtn.addEventListener("click", saveSundayPlan);

}
// ==========================================
// CLEAR ALL SELECTED SONGS
// ==========================================

function clearSelection(){

    // Fast Songs
    fastSongs.forEach(function(song){
        song.selected = false;
    });

    // Slow Songs
    slowSongs.forEach(function(song){
        song.selected = false;
    });

    // Save
    localStorage.setItem(
        "fastSongs",
        JSON.stringify(fastSongs)
    );

    localStorage.setItem(
        "slowSongs",
        JSON.stringify(slowSongs)
    );

    // Refresh Pages
    displayFastSongs();
    displaySlowSongs();
    displayPlanner();

    alert("All Selected Songs Cleared Successfully!");

}
function confirmSundayService(){

    const today = new Date().toLocaleDateString("en-GB");

    const fastSelected = fastSongs.filter(song => song.selected);
    const slowSelected = slowSongs.filter(song => song.selected);

    if(fastSelected.length===0 && slowSelected.length===0){
        alert("No songs selected.");
        return;
    }

    fastSongs.forEach(song=>{

        if(song.selected){

            song.lastSung = today;
            song.timesSung++;
            song.selected = false;

        }

    });

    slowSongs.forEach(song=>{

        if(song.selected){

            song.lastSung = today;
            song.timesSung++;
            song.selected = false;

        }

    });

    sundayHistory.push({
        date: today,
        fastSongs: fastSelected.map(song=>song.name),
        slowSongs: slowSelected.map(song=>song.name)
    });

    saveData();

    updateDashboard();
    displayFastSongs();
    displaySlowSongs();
    displayPlanner();

    alert("Sunday Worship Saved Successfully!");

}
document.addEventListener("DOMContentLoaded", function(){

    const dashboardAddSongBtn = document.getElementById("dashboardAddSongBtn");
    const planSundayBtn = document.getElementById("planSundayBtn");
    const historyBtn = document.getElementById("historyBtn");
    const reportBtn = document.getElementById("reportBtn");

    if(dashboardAddSongBtn){
        dashboardAddSongBtn.onclick = function(){
            window.location.href = "pages/fast-songs.html";
        };
    }

    if(planSundayBtn){
        planSundayBtn.onclick = function(){
            window.location.href = "pages/planner.html";
        };
    }

    if(historyBtn){
        historyBtn.onclick = function(){
            window.location.href = "pages/history.html";
        };
    }
if(reportBtn){
    reportBtn.onclick = function(){
        window.location.href = "pages/reports.html";
    };
}

});
const planSundayBtn = document.getElementById("planSundayBtn");

if(planSundayBtn){
    planSundayBtn.onclick = function(){
        window.location.href = "pages/planner.html";
    };
}
function goDashboard(){
    window.location.href = "../index.html";
}

function goFastSongs(){
    window.location.href = "pages/fast-songs.html";
}

function goSlowSongs(){
    window.location.href = "pages/slow-songs.html";
}

function goPlanner(){
    window.location.href = "pages/planner.html";
}

function goHistory(){
    window.location.href = "pages/history.html";
}

function goReports(){
    window.location.href = "pages/reports.html";
}

function goSettings(){
    window.location.href = "pages/settings.html";
}