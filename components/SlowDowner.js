import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createRubberBandNode } from 'rubberband-web';
import { useRouter } from 'next/router';
import styles from './SlowDowner.module.css';
import PlayIcon from './PlayIcon';
import PauseIcon from './PauseIcon';
import RewindIcon from './RewindIcon';
import LeftChevron from './LeftChevron';
import RightChevron from './RightChevron';

export default function SlowDowner({ isUnlocked, mp3 }) {
  const router = useRouter();

  // Audio graph refs — don't trigger re-renders
  const audioCtxRef    = useRef(null);
  const gainNodeRef    = useRef(null);
  const rbNodeRef      = useRef(null);
  const sourceNodeRef  = useRef(null);
  const audioBufferRef = useRef(null);

  // Playback position tracking refs
  const isPlayingRef        = useRef(false);
  const startCtxTimeRef     = useRef(0);
  const startOffsetRef      = useRef(0);
  const currentSpeedRef     = useRef(100);
  const currentTimeARef     = useRef(0);
  const currentTimeBRef     = useRef(0);
  const rafRef              = useRef(null);

  // UI state
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [duration,      setDuration]      = useState(0);
  const [playingAt,     setPlayingAt]     = useState(0);
  const [timeA,         setTimeA]         = useState(0);
  const [timeB,         setTimeB]         = useState(0);
  const [playSpeed,     setPlaySpeed]     = useState(100);
  const [playPitchCents, setPlayPitchCents] = useState(0);
  const [rbReady,       setRbReady]       = useState(false);
  const [loadError,     setLoadError]     = useState(false);

  const formatTime = (secs) => {
    const s = Math.max(0, secs);
    const m  = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    const ms = Math.floor((s - Math.floor(s)) * 10);
    return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}.${ms}`;
  };

  // Initialise audio context + RubberBand node once on mount
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx  = new window.AudioContext();
      const gain = ctx.createGain();
      audioCtxRef.current  = ctx;
      gainNodeRef.current  = gain;

      try {
        const rb = await createRubberBandNode(ctx, '/rubberband-processor.js');
        if (cancelled) return;
        rb.connect(gain);
        gain.connect(ctx.destination);
        rbNodeRef.current = rb;
        setRbReady(true);
      } catch (err) {
        console.error('RubberBand init failed:', err?.message, err?.stack, err);
        setLoadError(true);
      }

      // Load mp3
      try {
        const resp   = await fetch(mp3);
        const raw    = await resp.arrayBuffer();
        const buffer = await ctx.decodeAudioData(raw);
        if (cancelled) return;
        audioBufferRef.current   = buffer;
        currentTimeBRef.current  = buffer.duration;
        setDuration(buffer.duration);
        setTimeB(buffer.duration);
      } catch (err) {
        console.error('Audio load failed:', err?.message, err);
      }
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (_) {}
        sourceNodeRef.current.disconnect();
      }
      if (rbNodeRef.current)   rbNodeRef.current.disconnect();
      if (gainNodeRef.current) gainNodeRef.current.disconnect();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [mp3]);

  // Keep refs in sync with state so callbacks always see latest values
  useEffect(() => { currentSpeedRef.current = playSpeed; },  [playSpeed]);
  useEffect(() => { currentTimeARef.current = timeA; },      [timeA]);
  useEffect(() => { currentTimeBRef.current = timeB; },      [timeB]);

  // rAF position tracker
  const startTracker = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      if (!isPlayingRef.current || !audioCtxRef.current) return;
      const elapsed = audioCtxRef.current.currentTime - startCtxTimeRef.current;
      const tempo   = currentSpeedRef.current / 100;
      const tA      = currentTimeARef.current;
      const tB      = currentTimeBRef.current;
      const range   = tB - tA;
      let pos = startOffsetRef.current + elapsed * tempo;
      if (range > 0) {
        while (pos >= tB) pos -= range;
        while (pos < tA) pos += range;
      }
      setPlayingAt(pos);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopSource = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (_) {}
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  const startSource = useCallback((offset, tA, tB) => {
    if (!audioBufferRef.current || !rbNodeRef.current || !audioCtxRef.current) return;
    stopSource();

    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    const src = audioCtxRef.current.createBufferSource();
    src.buffer     = audioBufferRef.current;
    src.loop       = true;
    src.loopStart  = tA;
    src.loopEnd    = tB;
    src.connect(rbNodeRef.current);

    startCtxTimeRef.current  = audioCtxRef.current.currentTime;
    startOffsetRef.current   = offset;

    src.start(0, offset);
    sourceNodeRef.current = src;
    isPlayingRef.current  = true;
    setIsPlaying(true);
    startTracker();
  }, [stopSource, startTracker]);

  const handlePlay = async () => {
    if (!isUnlocked) {
      alert('The slow-downer tool is only available for active users');
      router.push('/activate-user-account');
      return;
    }
    if (!audioBufferRef.current || !rbNodeRef.current) return;

    if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();

    if (isPlayingRef.current) {
      stopSource();
    } else {
      const offset = Math.max(timeA, Math.min(playingAt, timeB));
      startSource(offset, timeA, timeB);
    }
  };

  const handleRewind = () => {
    setPlayingAt(timeA);
    if (isPlayingRef.current) startSource(timeA, timeA, timeB);
    else startOffsetRef.current = timeA;
  };

  const handleSpeedChange = (e) => {
    const speed = Number(e.target.value);
    setPlaySpeed(speed);
    if (rbNodeRef.current) {
      // Reset tracking origin so position doesn't jump
      startOffsetRef.current  = playingAt;
      startCtxTimeRef.current = audioCtxRef.current.currentTime;
      rbNodeRef.current.setTempo(speed / 100);
    }
  };

  const handlePitchChange = (e) => {
    const cents = Number(e.target.value);
    setPlayPitchCents(cents);
    if (rbNodeRef.current) {
      rbNodeRef.current.setPitch(Math.pow(2, cents / 100 / 12));
    }
  };

  const handleTimeSlider = (e) => {
    const val = Number(e.target.value);
    setPlayingAt(val);
    if (isPlayingRef.current) startSource(val, timeA, timeB);
  };

  // Live A/B update — no restart needed, just update loop points
  const handleSetA = () => {
    const newA = playingAt;
    setTimeA(newA);
    if (sourceNodeRef.current) sourceNodeRef.current.loopStart = newA;
  };

  const handleSetB = () => {
    if (playingAt <= timeA) return;
    const newB = playingAt;
    setTimeB(newB);
    if (sourceNodeRef.current) sourceNodeRef.current.loopEnd = newB;
  };

  const handleTimeASlider = (e) => {
    const val = Number(e.target.value);
    setTimeA(val);
    if (sourceNodeRef.current) sourceNodeRef.current.loopStart = val;
  };

  const handleTimeBSlider = (e) => {
    const val = Number(e.target.value);
    setTimeB(val);
    if (sourceNodeRef.current) sourceNodeRef.current.loopEnd = val;
  };

  const componentStyle = { opacity: isUnlocked ? 1 : 0.5 };

  if (loadError) {
    return <div className={styles.App}>Failed to load audio player.</div>;
  }

  return (
    <div style={componentStyle} className={styles.App}>

      <div className={styles.slowDownerRow}>
        <h3>Speed</h3>
        <center>
          <input type="range" min="25" max="200" value={playSpeed} onChange={handleSpeedChange} />
        </center>
        <label className={styles.numberLabel}>{playSpeed}%</label>
      </div>

      <div className={styles.slowDownerRow}>
        <h3>Pitch</h3>
        <center>
          <input type="range" name="pitchSliderCents" min="-100" max="100" value={playPitchCents} onChange={handlePitchChange} />
        </center>
        <label className={styles.numberLabel}>{(playPitchCents / 100).toFixed(2)}</label>
      </div>

      <hr className={styles.slowDownerSeparator} />

      <div className={styles.slowDownerRow}>
        <h3>Start</h3>
        <center>
          <input type="range" className={styles.sliderRoom} step="0.5" min="0"
            max={duration} value={timeA} onChange={handleTimeASlider} />
        </center>
        <label className={styles.numberLabel}>{formatTime(timeA)}</label>
        <button onClick={() => handleTimeASlider({ target: { value: Math.max(timeA - 0.5, 0) } })}
          className={`${styles.incrementButton} ${styles.left}`} aria-label="Decrease"><LeftChevron /></button>
        <button onClick={handleSetA}>Set A</button>
        <button onClick={() => handleTimeASlider({ target: { value: Math.min(timeA + 0.5, duration) } })}
          className={`${styles.incrementButton} ${styles.right}`} aria-label="Increase"><RightChevron /></button>
      </div>

      <div className={styles.slowDownerRow}>
        <h3>End</h3>
        <center>
          <input type="range" className={styles.sliderRoom} step="0.5" min="0"
            max={duration} value={timeB} onChange={handleTimeBSlider} />
        </center>
        <label className={styles.numberLabel}>{formatTime(timeB)}</label>
        <button onClick={() => handleTimeBSlider({ target: { value: Math.max(timeB - 0.5, 0) } })}
          className={`${styles.incrementButton} ${styles.left}`} aria-label="Decrease"><LeftChevron /></button>
        <button onClick={handleSetB}>Set B</button>
        <button onClick={() => handleTimeBSlider({ target: { value: Math.min(timeB + 0.5, duration) } })}
          className={`${styles.incrementButton} ${styles.right}`} aria-label="Increase"><RightChevron /></button>
      </div>

      <hr className={styles.slowDownerSeparator} />

      <div className={styles.slowDownerRow}>
        <label className={styles.mainPlaybackLabel}>{formatTime(playingAt - timeA)}</label>
        <center>
          <input type="range" min={timeA} max={timeB} value={playingAt}
            step="0.1" onChange={handleTimeSlider} />
        </center>
        <label className={styles.mainPlaybackLabel}>{formatTime(timeB - timeA)}</label>
      </div>

      <div className={styles.buttonControlsRow}>
        <button className={styles.buttonRewind} onClick={handleRewind}>
          <RewindIcon />
        </button>
        <button className={styles.buttonPlay} disabled={!rbReady || !audioBufferRef.current} onClick={handlePlay}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

    </div>
  );
}
