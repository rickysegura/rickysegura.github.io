class SimpleAudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.audio.loop = false;
    this.audio.preload = 'auto';
    
    // Make it hidden background audio
    this.audio.style.display = 'none';
    document.body.appendChild(this.audio);
    
    // Track if audio is ready to play
    this.isReady = false;
    this.pendingPlay = null;
    
    // Set up event listeners
    this.audio.addEventListener('canplaythrough', () => {
      this.isReady = true;
      console.log('Audio loaded and ready to play');
    });
    
    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      console.error('Failed to load:', this.audio.src);
    });
  }

  async play(audioUrl, volume = 0.5) {
    this.audio.src = audioUrl;
    this.audio.volume = volume;
    this.pendingPlay = { audioUrl, volume };
    
    try {
      await this.audio.play();
      console.log('Audio playing successfully');
    } catch (error) {
      console.error('Autoplay blocked. Need user interaction first.');
      console.error('Error:', error.message);
      
      // Create a click-to-play button
      this.createPlayButton();
    }
  }

  createPlayButton() {
    // Check if button already exists
    if (document.getElementById('audio-play-btn')) return;
    
    const playButton = document.createElement('button');
    playButton.id = 'audio-play-btn';
    playButton.innerHTML = '🎵 Anthem';
    playButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      padding: 10px 15px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border: 2px solid white;
      border-radius: 5px;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
    `;
    
    playButton.addEventListener('click', () => {
      this.audio.play().then(() => {
        console.log('Music started after user interaction');
        playButton.remove();
      }).catch(error => {
        console.error('Still failed to play:', error);
      });
    });
    
    document.body.appendChild(playButton);
  }

  pause() {
    this.audio.pause();
  }

  resume() {
    this.audio.play().catch(error => {
      console.error('Resume failed:', error);
    });
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume)); // 0-1
  }

  setLoop(loop) {
    this.audio.loop = loop;
  }
}

// Initialize audio player
const backgroundMusic = new SimpleAudioPlayer();

// Try to play immediately (will likely be blocked)
backgroundMusic.setLoop(true); // Loop the background music
backgroundMusic.play("./background.mp3", 0.3); // Lower volume for background

// Alternative: Wait for any user interaction on the page
let hasInteracted = false;

function enableAudioOnInteraction() {
  if (hasInteracted) return;
  
  hasInteracted = true;
  backgroundMusic.play("./background.mp3", 0.3);
  
  // Remove event listeners after first interaction
  document.removeEventListener('click', enableAudioOnInteraction);
  document.removeEventListener('keydown', enableAudioOnInteraction);
  document.removeEventListener('touchstart', enableAudioOnInteraction);

  // Hide play button
  document.getElementById("audio-play-btn").style.display = "none";
}

// Listen for any user interaction
document.addEventListener('click', enableAudioOnInteraction);
document.addEventListener('keydown', enableAudioOnInteraction);
document.addEventListener('touchstart', enableAudioOnInteraction);

// Debug: Check if file exists
fetch('./background.mp3')
  .then(response => {
    if (response.ok) {
      console.log('✅ background.mp3 file found');
    } else {
      console.error('❌ background.mp3 file not found (404)');
    }
  })
  .catch(error => {
    console.error('❌ Error checking for background.mp3:', error);
  });