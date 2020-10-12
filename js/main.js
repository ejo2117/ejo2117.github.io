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


//set up audio context
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
let currentBuffer = null;

const visualizeAudio = url => {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => visualizeAudio(audioBuffer));
}

const filerData = audioBuffer => {
    const rawData = audioBuffer.getChannelData(0);
    const samples = 70;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j])
        }
        filteredData.push(sum / blockSize)

    }
    return filteredData;

}
const normalizeData = filteredData => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n * multiplier);

}

const draw = normalizeData => {
    //set up canvas
    const canvas = document.querySelector("canvas");
    const dpr = window.devicePixelRatio || 1;
    const padding = 20;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.translate(0, canvas.offsetHeight / 2 + padding);
}

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
    var wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple'
    });

    //content loaders
    $('.title').each((i, e) => {
        $(e).on('click', () => {
            let content = $(e).attr('data-content');
            $('.content.' + content).addClass('showing');
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

        doodle.update(`:doodle { @grid: 50x1 / 100%; }
        :container { animation: r 80s linear
        infinite; }
        @place-cell: center;
        @size: 300% 6vmin;
        transition: @r(.5s) ease;
        background: @pd(`+ hexArr[0] + `, ` + hexArr[1] + `, ` + hexArr[2] + `);
        transform-origin: 1vmin center;
        transform: translateX(calc(@i * 2%)) rotate(calc(90deg));
        @keyframes r { from{transform:translateX(-100%)}to {
        transform: translateX(100%) } }`)

    })

})