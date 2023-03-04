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

  return {process: function(inputData) {
    if (!rnnoiseReady) {
      throw new Error('RNNoise is not ready yet!');
    }

    const inputPtr = Module._malloc(inputData.length * inputData.BYTES_PER_ELEMENT);
    const outputPtr = Module._malloc(inputData.length * inputData.BYTES_PER_ELEMENT);

    Module.HEAPF32.set(inputData, inputPtr / Float32Array.BYTES_PER_ELEMENT);

    Module.ccall(
      'rnnoise_process_frame',
      'number',
      ['number', 'number'],
      [outputPtr, inputPtr]
    );

    const outputData = new Float32Array(inputData.length);
    outputData.set(Module.HEAPF32.subarray(outputPtr / Float32Array.BYTES_PER_ELEMENT, (outputPtr + inputData.length * inputData.BYTES_PER_ELEMENT) / Float32Array.BYTES_PER_ELEMENT));

    Module._free(inputPtr);
    Module._free(outputPtr);

    return outputData;
  }
};
})();

function RnNoise(sampleRate) {
RNNoiseModule.load(function() {
RNNoiseModule.ccall('rnnoise_init', 'number', ['number'], [sampleRate]);
});

return RNNoiseModule;
}

