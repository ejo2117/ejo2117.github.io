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
            wavesurfer.load('src/allubaby.wav')

        })

    })

})