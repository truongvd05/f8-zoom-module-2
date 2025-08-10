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
    createList,
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
const follow = $(".fllow-artist");
const timeStart = $(".js-time-start");
const trackList = $(".track-list");
const scroll = $(".content-wrapper");

let currenindex = 0;
let currenid = null;
let isPlay = false;
let isVolume = true;
let isLoop = false;
let isRandom = false;
let lastVolume = audio.volume;
let ismoveVolume = false;
let ismoveBar = false;
let idArtist = null;
let idAPlaylist = null;
let idFollow = null;
export let isFolow = false;
const sectionControl = $(".artist-controls");
const sectionPopular = $(".popular-section");
const sectionAstist = $(".artist-hero");
const sectionAstistCard = $(".artist-card");

const params = new URLSearchParams(location.search);
let trackCache = null;

async function getTracks(limit = 20) {
    if (trackCache) {
        return trackCache;
    }
    const { tracks } = await httpRequest.get(`tracks/trending?limit=${limit}`);
    trackCache = tracks;
    return trackCache;
}

// get song form url
function handleURL() {
    const song = params.get(trackList.id);
    currenindex = params?.get(song) ?? currenindex;
}

// handle param
async function handleParam() {
    const tracks = await getTracks();
    params.set(trackList.id, tracks[currenindex].title);
    const Url = params.size ? `?${params}` : "";
    const saveUrl = `${location.pathname}${Url}${location.hash}`;
    history.replaceState(null, "", saveUrl);
}

export async function getTrendingTracks(limit = 20) {
    const { tracks } = await httpRequest.get(`tracks/trending?limit=${limit}`);
    return tracks;
}

// /handle scroll
function handleScroll() {
    const songs = $$(".track-item");
    const currenSong = songs[currenindex];
    const offset = 300;
    const rect = currenSong.getBoundingClientRect();
    scroll.scrollTo({
        top: scroll.scrollTop + rect.top - offset,
        behavior: "smooth",
    });
}

// handle get user state
export async function handleGetState() {
    const saved = JSON.parse(localStorage.getItem("listener"));
    if (saved) {
        currenindex = saved.index ?? 0;
        const time = saved.time ?? 0;
        const volume = saved.volume ?? 0.5;
        audio.volume = volume;
        currenid = saved.id;
        const res = await httpRequest.get(`tracks/${currenid}`);
        audio.src = res.audio_url;
        audio.currentTime = time;
        timeEnd.innerText = totalSongTime(res.duration);
        handleProgress();
        isLoop = saved.loop;
        handleTime(time);
        if (isLoop) {
            loopBtn.classList.add("active");
            audio.loop = isLoop;
        } else {
            audio.loop = isLoop;
            loopBtn.classList.remove("active");
        }
    }
}

// handle user state
export function handleUserState() {
    localStorage.setItem(
        "listener",
        JSON.stringify({
            index: currenindex,
            time: audio.currentTime,
            volume: audio.volume,
            loop: isLoop,
            id: currenid,
        })
    );
}

// active card
function handleClickCard() {
    sectionAstistCard.addEventListener("click", function (e) {
        const target = e.target.closest(".card");
        const actived = $$(".card.active")[0];
        if (!target) return;
        const id = target.dataset.index;
        if (target) {
            if (actived) {
                actived.classList.remove("active");
            }
            renderHero(id);
            target.classList.add("active");
        }
    });
}
export function handleFollw() {
    sectionAstist.addEventListener("click", async function (e) {
        const targetID = e.target.closest(".hero-content");
        const target = e.target.closest(".fllow-artist");
        if (!target) return;
        const id = targetID.dataset.index;
        if (target.classList.contains("follow")) {
            target.classList.remove("follow");
            target.textContent = "Follow";
        } else {
            const res = await httpRequest.put(`artists/${id}/follow`);
            console.log(res);
            target.classList.add("follow");
            target.textContent = "Following";
        }
        isFolow = !isFolow;
    });
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

const createPlaylist = $(".overlay-create");
const inputImg = document.getElementById("input-file");
const closeForm = $(".close-form");
export function handlecreatePlaylist() {
    let id = null;
    let url = null;
    const container = $(".section-input");
    const accessToken = localStorage.getItem("accessToken");
    const createDescription = $(".input-description").value;
    const createName = $(".create-name").value;
    const valueDesctiption = $(".input-description");
    const valueName = $(".create-name");

    closeForm.addEventListener("click", function (e) {
        container.classList.remove("show");
        sectionControl.hidden = false;
        sectionPopular.hidden = false;
        sectionAstist.hidden = false;
        sectionAstistCard.style.display = "grid";
    });
    createBtn.addEventListener("click", async function () {
        const data = {
            name: "My New Playlist",
            description: "Playlist description",
            is_public: true,
            cover_image_url: "https://example.com/playlist-cover.jpg",
        };
        const res = await httpRequest.post("playlists", data);
        valueDesctiption.value = res.playlist.description;
        valueName.value = res.playlist.name;
        id = await createList();
        container.classList.add("show");
        sectionControl.hidden = true;
        sectionPopular.hidden = true;
        sectionAstist.hidden = true;
        sectionAstistCard.style.display = "none";
        renderPlayerList();
    });

    // get url img
    inputImg.addEventListener("change", async function (e) {
        const file = e.target.files[0];
        const formData = new FormData();
        if (!file) return;
        formData.append("cover", file);
        try {
            const res = await fetch(
                `https://spotify.f8team.dev/api/upload/playlist/${id}/cover`,
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (!res.ok) {
                throw new Error(`Upload thất bại: ${res.status}`);
            }
            const data = await res.json();
            console.log("Upload thành công:", data);
            url = `https://spotify.f8team.dev${data.file.url}`;
            console.log(url);
        } catch (error) {
            console.log(error);
        }
    });
    createPlaylist.addEventListener("submit", async function (e) {
        e.preventDefault();
        const data = {
            name: createName ? "Default" : valueName.value,
            description: createDescription ? "Default" : valueDesctiption.value,
            image_url: url,
        };

        const res = await httpRequest.put(`playlists/${id}`, data);
        renderPlayerList();
        this.classList.remove("show");
        container.classList.remove("show");
        sectionControl.hidden = false;
        sectionPopular.hidden = false;
        sectionAstist.hidden = false;
        sectionAstistCard.style.display = "grid";
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
    if (audio.readyState > 0) {
        audio.currentTime = percent * audio.duration;
    }
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
    handleParam();
    isPlay = true;
    currenindex++;
    currenindex = (currenindex + tracks.length) % tracks.length;
    activeSong(currenindex);
    currenid = tracks[currenindex].id;
    audio.src = tracks[currenindex].audio_url;
    iconPlay.classList.replace("fa-play", "fa-pause");
    audio.play();
    handleScroll();
}
// handle prve song
function handelPrevSong(tracks) {
    handleParam();
    isPlay = true;
    currenindex--;
    currenindex = (currenindex + tracks.length) % tracks.length;
    activeSong(currenindex);
    currenid = tracks[currenindex].id;
    audio.src = tracks[currenindex].audio_url;
    iconPlay.classList.replace("fa-play", "fa-pause");
    audio.play();
    handleScroll();
}

function handleContextMenu(e) {
    e.preventDefault();
}
// context menu
contexMenuPlayList.addEventListener("click", async function (e) {
    const target = $(".section-input.show");
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
    // tắt khi người dùng xóa playlist mà không sửa
    if (target) {
        target.classList.remove("show");
        sectionControl.hidden = false;
        sectionPopular.hidden = false;
        sectionAstist.hidden = false;
        sectionAstistCard.style.display = "grid";
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
            idFollow = id;
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
    createBtn.addEventListener("click", toastOnClick);
    follow.addEventListener("click", toastOnClick);
}

export function removeShowToast() {
    if (navtabs) {
        navtabs.removeEventListener("click", toastOnClick);
        createBtn.removeEventListener("click", toastOnClick);
        follow.removeEventListener("click", toastOnClick);
    }
}

function toastOnClick(e) {
    if (
        e.target.closest(".js-player-list") ||
        e.target.closest(".js-artist") ||
        e.target.closest(".create-btn") ||
        e.target.closest(".fllow-artist")
    ) {
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
        history.pushState({}, "", window.location.pathname);
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
    random.addEventListener("click", randomSong);
}
// function random
function randomSong() {
    if (!isRandom) {
        random.classList.add("active");
    } else {
        random.classList.remove("active");
    }
    isRandom = !isRandom;
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
    if (isPlay) {
        audio.play();
    }
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
    loop.addEventListener("click", loopsong);
}

function loopsong() {
    isLoop = !isLoop;
    // Toggle class active
    loop.classList.toggle("active", isLoop);
    // Bật/tắt loop audio
    audio.loop = isLoop;
}

// play song
function handlePlay() {
    play.addEventListener("click", function () {
        this.classList.replace("control-btn-play", "control-btn-pause");
        playDefault(play);
    });
}
// play song
function playDefault(play) {
    if (!isPlay) {
        iconPlay.classList.replace("fa-play", "fa-pause");
        activeSong(currenindex);
        if (audio.readyState > 2) {
            audio.play();
        }
    } else {
        iconPlay.classList.replace("fa-pause", "fa-play");
        play.classList.replace("control-btn-pause", "control-btn-play");
        audio.pause();
    }
    isPlay = !isPlay;
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
        currenid = tracks[index].id;
        const song = tracks[index];
        renderPlayerLeft(song);
        audio.play();
        isPlay = true;
        iconPlay.classList.replace("fa-play", "fa-pause");
        activeSong(currenindex);
        timeEnd.innerHTML = totalSongTime(tracks[index].duration);
        handleTime();
        handleParam();
    });
}

// handle keydown
async function handleKeyDown() {
    const tracks = await getTrendingTracks();
    document.addEventListener("keydown", async function (e) {
        if (["input", "textarea"].includes(e.target.tagName.toLowerCase()))
            return;
        switch (e.code) {
            case "Space":
                e.preventDefault();
                playDefault(play);
                break;
            case "ArrowRight":
                e.preventDefault();
                handlNextSong(tracks);
                break;
            case "ArrowLeft":
                e.preventDefault();
                handelPrevSong(tracks);
                break;
            case "ArrowUp":
                e.preventDefault();
                break;
            case "ArrowDown":
                e.preventDefault();
                break;
            case "KeyL":
                e.preventDefault();
                loopsong();
                break;
            case "KeyR":
                e.preventDefault();
                randomSong();
                break;
        }
    });
}
function activeSong(currenindex) {
    const current = $$(".track-item.playing")[0];
    const songs = $$(".track-item");
    if (current) current.classList.remove("playing");
    const newActive = songs[currenindex];
    if (newActive) newActive.classList.add("playing");
}

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
    addPlaylist();
    handleClickCard();
    handleKeyDown();
    handleParam();
    handleURL();
}
