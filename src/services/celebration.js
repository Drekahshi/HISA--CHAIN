export class CelebrationService {
  static createConfetti(count = 100) {
    for (let i = 0; i < count; i++) {
      this.createConfettiPiece();
    }
  }

  static createConfettiPiece() {
    const colors = [
      '#FF6B35', '#FFD23F', '#4CAF50', '#8D4004',
      '#7B2CBF', '#E63946', '#06FFA5', '#FFBE0B'
    ];

    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = (Math.random() * 10 + 5) + 'px';
    confetti.style.height = (Math.random() * 10 + 5) + 'px';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';

    document.body.appendChild(confetti);

    setTimeout(() => {
      document.body.removeChild(confetti);
    }, 5000);
  }

  static createSparkles(count = 20) {
    for (let i = 0; i < count; i++) {
      this.createSparkle();
    }
  }

  static createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.top = Math.random() * 100 + 'vh';

    document.body.appendChild(sparkle);

    setTimeout(() => {
      document.body.removeChild(sparkle);
    }, 1000);
  }

  static playCelebrationSound() {
    // Create a simple celebration sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Audio context not supported");
    }
  }

  static showCelebrationMessage(message, duration = 3000) {
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';

    const messageDiv = document.createElement('div');
    messageDiv.className = 'celebration-message';
    messageDiv.innerHTML = `
      <h2>🎉 ${message} 🎉</h2>
      <p>HISA! Your action was successful!</p>
    `;

    overlay.appendChild(messageDiv);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('active');
    }, 100);

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 500);
    }, duration);
  }

  static animateElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('bounce');
      setTimeout(() => {
        element.classList.remove('bounce');
      }, 1000);
    }
  }
}
