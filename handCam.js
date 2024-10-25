/***************************************************
 *               // SECTION - VARIABLES
 ***************************************************/
let video;  // points to var element: element
let isVideo = false; //check if video is on: boolean
let model;          // CNN model conncted to handtracker: handTracker model 
let selectedDeviceId = null; // Variable to hold the selected device ID
let threshold = 10;
let handArea = 1;
let cursorWidth;
let cursorHeight;
let customCursor;
let stopLoop = false;
let deltaX;
let deltaY;
let posX;
let posY;
let handDetectClose;
let overallDeltaX = 0;
let overallDeltaY = 0;
let lastCursorLeft;
let lastCursorTop;
let cursorTop;
let cursorLeft;
let inToolBox;
let inTutorial = true;
let currentSlide = 0;
let currentTouchX;
let currentTouchY;
let canvas;
let ctx;
let videoHeight;
let videoWidth;
let handWidth;
let handHeight;

// type of movementTool
// 0 - none
// 1 - pan
// 2 - rotate
// 3 - zoom 
let tool = 0;       

//!SECTION


const modelParams = {
    flipHorizontal: false, 
    imageScaleFactor: 0.5, 
    maxNumBoxes: 20, 
    scoreThreshold: 0.6,   // threshold to be printed out or set in detections
    modelType: "ssd320fpnlite",
    modelSize: "int8",  // base fp16 or int8 ... large, medium, small
    bboxLineWidth: "2",  // draw box width
    fontSize: 14,
  };


// Load the model when the webapp is run
handTrack.load(modelParams).then((lmodel) => {
    // detect objects in the image.
    model = lmodel;
    debugPrint("model is fully loaded");
    let loadingScreen = document.getElementById("loadingScreen");
    loadingScreen.classList.remove("active");
    loadingScreen.style.visibility = 'hidden';
    toggleVideo();      //Added for hologram version to start on runup
  });



/***************************************************
 *                  FUNCTIONS
 ***************************************************/

//SECTION - CAMERA
// Initialize the camera on startup
async function InitializeCamera() {
    video = document.getElementById('handCamVideo');
    startVideo();
}


// Toggles the handtracker on and off
function toggleVideo() {
    if(!isVideo) {
        inToolBox = false;
        inHelpBox = false;
        inTutorial = true;
        InitializeCamera();
        centerCustomCursor();
        openTutorial();
        moveCursor();
    }
    else {
        handTrack.stopVideo(video);
        stopLoop = true;
        isVideo = false;
    }
}

function startVideo() {
    debugPrint(selectedDeviceId);
        // Constraints object to specify what kind of media stream we want (in this case, video)
    if (selectedDeviceId == null) {
        var constraints = {
            video: true
        };
    }
    else {
        var constraints = {
            video: {
                deviceId: selectedDeviceId // Specify the device ID of the webcam you want to use
            },
        };
    }

    handTrack.startVideo(video).then(function (status) {
        debugPrint("video started", status);
        if (status) {
            isVideo = true;
            navigator.mediaDevices.getUserMedia(constraints)
            .then(setVideoSrc)
            .catch(handleError);
            video.style.height = "100%";
            videoWidth = video.width;
            videoHeight = video.height;
            runDetections();
        }
    });
}


let lastMovementTime = Date.now(); // Initialize with current timestamp
const inactivityThreshold = 10000000; 

// ANCHOR - OLD DETECTION FUNCTION (DELTA BASED ON PIXELS)
// // runs the handtracker by looping through the video and making predictions.
// async function runDetections(){
//     let prevX = null;       // Only detects previous X if last gesture was the same
//     let prevY = null;

//     // detects previous no matter what (meant for movements with cursor)
//     let overallPrevX = null;
//     let overallPrevY = null;
    
//     debugPrint("Run Detection loop");
//     // Continuously detect hand gestures
//     setInterval(async () => {
//         const predictions = await model.detect(video);
        
//         handArea = 0;
//         // Check if a hand is detected in the array of predictions
        
//         for (const prediction of predictions) {
            
//             if (prediction.label == 'open') {
//                 debugPrint("hand open");
//                 posX = (prediction.bbox[0] + prediction.bbox[2]) / 2;
//                 posY = (prediction.bbox[1] + prediction.bbox[3]) / 2;
//                 prevX = null;
//                 prevY = null;
//                 handDetectClose = false;
//             }
//             else if (prediction.label == 'closed' || prediction.label == 'pinch') {
//                 debugPrint("hand closed");
//                 posX = (prediction.bbox[0] + prediction.bbox[2]) / 2;
//                 posY = (prediction.bbox[1] + prediction.bbox[3]) / 2;
//                 handDetectClose = true;
//             }
//             if ((prediction.bbox[0] + prediction.bbox[2]) * (prediction.bbox[1] + prediction.bbox[3]) > handArea) {
//                 handArea =  (prediction.bbox[0] + prediction.bbox[2]) * (prediction.bbox[1] + prediction.bbox[3]);
//                 threshold = threshold / handArea 
//             }
//         }
//         if (handDetectClose && !inToolBox) {       //hand closed is like a mouse click so when it's closed then start tracking movements 
//             if (prevX != null || prevY != null) {
//                 // Calculate movement direction
//                 deltaX = posX - prevX;
//                 deltaY = posY - prevY;
//                 if (prevX == null) {
//                     deltaX = 0;
//                 }
//                 else if (prevY == null) {
//                     deltaY = 0;
//                 }
//                 doMovement();
//             }
//             prevX = posX;
//             prevY = posY;
//         } 
//         else {// Check if inactivity threshold exceeded
//             const currentTime = Date.now();
//             const timeSinceLastMovement = currentTime - lastMovementTime;
            
//             if (timeSinceLastMovement >= inactivityThreshold) {
//                 // Perform action when no movement for a certain time (e.g., select no tool)
//                 deselectTool();
//             }
//             prevX = null;
//             prevY = null;
//         }
        
//         debugPrint(overallDeltaX);
//         // keep track of overall deltaX(when hand gestures are different) to keep track of where the cursor goes 
//         overallDeltaX = posX - overallPrevX;
//         overallDeltaY = posY - overallPrevY;
//         overallPrevX = posX;
//         overallPrevY = posY;
//     },100);
// }

// ANCHOR - NEW DETECTION FUNCTION BASED ON PERCENTAGES
// runs the handtracker by looping through the video and making predictions.
async function runDetections(){
    let prevX = null;       // Only detects previous X if last gesture was the same
    let prevY = null;

    // detects previous no matter what (meant for movements with cursor)
    let overallPrevX = null;
    let overallPrevY = null;
    
    debugPrint("Run Detection loop");
    // Continuously detect hand gestures
    setInterval(async () => {
        const predictions = await model.detect(video);
        
        handArea = 0;
        handWidth = 0;
        handHeight = 0;
        // Check if a hand is detected in the array of predictions
        
        for (const prediction of predictions) {
            if (prediction.label == 'open') {
                debugPrint("hand open");
                posX = (prediction.bbox[0] + prediction.bbox[2]/2);
                posY = (prediction.bbox[1] + prediction.bbox[3]/2);
                prevX = null;
                prevY = null;
                handDetectClose = false;
            }
            else if (prediction.label == 'closed' || prediction.label == 'pinch') {
                debugPrint("hand closed");
                posX = (prediction.bbox[0] + prediction.bbox[2]/2);
                posY = (prediction.bbox[1] + prediction.bbox[3]/2);
                handDetectClose = true;
            }
            if ((prediction.bbox[0] + prediction.bbox[2]) * (prediction.bbox[1] + prediction.bbox[3]) > handArea) {
                handArea =  (prediction.bbox[0] + prediction.bbox[2]) * (prediction.bbox[1] + prediction.bbox[3]);
                threshold = threshold / handArea;
            }
            handWidth = Math.abs(prediction.bbox[0] - prediction.bbox[2]);
            handHeight = Math.abs(prediction.bbox[1] - prediction.bbox[3]);
        }
        if (handDetectClose && !inToolBox && !inHelpBox) {       //hand closed is like a mouse click so when it's closed then start tracking movements 
            if (prevX != null || prevY != null) {
                // Calculate movement direction
                deltaX = posX - prevX;
                deltaY = posY - prevY;
                if (prevX == null) {
                    deltaX = 0;
                }
                else if (prevY == null) {
                    deltaY = 0;
                }
                doMovement();
            }
            prevX = posX;
            prevY = posY;
        } 
        else {// Check if inactivity threshold exceeded
            const currentTime = Date.now();
            const timeSinceLastMovement = currentTime - lastMovementTime;
            
            if (timeSinceLastMovement >= inactivityThreshold) {
                // Perform action when no movement for a certain time (e.g., select no tool)
                deselectTool();
            }
            prevX = null;
            prevY = null;
        }
        
        debugPrint(overallDeltaX);
        // keep track of overall deltaX(when hand gestures are different) to keep track of where the cursor goes 
        overallDeltaX = posX - overallPrevX;
        overallDeltaY = posY - overallPrevY;
        overallPrevX = posX;
        overallPrevY = posY;
    },100);
}
// !SECTION - CAMERA


//SECTION - GUI
// creates an element card for the tutorial slides 
function openTutorial() {
    let tutWindow = document.getElementById("tutorialWindow");
    
    var current = document.getElementById('slide' + currentSlide);
    current.classList.add("active");
    tutWindow.classList.add("open");
    tutWindow.style.visibility = "visible";
    rotateLoop();
}

function doMovement() {
    // Define the maximum rotation angle
    const maxRotation = 30; // in degrees
    const maxDelta = 100; // maximum delta value
    const conversionFactor = maxRotation / maxDelta;
    lastMovementTime = Date.now();

    if(isDragging) {// if touch
        deltaX /= 7;
        deltaY /= 7;
        if (tool == 1 || tool == 2) {       // If the tool is pan or rotate
            //check if x or y movement is above the threshold set by the user
            if(tool == 1) {
                const panAmtX = deltaX;
                const panAmtY = deltaY;
                pan(panAmtX, panAmtY);
            }
            else if (tool == 2) {
                const rotateX = deltaX * conversionFactor;
                const rotateY = deltaY * conversionFactor;
                rotate(rotateX, rotateY);
            }
        }
        else if (tool == 3) {
            let minDeltaY = 30;   // min is positive because of flipped camera
            let maxDeltaY = -30; 
            let normalized = normalizeValue(deltaY, minDeltaY, maxDeltaY, -0.2, 0.2);
            let zoomFactor = 1 + normalized;
            zoom(zoomFactor);
            
          }
    }
    else {// if doing handmovements on camera
        if (tool == 1 || tool == 2) {       // If the tool is pan or rotate
            if ((Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {       //check if x or y movement is above the threshold set by the user
                if(tool == 1) {
                    const panAmtX = deltaX * 2;
                    const panAmtY = deltaY * 2;
                    pan(panAmtX, panAmtY);
                }
                else if (tool == 2) {
                    const rotateX = deltaX * conversionFactor;
                    const rotateY = deltaY * conversionFactor;
                    rotate(rotateX, rotateY);
                }
            }
        }
        else if (tool == 3) {
            if (Math.abs(deltaX) > (threshold-2)) {
              let minDeltaY = 30; 
              let maxDeltaY = -30; 
              let normalized = normalizeValue(deltaY, minDeltaY, maxDeltaY, -0.12, 0.12);
              let zoomFactor = 1 + normalized;
             
              zoom(zoomFactor);
            }
          }
    }

    
}


//!SECTION - GUI

//SECTION - HELPER FUNCTIONS

//given the pixel positioning of the hand in view, calculate the percentage from left so that it is the same on the display
function getPercentFromLeft(pixelValue){
    return pixelValue / videoWidth;
}

//given the pixel positioning of the hand in view, calculate the percentage from top so that it is the same on the display
function getPercentFromTop(pixelValue){
    return pixelValue / videoHeight;
}

// normalize value into a specified range which is used for finding the zoom factor 
function normalizeValue(inputValue, minInput, maxInput, minOutput, maxOutput) {
    return ((inputValue - minInput) / (maxInput - minInput)) * (maxOutput - minOutput) + minOutput;
}

//Helper function to set rotate tool variable on
function selectPanTool() {
    // Set the text box value to the updated value
    // printTool("Pan Tool");
    customCursor.src = "./assets/img/pan-tool.png";
    tool = 1;
}

//Helper function to set rotate tool variable on
function selectRotateTool() {
    // printTool("Rotate Tool");
    customCursor.src = "./assets/img/rotate-tool.png";
    tool = 2;
}

//helper function to set zoom tool on
function selectZoomTool() {
    // printTool("Zoom Tool");
    customCursor.src = "./assets/img/zoom-tool.png";
    tool = 3;
}

//helper function to set no tool
function deselectTool() {
    customCursor.src = "./assets/img/open.png";
    tool = 0;
    rotateLoop();
}

//print selected tool to a certain element
function printTool(msg){
    var toolText = document.getElementById("Tool");
    toolText.textContent = msg;
}
  
// Function to handle success when accessing the webcam stream
function setVideoSrc(stream) {
    // Set the video element's source to the stream
    video.srcObject = stream;
}

// Function to handle errors when accessing the webcam stream
function handleError(error) {
    // console.error('Error accessing webcam: ', error);
}

// function updates the position of the cursor image
function updateCursor() {
    // Set the cursor position
    if(isDragging) {
       customCursor.style.left = currentTouchX + 'px';
       customCursor.style.top = currentTouchY + 'px';
   }
}


// toggles debug mode on and off (shows console logs and camera view)
function debugMode() {
    if (debug) {
        video.style.visibility = "hidden";
        video.style.display = "none";
        // canvas.style.visibility = "hidden";
        // canvas.style.display = "none";
        debug = false;
    }
    else {
        video.style.visibility = "visible";
        video.style.display = "inline";
        // canvas.style.visibility = "visible";
        // canvas.style.display = "inline";
        debug = true;
    }
}

// !SECTION - HELPER FUNCTIONS

// Define a function that will be executed repeatedly
function moveCursor() {
    debugPrint("Cursor Loop is running...");
    if (stopLoop == false) {
        let intervalId = setInterval(function() {
            cursorReadLoop();
            if (stopLoop) {
                clearInterval(intervalId); // Stop the loop
                debugPrint("Loop stopped.");
            }
        }, 100);
    }
}

// SECTION - TUTORIAL
//function to move to next tutorial slide
function nextStep() {
    var current = document.getElementById('slide' + currentSlide);
    
    // Remove 'active' class from current slide
    current.classList.remove('active');
    
    // Increment currentSlide to move to the next slide
    currentSlide++;

    // Get the next slide element
    var next = document.getElementById('slide' + currentSlide);

    // Check if there is a next slide element
    if (next) {
        // Add 'active' class to the next slide to display it
        next.classList.add('active');
    } else {
        // If there is no next slide:
        let tutWindow = document.getElementById("tutorialWindow");
        // Hide the tutorial window or handle completion logic
        tutWindow.style.visibility = "hidden";
        tutWindow.classList.remove("open");
        
        // Reset currentSlide and any other relevant flags or variables
        currentSlide = 0;
        inTutorial = false;
    }
}

let actionAllowed = true;   // so the next step button doesnt get rapid fired


// check where the cursor is in relation to the buttons in the toolbar so that users can select an action to do such as rotate,zoom, and pan
function tutorialCheck() {
    let buttons = [
        { id: "next", action: nextStep }
    ];

    let cursorRect = customCursor.getBoundingClientRect();
    let cursorLeft = cursorRect.left;
    let cursorTop = cursorRect.top;

    buttons.forEach(buttonInfo => {
        let button = document.getElementById(buttonInfo.id);
        let buttonRect = button.getBoundingClientRect();

        if (cursorLeft >= buttonRect.left && cursorLeft <= buttonRect.right &&
            cursorTop >= buttonRect.top && cursorTop <= buttonRect.bottom) {
            button.classList.add("expanded");
            button.classList.add("active");
            if (handDetectClose && actionAllowed) {
                // Check if hand is close and action is allowed
                actionAllowed = false; // Disable further actions temporarily
                buttonInfo.action();

                // Set a timeout to re-enable action after a delay
                setTimeout(() => {
                    actionAllowed = true;
                }, 2500); // Delay time
            }
        } else {
            button.classList.remove("expanded");
            button.classList.remove("active");
        }
    });
}


function restartTutorial() {
    currentSlide = 0;
    inTutorial = true;
    centerCustomCursor();
    deselectTool();
    openTutorial();
    loadMolecule();
    // moveCursor();
}
// !SECTION - TUTORIAL



// SECTION - CURSOR

// ANCHOR - OLD CURSOR READ BASED ON DELTA PIXEL VALUES
// Loop that constantly checks what the position of the cursor should be
function cursorReadLoop() {
    var viewerContainer = document.getElementById('molecule_container');
    var viewerRect = viewerContainer.getBoundingClientRect();
    let container = document.getElementById("toolbox");
    let containerRect = container.getBoundingClientRect();
    let maxLeft = viewerRect.width - cursorWidth;
    let maxTop = viewerRect.height - cursorHeight;
    if(inTutorial) {
        tutorialCheck();
    }
    else {
        toolCheck();
    }

    // Calculate the maximum allowed positions within the viewerContainer
    if (handDetectClose) {
        maxLeft = viewerRect.width - containerRect.width - cursorWidth;
    }

    // Parse lastCursorLeft and lastCursorTop as integers
    let parsedLastCursorLeft = parseInt(lastCursorLeft);
    let parsedLastCursorTop = parseInt(lastCursorTop);

    // If parsing fails, default to 0
    parsedLastCursorLeft = isNaN(parsedLastCursorLeft) ? 0 : parsedLastCursorLeft;
    parsedLastCursorTop = isNaN(parsedLastCursorTop) ? 0 : parsedLastCursorTop;

    // Calculate the new cursor position based on the previous position and delta
    let cursorLeft, cursorTop;
    let thresholdResetX = 40;        // Var that we need to reset movement (not move cursor)
    let thresholdResetY = 25;        // Var that we need to reset movement (not move cursor)
    let cursorThreshold = 3.75;

    if (Math.abs(overallDeltaX) < thresholdResetX && Math.abs(overallDeltaX) > cursorThreshold) {
        let adjustedDeltaX = overallDeltaX * 5;
        cursorLeft = parsedLastCursorLeft - adjustedDeltaX;
        // Ensure cursor stays within the boundaries of the viewerContainer
        cursorLeft = Math.max(0, Math.min(cursorLeft, maxLeft));
    } else {
        cursorLeft = parsedLastCursorLeft;
    }

    if (Math.abs(overallDeltaY) < thresholdResetY && Math.abs(overallDeltaY) > cursorThreshold) {
        let adjustedDeltaY = overallDeltaY * 8;
        cursorTop = parsedLastCursorTop + adjustedDeltaY;
        // Ensure cursor stays within the boundaries of the viewerContainer
        cursorTop = Math.max(0, Math.min(cursorTop, maxTop));
    } else {
        cursorTop = parsedLastCursorTop;
    }
    
    // Update the last cursor position
    lastCursorLeft = cursorLeft + 'px';
    lastCursorTop = cursorTop + 'px';
    customCursor.style.left = cursorLeft + 'px';
    customCursor.style.top = cursorTop + 'px';
    updateCursor();
    
}

// ANCHOR - NEW CURSOR READ BASED ON PERCENTAGE
function cursorReadLoop() {
    var viewerContainer = document.getElementById('molecule_container');
    var viewerRect = viewerContainer.getBoundingClientRect();
    let container = document.getElementById("toolbox");
    let containerRect = container.getBoundingClientRect();
    let maxLeft = viewerRect.width - cursorWidth;
    let maxTop = viewerRect.height - cursorHeight;
    if(inTutorial) {
        tutorialCheck();
    }
    else {
        toolCheck();
    }

    // Calculate the maximum allowed positions within the viewerContainer
    if (handDetectClose) {
        maxLeft = viewerRect.width - containerRect.width - cursorWidth;
    }

    // Parse lastCursorLeft and lastCursorTop as integers
    let parsedLastCursorLeft = parseInt(lastCursorLeft);
    let parsedLastCursorTop = parseInt(lastCursorTop);

    // If parsing fails, default to 0
    parsedLastCursorLeft = isNaN(parsedLastCursorLeft) ? 0 : parsedLastCursorLeft;
    parsedLastCursorTop = isNaN(parsedLastCursorTop) ? 0 : parsedLastCursorTop;

    // Calculate the new cursor position based on the previous position and delta
    let cursorLeft, cursorTop;
    let cursorThresholdX = 5;
    let cursorThresholdY = 5;

    //NOTE - CALCULATE HAND DISTANCE FROM CENTER. NORMALIZE VALUE SO BASED ON CAMERA SIZE IT WILL GRADUALLY ADD HANDWIDTH TO ADJUST FOR BOUNDING BOXES NOT BEING IN ABSOLUTE EDGE
    if (Math.abs(overallDeltaX) > cursorThresholdX) {
        var leftPercentage;
        var posXAdjust = normalizeValue(posX, handWidth/2, videoWidth-(handWidth/2), -handWidth/2, handWidth/2);
        var leftPoint = posX + posXAdjust; // calculates top most point of hand
        leftPercentage = getPercentFromLeft(leftPoint);     
        cursorLeft = maxLeft * (1-leftPercentage);      //since camera is flipped
        cursorLeft = Math.max(0, Math.min(cursorLeft, maxLeft));    //keeps cursor in bounds
        debugPrint("Left % VALUE: " + leftPercentage);
    } else {
        cursorLeft = parsedLastCursorLeft;
    }
    if (Math.abs(overallDeltaY) > cursorThresholdY) {
        var topPercentage;
        //normalize values so that it adds part of handheight gradually
        var posYAdjust = normalizeValue(posY, handHeight/3, videoHeight-(handHeight/3), -handHeight, handHeight);
        var topPoint = posY + posYAdjust; // calculates top most point of hand
        topPercentage = getPercentFromTop(topPoint);     
        cursorTop = maxTop * topPercentage;
        cursorTop = Math.max(0, Math.min(cursorTop, maxTop));       // keeps cursor in bounds
        debugPrint("Top % VALUE: " + topPercentage);
    } else {
        cursorTop = parsedLastCursorTop;
    }
    
    // Update the last cursor position
    lastCursorLeft = cursorLeft + 'px';
    lastCursorTop = cursorTop + 'px';
    customCursor.style.left = cursorLeft + 'px';
    customCursor.style.top = cursorTop + 'px';
    updateCursor();
    
}


// check where the cursor is in relation to the buttons in the toolbar so that users can select an action to do such as rotate,zoom, and pan
function toolCheck() {
    let handClosedOnButton = false; // State variable to track hand closure on button
    let buttons = [
        { id: "pan", action: selectPanTool },
        { id: "rotate", action: selectRotateTool },
        { id: "zoom", action: selectZoomTool }
        // { id: "help", action: restartTutorial },
        // { id: "noTool", action: deselectTool },
        // { id: "resetView", action: resetView }
    ];

    let cursorRect = customCursor.getBoundingClientRect();
    let cursorLeft = cursorRect.left;
    let cursorTop = cursorRect.top;
    inToolBox = false;
    inHelpBox = false;

    buttons.forEach(buttonInfo => {
        let button = document.getElementById(buttonInfo.id);
        let buttonRect = button.getBoundingClientRect();
    
        if (cursorLeft >= buttonRect.left && cursorLeft <= buttonRect.right &&
            cursorTop >= buttonRect.top && cursorTop <= buttonRect.bottom) {
                button.classList.add("expanded");
                button.classList.add("active");
                if (handDetectClose) {
                    buttonInfo.action();
                }
        } else {
            button.classList.remove("expanded");
            button.classList.remove("active");
            handClosedOnButton = false;
        }
    });

    let container = document.getElementById("toolbox");
    let containerRect = container.getBoundingClientRect();

    let helpContainer = document.getElementById("helpbox");
    let helpRect = helpContainer.getBoundingClientRect();

    if (cursorLeft >= containerRect.left && cursorLeft <= containerRect.right &&
        cursorTop >= containerRect.top && cursorTop <= containerRect.bottom) {
        inToolBox = true;
        container.classList.add("expanded");
    }
    else {
        container.classList.remove("expanded");
    }
}


// called to center cursor in the viewer. Is called when camera is toggled on
function centerCustomCursor() {
    var viewerContainer = document.getElementById('molecule_container');
    var viewerRect = viewerContainer.getBoundingClientRect();
    customCursor = document.getElementById('customCursor');

    cursorWidth = customCursor.offsetWidth;
    cursorHeight = customCursor.offsetHeight;

    // Update cursor position (CENTERS IT)
    customCursor.style.left = 'calc(50% - ' + cursorWidth / 2 + 'px)';
    customCursor.style.top = 'calc(50% - ' + cursorHeight / 2  + 'px)';
    lastCursorLeft = window.getComputedStyle(customCursor).left;
    lastCursorTop = window.getComputedStyle(customCursor).top;
    cursorLeft = lastCursorLeft;
    cursorTop = lastCursorTop;
}

// !SECTION - CURSOR


//SECTION - EVENT LISTENERS
//touching logic 
var isDragging = false;
var mouseStartX, mouseStartY;       // used for actual mouse movements not camera hand

/***************************************************
 *                  EVENT LISTENERS
 ***************************************************/

document.addEventListener("DOMContentLoaded", centerCustomCursor);
window.addEventListener('resize', centerCustomCursor);

document.addEventListener('DOMContentLoaded', function() {

    var videoSelect = document.getElementById('cameraSelect');
    
    // Function to handle change event of the dropdown menu
    videoSelect.addEventListener('change', function(event) {
        selectedDeviceId = event.target.value; // Set the selected device ID to the variable
        debugPrint('Selected camera ID:', selectedDeviceId);
    });
    
    // Set the initial value of selectedDeviceId on page load
    selectedDeviceId = videoSelect.value; // Get the initial value
    debugPrint('Selected camera ID on load:', selectedDeviceId);

    // Enumerate devices
    navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            devices.forEach(function(device) {
                if (device.kind === 'videoinput') {
                    var option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label || 'Camera ' + (videoSelect.length + 1);
                    videoSelect.appendChild(option);
                }
            });
        })
        .catch(function(err) {
            debugPrint('Error enumerating devices: ', err);
        });

        

    let moleculeTouch = document.getElementById('front-panel'); //elemnet on top thgat allows touch.

    // Prevent default behavior (like scrolling) on touchmove
    moleculeTouch.addEventListener('touchmove', function(event) {
        event.preventDefault(); // Prevent scrolling while touching the molecule
    });

    moleculeTouch.addEventListener('touchstart', function(event) {
        let touch = event.touches[0]; // Get the first touch event
        isDragging = true;
        startX = touch.clientX;
        startY = touch.clientY;
    });

    moleculeTouch.addEventListener('touchmove', function(event) {
        if (isDragging) {
            // deltaX and deltaY are used for movements
            // overallDeltaX and overallDeltaY are used for cursor movements and positioning
            // currentTouchX and currentTouchY are used for cursor positioning.

            let touch = event.touches[0]; // Get the first touch event
            overallDeltaX = touch.clientX - startX;
            overallDeltaY = touch.clientY - startY;
            overallDeltaX = -overallDeltaX; // Adjust as needed for your application
            deltaX = overallDeltaX;     
            deltaY = overallDeltaY;
            startX = touch.clientX;
            startY = touch.clientY;
            currentTouchX = startX;
            currentTouchY = startY;
            updateCursor();
            doMovement();
        }
    });

    moleculeTouch.addEventListener('touchend', function(event) {
        isDragging = false;
        let buttons = [
            { id: "pan", action: selectPanTool },
            { id: "rotate", action: selectRotateTool },
            { id: "zoom", action: selectZoomTool },
            { id: "help", action: restartTutorial },
            { id: "noTool", action: deselectTool },
            { id: "resetView", action: resetView }
        ];
    
        let cursorRect = customCursor.getBoundingClientRect();
        let cursorLeft = cursorRect.left;
        let cursorTop = cursorRect.top;
        inToolBox = false;
    
        buttons.forEach(buttonInfo => {
            let button = document.getElementById(buttonInfo.id);
            let buttonRect = button.getBoundingClientRect();
        
            if (cursorLeft >= buttonRect.left && cursorLeft <= buttonRect.right &&
                cursorTop >= buttonRect.top && cursorTop <= buttonRect.bottom) {
                    button.classList.add("expanded");
                    button.classList.add("active");
                    buttonInfo.action();
                
            } else {
                button.classList.remove("expanded");
                button.classList.remove("active");
            }
        });
    });


});

//!SECTION - EVENT LISTENERS
