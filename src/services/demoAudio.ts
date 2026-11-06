/**
 * Demo voice note: one spoken tribute (assets/audio/demo-tribute.wav, ~36 s) that
 * every mock voice-note player in the app plays, so the waveforms actually work in
 * demos. Real recordings people make keep playing their own audio.
 *
 * One shared player: starting a card stops whichever card was playing.
 *
 *   const audio = useDemoAudio("voice-note-vn1");
 *   <Pressable onPress={audio.toggle}>{audio.isPlaying ? "pause" : "play"}</Pressable>
 */
import { useEffect, useState } from "react";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from "expo-audio";

const DEMO_SOURCE = require("../../assets/audio/demo-tribute.wav");

/** Approximate length, shown before the file has loaded. */
export const DEMO_AUDIO_SECONDS = 36;

interface DemoState {
  ownerId: string | null;
  playing: boolean;
  currentTime: number;
  duration: number;
}

let player: AudioPlayer | null = null;
let state: DemoState = { ownerId: null, playing: false, currentTime: 0, duration: DEMO_AUDIO_SECONDS };
const listeners = new Set<() => void>();

function emit(next: Partial<DemoState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function getPlayer(): AudioPlayer {
  if (!player) {
    // Play even when the iPhone's silent switch is on (people tap play deliberately).
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    player = createAudioPlayer(DEMO_SOURCE, { updateInterval: 250 });
    player.addListener("playbackStatusUpdate", (status: AudioStatus) => {
      if (status.didJustFinish) {
        emit({ playing: false, currentTime: 0 });
        player?.seekTo(0).catch(() => {});
        return;
      }
      emit({
        playing: status.playing,
        currentTime: status.currentTime,
        duration: status.duration > 0 ? status.duration : state.duration,
      });
    });
  }
  return player;
}

export const demoAudio = {
  /** Play this card's audio, pause it, or switch to it from another card. */
  toggle(ownerId: string) {
    const p = getPlayer();
    if (state.ownerId === ownerId && state.playing) {
      p.pause();
      emit({ playing: false });
      return;
    }
    if (state.ownerId !== ownerId) {
      p.pause();
      p.seekTo(0).catch(() => {});
      emit({ ownerId, currentTime: 0 });
    }
    // Must run inside the tap on web (browser autoplay rules).
    p.play();
    emit({ ownerId, playing: true });
  },

  stop() {
    player?.pause();
    emit({ playing: false, currentTime: 0, ownerId: null });
  },

  getState(): DemoState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Playback state for one card. Only the card that started playback reports progress. */
export function useDemoAudio(ownerId: string) {
  const [snapshot, setSnapshot] = useState<DemoState>(() => demoAudio.getState());

  useEffect(() => {
    const sync = () => setSnapshot(demoAudio.getState());
    return demoAudio.subscribe(sync);
  }, []);

  const isMine = snapshot.ownerId === ownerId;
  const duration = snapshot.duration || DEMO_AUDIO_SECONDS;
  const currentTime = isMine ? snapshot.currentTime : 0;

  return {
    isPlaying: isMine && snapshot.playing,
    currentTime,
    duration,
    /** 0–1 */
    progress: duration > 0 ? Math.min(1, currentTime / duration) : 0,
    toggle: () => demoAudio.toggle(ownerId),
  };
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
