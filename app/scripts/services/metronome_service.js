const successMp3Url = require("file!../../resources/success.mp3");
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer;

function loadMp3() {
  const request = new XMLHttpRequest();
  request.open("GET", successMp3Url, true);
  request.responseType = "arraybuffer";

  request.onload = function() {
    const audioData = request.response;

    audioCtx.decodeAudioData(
      audioData,
      function(buffer) {
        audioBuffer = buffer;
      },
      function(e) {
        console.error("Error with decoding audio data" + e.err);
      },
    );
  };

  request.send();
}

loadMp3();

export default {
  createAudioNode: function() {
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    return source;
  },
  play: function(delay) {
    const source = this.createAudioNode();
    source.start(audioCtx.currentTime + delay / 1000);
    return source;
  },
  stop: function(source) {
    source.stop(0);
  },
};
