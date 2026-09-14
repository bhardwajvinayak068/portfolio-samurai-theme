/**
 * SOVEREIGN AUDIO ENGINE
 * Bespoke luxury micro-sound synthesizer using native Web Audio API
 * No external assets required. 100% synthetic, zero latency, lightweight.
 */

(function () {
    'use strict';

    class SovereignAudio {
        constructor() {
            this.ctx = null;
            this.isMuted = true; // Default muted for respectful UX
            this.gainNode = null;
            this.ambientOsc = null;
            this.ambientGain = null;

            this.initElements();
        }

        initContext() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                    this.gainNode = this.ctx.createGain();
                    this.gainNode.gain.setValueAtTime(0.4, this.ctx.currentTime);
                    this.gainNode.connect(this.ctx.destination);
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        initElements() {
            const toggles = document.querySelectorAll('.sound-pill-btn');
            const beacon = document.getElementById('audio-beacon-tooltip');

            if (beacon) {
                setTimeout(() => {
                    beacon.classList.add('fade-out');
                }, 5200);
            }

            toggles.forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (beacon) beacon.classList.add('fade-out');
                    this.toggleMute();
                });
            });

            // Global shortcut [S] to toggle sound
            window.addEventListener('keydown', (e) => {
                if ((e.key === 's' || e.key === 'S') && !e.target.matches('input, textarea, select')) {
                    e.preventDefault();
                    this.toggleMute();
                }
            });

            // Bind sound to luxury buttons and interactive cards
            document.addEventListener('click', (e) => {
                const target = e.target.closest('button, a, .system-card, .timeline-card, .scrubber-pill');
                if (target && !target.closest('.sound-pill-btn')) {
                    if (!this.isMuted) {
                        this.playHapticChime();
                    }
                }
            });

            // Hover subtle tick
            document.addEventListener('mouseover', (e) => {
                const target = e.target.closest('button, a.btn, .system-card, .scrubber-pill');
                if (target && !this.isMuted) {
                    this.playHoverTick();
                }
            });
        }

        toggleMute() {
            this.initContext();
            this.isMuted = !this.isMuted;

            if ('vibrate' in navigator) {
                try { navigator.vibrate(12); } catch (e) {}
            }

            const toggles = document.querySelectorAll('.sound-pill-btn');
            const labels = document.querySelectorAll('.sound-pill-text, .mobile-sound-text');
            const beacon = document.getElementById('audio-beacon-tooltip');

            if (beacon) {
                beacon.classList.add('fade-out');
            }

            toggles.forEach(toggle => {
                toggle.setAttribute('aria-pressed', (!this.isMuted).toString());
                toggle.classList.toggle('active', !this.isMuted);
            });

            labels.forEach(label => {
                label.textContent = this.isMuted ? 'SOUND: OFF' : 'SOUND: ACTIVE';
            });

            if (!this.isMuted) {
                this.playActivationTone();
                this.startAmbientHum();
            } else {
                this.stopAmbientHum();
            }
        }

        playHapticChime() {
            if ('vibrate' in navigator) {
                try { navigator.vibrate(6); } catch (e) {}
            }
            if (this.isMuted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(1760, now); // A6
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

                osc.connect(gain);
                gain.connect(this.gainNode);

                osc.start(now);
                osc.stop(now + 0.15);
            } catch (e) {}
        }

        playHoverTick() {
            if (this.isMuted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(2400, now);

                gain.gain.setValueAtTime(0.02, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

                osc.connect(gain);
                gain.connect(this.gainNode);

                osc.start(now);
                osc.stop(now + 0.05);
            } catch (e) {}
        }

        playActivationTone() {
            if (!this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // C6

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

                osc.connect(gain);
                gain.connect(this.gainNode);

                osc.start(now);
                osc.stop(now + 0.32);
            } catch (e) {}
        }

        playNodePing() {
            if (this.isMuted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(659.25, now); // E5
                osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.18); // B5

                gain.gain.setValueAtTime(0.09, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

                osc.connect(gain);
                gain.connect(this.gainNode);

                osc.start(now);
                osc.stop(now + 0.25);
            } catch (e) {}
        }

        playSurgeSweep() {
            if (this.isMuted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(640, now + 0.35);
                osc.frequency.exponentialRampToValueAtTime(80, now + 1.1);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.linearRampToValueAtTime(0.07, now + 0.25);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

                osc.connect(gain);
                gain.connect(this.gainNode);

                osc.start(now);
                osc.stop(now + 1.4);
            } catch (e) {}
        }

        startAmbientHum() {
            if (!this.ctx || this.ambientOsc) return;
            try {
                const now = this.ctx.currentTime;
                this.ambientOsc = this.ctx.createOscillator();
                this.ambientGain = this.ctx.createGain();

                this.ambientOsc.type = 'sine';
                this.ambientOsc.frequency.setValueAtTime(110, now); // A2 deep warm fundamental

                this.ambientGain.gain.setValueAtTime(0.0001, now);
                this.ambientGain.gain.linearRampToValueAtTime(0.025, now + 2.0);

                this.ambientOsc.connect(this.ambientGain);
                this.ambientGain.connect(this.gainNode);

                this.ambientOsc.start(now);
            } catch (e) {}
        }

        stopAmbientHum() {
            if (this.ambientOsc && this.ambientGain && this.ctx) {
                try {
                    const now = this.ctx.currentTime;
                    this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
                    setTimeout(() => {
                        if (this.ambientOsc) {
                            this.ambientOsc.stop();
                            this.ambientOsc.disconnect();
                            this.ambientOsc = null;
                            this.ambientGain = null;
                        }
                    }, 500);
                } catch (e) {}
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.sovereignAudio = new SovereignAudio();
        });
    } else {
        window.sovereignAudio = new SovereignAudio();
    }
})();
