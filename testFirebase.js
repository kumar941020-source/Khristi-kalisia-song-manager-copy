import { db } from "./firebase.js";
import { ref, set } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


set(ref(db, "test"), {
    message: "Firebase Connected"
});