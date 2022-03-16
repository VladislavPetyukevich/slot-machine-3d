# SlotMachine3D
3D slot-machine. Made in [three.js](https://threejs.org/)

## Demo

![preview of demo](preview.png)

Run `npm ci && npm run demo` to see the demo in action.  
All this demo code is located in [demo](demo) directory.  

## Usage

Code from demo examle:  
```js
var slotMachine = new SlotMachine3D({
  renderContainer: renderContainer, // HTML Element
  numbersRollTextureURL: '/number-roll.png',
  slotTextureURL: '/slot.png',
  backgroundHexColor: 0x000000, // Optional
  caption: 'RABOTAEM', // Optional
  font: 'Angles Octagon', // Optional. Default value: 'serif'
  fontSize: '40px', // Optional. Default value: '40px'
  fillStyle: '#020000', // Optional. Default value: '#020000'
  onSpinStart: onSpinStart, // Optional
  onSpinFinish: onSpinFinish, // Optional
});

slotMachine.spin(123);
slotMachine.setCaption('Custom caption');

// Glitch effects
// slotMachine.enableGlitchSpinSlot();
// slotMachine.enableGlitchSpinCaption();

// slotMachine.disableGlitchSpinSlot();
// slotMachine.disableGlitchSpinCaption();

// slotMachine.setCameraShakeAmplitude(0.15);
// slotMachine.setCameraShakesPerSecond(15);
// slotMachine.enableCameraShake();
// slotMachine.disableCameraShake();

// slotMachine.setSpinConfig([
//   {
//     cycles: 1,
//     durationSeconds: 3
//   },
//   {
//     cycles: [1, 2],
//     durationSeconds: [3, 4]
//   },
//   {
//     cycles: [2, 3],
//     durationSeconds: [4, 5]
//   },
// ]);
```
