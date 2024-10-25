// Global variables for the 
var viewer;     // 3dmodel viewer: element
var element;    // element (the container for the element (3d viewer) to be placed in): video element
var animationSpeed = 0; // speed in ms of certain animations such as spin, zoom, etc: int
var debug = false;
var userLoaded = false;
var toolbox;


// Function loads Sphere on 3d viewer used as a test of creating a 3d model viewer space
function loadSphere() {
    element = document.getElementById("molecule_container");
    viewer = $3Dmol.createViewer(element, {backgroundColor: "black"});
    
    viewer.addSphere({ center: {x:0, y:0, z:0}, radius: 10.0, color: 'green'})
    viewer.zoomTo();
    viewer.render();
}

// function loads a molecule from a local file in the pdbLocal directory
function loadMolecule() {
    element = document.getElementById("molecule_container");
    viewer = $3Dmol.createViewer( element, {backgroundColor: "#34568B"} );
    toolbox = document.getElementById("toolbox");
    let pdbUri = 'pdbLocal/5tcq.pdb';
    jQuery.ajax( pdbUri, { 
      success: function(data) {
        viewer.addModel( data, "pdb" );                       /* load data */
        viewer.setStyle({}, {cartoon: {color: 'spectrum'}});  /* style all atoms */
        viewer.zoomTo();                                      /* set camera */
        viewer.render();                                      /* render scene */
        viewer.zoom(0.45, 200);                               /* slight zoom */
        viewer.translate(-toolbox.clientWidth/2,0);
      },
      error: function(hdr, status, err) {
        debugPrint( "Failed to load PDB " + pdbUri + ": " + err );
      },
    });

}


// load a model based on a pdb ID that the user gives in the textbox
function loadUserDefined(){
    var pdbId = document.getElementById("searchBox").value;
    element = document.getElementById("molecule_container");
    viewer = $3Dmol.createViewer( element, {backgroundColor: "#34568B"} );

    pdbId = pdbId.trim();
    // Remove all whitespace characters inside the URL string
    pdbId = pdbId.replace(/\s+/g, '');

    downloadPDBAndView(pdbId, viewer)
    .then(() => {
        // Reset viewer after successful download
        viewer.setStyle({}, {cartoon: {color: 'spectrum'}});  /* style all atoms */
        viewer.zoomTo();                                      /* set camera */
        viewer.render();                                      /* render scene */
        viewer.zoom(0.45, 200);                               /* slight zoom */
        viewer.translate(-toolbox.clientWidth/2,0);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });

    pdbId = parseIdFromPdbUrl(pdbId);
    $3Dmol.download("pdb:" + pdbId, viewer);

    // alert("Function Search term: " + searchTerm);
}

// Function to download PDB and return a promise
function downloadPDBAndView(pdbId, viewer) {
  return new Promise((resolve, reject) => {
      pdbId = parseIdFromPdbUrl(pdbId);
      $3Dmol.download("pdb:" + pdbId, viewer, {}, function() {
          // This function will be called after successful download
          resolve();
      }, function(err) {
          // Handle download error
          reject(new Error('Error downloading PDB: ' + err));
      });
  });
}

function parseIdFromPdbUrl(urlOrId) {
  // Check if the input is a URL
  if (isValidUrl(urlOrId)) {
      // Regular expression to match the ID before .pdb in the URL
      const regex = /\/(\w+)\.pdb$/;
      // Execute the regex on the URL
      const match = regex.exec(urlOrId);
      // If there's a match, return the ID captured by the first capturing group
      if (match && match.length > 1) {
          return match[1]; // This will return the ID (e.g., "8WQW") for the given URL
      } else {
          throw new Error('Invalid PDB URL format');
      }
  } else {
      // Assume the input is already just the ID, return it directly
      return urlOrId;
  }
}

function isValidUrl(str) {
  try {
      new URL(str);
      return true;
  } catch (error) {
      return false;
  }
}



function resetView() {
    if (userLoaded) {
      loadUserDefined();
    }
    else {
      loadMolecule();
    }
}



var rotateSquelch = false;
var panSquelch = false;
var zoomSquelch = false;

// rotates the molecule based on two degree values
// Parameters x: angle to rotate vertically (absolute value)
//            y: angle to rotate horizontally
function rotate(x, y) {
  if (rotateSquelch == false) {
     viewer.rotate(-x, "vy", animationSpeed, false);
     viewer.rotate(y, "vx", animationSpeed, false);
     debugPrint("rotate");
     rotateSquelch = true;
  
    requestAnimationFrame(function() {
      rotateSquelch = false;
    });
  }
}

function pan(x, y) {
  if (panSquelch == false) {
    viewer.translate(-x, -y, animationSpeed, false);
    panSquelch = true;
 
    requestAnimationFrame(function() {
      panSquelch = false;
    });
  }
}

function zoom(factor) { //factor > 1 zooms in, less than 1 zooms out
  if (zoomSquelch == false) {
    currentZoom = viewer.getView()[4];
    viewer.zoom(factor, animationSpeed, false);
    zoomSquelch = true;

    requestAnimationFrame(function() {
      zoomSquelch = false;
    });
  }

}

function debugPrint(message) {
  if (debug) {
    console.log("DEBUG MESSAGE: " + message);
  }
}

function constantRotate() {
  viewer.rotate(1, "vy", animationSpeed, false);
}

var rotateLoopIntervalId;

// Define a function that will be executed repeatedly
function rotateLoop() {
  clearInterval(rotateLoopIntervalId); // Stop the loop
  debugPrint("Rotate Loop is running...");
  if (tool == 0) {
      rotateLoopIntervalId = setInterval(function() {
          constantRotate();
          if (tool != 0) {
              clearInterval(rotateLoopIntervalId); // Stop the loop
              debugPrint("Loop stopped.");
          }
      }, 50);
  }
}

