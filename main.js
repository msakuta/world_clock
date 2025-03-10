const defaultTimezones = [
    { name: "New York", timeZone: "America/New_York", offset: -5 },
    { name: "London", timeZone: "Europe/London", offset: 0 },
    { name: "Berlin", timeZone: "Europe/Berlin", offset: 1 },
    { name: "Moscow", timeZone: "Europe/Moscow", offset: 3 },
    { name: "Dubai", timeZone: "Asia/Dubai", offset: 4 },
    { name: "New Delhi", timeZone: "Asia/Kolkata", offset: 5.5 },
    { name: "Beijing", timeZone: "Asia/Shanghai", offset: 8 },
    { name: "Tokyo", timeZone: "Asia/Tokyo", offset: 9 },
    { name: "Sydney", timeZone: "Australia/Sydney", offset: 10 },
    { name: "Los Angeles", timeZone: "America/Los_Angeles", offset: -8 }
];
let timezones = [];

const clock = document.getElementById("clock");
const hourOffsetSlider = document.getElementById("hourOffset");
const hourValue = document.getElementById("hourValue");
const showLabels = document.getElementById("showLabels");
const radius = 150; // Text radius
const outerRadius = 170;
const labelRadius = 190;
const globeRadius = 160;
const daylightRadius = 160;
const clockWidth = 400;
const clockHeight = 400;
const workHourStart = 9;
const workHourEnd = 18;

function loadSettings() {
    try {
        const settings = JSON.parse(localStorage["worldClock"]) || {};
        timezones = settings.timezones || defaultTimezones;
    }
    catch (e) {
        timezones = defaultTimezones;
    };
}

loadSettings();

function updateClock() {
    clock.innerHTML = ""; // Clear existing elements
    const ctx = canvas.getContext("2d");
    const offset = parseInt(hourOffsetSlider.value);
    const now = new Date(new Date().getTime() + offset * 3600000);
    let noon = -((now.getUTCHours() * 60 + now.getUTCMinutes()) * 60 + now.getUTCSeconds()) * 360 / (24 * 60 * 60) + 90;
    noon -= Math.floor(noon / 360) * 360;

    ctx.clearRect(0, 0, clockWidth, clockHeight);
    ctx.strokeStyle = "#afaf00";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(clockWidth / 2, clockHeight / 2, daylightRadius - ctx.lineWidth / 2., noon * Math.PI / 180, (noon + 180) * Math.PI / 180);
    ctx.stroke();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#3f7faf";
    ctx.beginPath();
    ctx.arc(clockWidth / 2, clockHeight / 2, daylightRadius + ctx.lineWidth / 2.,
        (noon + (workHourStart - 6) * 180 / 12) * Math.PI / 180,
        (noon + (workHourEnd - 6) * 180 / 12) * Math.PI / 180);
    ctx.stroke();

    for (let i = 0; i < 24; i++) {
        const angle = i * Math.PI / 12 + (noon - 90) * Math.PI / 180;
        const x0 = clockWidth / 2 + radius * Math.cos(angle);
        const y0 = clockHeight / 2 + radius * Math.sin(angle);
        const x1 = clockWidth / 2 + outerRadius * Math.cos(angle);
        const y1 = clockHeight / 2 + outerRadius * Math.sin(angle);
        const x2 = clockWidth / 2 + labelRadius * Math.cos(angle);
        const y2 = clockWidth / 2 + labelRadius * Math.sin(angle);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        // Don't clutter the display with clock ticks if we show labels
        if (!showLabels.checked) {
            ctx.fillStyle = "#fff";
            ctx.font = "bold 20px sans-serif";
            const text = `${i}`;
            const tm = ctx.measureText(text);
            ctx.fillText(text, x2 - tm.width / 2, y2 + 10);
        }
    }

    timezones.forEach((tz, index) => {
        const angle = tz.offset * 2 * Math.PI / 24;
        const x = clockWidth / 2 + radius * Math.cos(angle);
        const y = clockHeight / 2 + radius * Math.sin(angle);

        if (showLabels.checked) {
            const person = document.createElement("div");
            person.className = "person";
            person.style.left = `${x}px`;
            person.style.top = `${y}px`;
            person.innerHTML = `${tz.name}<br>${now.toLocaleTimeString('en-US', { timeZone: tz.timeZone })}`;
            clock.appendChild(person);
        }

        if (tz.iconUrl) {
            const iconX = clockWidth / 2 + radius * Math.cos(angle);
            const iconY = clockWidth / 2 + radius * Math.sin(angle);
            const icon = document.createElement("img");
            icon.src = tz.iconUrl;
            icon.style.position = "absolute";
            icon.style.width = "32px";
            icon.style.height = "32px";
            icon.style.left = `${iconX}px`;
            icon.style.top = `${iconY}px`;
            clock.appendChild(icon);
        }

    });
}

hourOffsetSlider.addEventListener("input", () => {
    hourValue.textContent = hourOffsetSlider.value;
    updateClock();
});

const timezoneName = document.getElementById("timezoneName");
const timezoneId = document.getElementById("timezoneId");
const timezoneIconUrl = document.getElementById("timezoneIconUrl");
const timezoneHourOffsetSlider = document.getElementById("timezoneHourOffsetSlider");
const timezoneHourOffsetValue = document.getElementById("timezoneHourOffsetValue");
const addTimezoneButton = document.getElementById("addTimezone");

addTimezoneButton.addEventListener("click", function addTimezone() {
    timezones.push({
        name: timezoneName.value,
        timeZone: timezoneId.value,
        iconUrl: timezoneIconUrl.value,
        offset: parseFloat(timezoneHourOffsetValue.textContent),
    });
    localStorage["worldClock"] = JSON.stringify({
        timezones
    });
});

timezoneHourOffsetSlider.addEventListener("input", () => {
    timezoneHourOffsetValue.textContent = timezoneHourOffsetSlider.value;
});

showLabels.addEventListener("click", updateClock);

updateClock();
setInterval(updateClock, 1000);
