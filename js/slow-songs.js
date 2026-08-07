// ==========================================
// SLOW SONG PAGE
// ==========================================
import {
    slowSongs,
    addSlowSong,
    markSlowSongUsed,
    selectSlowSong,
    editSlowSong,
    deleteSlowSong,
    saveSlowSongLyrics

} from "../script1.js";
let currentSongId = "";
function displaySlowSongs() {

    let table = document.getElementById("slowSongTable");

    if (!table) return;

    table.innerHTML = "";

    slowSongs.forEach(song => {

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
                onclick="markSlowSongUsed('${song.id}')">
                ✔ Used
            </button>

            <button
                class="btn-primary admin-only"
                onclick="selectSlowSong('${song.id}')">
                ⭐ Select
            </button>

            <button
                class="btn-primary admin-only"
                onclick="editSlowSong('${song.id}')">
                ✏ Edit
            </button>

            <button
                class="btn-danger admin-only"
                onclick="deleteSlowSong('${song.id}')">
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



async function addSlow() {

    let name = document.getElementById("slowSongName").value.trim();

    let date = document.getElementById("slowSongDate").value;

    if (name === "") {

        alert("Enter song name");

        return;

    }

    addSlowSong(name, date);

    document.getElementById("slowSongName").value = "";

    document.getElementById("slowSongDate").value = "";

}



function searchSlow(value) {

    let table = document.getElementById("slowSongTable");

    if (!table) return;

    let search = value.toLowerCase();

    table.innerHTML = "";

    slowSongs
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
        onclick="markSlowSongUsed('${song.id}')">
        ✔ Used
    </button>

    <button
        class="btn-primary admin-only"
        onclick="selectSlowSong('${song.id}')">
        ⭐ Select
    </button>

    <button
        class="btn-primary"
        onclick="openLyrics('${song.id}')">
        📖 Lyrics
    </button>

    <button
        class="btn-primary admin-only"
        onclick="editSlowSong('${song.id}')">
        ✏ Edit
    </button>

    <button
        class="btn-danger admin-only"
        onclick="deleteSlowSong('${song.id}')">
        🗑 Delete
    </button>

</td>
            `;

            table.appendChild(row);

        });

}
function openLyrics(songId) {

    currentSongId = songId;

    const modal = document.getElementById("lyricsModal");
    const text = document.getElementById("lyricsText");
    const title = document.getElementById("lyricsSongName");

    const song = slowSongs.find(s => s.id === songId);

    if (!song) return;

    title.innerText = song.name;
    text.value = song.lyrics || "";

    modal.style.display = "flex";

}

function closeLyrics() {

    document.getElementById("lyricsModal").style.display = "none";

}
async function saveLyrics() {

    const lyrics =
    document.getElementById("lyricsText").value;

    await saveSlowSongLyrics(currentSongId, lyrics);

    alert("Lyrics Saved Successfully ✅");

    closeLyrics();

}

// DOMContentLoaded ki zarurat nahi hai.
// initializeApp() script1.js se displaySlowSongs() call ho jayega.
window.openLyrics = openLyrics;
window.closeLyrics = closeLyrics;
window.saveLyrics = saveLyrics;
window.displaySlowSongs = displaySlowSongs;
window.addSlow = addSlow;
window.searchSlow = searchSlow;
window.markSlowSongUsed = markSlowSongUsed;
window.selectSlowSong = selectSlowSong;
window.editSlowSong = editSlowSong;
window.deleteSlowSong = deleteSlowSong;