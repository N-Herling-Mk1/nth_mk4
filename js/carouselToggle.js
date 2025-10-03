import { DEBOUNCE_DURATION_MS } from './configure.js';
import { initAudioController, resumeAudioContext, loadAndPlay } from './audioController.js';
// From visualizer.js:
import { setAnalyserNode, startVisualizer, stopVisualizer } from './visualizer.js';
// From uiAnimator.js:
import { startUIAnimation } from './uiAnimator.js';

const pages = [
  {
    id: 'cv',
    img: 'assets/images/CV_2.png',
    alt: 'CV Preview',
    contentUrl: 'content/CV.html',
    audioUrl: 'assets/audio/02_Load_CV.wav'
  },
  {
    id: 'project1',
    img: 'assets/images/project_1.png',
    alt: 'Project 1 Preview',
    contentUrl: 'content/project_1.html',
    audioUrl: 'assets/audio/03_Project1.wav'
  },
  {
    id: 'project2',
    img: 'assets/images/project_2.png',
    alt: 'Project 2 Preview',
    contentUrl: 'content/project_2.html',
    audioUrl: 'assets/audio/04_Project2.wav'
  },
  {
    id: 'project3',
    img: 'assets/images/project_3.png',
    alt: 'Project 3 Preview',
    contentUrl: 'content/project_3.html',
    audioUrl: 'assets/audio/05_Project3.wav'
  },
  {
    id: 'project4',
    img: 'assets/images/project_4.png',
    alt: 'Project 4 Preview',
    contentUrl: 'content/project_4.html',
    audioUrl: 'assets/audio/06_Project4.wav'
  },
  {
    id: 'project5',
    img: 'assets/images/project_5.png',
    alt: 'Project 5 Preview',
    contentUrl: 'content/project_5.html',
    audioUrl: 'assets/audio/muscle_car_power_up.wav'
  },
];

let currentIndex = 0;
let isDebounced = false;
let audioContext;
let analyser;
let currentAudio = null;

export function initCarouselToggle() {
  // Sync the debounce time into CSS as a custom property
  document.documentElement.style.setProperty('--debounce-duration', `${DEBOUNCE_DURATION_MS}ms`);

  const previewImg = document.querySelector('.middle-toggle .preview-container img');
  const leftBtn = document.querySelector('.middle-toggle .toggle-btn.left');
  const rightBtn = document.querySelector('.middle-toggle .toggle-btn.right');
  const bottomContent = document.querySelector('.bottom-content');

  if (!previewImg || !leftBtn || !rightBtn || !bottomContent) {
    console.error('CarouselToggle: Required elements not found in the DOM.');
    return;
  }

  // Initialize AudioContext and analyser
  ({ audioContext, analyser } = initAudioController());

  // Update image, content, and play audio for current page
  async function updatePreview() {
    previewImg.style.opacity = 0;
    bottomContent.classList.add('fade-out');

    setTimeout(async () => {
      const page = pages[currentIndex];
      previewImg.src = page.img;
      previewImg.alt = page.alt;
      previewImg.style.opacity = 1;

      if (page.contentUrl) {
        try {
          const response = await fetch(page.contentUrl);
          if (!response.ok) throw new Error('Network response was not ok');
          const htmlContent = await response.text();
          bottomContent.innerHTML = htmlContent;
        } catch (error) {
          bottomContent.innerHTML = `<p>Error loading content.</p>`;
          console.error('Error loading content:', error);
        }
      } else {
        bottomContent.innerHTML = '';
      }

      bottomContent.classList.remove('fade-out');

      try {
        await resumeAudioContext(audioContext);

        if (currentAudio) {
          currentAudio.pause();
          currentAudio.src = '';
          currentAudio = null;
        }

        currentAudio = await loadAndPlay(page.audioUrl, audioContext);

        setAnalyserNode(analyser);
        startVisualizer();

        startUIAnimation();

      } catch (err) {
        console.warn('Audio playback prevented or failed:', err);
        stopVisualizer();
      }
    }, 300);
  }

  // Debounced navigation handler
  function handleNavigation(direction) {
    if (isDebounced) return;
    isDebounced = true;

    currentIndex = direction === 'left'
      ? (currentIndex - 1 + pages.length) % pages.length
      : (currentIndex + 1) % pages.length;

    updatePreview();

    setTimeout(() => {
      isDebounced = false;
    }, DEBOUNCE_DURATION_MS);
  }

  // Ripple effect trigger using CSS animation, positioned at click location
  function triggerRippleEffect(button, event) {
    // Calculate click position relative to button
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Set CSS variables to position ripple at click point
    button.style.setProperty('--ripple-left', `${x}px`);
    button.style.setProperty('--ripple-top', `${y}px`);

    // Restart animation by removing and re-adding class
    button.classList.remove('ripple-active');
    void button.offsetWidth; // trigger reflow
    button.classList.add('ripple-active');
  }

  // Resume AudioContext on first user interaction
  function userGestureHandler() {
    resumeAudioContext(audioContext).catch(() => {});
    leftBtn.removeEventListener('click', userGestureHandler);
    rightBtn.removeEventListener('click', userGestureHandler);
  }

  leftBtn.addEventListener('click', userGestureHandler, { once: true });
  rightBtn.addEventListener('click', userGestureHandler, { once: true });

  leftBtn.addEventListener('click', (e) => {
    triggerRippleEffect(leftBtn, e);
    handleNavigation('left');
  });

  rightBtn.addEventListener('click', (e) => {
    triggerRippleEffect(rightBtn, e);
    handleNavigation('right');
  });

  // Initial content load (audio will wait for user interaction)
  updatePreview();
}
