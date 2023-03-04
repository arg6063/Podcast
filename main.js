const audioContext = new AudioContext();
const rnnoise = new RnNoise(audioContext.sampleRate);
const fileInput = document.getElementById('audio-file');
const processBtn = document.getElementById('process-btn');
const originalAudio = document.getElementById('original-audio');
const processedAudio = document.getElementById('processed-audio');

fileInput.addEventListener('change', function() {
  const file = fileInput.files[0];
  const fileReader = new FileReader();

  fileReader.onload = function() {
    const audioData = fileReader.result;
    audioContext.decodeAudioData(audioData, function(buffer) {
      originalAudio.src = URL.createObjectURL(file);
      originalAudio.controls = true;

      processBtn.addEventListener('click', function() {
        applyNoiseReduction(buffer);
        applyPodcastEffect(buffer);
        playProcessedAudio(buffer);
      });
    });
  };

  fileReader.readAsArrayBuffer(file);
});

function applyNoiseReduction(buffer) {
  const inputData = buffer.getChannelData(0);
  const outputData = rnnoise.process(inputData);
  buffer.copyToChannel(outputData, 0);
}

function applyPodcastEffect(buffer) {
  const inputNode = audioContext.createBufferSource();
  inputNode.buffer = buffer;

  const compressorNode = audioContext.createDynamicsCompressor();
  compressorNode.threshold.setValueAtTime(-24, audioContext.currentTime);
  compressorNode.knee.setValueAtTime(30, audioContext.currentTime);
  compressorNode.ratio.setValueAtTime(12, audioContext.currentTime);
  compressorNode.attack.setValueAtTime(0, audioContext.currentTime);
  compressorNode.release.setValueAtTime(0.25, audioContext.currentTime);

  inputNode.connect(compressorNode);
  compressorNode.connect(audioContext.destination);

  inputNode.start();
}

function playProcessedAudio(buffer) {
  processedAudio.src = URL.createObjectURL(new Blob([buffer]));
  processedAudio.controls = true;
}
