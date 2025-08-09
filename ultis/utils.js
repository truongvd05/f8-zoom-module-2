export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

import { handleUserState } from "./module.js";
const audio = $(".audio-player");
const timeStart = $(".js-time-start");

export function escapeHTML(html) {
    // Kiểm tra input có hợp lệ không
    const tempDiv = document.createElement("div");
    tempDiv.textContent = String(html); // ép về chuỗi
    return tempDiv.innerHTML;
}

// total song times
export function totalSongTime(time) {
    const div = document.createElement("div");
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
    return `${minutes}:${seconds}`;
}
// time start Song
export function TimeStartSong(time) {
    const minutes = Math.floor(time.duration / 60);
    const seconds = Math.floor(time.duration % 60)
        .toString()
        .padStart(2, "0");
    return `${minutes}:${seconds}`;
}
export function handleTimeStart(time = 0) {
    if (time) {
        const munius = Math.floor(time / 60);
        const second = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");
        timeStart.innerText = `${munius}:${second}`;
        return;
    }
    const munius = Math.floor(audio.currentTime / 60);
    const second = Math.floor(audio.currentTime % 60)
        .toString()
        .padStart(2, "0");
    timeStart.innerText = `${munius}:${second}`;
}
// handle time
export function handleTime() {
    audio.ontimeupdate = () => {
        handleTimeStart();
        handleUserState();
    };
}
