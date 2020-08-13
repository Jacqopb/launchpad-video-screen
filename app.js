//Available in nodejs

var NodeWebcam = require("node-webcam");
const sharp = require('sharp');
var PNG = require('png-js');
const Launchpad = require('launchpad-mk2')

let launchpad = new Launchpad({
  in: 1,
  out: 1
})
launchpad.darkAll()

//Default options

var opts = {

    //Picture related

    width: 8,

    height: 8,

    quality: 100,

    // Number of frames to capture
    // More the frames, longer it takes to capture
    // Use higher framerate for quality. Ex: 60

    frames: 1,


    //Delay in seconds to take shot
    //if the platform supports miliseconds
    //use a float (0.1)
    //Currently only on windows

    delay: 0,


    //Save shots in memory

    saveShots: true,


    // [jpeg, png] support varies
    // Webcam.OutputTypes

    output: "png",


    //Which camera to use
    //Use Webcam.list() for results
    //false for default device

    device: false,


    // [location, buffer, base64]
    // Webcam.CallbackReturnTypes

    callbackReturn: "location",


    //Logging

    verbose: true

};


//Creates webcam instance

var Webcam = NodeWebcam.create( opts );


//Will automatically append location output type

// Webcam.capture( "test_picture", function( err, data ) {} );


//Also available for quick use

// NodeWebcam.capture( "test_picture", opts, function( err, data ) {
//     console.log('')
// });


//Get list of cameras

Webcam.list( function( list ) {

    //Use another device

    var anotherCam = NodeWebcam.create( { device: list[ 0 ] } );

});

//Return type with base 64 image

let opts2 = Object.assign({}, opts, {
    callbackReturn: "buffer"
})



const captureImageAndTriggerRefresh = ()=>{
    NodeWebcam.capture( "test_picture2", opts2, function( err, imageBuffer ) {
        console.log('Raw image buffer')
        sharp(imageBuffer).resize(8, 8).toBuffer((err, data, info) => {
            console.log('Resized image buffer')

            const png = new PNG(data)

            png.decode(function(pixels) {

                console.log('Image decoded!')
                sendImageToMidi(pixels)
            });

        });

    });
}



const sendImageToMidi = (decodedPngBuffer) => {


    let pixel = 0  // each pixel corresponds to 4 values in the buffer
    let column = 1
    let row = 8

    do{
        var button = launchpad.getButton(row, column)
        button.setRgbColor(
            Math.floor(decodedPngBuffer[pixel*4+0]/4),
            Math.floor(decodedPngBuffer[pixel*4+1]/4),
            Math.floor(decodedPngBuffer[pixel*4+2]/4)) // +3 is opcity which is not used/supported

        pixel++
        column++

        if(column==9){
            row--
            column=1
        }

    } while(row>0)


}



setInterval(captureImageAndTriggerRefresh, 100)