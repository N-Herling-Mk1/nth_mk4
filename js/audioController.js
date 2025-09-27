// File: audioController.js

let audioContext = null;
let analyser = null;
let sourceNode = null;
let audioElement = null;
let endCallback = null;

/**
 * Initializes (once) and returns the shared AudioContext and AnalyserNode.
 */
export function initAudioController() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    console.log('[AudioController] AudioContext and Analyser initialized.');
  }

  return { audioContext, analyser };
}

/**
 * Ensures the AudioContext is resumed after a user gesture.
 */
export async function resumeAudioContext() {
  if (!audioContext) initAudioController(); // Ensure it exists
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
    console.log('[AudioController] AudioContext resumed.');
  }
}

/**
 * Loads and plays an audio file using the shared AudioContext.
 * @param {string} url - Audio file URL
 * @returns {Promise<HTMLAudioElement>} - The playing audio element
 */
export async function loadAndPlay(url) {
  try {
    await resumeAudioContext(); // Always ensure it's resumed before playback

    // Stop any previous audio
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      audioElement.load();
      audioElement = null;
    }

    // Create and prepare new HTMLAudioElement
    audioElement = new Audio();
    audioElement.src = url;
    audioElement.crossOrigin = 'anonymous';
    audioElement.preload = 'auto';
    audioElement.autoplay = false;

    await new Promise((resolve, reject) => {
      audioElement.oncanplay = resolve;
      audioElement.onerror = () => reject(new Error('Failed to load audio'));
    });

    // Disconnect previous source if exists
    if (sourceNode) {
      try {
        sourceNode.disconnect();
      } catch (err) {
        console.warn('[AudioController] Failed to disconnect old source:', err);
      }
    }

    // Create new MediaElementSource using the same audioContext
    sourceNode = audioContext.createMediaElementSource(audioElement);
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    // Set up 'ended' callback
    audioElement.onended = () => {
      console.log('[AudioController] Audio playback ended.');
      if (typeof endCallback === 'function') endCallback();
    };

    // Play audio
    await audioElement.play();
    console.log('[AudioController] Audio playback started:', url);

    return audioElement;
  } catch (error) {
    console.error('[AudioController] Error in loadAndPlay:', error);
    throw error;
  }
}

/**
 * Register a callback to be called when audio ends.
 */
export function onAudioEnded(callback) {
  endCallback = callback;
}
