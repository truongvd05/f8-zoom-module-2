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
    getPlaylists,
    renderArtists,
    followArtist,
    renderPopularSong,
    renderTracksPlaylist,
    renderPlayerLeftAdd,
    renderCard,
} from "./module.js";

const play = $(".play-btn");
const iconPlay = $(".js-icon-play");
const audio = $(".audio-player");
const btnHuge = $(".play-btn-large");
const loop = $(".repeat-btn");
const random = $(".btn-shuffle");
const timeEnd = $(".js-time-end");
const iconVolume = $(".js-icon-volume");
const sortBtn = $(".search-library");
const sortBtnList = $(".sort-btn-list");
const viewAs = $(".user-view");
const sidebarContextMenu = $(".sidebar");
const contexMenu = $(".context-menu");
const contexMenuPlayList = $(".context-menu-playlist");
const navtabs = $(".nav-tabs");
const playCenter = $(".player-center");
const loopBtn = $(".repeat-btn");
const volumeBar = $(".volume-bar");
const volumeContaine = $(".js-volume");
const bar = $(".progress-bar");
const signUp = signupForm.querySelector(".auth-form-content");
const login = loginForm.querySelector(".auth-form-content");
const createBtn = $(".create-btn");
const labal = $(".labal-input");
const follow = $(".fllow-artist");
const scroll = $(".content-wrapper");
const searchLibrary = $(".library-search");
const popularList = $(".track-list");
const progressFill = $(".progress-bar");
const progressHandle = $(".progress-handle");
const contextmenuTracks = $(".contextmenu-add-tracks");
const deletcontextmenu = $(".contextmenu-delete-tracks");

let currenindex = null;
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
let copyTracks = null;
let playlistTracks = null;
let playlistId = null;
let playlistIndex = null;
let currendidAdd = null;

const sectionControl = $(".artist-controls");
const sectionPopular = $(".popular-section");
const sectionAstist = $(".artist-hero");
const sectionAstistCard = $(".artist-card");
const sectionPlaylist = $(".playlist-controls");

let trackCache = null;
let playArtists = null;

export async function getArtists() {
    if (playArtists) {
        return playArtists;
    }
    const { artists } = await httpRequest.get("me/following?limit=20&offset=0");
    playArtists = artists;
    return artists;
}
// add tracks to playlist
function handleAddTracks() {
    contextmenuTracks.addEventListener("click", async function (e) {
        const target = e.target.closest(".item-playlist");
        if (!target) return;
        playlistId = target.dataset.id;
        const data = {
            track_id: currendidAdd,
            position: 0,
        };
        try {
            const res = await httpRequest.post(
                `playlists/${playlistId}/tracks`,
                data
            );
            const message = res.message;
            showNotification(message);
        } catch (error) {
            const message = error?.response?.error?.message;
            showNotification(message);
        }
        renderPlayerList();
    });
    deletcontextmenu.addEventListener("click", async function (e) {
        const target = e.target.closest(".delete-tracks");
        if (target) {
            const isConfirmed = confirm(
                "Bạn có chắc chắn muốn xóa bài hát này không?"
            );
            if (isConfirmed) {
                const res = await httpRequest.del(
                    `playlists/${playlistId}/tracks/${currendidAdd}`
                );
                const message = res.message;
                showNotification(message);
            } else {
                console.log("Đã hủy!");
            }
            copyTracks = await getMusicPlaylist();
            renderTracksPlaylist(copyTracks, popularList);
            renderPlayerList();
        }
    });
}
// search
function handleSearch() {
    searchLibrary.addEventListener("input", async function (e) {
        const input = searchLibrary.value.trim().toLowerCase();
        const playlist = $(".js-player-list.active");
        const artists = $(".js-artist.active");
        if (playlist) {
            const res = await getPlaylists();
            const filter = res.filter((item) => {
                return item.name.toLowerCase().includes(input);
            });
            renderPlayerList(filter);
        }
        if (artists) {
            const res = await getArtists();
            const filter = res.filter((item) => {
                return item.name.toLowerCase().includes(input);
            });
            renderArtists(filter);
        }
    });
}
async function getTracks(limit = 20) {
    if (trackCache) {
        return trackCache;
    }
    const { tracks } = await httpRequest.get(`tracks/trending?limit=${limit}`);
    trackCache = tracks;
    return trackCache;
}

export async function getTrendingTracks(limit = 20) {
    const { tracks } = await httpRequest.get(`tracks/trending?limit=${limit}`);
    return tracks;
}

// /handle scroll
function handleScroll() {
    const songs = $$(".track-item");
    if (!songs.length) return;
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
        const time = saved.time ?? 0;
        const volume = saved.volume ?? 0.5;
        audio.volume = volume;
        if (isLoop) {
            loopBtn.classList.add("active");
        } else {
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
async function getMusicData() {
    try {
        const { tracks } = await httpRequest.get(
            `artists/${currenid}/tracks/popular`
        );
        copyTracks = JSON.parse(JSON.stringify(tracks));
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
    }
    return copyTracks;
}
async function getMusicPlaylist() {
    try {
        const { tracks } = await httpRequest.get(
            `playlists/${playlistId}/tracks`
        );
        playlistTracks = JSON.parse(JSON.stringify(tracks));
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
    }
    return playlistTracks;
}
// active card
function handleClickCard() {
    sectionAstistCard.addEventListener("click", async function (e) {
        const target = e.target.closest(".card");
        const actived = $$(".card.active")[0];
        sectionAstistCard.style.display = "none";
        sectionAstist.style.display = "flex";
        sectionControl.hidden = false;
        sectionPlaylist.hidden = true;
        if (!target) return;
        currenid = target.dataset.index;
        copyTracks = await getMusicData();
        if (target) {
            if (actived) {
                actived.classList.remove("active");
            }
            renderHero(currenid);
            target.classList.add("active");
        }
        if (copyTracks < 1) return;
        renderPlayerLeft(copyTracks[0]);
        audio.src = copyTracks[0].audio_url;
        activeSong(copyTracks[0]);
        renderPopularSong(copyTracks, popularList);
        sectionPopular.hidden = false;
        timeEnd.innerText = totalSongTime(copyTracks[0].duration);
    });
}

export function handleFollw() {
    sectionAstist.addEventListener("click", async function (e) {
        const targetID = e.target.closest(".hero-content");
        const target = e.target.closest(".fllow-artist");
        if (!target) return;
        const id = targetID.dataset.index;
        if (target.classList.contains("follow")) {
            const res = await httpRequest.del(`artists/${id}/follow`);
            followArtist();
            target.classList.remove("follow");
            target.textContent = "Follow";
        } else {
            const res = await httpRequest.post(`artists/${id}/follow`);
            followArtist();
            target.classList.add("follow");
            target.textContent = "Following";
        }
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
        updateProgress(e);
    });
}

let percent = null;
let percent1 = null;
// update tiến trình
function updateProgress(e) {
    const rect = progressFill.getBoundingClientRect();
    percent = (e.clientX - rect.left) / rect.width;
    percent1 = e.clientX - rect.left;
    progressFill.style.width = `${percent}px`;
    progressHandle.style.left = `${percent1}px`;
    percent = Math.min(Math.max(percent, 0), 1);
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
            updateProgress(e);
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
async function handleControlSong() {
    playCenter.addEventListener("click", async function (e) {
        if (e.target.closest(".next-btn")) {
            handlNextSong(copyTracks);
            handleProgress();
            activeSong(currenindex);
            renderPlayerLeft(copyTracks[currenindex]);
        }
        if (e.target.closest(".control-prev")) {
            handelPrevSong(copyTracks);
            handleProgress();
            activeSong(currenindex);
            renderPlayerLeft(copyTracks[currenindex]);
        }
    });
}
// handle next Song
function handlNextSong(tracks) {
    isPlay = true;
    if (isRandom) {
        handleSong();
        return;
    }
    const newTracks = tracks.map((t) => {
        return {
            id: t.id,
            duration: t.duration || t.track_duration,
            audio_url: t.audio_url || t.track_audio_url,
        };
    });
    currenindex++;
    currenindex = (currenindex + newTracks.length) % newTracks.length;
    timeEnd.innerText = totalSongTime(newTracks[currenindex].duration);
    activeSong(currenindex);
    activeSong1(currenindex);
    currenid = newTracks[currenindex].id;
    audio.src = newTracks[currenindex].audio_url;
    iconPlay.classList.replace("fa-play", "fa-pause");
    handleScroll();
    audio.play();
}
// handle prve song
function handelPrevSong(tracks) {
    isPlay = true;
    currenindex--;
    currenindex = (currenindex + tracks.length) % tracks.length;
    timeEnd.innerText = totalSongTime(copyTracks[currenindex].duration);
    activeSong(currenindex);
    currenid = tracks[currenindex].id;
    audio.src = tracks[currenindex].audio_url;
    iconPlay.classList.replace("fa-play", "fa-pause");
    audio.play();
    handleScroll();
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

function unfollow() {
    const un = $(".context-menu");
    un.addEventListener("click", async function (e) {
        const target = e.target.closest(".artist-unfollow");
        if (!target) return;
        const id = target.dataset.index;
        const res = await httpRequest.del(`artists/${idArtist}/follow`);
        followArtist();
    });
}
// context menu
function handleContextMenu(e) {
    e.preventDefault();
}
document.addEventListener("contextmenu", handleContextMenu);
contexMenu.addEventListener("contextmenu", handleContextMenu);
contexMenuPlayList.addEventListener("contextmenu", handleContextMenu);

// click item artists
function handleClickItemArtists() {
    const library = $(".library-content");
    library.addEventListener("click", async function (e) {
        const item = e.target.closest(".library-artists");
        const itemActive = document.querySelector(".library-artists.active");
        sectionAstistCard.style.display = "none";
        sectionAstist.style.display = "block";
        sectionPlaylist.hidden = true;
        if (item) {
            if (itemActive) {
                itemActive.classList.remove("active");
            }
            currenid = item.dataset.index;
            copyTracks = await getMusicData();
            item.classList.add("active");
            renderPopularSong(copyTracks, popularList);
            renderHero(currenid);
            console.log(copyTracks);

            sectionPopular.hidden = false;
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
            playlistId = item1.dataset.id;
            copyTracks = await getMusicPlaylist();
            renderHero1(playlistId);
            renderTracksPlaylist(copyTracks, popularList);
            sectionPopular.hidden = false;
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
        sectionAstistCard.style.display = "grid";
        sectionAstist.style.display = "none";
        sectionPopular.hidden = true;
        renderCard();
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
    if (e.target.closest(".add-trask")) return;
    contextmenuTracks.style.display = "none";
    deletcontextmenu.style.display = "none";
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
async function handleSong() {
    const lastRandom = currenindex;
    if (copyTracks.length !== 1) {
        do {
            currenindex = Math.floor(Math.random() * copyTracks.length);
        } while (currenindex === lastRandom);
        currenid = copyTracks[currenindex].id;
        timeEnd.innerText = totalSongTime(copyTracks[currenindex].duration);
        audio.src = copyTracks[currenindex].audio_url;
        activeSong(currenindex);
        handleScroll();
        iconPlay.classList.replace("fa-play", "fa-pause");
        if (isPlay && audio.readyState > 2) {
            audio.play();
        }
    }
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
        audio.src = copyTracks[currenindex].audio_url;
        audio.play();
        isPlay = true;
        activeSong(currenindex);
        iconPlay.classList.replace("fa-play", "fa-pause");
        timeEnd.innerText = totalSongTime(copyTracks[currenindex].duration);
        handleTime();
    });
}
audio.addEventListener("canplay", () => {
    if (isPlay) {
        audio.play();
    }
});
audio.addEventListener("ended", async () => {
    if (ismoveBar) return;
    if (isRandom) {
        handleSong();
        return;
    }
    if (isLoop) {
        audio.loop = isLoop;
    } else {
        audio.loop = isLoop;
        handlNextSong(copyTracks);
        renderPlayerLeft(copyTracks[currenindex]);
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

async function clickPopularSong() {
    const list = $(".track-list");
    list.addEventListener("click", async (e) => {
        const item = e.target.closest(".track-item");
        const item1 = e.target.closest(".add-item");
        if (item) {
            currenindex = item.dataset.index;
            currenid = item.dataset.id;
            audio.src = copyTracks[currenindex].audio_url;
            renderPlayerLeft(copyTracks[currenindex]);
            audio.play();
            isPlay = true;
            iconPlay.classList.replace("fa-play", "fa-pause");
            activeSong(currenindex);
            timeEnd.innerText = totalSongTime(copyTracks[currenindex].duration);
            handleTime();
        }
        if (item1) {
            currenindex = item1.dataset.index;
            currenid = item1.dataset.id;
            audio.src = copyTracks[currenindex].track_audio_url;
            audio.play();
            isPlay = true;
            renderPlayerLeftAdd(copyTracks[currenindex]);
            iconPlay.classList.replace("fa-play", "fa-pause");
            activeSong1(currenindex);
            timeEnd.innerText = totalSongTime(
                copyTracks[currenindex].track_duration
            );
            handleTime();
        }
    });
    list.addEventListener("contextmenu", function (e) {
        const item = e.target.closest(".track-item");
        const item1 = e.target.closest(".add-item");

        if (item) {
            currenindex = item.dataset.index;
            currendidAdd = item.dataset.id;
            contextmenuTracks.style.display = "inline-block";
            contextmenuTracks.style.left = e.pageX + "px";
            contextmenuTracks.style.top = e.pageY + "px";
        }
        if (item1) {
            currenindex = item1.dataset.index;
            currendidAdd = item1.dataset.id;
            deletcontextmenu.style.display = "inline-block";
            deletcontextmenu.style.left = e.pageX + "px";
            deletcontextmenu.style.top = e.pageY + "px";
        }
    });
}

// handle keydown
async function handleKeyDown() {
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
                handlNextSong(copyTracks);
                renderPlayerLeft(copyTracks[currenindex]);
                activeSong(currenindex);
                break;
            case "ArrowLeft":
                e.preventDefault();
                handelPrevSong(copyTracks);
                renderPlayerLeft(copyTracks[currenindex]);
                activeSong(currenindex);
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

function activeSong1(currenindex) {
    const current = $$(".add-item.playing")[0];
    const songs = $$(".add-item");
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
    handleSearch();
    unfollow();
    handleAddTracks();
}
