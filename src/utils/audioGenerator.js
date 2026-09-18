/**
 * Generates a valid standard WAV PCM audio Blob in-memory.
 * Useful for demo presets and testing VAD / No-Speech detection.
 */
export function createWavAudioBlob({ durationSec = 10, sampleRate = 16000, isSilent = false, name = "sample.wav" }) {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // "fmt " sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true);  // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample

  // "data" sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write sample PCM data
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    let sample = 0;
    if (!isSilent) {
      // Synthesize realistic speech-like formant harmonics (120Hz fundamental + 480Hz + 1200Hz)
      const t = i / sampleRate;
      const f0 = Math.sin(2 * Math.PI * 130 * t);
      const f1 = 0.5 * Math.sin(2 * Math.PI * 500 * t);
      const f2 = 0.25 * Math.sin(2 * Math.PI * 1500 * t);
      // Add speech cadence amplitude modulation (bursts and pauses)
      const cadence = Math.sin(2 * Math.PI * 1.5 * t) > 0.2 ? 1 : 0.05;
      sample = (f0 + f1 + f2) * cadence * 0.4;
      // Clamp to 16-bit signed integer
      sample = Math.max(-1, Math.min(1, sample));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  blob.name = name;
  return blob;
}
