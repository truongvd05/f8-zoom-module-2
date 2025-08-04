import {
    $,
    $$,
    httpRequest,
    handleTime,
    totalSongTime,
    renderPlayerLeft,
    escapeHTML,
    showNotification,
    renderHero,
    renderHero1,
    renderPlayerList,
} from "./module.js";

const play = $(".play-btn");
const iconPlay = $(".js-icon-play");
const audio = $(".audio-player");
const btnHuge = $(".play-btn-large");
const loop = $(".repeat-btn");
const random = $(".btn-shuffle");
const timeEnd = $(".js-time-end");
const volume = $(".volume-container");
const iconVolume = $(".js-icon-volume");
const sortBtn = $(".search-library");
const sortBtnList = $(".sort-btn-list");
const viewAs = $(".user-view");
const sidebarContextMenu = $(".sidebar");
const contexMenu = $(".context-menu");
const contexMenuPlayList = $(".context-menu-playlist");
const navtabs = $(".nav-tabs");
const playCenter = $(".player-center");
const icomVolume = $(".js-icon-volume");
const loopBtn = $(".repeat-btn");
const volumeBar = $(".volume-bar");
const volumeContaine = $(".js-volume");
const bar = $(".progress-bar");
const signUp = signupForm.querySelector(".auth-form-content");
const login = loginForm.querySelector(".auth-form-content");
const createBtn = $(".create-btn");
const labal = $(".labal-input");

let currenindex = 0;
let isPlay = false;
let currentSong = 0;
let isVolume = true;
let isLoop = false;
let isRandom = false;
let lastVolume = audio.volume;
let ismoveVolume = false;
let ismoveBar = false;
let idArtist = null;
let idAPlaylist = null;

const sectionControl = $(".artist-controls");
const sectionPopular = $(".popular-section");
const sectionAstist = $(".artist-hero");
export async function getTrendingTracks(limit = 20) {
    const { tracks } = await httpRequest.get(`tracks/trending?limit=${limit}`);
    return tracks;
}

// show render
function addPlaylist() {
    const overlay = $(".overlay-create");
    labal.addEventListener("click", function () {
        overlay.classList.add("show");
    });
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
            overlay.classList.remove("show");
        }
    });
    // close render
}

function createPlaylist() {
    const container = $(".section-input");
    createBtn.addEventListener("click", function () {
        if (container.classList.contains("show")) {
            container.classList.remove("show");
            sectionControl.hidden = false;
            sectionPopular.hidden = false;
            sectionAstist.hidden = false;
        } else {
            container.classList.add("show");
            sectionControl.hidden = true;
            sectionPopular.hidden = true;
            sectionAstist.hidden = true;
        }
    });
}

// show password resgiter
function showPassWord(container) {
    const password = $("#signupPassword");
    container.addEventListener("click", function (e) {
        const icon = e.target.closest(".icon-password");
        if (icon) {
            const password = icon.closest(".form-group").querySelector("input");
            if (password.type === "password") {
                password.type = "text";
                icon.classList.replace("fa-eye-slash", "fa-eye");
            } else {
                icon.classList.replace("fa-eye", "fa-eye-slash");
                password.type = "password";
            }
        }
    });
}
// handle click bar
function handleClickBar() {
    bar.addEventListener("mousedown", (e) => {
        ismoveBar = true;
        UpdateProgress(e);
    });
}
// update tiến trình
function UpdateProgress(e) {
    const progressFill = $(".progress-bar");
    const progressHandle = $(".progress-handle");
    const rect = progressFill.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    let percent1 = e.clientX - rect.left;
    percent = Math.min(Math.max(percent, 0), 1);
    progressFill.style.width = `${percent}px`;
    progressHandle.style.left = `${percent1}px`;
    audio.currentTime = percent * audio.duration;
}
// handle move on volume
function changeVolume() {
    volumeBar.addEventListener("mousedown", (e) => {
        ismoveVolume = true;
        updateVolume(e);
    });
    document.addEventListener("mousemove", (e) => {
        if (ismoveVolume) {
            updateVolume(e);
        }
        if (ismoveBar) {
            UpdateProgress(e);
        }
    });
    document.addEventListener("mouseup", function (e) {
        ismoveVolume = false;
        ismoveBar = false;
    });
}

function updateVolume(e) {
    const volume = $(".volume-fill");
    const markVolume = $(".volume-handle");
    const rect = volumeBar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.min(Math.max(percent, 0), 1);
    audio.volume = percent;
    lastVolume = audio.volume;
    volume.style.width = `${audio.volume * 100}%`;
    markVolume.style.left = `${audio.volume * 100}%`;
    if (audio.volume === 0) {
        iconVolume.classList.replace("fa-volume-up", "fa-volume-down");
        volumeContaine.classList.add("mute");
    } else {
        iconVolume.classList.replace("fa-volume-down", "fa-volume-up");
        volumeContaine.classList.remove("mute");
    }
}
// handle volume
function handleClickSort() {
    sortBtnList.addEventListener("click", function (e) {
        const itemActive = $$(".item-sort.active");
        const itemClick = e.target.closest(".item-sort");
        if (itemClick) {
            itemActive.forEach((item) => {
                item.classList.remove("active");
            });
            itemClick.classList.add("active");
        }
        if (e.target.closest(".item-sort")) {
            const target = e.target;
            const text = target.textContent;
            const changeText = $(".sort-btn-text");
            changeText.innerHTML = escapeHTML(text);
        }
        if (e.target.closest("i")) {
            const icon = $(".icon-view");
            const className = e.target.className;
            icon.className = `${className} icon-view`;
        }
    });
}
// thanh tiến trình
function handleProgress() {
    const progress = document.querySelector(".progress-fill");
    const progressHandle = $(".progress-handle");
    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${percent}%`;
            progressHandle.style.left = `${percent}%`;
        }
    });
}

//
function handleControlSong() {
    playCenter.addEventListener("click", async function (e) {
        const tracks = await getTrendingTracks();
        if (e.target.closest(".next-btn")) {
            handlNextSong(tracks);
            handleProgress();
            timeEnd.innerHTML = totalSongTime(tracks[currenindex].duration);
            handleTime();
            activeSong(currenindex);
            renderPlayerLeft(tracks[currenindex]);
        }
        if (e.target.closest(".control-prev")) {
            handelPrevSong(tracks);
            handleProgress();
            timeEnd.innerHTML = totalSongTime(tracks[currenindex].duration);
            handleTime();
            activeSong(currenindex);
            renderPlayerLeft(tracks[currenindex]);
        }
    });
}
// handle next Song
function handlNextSong(tracks) {
    isPlay = true;
    currenindex++;
    currentSong = (currenindex + tracks.length) % tracks.length;
    audio.src = tracks[currentSong].audio_url;
    iconPlay.classList.replace("fa-play", "fa-pause");
    audio.play();
}
// handle prve song
function handelPrevSong(tracks) {
    isPlay = true;
    currenindex--;
    currentSong = (currenindex + tracks.length) % tracks.length;

    audio.src = tracks[currentSong].audio_url;
    iconPlay.classList.replace("fa-play", "fa-pause");
    audio.play();
}

function handleContextMenu(e) {
    e.preventDefault();
}
// context menu
contexMenuPlayList.addEventListener("click", async function (e) {
    if (e.target.closest(".playlist-delete")) {
        try {
            const res = await httpRequest.del(`playlists/${idAPlaylist}`);
            renderPlayerList();
        } catch (error) {
            const message = error?.response?.error?.message;
            switch (error?.response?.error?.code) {
                case "PERMISSION_DENIED":
                    showNotification(message);
                    break;
                case "RATE_LIMIT_EXCEEDED":
                    showNotification(message);
                    break;
                default:
                    console.log("có lỗi xảy ra");
                    break;
            }
        }
    }
});
contexMenu.addEventListener("contextmenu", handleContextMenu);
contexMenuPlayList.addEventListener("contextmenu", handleContextMenu);
// click item artists
function handleClickItemArtists() {
    const library = $(".library-content");
    library.addEventListener("click", function (e) {
        const item = e.target.closest(".library-artists");
        const itemActive = document.querySelector(".library-artists.active");
        let id = null;
        if (item) {
            if (itemActive) {
                itemActive.classList.remove("active");
            }
            item.classList.add("active");
            id = item.dataset.index;
            renderHero(id);
        }
        const item1 = e.target.closest(".library-play-list");
        const itemActive1 = document.querySelectorAll(
            ".library-play-list.active"
        )[0];
        if (item1) {
            if (itemActive1) {
                itemActive1.classList.remove("active");
            }
            item1.classList.add("active");
            id = item1.dataset.index;
            renderHero1(id);
        }
    });
}

// when user not loggin
export function showToast() {
    navtabs.addEventListener("click", toastOnClick);
}

export function removeShowToast() {
    if (navtabs) {
        navtabs.removeEventListener("click", toastOnClick);
    }
}

function toastOnClick(e) {
    if (e.target.closest(".js-player-list") || e.target.closest(".js-artist")) {
        showNotification();
    }
}

// when user not loggin
export function createPlay() {
    const btn = $(".library-create-btn");
    const login = $(".library-login");
    btn.addEventListener("click", function (e) {
        login.classList.toggle("show");
    });
}
// reload pages
function handleReload() {
    const home = $(".home-btn");
    const logo = $(".logo");
    function reloadHome() {
        location.reload();
    }
    home.addEventListener("click", reloadHome);
    logo.addEventListener("click", reloadHome);
}
// handle menu sidebar
function handleSidebarContextMenu() {
    sidebarContextMenu.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        const artist = e.target.closest(".library-artists");
        if (artist) {
            const mouseX = e.pageX;
            const mouseY = e.pageY;
            idArtist = artist.dataset.index;

            // Gán vị trí cho phần tử
            contexMenu.style.left = `${mouseX}px`;
            contexMenu.style.top = `${mouseY}px`;
            contexMenu.classList.toggle("show");
        }
        const playlist = e.target.closest(".library-play-list");
        if (playlist) {
            const mouseX = e.pageX;
            const mouseY = e.pageY;
            idAPlaylist = playlist.dataset.index;

            // Gán vị trí cho phần tử
            contexMenuPlayList.style.left = `${mouseX}px`;
            contexMenuPlayList.style.top = `${mouseY}px`;
            contexMenuPlayList.classList.toggle("show");
        }
    });
}

export function removeOnClick() {
    sidebarContextMenu.removeEventListener("click", onclick);
}
document.addEventListener("click", function (e) {
    contexMenu.classList.remove("show");
    contexMenuPlayList.classList.remove("show");
    if (!e.target.closest(".sort-btn") && !e.target.closest(".sort-btn-list")) {
        sortBtnList.classList.remove("show");
    }
});
// user view as
function handleView() {
    viewAs.addEventListener("click", function (e) {
        const itemActive = $$(".item-view.active");
        const itemClick = e.target.closest(".item-view");
        if (itemClick) {
            itemActive.forEach((item) => {
                item.classList.remove("active");
            });
            itemClick.classList.add("active");
        }
    });
}
const librarySearch = $(".library-search");

// handle btn sort
function handleSort() {
    sortBtn.addEventListener("click", function (e) {
        if (e.target.closest(".sort-btn")) {
            sortBtnList.classList.toggle("show");
        }
        if (e.target.closest(".search-library-btn")) {
            librarySearch.classList.add("active");
            setTimeout(() => {
                librarySearch.focus();
            }, 100);
        }
    });
}
librarySearch.addEventListener("blur", () => {
    librarySearch.classList.remove("active");
});
// randomSong
function handleRandomSong() {
    random.addEventListener("click", function (e) {
        if (!isRandom) {
            isRandom = !isRandom;
            this.classList.add("active");
        } else {
            isRandom = !isRandom;
            this.classList.remove("active");
        }
    });
}
// update volume click icon
function updateVolumeUI(volumePercent) {
    const volume = $(".volume-fill");
    const markVolume = $(".volume-handle");
    volume.style.width = `${volumePercent * 100}%`;
    markVolume.style.left = `${volumePercent * 100}%`;
}

// handle volume
function handleVolume() {
    volumeContaine.addEventListener("click", function (e) {
        const target = e.target.closest(".js-volume");
        lastVolume = audio.volume || 0.5;

        if (target) {
            target.classList.toggle("mute");
        }
        if (target.classList.contains("mute")) {
            iconVolume.classList.replace("fa-volume-up", "fa-volume-down");
            audio.volume = 0;
            updateVolumeUI(0);
        } else {
            iconVolume.classList.replace("fa-volume-down", "fa-volume-up");
            audio.volume = lastVolume;
            updateVolumeUI(lastVolume);
        }
        isVolume = !isVolume;
    });
}
// handle huge btn
function handleBtnHuge() {
    btnHuge.addEventListener("click", async function (e) {
        const tracks = await getTrendingTracks();
        let currenindex = 0;
        audio.src = tracks[currenindex].audio_url;
        audio.play();
        isPlay = true;
        activeSong(currenindex);
        iconPlay.classList.replace("fa-play", "fa-pause");
        timeEnd.innerHTML = totalSongTime(tracks[currenindex].duration);
        handleTime();
    });
}
audio.addEventListener("canplay", () => {
    audio.play();
});
audio.addEventListener("ended", async () => {
    const tracks = await getTrendingTracks();
    if (isLoop) {
        audio.loop = isLoop;
    } else {
        audio.loop = isLoop;
        handlNextSong(tracks);
        activeSong(currenindex);
    }
});
function handleLoop() {
    if (isLoop) {
        audio.loop = true;
    } else {
        audio.loop = false;
    }
}

// loop song
function handleLoopSong() {
    loop.addEventListener("click", function (e) {
        isLoop = !isLoop;

        // Toggle class active
        this.classList.toggle("active", isLoop);

        // Bật/tắt loop audio
        audio.loop = isLoop;
    });
}

// play song
function handlePlay() {
    play.addEventListener("click", function () {
        this.classList.replace("control-btn-play", "control-btn-pause");
        if (!isPlay) {
            isPlay = !isPlay;
            iconPlay.classList.replace("fa-play", "fa-pause");
            audio.play();
            activeSong(currenindex);
            if (audio.readyState > 2) {
                audio.play();
            }
        } else {
            isPlay = !isPlay;
            iconPlay.classList.replace("fa-pause", "fa-play");
            this.classList.replace("control-btn-pause", "control-btn-play");
            audio.pause();
        }
    });
}

export async function getArtists() {
    const { artists } = await httpRequest.get("artists");
    return artists;
}

async function clickPopularSong() {
    const tracks = await getTrendingTracks();
    const list = $(".track-list");
    list.addEventListener("click", (e) => {
        const item = e.target.closest(".track-item");
        if (!item) return;
        const index = item.dataset.index;
        currenindex = index;
        audio.src = tracks[index].audio_url;
        const song = tracks[index];
        renderPlayerLeft(song);
        audio.play();
        isPlay = true;
        iconPlay.classList.replace("fa-play", "fa-pause");
        activeSong(currenindex);
        timeEnd.innerHTML = totalSongTime(tracks[index].duration);
        handleTime();
    });
}

function activeSong(currenindex) {
    const current = $$(".track-item.playing")[0];
    const songs = $$(".track-item");
    if (current) current.classList.remove("playing");
    const newActive = songs[currenindex];
    if (newActive) newActive.classList.add("playing");
}
// context menu

export function initControl() {
    handleRandomSong();
    handleLoopSong();
    handleBtnHuge();
    handlePlay();
    clickPopularSong();
    handleVolume();
    handleSort();
    handleClickSort();
    handleView();
    handleSidebarContextMenu();
    handleReload();
    handleClickItemArtists();
    handleControlSong();
    handleProgress();
    changeVolume();
    handleClickBar();
    showPassWord(signUp);
    showPassWord(login);
    createPlaylist();
    addPlaylist();
}
