// Creepy music box for InterWeb.
// Plays a public-domain carol (Jingle Bells) slowly, in a minor key.
// You can also load your own song file with the button in the corner.
(function () {
  // Frequencies (Hz), C minor
  var N = { C: 523.25, D: 587.33, Eb: 622.25, F: 698.46, G: 783.99 };
  // [note, beats]
  var tune = [
    ["Eb",1],["Eb",1],["Eb",2],  ["Eb",1],["Eb",1],["Eb",2],
    ["Eb",1],["G",1],["C",1.5],["D",.5],["Eb",4],
    ["F",1],["F",1],["F",1.5],["F",.5],
    ["F",1],["Eb",1],["Eb",1],["Eb",.5],["Eb",.5],
    ["Eb",1],["D",1],["D",1],["Eb",1],
    ["D",2],["G",2]
  ];
  var beat = 0.6;      // seconds per beat (slow and eerie)
  var restAfter = 3;   // beats of silence between loops

  var ctx, master, loopTimer, playing = false, audioEl = null;

  function pluck(freq, when, dur) {
    // two slightly detuned sine tones give an out-of-tune music box sound
    [0, 6].forEach(function (detune) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq * 2;
      o.detune.value = detune;
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(0.22, when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.8);
      o.connect(g); g.connect(master);
      o.start(when); o.stop(when + dur + 0.9);
    });
  }

  function scheduleLoop() {
    var t = ctx.currentTime + 0.1, total = 0;
    tune.forEach(function (n) {
      pluck(N[n[0]], t + total * beat, n[1] * beat);
      total += n[1];
    });
    loopTimer = setTimeout(scheduleLoop, (total + restAfter) * beat * 1000);
  }

  function startBox() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    ctx.resume();
    scheduleLoop();
  }

 function stopBox() {
  clearTimeout(loopTimer);
  if (ctx) { ctx.close(); ctx = null; master = null; }
}

  // UI
  var wrap = document.createElement("div");
  wrap.className = "music-ui";
  wrap.innerHTML =
    '<button type="button" id="music-toggle">Play the music box</button>' +
    '<label class="music-file">Use my own song' +
    '<input type="file" accept="audio/*" id="music-file"></label>';
  document.body.appendChild(wrap);

  var toggle = document.getElementById("music-toggle");

  function setPlaying(on) {
    playing = on;
    toggle.textContent = on ? "Silence it" : (audioEl ? "Play my song" : "Play the music box");
  }

  toggle.addEventListener("click", function () {
    if (playing) {
      if (audioEl) audioEl.pause(); else stopBox();
      setPlaying(false);
    } else {
      if (audioEl) audioEl.play(); else startBox();
      setPlaying(true);
    }
  });

  document.getElementById("music-file").addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    if (playing && !audioEl) stopBox();
    if (audioEl) audioEl.pause();
    audioEl = new Audio(URL.createObjectURL(file));
    audioEl.loop = true;
    audioEl.play();
    setPlaying(true);
  });
})();
