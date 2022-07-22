const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'PLAYER_STORAGE';

const playList = $('.playlist');
const heading = $('header h2');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const song = $('.song');
var songArray = [];
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const progress = $('#progress');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY))|| {}, // chưa lưu gì thì là obj trống
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))

    },
    songs: [
        {
            name: 'Pretending To Be Happy',
            singer: 'Suzy',
            path: './asset/song/song-1.mp3',
            image: './asset/img/img-1.png'
        },
        {
            name: 'Dream',
            singer: 'Baek Hyun, Suzy (miss A)',
            path: './asset/song/song-2.mp3',
            image: './asset/img/img-2.png'
        },
        {
            name: 'Take You Home',
            singer: 'Baek Hyun',
            path: './asset/song/song-3.mp3',
            image: './asset/img/img-3.png'
        },
        {
            name: 'Tomboy',
            singer: '(G)I-DLE',
            path: './asset/song/song-4.mp3',
            image: './asset/img/img-4.png'
        },
        {
            name: 'O.O',
            singer: 'NMIXX',
            path: './asset/song/song-5.mp3',
            image: './asset/img/img-5.png'
        },
        {
            name: 'XOXO',
            singer: 'JEON SOMI',
            path: './asset/song/song-6.mp3',
            image: './asset/img/img-6.png'
        },
        {
            name: 'Christmas EveL',
            singer: 'Stray Kids',
            path: './asset/song/song-7.mp3',
            image: './asset/img/img-7.png'
        },
        {
            name: "I Can't Stop Me",
            singer: 'TWICE',
            path: './asset/song/song-8.mp3',
            image: './asset/img/img-8.png'
        },
        {
            name: 'Black Mamba',
            singer: 'aespa',
            path: './asset/song/song-9.mp3',
            image: './asset/img/img-9.png'
        },
        {
            name: 'Mafia in The Morning',
            singer: 'ITZY',
            path: './asset/song/song-10.mp3',
            image: './asset/img/img-10.png'
        },
    ],

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div data-index = "${index}" class="song ${index === this.currentIndex ? 'active' : ''}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join("");
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat) ; 
    },
    handleEvent: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        // Xử lý CD quay/ dừng 
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000, //10sec 
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lý zoom in/out CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
            // if (newCdWidth > 0) {
            //     cd.style.width = newCdWidth + 'px';
            // } else {
            //     cd.style.width = 0;
            // }
        }
        // Xử lý khi click play btn
        playBtn.onclick = function() {
            if(_this.isPlaying === true) {
                audio.pause();           
            } else {
                audio.play();        
            }      
        }
        // Khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // Khi prev song 
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // Khi đã play song  
        audio.onplay = function() {
            player.classList.add('playing');
            _this.isPlaying = true;
            cdThumbAnimate.play()
        }
        // Khi song bị pause 
        audio.onpause = function() {
            player.classList.remove('playing');
            _this.isPlaying = false;
            cdThumbAnimate.pause()
        }
        // Khi tiến độ song thay đổi thì thay đổi value của progress
        audio.ontimeupdate = function() {
            // check duration khác NaN
            if (audio.duration) {
                const progrescentsPer = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progrescentsPer;
            }     
        }
        // Khi tua song thì thay đổi current time của audio
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }
        // Xử lý khi audio ended 
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                songArray.push(_this.currentIndex);
                console.log(songArray)
                nextBtn.click();
            }
        }
        // Khi chọn random btn (bật/ tắt random btn)
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom)   
        }
        // Khi chọn repeat btn ((bật/ tắt repeat btn)
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat)   
        }
        // lắng nghe hành vi click vào playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // xử lý khi click vào song 
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                 // xử lý khi click vào option
                if ( e.target.closest(".option")) {
                 
                   
                }
            }
           
        }
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        const _this = this;
        do {
            
            newIndex = Math.floor(Math.random() * this.songs.length)
            console.log(newIndex)
        } while (songArray.includes(newIndex));

        if (songArray.length == _this.songs.length - 1) {
            songArray.splice(0, songArray.length);
            
        } else {
            this.currentIndex = newIndex;
            this.loadCurrentSong();

        }
        // console.log(newIndex)
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 300);
    },

    start: function() {
        // Gán cấu hình từ config vào ứng dụng 
        this.loadConfig();
        // Định nghĩa các thuộc tính cho obj
        this.defineProperties();
        // Xử lý DOM event 
        this.handleEvent();
        // Tải thông tin bài hát đầu tiên khi mở ứng dụng 
        this.loadCurrentSong();
        // render playlist 
        this.render();
        //
 

    }
}
app.start();