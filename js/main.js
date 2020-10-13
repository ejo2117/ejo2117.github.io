function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shiftColors(doodle) {

    let x = randomInteger(0, 1280)
    let y = randomInteger(0, 2071)
    let msg = x % y;

    c1 = 'rgb(' + (msg * x) % 254 + ',' + (msg * y) % 254 + ',' + (msg) % 254 + ')';

    console.log(c1);
    hex1 = rgbToHex((msg * x) % 254, (msg * y) % 254, (msg) % 254)
    hex2 = rgbToHex((msg * 387 * x) % 254, (msg * 947 * y) % 254, (msg * 812) % 254)
    hex3 = rgbToHex((msg * 37 * x) % 254, (msg * 9 * y) % 254, (msg * 82) % 254)






    return ([hex1, hex2, hex3])
}


// Set up audio context
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

/**
 * Retrieves audio from an external source, the initializes the drawing function
 * @param {String} url the url of the audio we'd like to fetch
 */
const drawAudio = url => {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => draw(normalizeData(filterData(audioBuffer))));
};

/**
 * Filters the AudioBuffer retrieved from an external source
 * @param {AudioBuffer} audioBuffer the AudioBuffer from drawAudio()
 * @returns {Array} an array of floating point numbers
 */
const filterData = audioBuffer => {
    const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
    const samples = 70; // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i; // the location of the first sample in the block
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
        }
        filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    return filteredData;
};

/**
 * Normalizes the audio data to make a cleaner illustration 
 * @param {Array} filteredData the data from filterData()
 * @returns {Array} an normalized array of floating point numbers
 */
const normalizeData = filteredData => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n * multiplier);
}

/**
 * Draws the audio file into a canvas element.
 * @param {Array} normalizedData The filtered array returned from filterData()
 * @returns {Array} a normalized array of data
 */
const draw = normalizedData => {
    // set up the canvas
    const canvas = document.querySelector("#waveform");
    const dpr = window.devicePixelRatio || 1;
    const padding = 20;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.translate(0, canvas.offsetHeight / 2 + padding); // set Y = 0 to be in the middle of the canvas

    // draw the line segments
    const width = canvas.offsetWidth / normalizedData.length;
    for (let i = 0; i < normalizedData.length; i++) {
        const x = width * i;
        let height = normalizedData[i] * canvas.offsetHeight - padding;
        if (height < 0) {
            height = 0;
        } else if (height > canvas.offsetHeight / 2) {
            height = height > canvas.offsetHeight / 2;
        }
        drawLineSegment(ctx, x, height, width, (i + 1) % 2);
    }
};

/**
 * A utility function for drawing our line segments
 * @param {AudioContext} ctx the audio context 
 * @param {number} x  the x coordinate of the beginning of the line segment
 * @param {number} height the desired height of the line segment
 * @param {number} width the desired width of the line segment
 * @param {boolean} isEven whether or not the segmented is even-numbered
 */
const drawLineSegment = (ctx, x, height, width, isEven) => {
    ctx.lineWidth = 5; // how thick the line is
    ctx.strokeStyle = "#fff"; // what color our line is
    ctx.beginPath();
    height = isEven ? height : -height;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.arc(x + width / 2, height, width / 2, Math.PI, 0, isEven);
    ctx.lineTo(x + width, 0);
    ctx.stroke();
};


$(() => {
    //hover color shift
    $('.title').each((i, e) => {

        $(e).on('mouseenter', () => {
            let hexArr = shiftColors();
            $(e).children().each((i, e) => {

                $(e).css('color', hexArr[i])

            })

        })


    })

    $('.copyright').on('click', () => {
        let hexArr = shiftColors();
        $('.copyright ellipse').attr('fill', hexArr[0])
        $('.copyright path').attr('fill', hexArr[1])


    })
    //set up swipe listeners
    let panels = $('.menu');
    let view = 0;
    document.addEventListener('swiped-left', function (e) {
        console.log(e.target); // element that was swiped
        console.log(e.detail); // event data { dir: 'right', xStart: 196, xEnd: 230, yStart: 196, yEnd: 4 }
        $('.menu.showing').removeClass('showing')
        view++;
        $(panels[view]).addClass('showing')
    });
    document.addEventListener('swiped-right', function (e) {
        console.log(e.target); // element that was swiped
        console.log(e.detail); // event data { dir: 'right', xStart: 196, xEnd: 230, yStart: 196, yEnd: 4 }
        $('.menu.showing').removeClass('showing')
        view--;
        $(panels[view]).addClass('showing')
    });

    //audio player
    /*
        var sound = new Howl({
            src: ['src/allubaby.wav'],
            autoplay: true,
            loop: true,
            volume: 0.5,
            onend: function () {
                console.log('Finished!');
            }
        });
    */


    //content loaders
    $('.title').each((i, e) => {
        $(e).on('click', async () => {
            let content = $(e).attr('data-content');
            $('.content.' + content).addClass('showing');
            if (content == "player") {
                console.log('start visualizer')
                //drawAudio('src/allubaby.wav');
            } else if (content == "cube") {
                console.log("start painting")
                let interval = setInterval(() => { paintEdges() }, 5000)
                $('.cube .close').on('click', function () {
                    clearInterval(interval);
                })
            }
            //sound.play();
            // wavesurfer.load('src/allubaby.wav')

        })

    })
    $('.close').on('click', () => {
        $('.content.showing').removeClass('showing')

    })

    //filter controller
    let slider1 = $('#frequencySlider');
    let slider2 = $('#octaveSlider');
    let slider3 = $('#scaleSlider');

    slider1[0].oninput = function () {
        let freq = Math.log(this.value) / 100

        $('#svgFilter feTurbulence').attr('baseFrequency', freq)

    }
    slider2[0].oninput = function () {
        let oct = this.value;

        $('#svgFilter feTurbulence').attr('numOctaves', oct)
    }
    slider3[0].oninput = function () {
        let scale = this.value;
        $('#svgFilter feDisplacementMap').attr('scale', scale)
    }

    $('.shuffle').on('click', () => {
        let hexArr = shiftColors();

        let doodle = document.querySelector('css-doodle');



        doodle.update(`:doodle { @grid: 10x1 / 100%; }
        @place-cell: center;
        @size: 100% 10vmax;
        transition: @r(.5s) ease;
        background: @pd(`+ hexArr[0] + `, ` + hexArr[1] + `, ` + hexArr[2] + `);
        transform-origin: 0vmin center;
        transform: translateX(calc(@i * 10%)) rotate(calc(90deg));
        @keyframes r { from{transform:translateX(0%)}to {
        transform: translateX(100%) } }`)

    })

    let audioInterval;
    let audioElement = $('audio')[0];
    $('.play').on('click', () => {
        audioElement.play()
        $('.time .end').text(Math.floor(audioElement.duration))
        audioInterval = setInterval(() => {
            $('.time .position').text(Math.floor(audioElement.currentTime))
            let playhead = (Math.floor(audioElement.duration) / 100) * (Math.floor(audioElement.currentTime))
            $('.audio-controls input').attr('value', playhead)

            $('video').css('filter', 'hue-rotate(' + Math.floor(audioElement.currentTime) * 1.618 * 5 + 'deg)')
            if ($('video')[0].currentTime >= $('video')[0].duration - 14) {
                $('video')[0].currentTime = 25;
            }
        }, 1000)
        $('video')[0].currentTime = 25;

        $('video')[0].play();
        $('video')[0].playbackRate = 5.0;
        $('.play').css('display', 'none')
        $('.pause').css('display', 'block')
    })
    $('.pause').on('click', () => {
        $('audio')[0].pause();
        $('video')[0].pause();
        $('.play').css('display', 'block')
        $('.pause').css('display', 'none')
    })


})