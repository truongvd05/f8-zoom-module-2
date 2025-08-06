import {
    escapeHTML,
    totalSongTime,
    $,
    $$,
    getTrendingTracks,
    isFolow,
} from "./module.js";
import httpRequest from "./httpRequest.js";

const library = $(".library-content");
const popularList = $(".track-list");
const listArtists = $(".nav-tabs");
const playList = $(".js-player-list");
const playerLeft = $(".player-left");
const iconUserView = $(".user-view");
const card = $(".artist-card");

let playListsCache = null;
// render hero click card
export function renderCardHero(id) {}
// get data playlist
async function getPlaylists() {
    if (playListsCache) {
        return playListsCache; // dùng lại dữ liệu đã có
    }
    const { playlists } = await httpRequest.get("playlists?limit=20&offset=0");
    playListsCache = playlists;
    return playlists;
}

// render compact
function renderCompact(list) {
    const html = list
        .map((item) => {
            return `<li class="library-item library-play-list" data-index="${
                item.id
            }">
                                ${escapeHTML(item.name)}
                            </li>
                        `;
        })
        .join("");
    const ul = document.createElement("ul");
    ul.innerHTML = html;
    library.innerHTML = "";
    library.appendChild(ul);
}

function renderGrid(list) {
    const html = list
        .map((item) => {
            return `<li
                        class="library-play-list"
                        data-index="${item.id}"
                    >
                        <img src="${escapeHTML(item.image_url)}" alt="" />
                    </li>`;
        })
        .join("");
    const ul = document.createElement("ul");
    ul.innerHTML = html;
    ul.className = "library-content-folder";
    library.innerHTML = "";
    library.appendChild(ul);
}
// render click follow icon
function renderPro() {
    iconUserView.addEventListener("click", async function (e) {
        const active = $(".js-player-list.active");
        const playlists = await getPlaylists();
        if (active) {
            if (e.target.closest(".icon-compact")) {
                renderCompact(playlists);
            }
            if (e.target.closest(".icon-default")) {
                library.innerHTML = "";
                renderPlayerList();
            }
            if (e.target.closest(".icon-gird")) {
                renderGrid(playlists);
            }
        }
    });
}

function renderPlayList() {
    playList.addEventListener("click", async function (e) {
        const { playlists } = await httpRequest.get("me/playlists");
        console.log(playlists);

        const html = playlists
            .map((item) => {
                return `<div class="library-item library-play-list" data-index="${
                    item.id
                }">
                        <div class="item-icon liked-songs">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="item-info">
                            <div class="item-title">${escapeHTML(
                                item.name
                            )}</div>
                            <div class="item-subtitle">
                                <i class="fas fa-thumbtack"></i>
                                Playlist • ${escapeHTML(
                                    item.total_tracks
                                )} songs
                            </div>
                        </div>
                    </div>`;
            })
            .join("");
        library.innerHTML = html;
    });
}
async function renderPopularSong(tracks, container) {
    const html = tracks
        .map((item, index) => {
            return `<div class="track-item" data-index="${index}">
                        <div class="track-number">${sum(index)}</div>
                                <div class="track-image">
                                    <img
                                        src="${escapeHTML(
                                            item.album_cover_image_url
                                        )}"
                                        alt="${escapeHTML(item.title)}"
                                    />
                                </div>
                                <div class="track-info">
                                    <div class="track-name">
                                        ${escapeHTML(item.title)}
                                    </div>
                                </div>
                                <div class="track-plays">${escapeHTML(
                                    item.play_count.toLocaleString()
                                )}</div>
                                <div class="track-duration">${totalSongTime(
                                    item.duration
                                )}</div>
                                <button class="track-menu-btn">
                                    <i class="fas fa-ellipsis-h"></i>
                                </button>
                        </div>
                    </div>`;
        })
        .join("");
    container.innerHTML = html;
}

export function renderPlayerLeft(item) {
    const html = `<img
                    src="${escapeHTML(item.album_cover_image_url)}"
                    alt="${escapeHTML(item.title)}"
                    class="player-image"
                />
                <div class="player-info">
                    <div class="player-title">
                        ${escapeHTML(item.title)}
                    </div>
                    <div class="player-artist">${escapeHTML(
                        item.artist_name
                    )}</div>
                </div>
                <button class="add-btn">
                    <i class="fa-solid fa-plus"></i>
                </button>`;
    playerLeft.innerHTML = html;
}
function sum(num) {
    return ++num;
}

export function renderUser(user, element) {
    element.innerHTML = `${escapeHTML(user.username)}`;
}
// handle click artiest
function artists() {
    listArtists.addEventListener("click", async function (e) {
        const navActive = $$(".nav-tab.active")[0];
        const active = e.target.closest(".nav-tab");
        const { artists } = await httpRequest.get("artists");
        if (active) {
            navActive.classList.remove("active");
            active.classList.add("active");
        }
        if (e.target.closest(".js-artist")) {
            // get user follow
            // const res = await httpRequest.get(
            //     `users/me/artists?limit=20&offset=0`
            // );
            // console.log(res);

            const html = artists
                .map((item, index) => {
                    return `<div class="library-item library-artists" data-index="${escapeHTML(
                        item.id
                    )}">
                <img
                    src="${escapeHTML(item.image_url)}"
                    alt="${escapeHTML(item.name)}"
                    class="item-image"
                />
                <div class="item-info">
                    <div class="item-title">${escapeHTML(item.name)}</div>
                    <div class="item-subtitle">Artist</div>
                </div>
            </div>`;
                })
                .join("");
            library.innerHTML = html;
        }
    });
}

export async function renderHero(id) {
    const element = $(".artist-hero");
    const res = await httpRequest.get(`artists/${id}`);

    const html = `<div class="hero-background" >
                    <img
                        src="${escapeHTML(res.background_image_url)}"
                        alt="${res.name} background"
                        class="hero-image"
                    />
                    <div class="hero-overlay"></div>
                </div>
                <div class="hero-content" data-index="${res.id}">
                    <div class="verified-badge">
                        <i class="fas fa-check-circle"></i>
                        <span>Verified Artist</span>
                    </div>
                    <h1 class="artist-name">${escapeHTML(res.name)}</h1>
                    <p class="monthly-listeners">
                        ${escapeHTML(
                            res.monthly_listeners.toLocaleString()
                        )} monthly listeners
                    </p>
                    <div>
                        <button class="fllow-artist">${
                            res.is_following ? "Following" : "Follow"
                        }</button>
                    </div>
                </div>`;
    element.innerHTML = html;

    // const res1 = await httpRequest.get(`artists/${id}/albums`);
}

export async function renderHero1(idArtist) {
    const element = $(".artist-hero");
    const res = await httpRequest.get(`playlists/${idArtist}`);

    // const { user } = await httpRequest.get("users/me");
    const html = `<div class="hero-background">
                    <img
                        src="${escapeHTML(res.image_url)}"
                        alt="${res.name} background"
                        class="hero-image"
                    />
                    <div class="hero-overlay"></div>
                </div>
                <div class="hero-content">
                    <div class="verified-badge">
                        <i class="fas fa-check-circle"></i>
                        <span>Verified Artist</span>
                    </div>
                    <h1 class="artist-name">${escapeHTML(res.name)}</h1>
                    <p class="monthly-listeners" hiden>
                        ${escapeHTML(res.user_username)}
                    </p>
                </div>`;
    element.innerHTML = html;
}

async function renderCard() {
    const card = $(".artist-card");
    const { artists } = await httpRequest.get("artists");
    const html = artists
        .map((item, index) => {
            return `<div class="card" data-index="${item.id}">
                    <img class="card-img" src="${escapeHTML(
                        item.image_url
                    )}" alt="" />
                    <div class="card-info">
                        <div class="card-title">${escapeHTML(item.name)}</div>
                        <div class="card-subtitle">Artist</div>
                    </div>
                </div>`;
        })
        .join("");
    card.innerHTML = html;
}
export async function renderPlayerList() {
    const { playlists } = await httpRequest.get("me/playlists");
    const html = playlists
        .map((item) => {
            return `<div class="library-item library-play-list" data-index="${
                item.id
            }"">
                        <div class="item-icon liked-songs">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="item-info">
                            <div class="item-title">${escapeHTML(
                                item.name
                            )}</div>
                            <div class="item-subtitle">
                                <i class="fas fa-thumbtack"></i>
                                Playlist • ${escapeHTML(
                                    item.total_tracks
                                )} songs
                            </div>
                        </div>
                    </div>`;
        })
        .join("");
    library.innerHTML = html;
}

function showNotfication() {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000); // 2 giây
}

// get trendingtracks
export async function userRender() {
    const listTracks = await getTrendingTracks();
    renderPopularSong(listTracks, popularList);
}

export async function initPopularSong() {
    artists();
    renderPlayList();
    renderPlayerList();
    renderPro();
    renderCard();
    renderCardHero();
}
