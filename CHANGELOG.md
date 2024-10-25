# Change Log
## [1.1.0] - (2024-06-18)
### Changed
- Hand movement to percentage based calculations as opposed to delta based movements

## [1.1.0] - (2024-06-18)
### Added
- Videos to tutorial cards
- Support for touch gestures on molecule viewer and buttons.
- Three buttons on the top left
    - Help button brings the tutorial cards back up
    - View reset view button to put the molecule back in original view
    - No tool option (hand cursor), this activates an idle spinning animations
- Option for the user to import their own molecule in a text box

### Changed
- Animation Speed is now removed so animations aren't added to a queue like before
- Buttons are now mouse/touch clickable
- Text drop shadow on buttons are now blue and less offset (avoid the error look that red had)
- Squelching is now used for all actions. This is to prevent further animations from queuing up before the current one completes and updates). 
- RequestanimationFrame is used to create smoother animations, by stopping animations in inactive tabs

### Fixed
- ResetTool and SpinMolecule functions spawned Infinite loops which caused bad performance issues

## [1.0.0] - (2024-06-18)
### Added
- Tutorial Screen showing 3 steps on how to use the application
- Loading screen has been added while the CNN model loads

### Changed
- Toggle through different tools with a new toolbar using your hand
- Removed the threshold slider and camera view element
- Replaced the selected tool text with cursor icons that inform the user what tool they are selecting
- Animation Speed is now decreased from 150 to 35 which shows noticable performance improvements

### Fixed
- Rotation tool now rotates the right way when closing fist (previously rotated in random directions)
- The zoom tool is now scaled less so it isn't so sensitive

## [0.5.0] - (2024-06-12)
### Added
- Toggle through different tools with your keyboard: Press "r" for rotate, "h" for pan, and "t" to toggle hand gesture on and off.
- User now has the ability to change between different cameras.
- Added a threshold slider.
 
### Changed
- Closed fist is now the movement control for everything.
- Made minor changes to UI.
- Changed the hand detection model from ssd640 to ssd320
- Changed model size from fp16(large) to int8(small)
- Detections only run every 100ms now instead of the previous 20ms

### Fixed
- Fixed bug where camera on screen was very small.

## [0.3.5] - (2024-06-10)
### Added
- functionality that allows user to swipe and rotate molecules with hand through the user's camera

### Fixed 
- Fixed bug where 3D model viewer would flash screen every time a new model was rendered
 
## [0.3.0] - (2024-06-05)
### Added
- 3D model viewer to display molecules 
- functionality that allows user to search for a specific molecule
- ability to render models from local .pdb files (set to 5tcq.pdb in pdbLocal) by default
