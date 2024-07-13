console.log('Lets write javascript');
let currentSong = new Audio();
let songs = [];
let currentIndex = 0;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currFolder = folder;
    try {
        let a = await fetch(`/${folder}/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
            }
        }

        // load all the songs

        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = ""
        for (const song of songs) {
            let li = document.createElement("li");
            li.innerHTML = `
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        `;
            songUL.appendChild(li);
        }

        // attach event listener to each song

        Array.from(document.querySelectorAll(".songList li")).forEach((e, index) => {
            e.addEventListener("click", () => {
                playMusic(index);
            });
        });
    } catch (error) {
        console.error('Error fetching songs:', error);
    }

    return songs
}

const playMusic = (index, shouldPlay = true) => {
    if (index < 0 || index >= songs.length) {
        return;
    }
    currentIndex = index;
    currentSong.src = `/${currFolder}/` + songs[currentIndex];
    document.querySelector(".songinfo").innerHTML = songs[currentIndex];
    document.querySelector(".songtimer").innerHTML = "00:00/00:00";
    if (shouldPlay) {
        currentSong.play().catch((error) => {
            console.error('Error playing the song:', error);
        });
        play.src = "img/pause.svg";
    } else {
        play.src = "img/play.svg";
    }
}
async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            //    get the metadata of every folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"></path>
                </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // loading playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(0, true)
        })
    });
}

async function main() {
    await getSongs("songs/ncs");
    if (songs.length > 0) {
        // Load the first song but don't play it
        playMusic(0, false);
    }

    // display all songs on the page

    displayAlbums()

    // attch an eventlistener to previous , play and next

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // listen for time update event

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtimer").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // add an eventlistener to seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // add an eventlistener to hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // add an eventlistener to close button

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // add an eventlistener to previous

    previous.addEventListener("click", () => {
        if (currentIndex > 0) {
            playMusic(currentIndex - 1);
        }
    });

    // add an eventlistener to next

    next.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            playMusic(currentIndex + 1);
        }
    });

    // add an event to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume>0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
        }
    })

    // add eventlistener to mute the track

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target)
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
        }
    })

}

main();

