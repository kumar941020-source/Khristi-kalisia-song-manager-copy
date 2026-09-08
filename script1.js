// ==========================================
// KHRISTI KALISIA WORSHIP SONG MANAGER
// MAIN SCRIPT 1
// ==========================================

import {
    db,
    ref,
    set,
    get,
    remove,
    update,
    push
} from "./firebase.js";


// ==========================================
// GLOBAL DATA
// ==========================================

export let fastSongs = [];

export let slowSongs = [];

let sundayHistory = [];

export let choirs = [];


// ==========================================
// SAVE DATA FUNCTION
// ==========================================

async function saveData() {

    const fastObject = {};

    fastSongs.forEach(song => {
        fastObject[song.id] = song;
    });


    const slowObject = {};

    slowSongs.forEach(song => {
        slowObject[song.id] = song;
    });


    const historyObject = {};

    sundayHistory.forEach(item => {
        historyObject[item.id] = item;
    });


    const choirObject = {};

    choirs.forEach(choir => {
        choirObject[choir.id] = choir;
    });


    await set(
        ref(db, "fastSongs"),
        fastObject
    );


    await set(
        ref(db, "slowSongs"),
        slowObject
    );


    await set(
        ref(db, "sundayHistory"),
        historyObject
    );


    await set(
        ref(db, "choirs"),
        choirObject
    );


    console.log("✅ Data Saved Successfully");

}


// ==========================================
// LOAD DATA FROM FIREBASE
// ==========================================

async function loadFirebaseData() {

    fastSongs = [];

    slowSongs = [];

    sundayHistory = [];

    choirs = [];


    // FAST SONGS
    const fastSnapshot =
        await get(
            ref(db, "fastSongs")
        );


    if (fastSnapshot.exists()) {

        fastSongs =
            Object.values(
                fastSnapshot.val()
            );

    }


    // SLOW SONGS
    const slowSnapshot =
        await get(
            ref(db, "slowSongs")
        );


    if (slowSnapshot.exists()) {

        slowSongs =
            Object.values(
                slowSnapshot.val()
            );

    }


    // SUNDAY HISTORY
    const historySnapshot =
        await get(
            ref(db, "sundayHistory")
        );


    if (historySnapshot.exists()) {

        sundayHistory =
            Object.values(
                historySnapshot.val()
            );

    }


    // CHOIRS
    const choirSnapshot =
        await get(
            ref(db, "choirs")
        );


    if (choirSnapshot.exists()) {

        choirs =
            Object.values(
                choirSnapshot.val()
            );

    }


    console.log("✅ Firebase Data Loaded");

}


// ==========================================
// INITIALIZE APP
// ==========================================

async function initializeApp() {

    await loadFirebaseData();

    updateDashboard();


    if (
        typeof window.displayFastSongs ===
        "function"
    ) {

        window.displayFastSongs();

    }


    if (
        typeof window.displaySlowSongs ===
        "function"
    ) {

        window.displaySlowSongs();

    }


    if (
        typeof window.displayChoirs ===
        "function"
    ) {

        window.displayChoirs();

    }


    if (
        typeof displaySelectedSongs ===
        "function"
    ) {

        displaySelectedSongs();

    }


    if (
        typeof window.displaySundayHistory ===
        "function"
    ) {

        window.displaySundayHistory();

    }


    if (
        typeof window.displayPlannerSongs ===
        "function"
    ) {

        window.displayPlannerSongs();

    }


    if (
        typeof updateStatistics ===
        "function"
    ) {

        updateStatistics();

    }


    window.appReady = true;


    console.log(
        "Firebase Initialized Successfully"
    );

}


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await initializeApp();

    }
);


// ==========================================
// DASHBOARD UPDATE
// ==========================================

function updateDashboard() {

    let fastCount =
        document.getElementById(
            "fastCount"
        );


    let slowCount =
        document.getElementById(
            "slowCount"
        );


    let historyCount =
        document.getElementById(
            "historyCount"
        );


    if (fastCount) {

        fastCount.innerText =
            fastSongs.length;

    }


    if (slowCount) {

        slowCount.innerText =
            slowSongs.length;

    }


    if (historyCount) {

        historyCount.innerText =
            sundayHistory.length;

    }


    displaySelectedSongs();

    updateStatistics();

}


// ==========================================
// DISPLAY SELECTED SONGS
// ==========================================

function displaySelectedSongs() {

    let box =
        document.getElementById(
            "selectedSongs"
        );


    if (!box) {

        return;

    }


    let selectedFast =
        fastSongs.filter(
            song =>
                song.selected === true
        );


    let selectedSlow =
        slowSongs.filter(
            song =>
                song.selected === true
        );


    let allSelected = [
        ...selectedFast,
        ...selectedSlow
    ];


    if (allSelected.length === 0) {

        box.innerHTML =
            "No songs selected";

        return;

    }


    box.innerHTML = "";


    allSelected.forEach(song => {

        let div =
            document.createElement(
                "div"
            );


        div.className =
            "song-item";


        div.innerHTML = `

            <span>
                🎵 ${song.name}
            </span>

            <span>
                ⭐ Selected
            </span>

        `;


        box.appendChild(div);

    });

}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    let allSongs = [
        ...fastSongs,
        ...slowSongs
    ];


    let mostPlayed =
        document.getElementById(
            "mostPlayed"
        );


    let recentSong =
        document.getElementById(
            "recentSong"
        );


    let oldSong =
        document.getElementById(
            "oldSong"
        );


    if (allSongs.length === 0) {

        return;

    }


    // MOST PLAYED

    let maxSong =
        [...allSongs].sort(
            (a, b) =>
                (b.timesSung || 0) -
                (a.timesSung || 0)
        )[0];


    if (mostPlayed) {

        mostPlayed.innerText =
            maxSong.name;

    }


    // RECENT SONG

    let recent =
        [...allSongs].sort(
            (a, b) =>
                new Date(b.lastSung) -
                new Date(a.lastSung)
        )[0];


    if (recentSong) {

        recentSong.innerText =
            recent.name;

    }


    // OLD SONG

    let old =
        [...allSongs].sort(
            (a, b) =>
                new Date(a.lastSung) -
                new Date(b.lastSung)
        )[0];


    if (oldSong) {

        oldSong.innerText =
            old.name;

    }

}


// ==========================================
// ADD FAST SONG
// ==========================================

export async function addFastSong(
    name,
    date
) {

    let song = {

        id:
            Date.now().toString(),

        name:
            name,

        lastSung:
            date || "",

        timesSung:
            0,

        selected:
            false

    };


    fastSongs.push(song);


    await saveData();


    updateDashboard();


    if (
        typeof window.displayFastSongs ===
        "function"
    ) {

        window.displayFastSongs();

    }

}


// ==========================================
// ADD SLOW SONG
// ==========================================

export async function addSlowSong(
    name,
    date
) {

    let song = {

        id:
            Date.now().toString(),

        name:
            name,

        lastSung:
            date || "",

        timesSung:
            0,

        selected:
            false

    };


    slowSongs.push(song);


    await saveData();


    updateDashboard();


    if (
        typeof window.displaySlowSongs ===
        "function"
    ) {

        window.displaySlowSongs();

    }

}


// ==========================================
// DELETE FAST SONG
// ==========================================

export async function deleteFastSong(id) {

    fastSongs =
        fastSongs.filter(
            song =>
                song.id != id
        );


    await saveData();

    updateDashboard();


    if (
        typeof window.displayFastSongs ===
        "function"
    ) {

        window.displayFastSongs();

    }

}


// ==========================================
// DELETE SLOW SONG
// ==========================================

export async function deleteSlowSong(id) {

    slowSongs =
        slowSongs.filter(
            song =>
                song.id != id
        );


    await saveData();

    updateDashboard();


    if (
        typeof window.displaySlowSongs ===
        "function"
    ) {

        window.displaySlowSongs();

    }

}


// ==========================================
// EDIT FAST SONG
// ==========================================

export async function editFastSong(id) {

    let song =
        fastSongs.find(
            s =>
                s.id == id
        );


    if (!song) return;


    let newName =
        prompt(
            "Enter new song name",
            song.name
        );


    if (!newName) return;


    song.name =
        newName;


    await saveData();

    updateDashboard();


    if (
        typeof window.displayFastSongs ===
        "function"
    ) {

        window.displayFastSongs();

    }

}


// ==========================================
// EDIT SLOW SONG
// ==========================================

export async function editSlowSong(id) {

    let song =
        slowSongs.find(
            s =>
                s.id == id
        );


    if (!song) return;


    let newName =
        prompt(
            "Enter new song name",
            song.name
        );


    if (!newName) return;


    song.name =
        newName;


    await saveData();

    updateDashboard();


    if (
        typeof window.displaySlowSongs ===
        "function"
    ) {

        window.displaySlowSongs();

    }

}


// ==========================================
// SELECT FAST SONG
// NO LIMIT
// ==========================================

export async function selectFastSong(id) {

    let song =
        fastSongs.find(
            s =>
                s.id == id
        );


    if (!song) return;


    // NO LIMIT
    song.selected =
        !song.selected;


    await saveData();

    updateDashboard();


    if (
        typeof window.displayFastSongs ===
        "function"
    ) {

        window.displayFastSongs();

    }

}


// ==========================================
// SELECT SLOW SONG
// NO LIMIT
// ==========================================

export async function selectSlowSong(id) {

    let song =
        slowSongs.find(
            s =>
                s.id == id
        );


    if (!song) return;


    // NO LIMIT
    song.selected =
        !song.selected;


    await saveData();

    updateDashboard();


    if (
        typeof window.displaySlowSongs ===
        "function"
    ) {

        window.displaySlowSongs();

    }

}


// ==========================================
// MARK FAST SONG USED
// ==========================================

export async function markFastSongUsed(id) {

    let song =
        fastSongs.find(
            s =>
                s.id == id
        );


    if (!song) return;


    song.timesSung =
        (song.timesSung || 0) + 1;


    song.lastSung =
        new Date()
            .toLocaleDateString(
                "en-GB"
            );


    song.selected =
        false;


    await saveData();

    updateDashboard();


    if (
        typeof window.displayFastSongs ===
        "function"
    ) {

        window.displayFastSongs();

    }

}


// ==========================================
// MARK SLOW SONG USED
// ==========================================

export async function markSlowSongUsed(id) {

    let song =
        slowSongs.find(
            s =>
                s.id == id
        );


    if (!song) return;


    song.timesSung =
        (song.timesSung || 0) + 1;


    song.lastSung =
        new Date()
            .toLocaleDateString(
                "en-GB"
            );


    song.selected =
        false;


    await saveData();

    updateDashboard();


    if (
        typeof window.displaySlowSongs ===
        "function"
    ) {

        window.displaySlowSongs();

    }

}


// ==========================================
// SAVE SUNDAY PLANNER
// NO LIMIT
// ==========================================

export async function saveSundayPlan() {

    let selectedFast =
        fastSongs.filter(
            song =>
                song.selected
        );


    let selectedSlow =
        slowSongs.filter(
            song =>
                song.selected
        );


    // At least one song required

    if (
        selectedFast.length === 0 &&
        selectedSlow.length === 0
    ) {

        alert(
            "Please select at least one song"
        );

        return;

    }


    let plan = {

        id:
            Date.now().toString(),

        date:
            new Date()
                .toLocaleDateString(
                    "en-GB"
                ),

        fastSongs:
            selectedFast,

        slowSongs:
            selectedSlow

    };


    sundayHistory.push(
        plan
    );


    // Unselect songs

    fastSongs.forEach(
        song =>
            song.selected = false
    );


    slowSongs.forEach(
        song =>
            song.selected = false
    );


    await saveData();

    updateDashboard();


    if (
        typeof window.displaySundayHistory ===
        "function"
    ) {

        window.displaySundayHistory();

    }


    alert(
        "Sunday Plan Saved Successfully"
    );

}
// ==========================================
// CLEAR SELECTED SONGS
// ==========================================

export async function clearSelectedSongs() {

    fastSongs.forEach(
        song => {
            song.selected = false;
        }
    );


    slowSongs.forEach(
        song => {
            song.selected = false;
        }
    );


    await saveData();

    updateDashboard();

}


// ==========================================
// GET SUNDAY HISTORY
// ==========================================

export function getSundayHistory() {

    return [
        ...sundayHistory
    ];

}


// ==========================================
// DELETE HISTORY
// ==========================================

export async function deleteHistory(id) {

    sundayHistory =
        sundayHistory.filter(
            item =>
                item.id != id
        );


    await saveData();

    updateDashboard();


    if (
        typeof window.displaySundayHistory ===
        "function"
    ) {

        window.displaySundayHistory();

    }

}


// ==========================================
// SEARCH FAST SONGS
// ==========================================

export function searchFastSongs(value) {

    let search =
        value.toLowerCase();


    let result =
        fastSongs.filter(
            song =>
                song.name
                    .toLowerCase()
                    .includes(search)
        );


    return result;

}


// ==========================================
// SEARCH SLOW SONGS
// ==========================================

export function searchSlowSongs(value) {

    let search =
        value.toLowerCase();


    let result =
        slowSongs.filter(
            song =>
                song.name
                    .toLowerCase()
                    .includes(search)
        );


    return result;

}


// ==========================================
// SORT SONGS
// ==========================================

export function sortSongs(
    array,
    type
) {

    if (type === "name") {

        return array.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    }


    if (type === "most") {

        return array.sort(
            (a, b) =>
                (b.timesSung || 0) -
                (a.timesSung || 0)
        );

    }


    if (type === "old") {

        return array.sort(
            (a, b) =>
                new Date(a.lastSung) -
                new Date(b.lastSung)
        );

    }


    return array;

}


// ==========================================
// FAST SONG LYRICS
// ==========================================

export async function saveSongLyrics(
    songId,
    lyrics
) {

    const song =
        fastSongs.find(
            s =>
                s.id === songId
        );


    if (!song) return;


    song.lyrics =
        lyrics;


    await saveData();

}


// ==========================================
// SLOW SONG LYRICS
// ==========================================

export async function saveSlowSongLyrics(
    songId,
    lyrics
) {

    const song =
        slowSongs.find(
            s =>
                s.id === songId
        );


    if (!song) return;


    song.lyrics =
        lyrics;


    await saveData();

}


// ==========================================
// ADD CHOIR
// ==========================================

export async function addChoir(
    name,
    leader
) {

    let choir = {

        id:
            Date.now().toString(),

        name:
            name,

        leader:
            leader,

        members: []

    };


    choirs.push(
        choir
    );


    await saveData();


    if (
        typeof window.displayChoirs ===
        "function"
    ) {

        window.displayChoirs();

    }

}


// ==========================================
// DELETE CHOIR
// ==========================================

export async function deleteChoir(id) {

    choirs =
        choirs.filter(
            choir =>
                choir.id != id
        );


    await saveData();


    if (
        typeof window.displayChoirs ===
        "function"
    ) {

        window.displayChoirs();

    }

}


// ==========================================
// EDIT CHOIR
// ==========================================

export async function editChoir(id) {

    let choir =
        choirs.find(
            c =>
                c.id == id
        );


    if (!choir) return;


    let name =
        prompt(
            "Choir Name",
            choir.name
        );


    if (!name) return;


    let leader =
        prompt(
            "Leader Name",
            choir.leader
        );


    if (!leader) return;


    choir.name =
        name;


    choir.leader =
        leader;


    await saveData();


    if (
        typeof window.displayChoirs ===
        "function"
    ) {

        window.displayChoirs();

    }

}


// ==========================================
// UPDATE CHOIR LEADER
// ==========================================

export async function updateChoirLeader(
    id,
    newLeader
) {

    const choir =
        choirs.find(
            c =>
                c.id == id
        );


    if (!choir) return;


    choir.leader =
        newLeader;


    await saveData();


    if (
        typeof window.displayChoirs ===
        "function"
    ) {

        window.displayChoirs();

    }

}


// ==========================================
// UPDATE CHOIR MEMBERS
// ==========================================

export async function updateChoirMembers(
    id,
    members
) {

    const choir =
        choirs.find(
            c =>
                c.id == id
        );


    if (!choir) return;


    choir.members =
        members || [];


    await saveData();


    if (
        typeof window.displayChoirs ===
        "function"
    ) {

        window.displayChoirs();

    }


    console.log(
        "✅ Choir Members Saved Successfully"
    );

}


// ==========================================
// WINDOW FUNCTIONS
// ==========================================

window.deleteFastSong =
    deleteFastSong;


window.editFastSong =
    editFastSong;


window.selectFastSong =
    selectFastSong;


window.markFastSongUsed =
    markFastSongUsed;


window.deleteSlowSong =
    deleteSlowSong;


window.editSlowSong =
    editSlowSong;


window.selectSlowSong =
    selectSlowSong;


window.markSlowSongUsed =
    markSlowSongUsed;


window.addFastSong =
    addFastSong;


window.addSlowSong =
    addSlowSong;


window.saveSundayPlan =
    saveSundayPlan;


window.clearSelectedSongs =
    clearSelectedSongs;