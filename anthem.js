class PlaylistAudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.audio.loop = false;
    this.audio.preload = 'auto';
    
    // Make it hidden background audio
    this.audio.style.display = 'none';
    document.body.appendChild(this.audio);
    
    // Playlist management
    this.playlist = [];
    this.currentTrackIndex = 0;
    
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
      // Try next track if current one fails
      this.playNext();
    });

    // Auto-advance to next track when current one ends
    this.audio.addEventListener('ended', () => {
      console.log('Track ended, advancing to next...');
      this.playNext();
    });
  }

  // Set the playlist
  setPlaylist(tracks) {
    this.playlist = tracks.map(track => {
      if (typeof track === 'string') {
        return { url: track, title: track.split('/').pop().replace('.mp3', '') };
      }
      return track; // Assume it's already an object with url and title
    });
    
    this.currentTrackIndex = 0;
    
    console.log(`Playlist set with ${this.playlist.length} tracks`);
    console.log('Tracks:', this.playlist.map(t => t.title));
  }

  // Get next track index (sequential play only)
  getNextTrackIndex() {
    return (this.currentTrackIndex + 1) % this.playlist.length;
  }

  // Play current track
  async playCurrentTrack(volume = 0.5) {
    if (this.playlist.length === 0) {
      console.warn('No playlist set');
      return;
    }

    const currentTrack = this.playlist[this.currentTrackIndex];
    console.log(`Playing: ${currentTrack.title}`);
    
    this.audio.src = currentTrack.url;
    this.audio.volume = volume;
    this.pendingPlay = { track: currentTrack, volume };
    
    try {
      await this.audio.play();
      console.log('Audio playing successfully');
      this.updatePlayButton(`🎵 ${currentTrack.title}`);
    } catch (error) {
      console.error('Autoplay blocked. Need user interaction first.');
      console.error('Error:', error.message);
      
      // Create a click-to-play button
      this.createPlayButton();
    }
  }

  // Play next track
  async playNext() {
    if (this.playlist.length === 0) return;
    
    this.currentTrackIndex = this.getNextTrackIndex();
    await this.playCurrentTrack(this.audio.volume);
  }

  // Play previous track
  async playPrevious() {
    if (this.playlist.length === 0) return;
    
    // Sequential play only - go to previous track
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    await this.playCurrentTrack(this.audio.volume);
  }

  // Skip to specific track
  async skipToTrack(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentTrackIndex = index;
      await this.playCurrentTrack(this.audio.volume);
    }
  }

  // Start playlist
  async startPlaylist(volume = 0.5) {
    if (this.playlist.length === 0) {
      console.warn('No playlist to start');
      return;
    }

    this.currentTrackIndex = 0;
    await this.playCurrentTrack(volume);
  }

  createPlayButton() {
    // Check if button already exists
    if (document.getElementById('audio-play-btn')) return;
    
    const currentTrack = this.playlist[this.currentTrackIndex];
    const playButton = document.createElement('div');
    playButton.id = 'audio-play-btn';
    playButton.innerHTML = `🎵 ${currentTrack ? currentTrack.title : 'Playlist'}`;
    playButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 5;
      padding: 10px 15px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border: 2px solid white;
      border-radius: 5px;
      font-family: inherit;
      font-size: 11px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
    
    // Add controls for pause/play, next/previous
    const controlsContainer = document.createElement('div');
    controlsContainer.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      z-index: 5;
      display: flex;
      gap: 5px;
    `;

    function addHoverEffect(button) {
      // Hover
      button.addEventListener("mouseenter", () => {
        button.style.background = "rgba(255, 255, 255, 0.2)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.background = "rgba(0, 0, 0, 0.8)";
        button.style.transform = "scale(1)";
      });

      // Click (press down)
      // Click (press down)
      button.addEventListener("mousedown", () => {
        button.style.background = "rgba(255, 255, 255, 0.4)";
        button.style.transform = "scale(0.9)";
      });

      // Release click
      button.addEventListener("mouseup", () => {
        button.style.background = "rgba(255, 255, 255, 0.2)";
        button.style.transform = "scale(1)";
      });

      // Smooth transition
      button.style.transition = "background 0.2s ease, transform 0.1s ease";
    }
    
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '⏮️';
    prevButton.style.cssText = `
      padding: 5px 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border: 2px outset white;
      border-radius: 5px;
      font-size: 12px;
    `;
    prevButton.addEventListener('click', () => this.playPrevious());
    
    const pausePlayButton = document.createElement('button');
    pausePlayButton.id = 'pause-play-btn';
    pausePlayButton.innerHTML = '▶️';
    pausePlayButton.style.cssText = prevButton.style.cssText;
    pausePlayButton.addEventListener('click', () => this.togglePause());
    
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '⏭️';
    nextButton.style.cssText = prevButton.style.cssText;
    nextButton.addEventListener('click', () => this.playNext());
    
    addHoverEffect(prevButton);
    addHoverEffect(pausePlayButton);
    addHoverEffect(nextButton);
    
    controlsContainer.appendChild(prevButton);
    controlsContainer.appendChild(pausePlayButton);
    controlsContainer.appendChild(nextButton);
    
    document.body.appendChild(playButton);
    document.body.appendChild(controlsContainer);
  }

  updatePlayButton(text) {
    const playButton = document.getElementById('audio-play-btn');
    if (playButton) {
      playButton.innerHTML = text;
    }
  }

  // Control methods
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

  // Toggle pause/play
  togglePause() {
    const pausePlayButton = document.getElementById('pause-play-btn');
    
    if (this.audio.paused) {
      this.resume();
      if (pausePlayButton) pausePlayButton.innerHTML = '⏸️';
      console.log('Music resumed');
    } else {
      this.pause();
      if (pausePlayButton) pausePlayButton.innerHTML = '▶️';
      console.log('Music paused');
    }
  }

  // Get current track info
  getCurrentTrack() {
    return this.playlist[this.currentTrackIndex];
  }

  // Get playlist info
  getPlaylistInfo() {
    return {
      tracks: this.playlist,
      currentIndex: this.currentTrackIndex,
      totalTracks: this.playlist.length
    };
  }
}

// Initialize audio player
const backgroundMusic = new PlaylistAudioPlayer();

// Define your playlist here
const musicPlaylistWithTitles = [
  { url: './anthems/takashimurakami.mp3', title: 'Takashi Murakami - 6 Dogs' },
  { url: './anthems/nuketown.mp3', title: 'Nuketown - Ski Mask the Slump God' },
  { url: './anthems/wasted.mp3', title: 'Wasted (remix) - Juice WRLD' },
  { url: './anthems/unreleased.mp3', title: '[unreleased] - Juice WRLD' },
  { url: './anthems/90210.mp3', title: '90210 - Blackbear' },
  { url: './anthems/crybaby.mp3', title: 'crybaby - Lil Peep' },
  { url: './anthems/ctrlaltdelete.mp3', title: 'CtrlAltDelete - Bones' },
  { url: './anthems/dior.mp3', title: 'Dior - Pop Smoke' },
  { url: './anthems/ptsd.mp3', title: 'PTSD - Pop Smoke' }
];

// Set up the playlist
backgroundMusic.setPlaylist(musicPlaylistWithTitles);

// Try to start playlist immediately (will likely be blocked)
backgroundMusic.startPlaylist(0.3);

// Debug: Check if files exist
const checkPlaylistFiles = async () => {
  console.log('🎵 Checking playlist files...');
  
  for (let i = 0; i < backgroundMusic.playlist.length; i++) {
    const track = backgroundMusic.playlist[i];
    try {
      const response = await fetch(track.url);
      if (response.ok) {
        console.log(`✅ ${track.title} (${track.url}) - Found`);
      } else {
        console.error(`❌ ${track.title} (${track.url}) - Not found (${response.status})`);
      }
    } catch (error) {
      console.error(`❌ ${track.title} (${track.url}) - Error: ${error.message}`);
    }
  }
};

// Run the check after a short delay to let the playlist initialize
setTimeout(checkPlaylistFiles, 1000);