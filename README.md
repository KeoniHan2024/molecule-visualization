# 🧬 Molecular Visualization Application 🧬
## Description
This application allows users to visualize molecular structures using .pdb files or by fetching data from the RCSB PDB database via URL. It utilizes a CNN model from the handtracker.js library to enable real-time interaction with molecular models through hand movements detected by a camera. Touch interaction is also supported on compatible devices, enhancing user experience, as tested on the Proto Holo platform.

## Features 
- **Support for .pdb Files:** Users can upload .pdb files directly for molecular visualization.
- **Integration with RCSB Database:** Fetch molecular structures by entering a URL from the RCSB PDB database.
- **Real-time Molecular Visualization:** Utilizes a CNN model in handtracker.js for interactive manipulation using hand gestures detected by the camera.
- **Gesture Controls:** Users can rotate, pan, and zoom in on models using detected hand movements.
- **Touch Support:** Enables touch interaction for navigating and manipulating molecules on devices that support it, enhancing user accessibility.

## Usage ⌨
Tool  | Action
------------- | -------------
**Pan**  | Close fist and move hand in the direction your fist is moving. Does not support z-axis panning
**Rotate**  | Close fist and move hand in the angle that you want the molecule to rotate in
**Zoom**  |  Close fist and move fist left to zoom out, right to zoom in

### Uploading .pdb Files 🧬
## Uploading .pdb Files (Option 1)
1. Download .pdb File
.pdb molecules can be downloaded from this RCSB database: https://www.rcsb.org/.
2. Import it into the file directory path ./pdbLocal
3. In the loadMolecule() function in index.js, replace the pdbUri variable with the path to the downloaded file

## Fetching from RCSB Database (Option 2) 🖱
1. Scroll down below the molecule viewer 
2. Type in pdb ID or a url in the format: https://files.rcsb.org/download/8WQW.pdb 
3. Press the 'Load Molecule' button

### Hand-gesture Interaction 🫳
1. Step about 1- 3 feet away from the camera
2. Move cursor with your open hand (palm facing the camera) to hover over a tool
3. Close fist to select a tool while hovered over a button
4. Use closed fist to grab and do motion

### Touch Interaction ✋
1. Use hands to select tools or buttons
2. Move cursor by dragging your finger across the screen.
3. When a tool is selected, hold and drag on the visualizer to do action with the tool

## Demo 🎞
Put demo in later

## License
//

## Authors
List the authors or contributors to the project.

## Acknowledgments
Acknowledge any res

# Changelog 🔎
| Version               |New Changes                          |Bug Fixes                        |
|----------------|-------------------------------|-----------------------------|
|0.3.0|<ul><li>added 3D model viewer to display molecules</li> <li>added functionality that allows user to search for a specific molecule</li><li>added ability to render models from local .pdb files (set to 5tcq.pdb in pdbLocal) by default</li></ul>     |N/A            |
|0.3.5 |<ul><li>Added functionality that allows user to swipe and rotate molecules with hand through the user's camera</li></ul>         |Fixed bug where 3D model viewer would flash screen every time a new model was rendered             |
|0.5.0 |<ul><li>Closed fist is now the movement control for everything.</li><li>Toggle through different tools with your keyboard: Press "r" for rotate, "h" for pan, and "t" to toggle hand gesture on and off.</li><li>User now has the ability to change between different cameras.</li><li>Added a threshold slider.</li><li>Made minor changes to UI.</li><li>Changed the hand detection model from ssd640 to ssd320</li><li>Changed model size from fp16(large) to int8(small)</li><li>Detections only run every 100ms now instead of the previous 20ms</li></ul>|<ul><li>Fixed bug where camera on screen was very small.</li></ul>|
|1.0.0 |<ul><li>Added a tutorial Screen showing 3 steps on how to use the application</li><li>Added a loading screen has been added while the CNN model loads</li><li>Toggle through different tools with a new toolbar using your hand</li><li>Removed the threshold slider and camera view element</li><li>Replaced the selected tool text with cursor icons that inform the user what tool they are selecting</li><li>Animation Speed is now decreased # Molecular Visualization Application||
|1.1.0|<ul><li>Added Videos to tutorial cards</li><li>Added Support for touch gestures on buttons.</li><li>Added Three buttons on the top left</li><li>Added Help button brings the tutorial cards back up</li><li>Added View reset view button to put the molecule back in original view</li><li>Added No tool option (hand cursor), this activates an idle spinning animations</li><li>Added the Option for the user to import their own molecule in a text box</li><li> Animation Speed is now removed so animations aren't added to a queue like before</li><li>Buttons are now mouse/touch clickable</li><li> Text drop shadow on buttons are now blue and less offset (avoid the error look that red had)</li><li> Squelching is now used for all actions. This is to prevent further animations from queuing up before the current one completes and updates).</li><li>RequestanimationFrame is used to create smoother animations, by stopping animations in inactive tabs</li></ul>|<ul><li>Fixed ResetTool and SpinMolecule functions spawned Infinite loops which caused bad performance issues</li></ul>|
|1.1.5 |<ul><li>Changed hand movement to percentage based calculations as opposed to delta based movements</li></ul>|


# Known Bugs/Issues 🐛
- When the lights are too bright it fails under pressure and hand gestures are not read very well
- When mutiple hands are shown in a frame. There may be some performance issues

# Files 🗃
```
├── pdbLocal
│   ├── 5tcq.pdb
│   └── 9ayg.pdb
├── assets
│   ├── fonts
│   │	└──CafeDeParisSans-BWwJx.ttf
│   └── img
│   	├── closed.png
│   	├── open.png
│   	├── pan-tool-alt.png
│   	├── pan-tool.png
│   	├── point.png
│   	├── rotate-tool.png
│   	└── zoom-tool.png
├── css
│   ├── carbon-components.css
│   └── style.css
├── lib
│   ├── 3Dmol-min-2.1.0.js
│   ├── 3Dmol.ui-min-2.1.0.js
│   ├── handtrack.min-0.1.0.js
│   └── jquery-3.6.0.min.js
├── handCam.js
├── index.js
├── index.html
├── CHANGELOG.md
└── README.md
```
# Libraries Used 📚
- **Handtracker.js**
	- [Github](https://github.com/victordibia/handtrack.js/)
	- [Documentation](https://victordibia.com/handtrack.js/#/)
- **3Dmol.js**
	- [Github](https://github.com/3dmol/3Dmol.js)
	- [Documentation](https://3dmol.csb.pitt.edu/)


