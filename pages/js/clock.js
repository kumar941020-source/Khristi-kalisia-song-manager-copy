function updateClock() {

    const box = document.getElementById("todayDate");

    if (!box) return;

    const now = new Date();

    box.innerHTML =
        now.toLocaleDateString("en-GB") +
        " | " +
        now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

}

updateClock();

setInterval(updateClock, 1000);