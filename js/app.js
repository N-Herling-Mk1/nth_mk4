//File: app.js 
//app.js is the main controller script for the audio 
//visualization web app. It manages the user interface and 
// coordinates the audio playback and visualization processes by:
//Initializing the audio context and analyzer nodes.
//Setting up UI elements such as the audio file selector and play button.
//Handling user interactions to start and stop audio playback.
//Coordinating the start and stop of visual effects tied to the audio.
//Managing event callbacks, like detecting when audio ends, to update the UI and stop visualizations cleanly.

// -------- code
import { initAudioController, loadAndPlay, onAudioEnded } from './audioController.js';
import { startVisualizer, setAnalyserNode, stopVisualizer } from './visualizer.js';
import { startUIAnimation } from './uiAnimator.js';
import { initCarouselToggle } from './carouselToggle.js';

window.addEventListener('DOMContentLoaded', async () => {
  // Initialize audio context and analyser node
  const { audioContext, analyser } = initAudioController();
  setAnalyserNode(analyser);

  // Start UI animations
  startUIAnimation();

  // Initialize carousel toggle widget
  initCarouselToggle();

  let isPlaying = false;
  let audioElement = null;

  // Handle audio ended event globally
  onAudioEnded(() => {
    stopVisualizer();
    isPlaying = false;
  });

  // Automatically load and play audio on page load
  const audioFile = 'assets/audio/power_up.wav'; // or whatever your default audio is

  try {
    audioElement = await loadAndPlay(audioFile, audioContext);
    if (audioElement) {
      isPlaying = true;
      startVisualizer();
    }
  } catch (error) {
    console.error('[App] Failed to play audio:', error);
  }
});
