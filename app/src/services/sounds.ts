import { Audio } from 'expo-av';

const soundFiles = {
  check: require('../../assets/sounds/check.wav'),
  uncheck: require('../../assets/sounds/uncheck.wav'),
  completeAll: require('../../assets/sounds/complete_all.wav'),
  message: require('../../assets/sounds/message.wav'),
};

type SoundName = keyof typeof soundFiles;

let soundCache: Partial<Record<SoundName, Audio.Sound>> = {};

async function playSound(name: SoundName) {
  try {
    // 기존 사운드가 있으면 재사용
    if (soundCache[name]) {
      await soundCache[name]!.replayAsync();
      return;
    }

    const { sound } = await Audio.Sound.createAsync(soundFiles[name]);
    soundCache[name] = sound;
    await sound.playAsync();
  } catch {}
}

export async function playCheck() {
  await playSound('check');
}

export async function playUncheck() {
  await playSound('uncheck');
}

export async function playCompleteAll() {
  await playSound('completeAll');
}

export async function playMessage() {
  await playSound('message');
}

export async function initAudio() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
    });
  } catch {}
}
