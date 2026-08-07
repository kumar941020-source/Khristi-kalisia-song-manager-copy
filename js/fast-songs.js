// ==========================================
// FAST SONG PAGE
// ==========================================
import {
    fastSongs,
    addFastSong,
    markFastSongUsed,
    selectFastSong,
    editFastSong,
    deleteFastSong,
    saveSongLyrics
} from "../script1.js";
let currentSongId = "";
function displayFastSongs() {

    let table = document.getElementById("fastSongTable");

    if (!table) return;

    table.innerHTML = "";

    fastSongs.forEach(song => {

        let row = document.createElement("tr");

        row.innerHTML = `

        <td>
            ${song.name}
            ${song.selected ? " ⭐" : ""}
        </td>

        <td>
            ${song.lastSung || "-"}
        </td>

        <td>
            ${song.timesSung || 0}
        </td>

        <td>

            <button
                class="btn-success admin-only"
                onclick="markFastSongUsed('${song.id}')">
                ✔ Used
            </button>

            <button
                class="btn-primary admin-only"
                onclick="selectFastSong('${song.id}')">
                ⭐ Select
            </button>

            <button
                class="btn-primary admin-only"
                onclick="editFastSong('${song.id}')">
                ✏ Edit
            </button>

            <button
                class="btn-danger admin-only"
                onclick="deleteFastSong('${song.id}')">
                🗑 Delete
            </button>
            <button
class="btn-primary"
onclick="openLyrics('${song.id}')">

📖 Lyrics

</button>

        </td>

        `;

        table.appendChild(row);

    });

}



function addFast() {

    let name = document.getElementById("fastSongName").value.trim();

    let date = document.getElementById("fastSongDate").value;

    if (name === "") {

        alert("Enter song name");

        return;

    }

    addFastSong(name, date);

    document.getElementById("fastSongName").value = "";

    document.getElementById("fastSongDate").value = "";

}



function searchFast(value) {

    let table = document.getElementById("fastSongTable");

    if (!table) return;

    let search = value.toLowerCase();

    table.innerHTML = "";

    fastSongs
        .filter(song =>
            song.name.toLowerCase().includes(search)
        )
        .forEach(song => {

            let row = document.createElement("tr");

            row.innerHTML = `

            <td>${song.name}</td>

            <td>${song.lastSung || "-"}</td>

            <td>${song.timesSung || 0}</td>

            <td>

    <button
        class="btn-success admin-only"
        onclick="markFastSongUsed('${song.id}')">
        ✔ Used
    </button>

    <button
        class="btn-primary admin-only"
        onclick="selectFastSong('${song.id}')">
        ⭐ Select
    </button>

    <button
        class="btn-primary"
        onclick="openLyrics('${song.id}')">
        📖 Lyrics
    </button>

    <button
        class="btn-primary admin-only"
        onclick="editFastSong('${song.id}')">
        ✏ Edit
    </button>

    <button
        class="btn-danger admin-only"
        onclick="deleteFastSong('${song.id}')">
        🗑 Delete
    </button>

</td>

            `;

            table.appendChild(row);

        });

}

// DOMContentLoaded yahan zarurat nahi hai.
// initializeApp() script1.js se displayFastSongs() ko call karega.
// ==========================
// LYRICS MODAL
// ==========================

function openLyrics(songId) {

    currentSongId = songId;

    const modal =
    document.getElementById("lyricsModal");

    const text =
    document.getElementById("lyricsText");

    const title =
    document.getElementById("lyricsSongName");

    const song =
    fastSongs.find(s => s.id === songId);

    if(!song) return;

    title.innerText = song.name;

    text.value = song.lyrics || "";

    modal.style.display = "flex";

}

function closeLyrics(){

    document.getElementById(
        "lyricsModal"
    ).style.display = "none";

}

async function saveLyrics() {

    const lyrics =
    document.getElementById("lyricsText").value;

    await saveSongLyrics(currentSongId, lyrics);

    alert("Lyrics Saved Successfully ✅");

    closeLyrics();

}

window.openLyrics = openLyrics;
window.closeLyrics = closeLyrics;
window.saveLyrics = saveLyrics;
window.addFast = addFast;
window.searchFast = searchFast;
window.markFastSongUsed = markFastSongUsed;
window.selectFastSong = selectFastSong;
window.editFastSong = editFastSong;
window.deleteFastSong = deleteFastSong;
window.displayFastSongs = displayFastSongs;
