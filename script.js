/* ============================================================
   Retro Birthday Landing Page — Script
   Handles: subtle interactions, confetti on OK click,
            hover effects, and entrance animations
   ============================================================ */

(function () {
  'use strict';

  // ── Intro Screen ────────────────────────────────────────────
  const introScreen = document.getElementById('intro-screen');
  const pageWrapper = document.getElementById('page-wrapper');
  const introParticlesContainer = document.getElementById('intro-particles');

  // Spawn floating particles on intro screen
  function spawnIntroParticles() {
    const colors = [
      'rgba(147, 197, 253, 0.5)',
      'rgba(96, 165, 250, 0.4)',
      'rgba(59, 130, 196, 0.3)',
      'rgba(251, 191, 36, 0.35)',
      'rgba(255, 255, 255, 0.2)',
    ];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'intro-particle';
      const size = Math.random() * 6 + 3;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDuration = (Math.random() * 8 + 6) + 's';
      p.style.animationDelay = (Math.random() * 6) + 's';
      introParticlesContainer.appendChild(p);
    }
  }

  if (introScreen && introParticlesContainer) {
    spawnIntroParticles();
  }

  // Handle intro click → reveal card & start music
  if (introScreen && pageWrapper) {
    introScreen.addEventListener('click', () => {
      // Start exit animation
      introScreen.classList.add('exiting');

      // Start music on user interaction
      const audioEl = document.getElementById('audio-el');
      if (audioEl) {
        audioEl.play().catch(() => {});
      }

      // After transition, remove intro and show card
      setTimeout(() => {
        introScreen.style.display = 'none';
        pageWrapper.classList.remove('hidden');
        // Trigger entrance confetti
        setTimeout(() => {
          const heading = document.getElementById('main-heading');
          if (heading) burstConfetti(heading);
        }, 800);
      }, 600);
    });
  }
  // ── 8-Bit Web Audio Sound Synthesizer ───────────────────────
  let sfxEnabled = true;
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!sfxEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'sparkle') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.05;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.16);
        });
      } else if (type === 'fanfare') {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          const t = now + idx * 0.07;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.22);
        });
      } else if (type === 'puff') {
        const bufferSize = Math.floor(ctx.sampleRate * 0.12);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        noise.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      }
    } catch (_) {}
  }

  // ── SFX Toggle Button ─────────────────────────────────────────
  const sfxToggleBtn = document.getElementById('sfx-toggle-btn');
  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sfxEnabled = !sfxEnabled;
      const icon = sfxToggleBtn.querySelector('.sfx-icon');
      const text = sfxToggleBtn.querySelector('.sfx-text');
      if (sfxEnabled) {
        sfxToggleBtn.classList.remove('muted');
        if (icon) icon.textContent = '🔊';
        if (text) text.textContent = 'SFX ON';
        playSound('sparkle');
      } else {
        sfxToggleBtn.classList.add('muted');
        if (icon) icon.textContent = '🔇';
        if (text) text.textContent = 'SFX OFF';
      }
    });
  }

  // ── Confetti Particle Burst ─────────────────────────────────
  function burstConfetti(originEl, count = 25) {
    if (!originEl) return;
    playSound('pop');
    let cx, cy;
    if (originEl.getBoundingClientRect) {
      const rect = originEl.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    } else {
      cx = window.innerWidth / 2;
      cy = window.innerHeight / 2;
    }

    const confettiColors = [
      '#5b9bd5', '#4a90d9', '#3b82c4',
      '#93c5fd', '#60a5fa', '#dbeafe',
      '#fbbf24', '#fef3c7', '#1a2a44'
    ];

    for (let i = 0; i < count; i++) {
      const conf = document.createElement('div');
      const size = Math.random() * 8 + 4;
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const isCircle = Math.random() > 0.4;

      conf.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${isCircle ? '50%' : '2px'};
        left: ${cx}px;
        top: ${cy}px;
        pointer-events: none;
        z-index: 99999;
        opacity: 1;
        border: 1px solid rgba(26, 42, 68, 0.3);
      `;
      document.body.appendChild(conf);

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 150 + 60;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 120;
      const rotation = Math.random() * 720 - 360;

      conf.animate([
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${vx}px, ${vy + 230}px) rotate(${rotation}deg)`, opacity: 0 }
      ], {
        duration: 1200 + Math.random() * 600,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards',
      }).onfinish = () => conf.remove();
    }
  }

  // ── Card click confetti ─────────────────────────────────────
  const card = document.getElementById('landing-card');
  if (card) {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input, label, .gift-interactive, .candle-flame-group')) return;
      burstConfetti(e.target, 18);
    });
  }

  // ── Candle Blow-Out & Relight Interaction ────────────────────
  const candleFlame = document.getElementById('candle-flame');
  const candleBtn = document.getElementById('ok-btn');
  const wishBubble = document.getElementById('wish-bubble');
  const smokeParticles = document.getElementById('smoke-particles');
  let isCandleBlown = false;

  function toggleCandle() {
    if (!isCandleBlown) {
      // Blow out
      isCandleBlown = true;
      if (candleFlame) candleFlame.classList.add('blown');
      if (wishBubble) wishBubble.classList.add('show');
      if (candleBtn) candleBtn.textContent = '🔥 Relight Candle';

      if (smokeParticles) {
        smokeParticles.setAttribute('opacity', '1');
        smokeParticles.innerHTML = `
          <circle cx="58" cy="4" r="3" fill="#94a3b8">
            <animate attributeName="cy" from="4" to="-10" dur="1.2s" fill="freeze" />
            <animate attributeName="r" from="3" to="7" dur="1.2s" fill="freeze" />
            <animate attributeName="opacity" from="0.8" to="0" dur="1.2s" fill="freeze" />
          </circle>
          <circle cx="59" cy="5" r="2" fill="#cbd5e1">
            <animate attributeName="cy" from="5" to="-7" dur="1s" fill="freeze" />
            <animate attributeName="cx" from="59" to="63" dur="1s" fill="freeze" />
            <animate attributeName="r" from="2" to="5" dur="1s" fill="freeze" />
            <animate attributeName="opacity" from="0.7" to="0" dur="1s" fill="freeze" />
          </circle>
        `;
      }

      playSound('puff');
      setTimeout(() => playSound('fanfare'), 220);
      burstConfetti(candleBtn || candleFlame, 35);
    } else {
      // Relight
      isCandleBlown = false;
      if (candleFlame) candleFlame.classList.remove('blown');
      if (wishBubble) wishBubble.classList.remove('show');
      if (smokeParticles) smokeParticles.setAttribute('opacity', '0');
      if (candleBtn) candleBtn.textContent = '🎂 Blow Candle';
      playSound('sparkle');
    }
  }

  if (candleFlame) {
    candleFlame.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCandle();
    });
  }
  if (candleBtn) {
    candleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCandle();
    });
  }

  // ── Hover tilt effect on the cake browser ───────────────────
  const cakeBrowser = document.getElementById('cake-browser');
  if (cakeBrowser && window.matchMedia('(hover: hover)').matches) {
    cakeBrowser.addEventListener('mousemove', (e) => {
      const rect = cakeBrowser.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const rotY = dx * 8;
      const rotX = -dy * 6;
      cakeBrowser.style.transform = `perspective(400px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      cakeBrowser.style.transition = 'transform 0.1s ease-out';
    });
    cakeBrowser.addEventListener('mouseleave', () => {
      cakeBrowser.style.transform = 'perspective(400px) rotateX(0) rotateY(0)';
      cakeBrowser.style.transition = 'transform 0.4s ease-out';
    });
  }

  // ── Pixel heart click interaction ───────────────────────────
  document.querySelectorAll('.pixel-heart').forEach(heart => {
    heart.style.cursor = 'pointer';
    heart.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('sparkle');
      heart.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      heart.style.transform = 'scale(1.4) rotate(15deg)';
      setTimeout(() => {
        heart.style.transform = '';
      }, 400);
      burstConfetti(heart, 20);
    });
  });

  // ── Balloon pop interaction ─────────────────────────────────
  document.querySelectorAll('.balloon-body').forEach(balloon => {
    balloon.style.cursor = 'pointer';
    balloon.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('pop');
      const parent = balloon.parentElement;
      parent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      parent.style.transform = 'scale(1.3)';
      parent.style.opacity = '0';
      burstConfetti(balloon, 22);
      setTimeout(() => {
        parent.style.transform = '';
        parent.style.opacity = '1';
      }, 1200);
    });
  });

  // ── Surprise Gift Unboxing & VIP Modal ───────────────────────
  const giftCircle = document.getElementById('gift-circle');
  const giftBox = document.getElementById('gift-box');
  const giftModal = document.getElementById('gift-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCloseDot = document.getElementById('modal-close-dot');
  const passClaimBtn = document.getElementById('pass-claim-btn');
  const navSurprise = document.getElementById('nav-surprise');
  const navCake = document.getElementById('nav-cake');

  function openGift() {
    if (giftBox) giftBox.classList.add('opened');
    burstConfetti(giftCircle || document.body, 40);
    playSound('fanfare');

    setTimeout(() => {
      if (giftModal) {
        giftModal.style.display = 'flex';
        giftModal.setAttribute('aria-hidden', 'false');
      }
    }, 450);
  }

  function closeGiftModal() {
    if (giftModal) {
      giftModal.style.display = 'none';
      giftModal.setAttribute('aria-hidden', 'true');
    }
    setTimeout(() => {
      if (giftBox) giftBox.classList.remove('opened');
    }, 600);
  }

  if (giftCircle) {
    giftCircle.addEventListener('click', (e) => {
      e.stopPropagation();
      openGift();
    });
  }
  if (navSurprise) {
    navSurprise.addEventListener('click', (e) => {
      e.preventDefault();
      openGift();
    });
  }
  if (navCake) {
    navCake.addEventListener('click', (e) => {
      e.preventDefault();
      const cake = document.getElementById('cake-browser');
      if (cake) {
        cake.scrollIntoView({ behavior: 'smooth' });
        burstConfetti(cake, 25);
        playSound('sparkle');
      }
    });
  }
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeGiftModal);
  if (modalCloseDot) modalCloseDot.addEventListener('click', closeGiftModal);
  if (giftModal) {
    giftModal.addEventListener('click', (e) => {
      if (e.target === giftModal) closeGiftModal();
    });
  }
  if (passClaimBtn) {
    passClaimBtn.addEventListener('click', () => {
      playSound('fanfare');
      burstConfetti(passClaimBtn, 55);
      setTimeout(closeGiftModal, 500);
    });
  }

  // ── "Celebrate With Us" Screen-wide Party Cannon ────────────
  const ctaLink = document.getElementById('cta-link');
  if (ctaLink) {
    ctaLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playSound('fanfare');
      burstConfetti(ctaLink, 35);

      setTimeout(() => {
        const leftOrigin = { getBoundingClientRect: () => ({ left: 60, top: window.innerHeight * 0.45, width: 0, height: 0 }) };
        const rightOrigin = { getBoundingClientRect: () => ({ left: window.innerWidth - 60, top: window.innerHeight * 0.45, width: 0, height: 0 }) };
        burstConfetti(leftOrigin, 30);
        burstConfetti(rightOrigin, 30);
      }, 250);
    });
  }

  // ── Mouse Sparkle Trail ─────────────────────────────────────
  let lastSparkleTime = 0;
  const sparkleChars = ['✦', '★', '✧', '•'];
  const sparkleColors = ['#5b9bd5', '#fbbf24', '#93c5fd', '#fef3c7'];

  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkleTime < 60) return;
    lastSparkleTime = now;

    const span = document.createElement('span');
    span.className = 'sparkle-trail';
    span.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
    span.style.left = e.clientX + 'px';
    span.style.top = e.clientY + 'px';
    span.style.color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 800);
  });

  // ── Wish Card Interactions ──────────────────────────────────
  const wishCheerBtn = document.getElementById('wish-cheer-btn');
  const cheerCounter = document.getElementById('cheer-counter');
  const waxSeal = document.querySelector('.wax-seal');
  const navWish = document.getElementById('nav-wish');
  const ctaWishLink = document.getElementById('cta-wish-link');
  let cheerCount = 0;

  function spawnFloatingHeart(originEl) {
    const rect = originEl.getBoundingClientRect();
    const heart = document.createElement('div');
    const hearts = ['💖', '❤️', '✨', '🎂', '🎉', '🌟'];
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top}px;
      font-size: ${Math.random() * 12 + 18}px;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, 0);
    `;
    document.body.appendChild(heart);

    const drift = (Math.random() - 0.5) * 120;
    heart.animate([
      { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${drift}px), -120px) scale(1.4)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 400,
      easing: 'ease-out',
      fill: 'forwards'
    }).onfinish = () => heart.remove();
  }

  if (wishCheerBtn) {
    wishCheerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cheerCount++;
      if (cheerCounter) {
        cheerCounter.textContent = `Loved ${cheerCount} time${cheerCount === 1 ? '' : 's'} ❤️`;
      }
      playSound('sparkle');
      burstConfetti(wishCheerBtn, 25);
      for (let i = 0; i < 4; i++) {
        setTimeout(() => spawnFloatingHeart(wishCheerBtn), i * 120);
      }
    });
  }

  if (waxSeal) {
    waxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('fanfare');
      burstConfetti(waxSeal, 25);
    });
  }

  function scrollToWishCard(e) {
    e.preventDefault();
    const wishCard = document.getElementById('wish-card');
    if (wishCard) {
      wishCard.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        burstConfetti(wishCard.querySelector('.wish-heading'), 20);
        playSound('sparkle');
      }, 500);
    }
  }

  if (navWish) navWish.addEventListener('click', scrollToWishCard);
  if (ctaWishLink) ctaWishLink.addEventListener('click', scrollToWishCard);

  // ── Chornai Wish Card Interactions ──────────────────────────
  const chornaiCheerBtn = document.getElementById('chornai-cheer-btn');
  const chornaiCheerCounter = document.getElementById('chornai-cheer-counter');
  const chornaiSeal = document.querySelector('.chornai-seal');
  const navChornai = document.getElementById('nav-chornai');
  const ctaChornaiLink = document.getElementById('cta-chornai-link');
  let chornaiCheerCount = 0;

  if (chornaiCheerBtn) {
    chornaiCheerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      chornaiCheerCount++;
      if (chornaiCheerCounter) {
        chornaiCheerCounter.textContent = `Loved by Chornai ${chornaiCheerCount} time${chornaiCheerCount === 1 ? '' : 's'} 💖`;
      }
      playSound('sparkle');
      burstConfetti(chornaiCheerBtn, 30);
      for (let i = 0; i < 5; i++) {
        setTimeout(() => spawnFloatingHeart(chornaiCheerBtn), i * 100);
      }
    });
  }

  if (chornaiSeal) {
    chornaiSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('fanfare');
      burstConfetti(chornaiSeal, 25);
    });
  }

  function scrollToChornaiCard(e) {
    e.preventDefault();
    const chornaiCard = document.getElementById('wish-card-chornai');
    if (chornaiCard) {
      chornaiCard.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        burstConfetti(chornaiCard.querySelector('.wish-heading'), 25);
        playSound('sparkle');
      }, 500);
    }
  }

  if (navChornai) navChornai.addEventListener('click', scrollToChornaiCard);
  if (ctaChornaiLink) ctaChornaiLink.addEventListener('click', scrollToChornaiCard);

  // ── MP3 Music Player ──────────────────────────────────────
  const audio = document.getElementById('audio-el');
  const btnPlay = document.getElementById('btn-play');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnVol = document.getElementById('btn-vol');
  const progressWrap = document.getElementById('progress-wrap');
  const progressBar = document.getElementById('progress-bar');
  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');
  const playerDisc = document.getElementById('player-disc');
  const audioFileInput = document.getElementById('audio-file-input');
  const musicPlayer = document.getElementById('music-player');

  let isPlaying = false;
  let isMuted = false;

  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function loadCustomAudioFile(file) {
    if (!file || !file.type.startsWith('audio/')) return;
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;

    const fileNameClean = file.name.replace(/\.[^/.]+$/, '');
    const trackTitle = document.getElementById('track-title');
    if (trackTitle) trackTitle.textContent = fileNameClean;

    audio.play().then(() => {
      playSound('sparkle');
    }).catch(() => {});
  }

  if (audioFileInput) {
    audioFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) loadCustomAudioFile(file);
    });
  }

  if (musicPlayer) {
    musicPlayer.addEventListener('dragover', (e) => {
      e.preventDefault();
      musicPlayer.style.transform = 'scale(1.03)';
    });
    musicPlayer.addEventListener('dragleave', () => {
      musicPlayer.style.transform = '';
    });
    musicPlayer.addEventListener('drop', (e) => {
      e.preventDefault();
      musicPlayer.style.transform = '';
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) loadCustomAudioFile(file);
    });
  }

  // Play / Pause
  if (btnPlay && audio) {
    btnPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
    });

    audio.addEventListener('play', () => {
      isPlaying = true;
      btnPlay.querySelector('.icon-play').style.display = 'none';
      btnPlay.querySelector('.icon-pause').style.display = 'block';
      playerDisc.classList.add('spinning');
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
      btnPlay.querySelector('.icon-play').style.display = 'block';
      btnPlay.querySelector('.icon-pause').style.display = 'none';
      playerDisc.classList.remove('spinning');
    });

    // Progress update
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = pct + '%';
        timeCurrent.textContent = formatTime(audio.currentTime);
      }
    });

    // Duration loaded
    audio.addEventListener('loadedmetadata', () => {
      timeTotal.textContent = formatTime(audio.duration);
    });

    // Click to seek
    progressWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = progressWrap.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    // Rewind 10s
    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    // Forward 10s
    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
    });

    // Volume toggle
    btnVol.addEventListener('click', (e) => {
      e.stopPropagation();
      isMuted = !isMuted;
      audio.muted = isMuted;
      btnVol.querySelector('.icon-vol-on').style.display = isMuted ? 'none' : 'block';
      btnVol.querySelector('.icon-vol-off').style.display = isMuted ? 'block' : 'none';
    });

    // Loop the song
    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });
  }

})();
