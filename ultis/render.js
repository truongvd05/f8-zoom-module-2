import {
    escapeHTML,
    totalSongTime,
    $,
    $$,
    getTrendingTracks,
} from "./module.js";
import httpRequest from "./httpRequest.js";

const library = $(".library-content");
const listArtists = $(".nav-tabs");
const playList = $(".js-player-list");
const playerLeft = $(".player-left");
const iconUserView = $(".user-view");

let playListsCache = null;
let currentOrder = "asc";

async function listadd() {
    const container = $(".add-playlist");
    const { playlists } = await httpRequest.get("me/playlists");
    const html = playlists
        .map((item) => {
            return `<li class="item-playlist" data-id="${item.id}">${escapeHTML(
                item.name
            )}</li>`;
        })
        .join("");
    container.innerHTML = html;
}
export async function createList() {
    const myplaylist = $(".my-playlist");
    const { playlists } = await httpRequest.get("me/playlists");
    const latest = playlists.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    )[0];
    myplaylist.innerText = latest.name;
    const id = latest.id;
    return id;
}
// sắp xếp playlist theo thứ tự mới nhất
export async function handleArrangeLatest() {
    const { playlists } = await httpRequest.get("me/playlists");
    playlists.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
    return playlists;
}
// render hero click card
export function renderCardHero(id) {}
// get data playlist
export async function getPlaylists() {
    if (playListsCache) {
        return playListsCache;
    }
    const { playlists } = await httpRequest.get("me/playlists");
    playListsCache = playlists;
    return playlists;
}

// render compact
function renderCompact(list, order = "desc") {
    list.sort((a, b) => {
        if (order === "asc") {
            // Longest time
            return new Date(a.updated_at) - new Date(b.updated_at);
        } else {
            // latest
            return new Date(b.updated_at) - new Date(a.updated_at);
        }
    });
    const html = list
        .map((item) => {
            return `<li class="library-item library-play-list" data-id="${
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

function renderGrid(list, order = "desc") {
    list.sort((a, b) => {
        if (order === "asc") {
            // Longest time
            return new Date(a.updated_at) - new Date(b.updated_at);
        } else {
            // latest
            return new Date(b.updated_at) - new Date(a.updated_at);
        }
    });
    const html = list
        .map((item) => {
            return `<li
                        class="library-play-list"
                        data-id="${item.id}"
                    >
                        <img src="${escapeHTML(
                            item.image_url
                        )}" alt="" onerror="this.onerror=null; this.src='https://demofree.sirv.com/nope-not-here.jpg';"/>
                    </li>`;
        })
        .join("");
    const ul = document.createElement("ul");
    ul.innerHTML = html;
    ul.className = "library-content-folder";
    library.innerHTML = "";
    library.appendChild(ul);
}

// togget oder

// render click follow icon
function renderPro() {
    iconUserView.addEventListener("click", async function (e) {
        const active = $(".js-player-list.active");
        const active1 = $(".recents.active");
        const artistActive = $(".js-artist.active");
        const playlists = await getPlaylists();
        let order = active1 ? "desc" : "asc";
        if (active) {
            // Icon Compact
            if (e.target.closest(".icon-compact")) {
                currentOrder = order;
                renderCompact(playlists, currentOrder);
            }
            // Icon Default
            if (e.target.closest(".icon-default")) {
                currentOrder = order;
                renderPlayList(currentOrder);
            }

            // Icon Grid
            if (e.target.closest(".icon-gird")) {
                currentOrder = order;
                renderGrid(playlists, currentOrder);
            }
        }
        if (artistActive) {
        }
    });
}
function renderSortBy() {
    const target = $(".sort-btn-list");
    target.addEventListener("click", async function (e) {
        const active = $(".js-player-list.active");
        const active1 = $(".recents.active");
    });
    playList.addEventListener("click", function (e) {
        renderPlayList(currentOrder);
    });
}

async function renderPlayList(order = "desc") {
    const { playlists } = await httpRequest.get("me/playlists");
    playlists.sort((a, b) => {
        if (order === "asc") {
            // Longest time
            return new Date(a.updated_at) - new Date(b.updated_at);
        } else {
            // latest
            return new Date(b.updated_at) - new Date(a.updated_at);
        }
    });
    const html = playlists
        .map((item) => {
            return `<div class="library-item library-play-list" data-id="${
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
}

export async function renderTracksPlaylist(tracks, container) {
    container.innerHTML = "";
    if (tracks < 1) {
        container.innerText = "bạn chưa thêm bài hát nào";
        return;
    }
    const html = tracks
        .map((item, index) => {
            return `<div class="add-item"
             data-index="${index}" data-id="${item.track_id}">
                        <div class="track-number">${sum(index)}</div>
                                <div class="track-image">
                                    <img
                                        src="${escapeHTML(
                                            item.artist_image_url
                                        )}"
                                        alt="${escapeHTML(item.track_title)}"
                                    />
                                </div>
                                <div class="track-info">
                                    <div class="track-name">
                                        ${escapeHTML(item.track_title)}
                                    </div>
                                </div>
                                <div class="track-plays">${escapeHTML(
                                    item.track_play_count.toLocaleString()
                                )}</div>
                                <div class="track-duration">${totalSongTime(
                                    item.track_duration
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

export async function renderPopularSong(tracks, container) {
    const saved = JSON.parse(localStorage.getItem("listener"));
    const currenindex = Number(saved?.index) ?? 0;
    container.innerHTML = "";
    const html = tracks
        .map((item, index) => {
            const isCurrentSong = index === currenindex;
            return `<div class="track-item ${isCurrentSong ? "playing" : ""}"
             data-index="${index}" data-id="${item.id}">
                        <div class="track-number">${sum(index)}</div>
                                <div class="track-image">
                                    <img
                                        src="${escapeHTML(item.image_url)}"
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
    const newTracks = {
        image_url: item.album_cover_image_url || item.image_url,
        title: item.track_title || item.title,
        album_title: item.album_title || (item.album && item.album.title),
        id: item.id,
    };
    const html = `<img
                    src="${escapeHTML(newTracks.image_url)}"
                    alt="${escapeHTML(newTracks.title)}"
                    class="player-image"
                />
                <div class="player-info">
                    <div class="player-title">
                        ${escapeHTML(newTracks.title)}
                    </div>
                    <div class="player-artist">${escapeHTML(
                        newTracks.album_title
                    )}</div>
                </div>
                <button class="add-btn">
                    <i class="fa-solid fa-plus"></i>
                </button>`;
    playerLeft.innerHTML = html;
}
export function renderPlayerLeftAdd(item) {
    const html = `<img
                    src="${escapeHTML(item.artist_image_url)}"
                    alt="${escapeHTML(item.track_title)}"
                    class="player-image"
                />
                <div class="player-info">
                    <div class="player-title">
                        ${escapeHTML(item.track_title)}
                    </div>
                    <div class="player-artist">${escapeHTML(
                        item.album_title
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

// filter follow artits
export async function followArtist() {
    const { artists } = await httpRequest.get("artists");
    const following = (
        await Promise.all(
            artists.map(async (item) => {
                try {
                    const res = await httpRequest.get(`artists/${item.id}`);
                    if (res.is_following) {
                        return res;
                    }
                } catch (error) {
                    console.log(error);
                }
            })
        )
    ).filter(Boolean);
    const html = following
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
        const following = (
            await Promise.all(
                artists.map(async (item) => {
                    try {
                        const res = await httpRequest.get(`artists/${item.id}`);
                        if (res.is_following) {
                            return res;
                        }
                    } catch (error) {
                        console.log(error);
                    }
                })
            )
        ).filter(Boolean);
        if (e.target.closest(".js-artist")) {
            const html = following
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

export async function renderArtists(artists = null) {
    if (!artists) {
        var { artists } = await httpRequest.get("artists");
    }
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

export async function renderHero2() {
    const element = $(".artist-hero");
    const res = await httpRequest.get(`artists`);
    const html = `<div class="hero-background" >
                    <img
                        src="${escapeHTML(res.background_image_url)}"
                        alt="background img"
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
                        <button class="fllow-artist ${
                            res.is_following ? "follow" : ""
                        }">${res.is_following ? "Following" : "Follow"}</button>
                    </div>
                </div>`;
    element.innerHTML = html;
}

export async function renderHero(id) {
    const element = $(".artist-hero");
    const res = await httpRequest.get(`artists/${id}`);
    const html = `<div class="hero-background" >
                    <img
                        src="${escapeHTML(res.background_image_url)}"
                        alt="background img"
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
                        <button class="fllow-artist ${
                            res.is_following ? "follow" : ""
                        }">${res.is_following ? "Following" : "Follow"}</button>
                    </div>
                </div>`;
    element.innerHTML = html;
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
                    <p class="monthly-listeners" hidden>
                        ${escapeHTML(res.user_username)}
                    </p>
                </div>`;
    element.innerHTML = html;
}

export async function renderCard() {
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
export async function renderPlayerList(playlists = null) {
    if (!playlists) {
        var { playlists } = await httpRequest.get("me/playlists");
    }
    const html = playlists
        .map((item) => {
            return `<div class="library-item library-play-list" data-id="${
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
}

export async function initPopularSong() {
    artists();
    renderPlayerList();
    renderPro();
    renderCard();
    renderCardHero();
    renderSortBy();
    listadd();
}
