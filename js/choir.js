// ==========================================
// CHOIR MANAGEMENT
// ==========================================


import {

    choirs,

    addChoir as saveChoir,

    editChoir,

    deleteChoir,
    updateChoirMembers

} from "../script1.js";
// ==========================================
// ADD CHOIR
// ==========================================
async function addChoir(){

    let choirName =
    document.getElementById("choirName").value.trim();

    let leaderName =
    document.getElementById("leaderName").value.trim();

    if(choirName==="" || leaderName===""){

        alert("Please fill all fields");

        return;

    }

    await saveChoir(

        choirName,

        leaderName

    );

    displayChoirs();

    document.getElementById("choirName").value="";

    document.getElementById("leaderName").value="";

}

// ==========================================
// DISPLAY CHOIRS
// ==========================================

function displayChoirs() {

    let container =
    document.getElementById("choirContainer");

    if (!container) return;

    container.innerHTML = "";

    if (choirs.length === 0) {

        container.innerHTML = `

        <div class="song-item">

        No Choir Available

        </div>

        `;

        return;

    }

    choirs.forEach(choir => {

        container.innerHTML += `

        <div class="section">

        <h3>
        🎤 ${choir.name}
        </h3>

        <p>

        👤 Leader :

        <b>${choir.leader}</b>

        </p>

        <p>

        👥 Members :

${(choir.members || []).length}
        </p>

<button
    class="btn-primary"
    onclick="openMembers('${choir.id}')">

    👥 Members

</button>

        <button
class="btn-primary admin-only"
onclick="editChoir('${choir.id}')">

✏ Edit

</button>

<button
class="btn-danger admin-only"
onclick="deleteChoir('${choir.id}')">

🗑 Delete

</button>

        </div>

        `;

    });

}
let currentChoirId = "";

function openMembers(choirId) {

    currentChoirId = choirId;

    const choir = choirs.find(c => c.id == choirId);

    if (!choir) return;

    choir.members = choir.members || [];

    document.getElementById("memberChoirName").innerText =
        choir.name;

    document.getElementById("memberModal").style.display = "flex";

    displayMembers();
}

function closeMembers() {

    document.getElementById("memberModal").style.display = "none";

}

function displayMembers() {

    const choir = choirs.find(c => c.id == currentChoirId);

    if (!choir) return;

    choir.members = choir.members || [];

    const box = document.getElementById("memberList");

    box.innerHTML = "";

    if (choir.members.length === 0) {

        box.innerHTML = "<p>No members added yet.</p>";

        return;
    }

    choir.members.forEach((member, index) => {

        box.innerHTML += `
        
        <div class="member-item">

            👤 ${member}

            <button
                class="btn-danger admin-only"
                onclick="deleteMember(${index})">

                🗑

            </button>

        </div>

        `;

    });
}

async function addMember() {

    const input =
        document.getElementById("memberName");

    const name = input.value.trim();

    if (name === "") {

        alert("Enter member name");

        return;
    }

    const choir =
        choirs.find(c => c.id == currentChoirId);

    if (!choir) return;

    choir.members = choir.members || [];

    choir.members.push(name);

    await saveChoirMembers();

    input.value = "";

    displayMembers();
}

async function deleteMember(index) {

    const choir =
        choirs.find(c => c.id == currentChoirId);

    if (!choir) return;

    choir.members.splice(index, 1);

    await saveChoirMembers();

    displayMembers();
}

async function saveChoirMembers() {

    const choir =
        choirs.find(c => c.id == currentChoirId);

    if (!choir) return;

    await updateChoirMembers(
        currentChoirId,
        choir.members
    );

}

window.openMembers = openMembers;
window.closeMembers = closeMembers;
window.addMember = addMember;
window.deleteMember = deleteMember;

window.addChoir = addChoir;
window.displayChoirs =
displayChoirs;

window.editChoir =
editChoir;

window.deleteChoir =
deleteChoir;
document.addEventListener("DOMContentLoaded", () => {
    displayChoirs();
});
