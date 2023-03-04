/* RNNoise.js - a WebAssembly wrapper for RNNoise */

const RNNoiseModule = (function() {

  // Change this if you put rnnoise.wasm in a different directory
  const rnnoiseWasmUrl = 'rnnoise.wasm';

  let rnnoiseReady = false;
  let rnnoiseCallbacks = [];

  function onRuntimeInitialized() {
    rnnoiseReady = true;
    for (let i = 0; i < rnnoiseCallbacks.length; i++) {
      rnnoiseCallbacks[i]();
    }
  }

  function loadRnnoise(callback) {
    if (rnnoiseReady) {
      callback();
    } else {
      rnnoiseCallbacks.push(callback);
      if (typeof Module !== 'undefined') {
        Module.onRuntimeInitialized = onRuntimeInitialized;
      } else {
        const script = document.createElement('script');
        script.src = 'rnnoise.js.mem';
        script.onload = function() {
          Module.onRuntimeInitialized = onRuntimeInitialized;
        };
        document.head.appendChild(script);
      }
    }
  }

  return {
