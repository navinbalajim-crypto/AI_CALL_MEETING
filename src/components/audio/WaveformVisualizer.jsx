import React, { useRef, useEffect } from 'react';

export const WaveformVisualizer = ({
  isRecording = false,
  stream = null,
  height = 90,
  barWidth = 3,
  barGap = 3,
  className = '',
  colorMode = 'ai' // ai (cyan/indigo), emerald (commitment), violet
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let source = null;

    if (stream && isRecording) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;

        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
      } catch (err) {
        console.warn('Microphone AudioContext error, falling back to procedural animation:', err);
      }
    }

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const h = canvas.height;
      const numBars = Math.floor(width / (barWidth + barGap));

      // Gradient selection
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      if (colorMode === 'ai') {
        gradient.addColorStop(0, '#5B6CFF');
        gradient.addColorStop(0.5, '#4FD1FF');
        gradient.addColorStop(1, '#8B5CF6');
      } else if (colorMode === 'emerald') {
        gradient.addColorStop(0, '#10B981');
        gradient.addColorStop(1, '#34D399');
      } else {
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(1, '#EC4899');
      }

      ctx.fillStyle = gradient;

      if (analyserRef.current && isRecording) {
        // True live audio frequency capture
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        for (let i = 0; i < numBars; i++) {
          const dataIndex = Math.floor((i / numBars) * (bufferLength * 0.7));
          const value = dataArray[dataIndex] || 0;
          const barHeight = Math.max(4, (value / 255) * h * 0.95);
          const x = i * (barWidth + barGap);
          const y = (h - barHeight) / 2;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else if (isRecording) {
        // Smooth simulated dynamic voice fluctuation when mic permission is in mock
        phase += 0.08;
        for (let i = 0; i < numBars; i++) {
          const sinFactor = Math.sin(phase + i * 0.25);
          const cosFactor = Math.cos(phase * 0.7 + i * 0.15);
          const baseHeight = (Math.abs(sinFactor * cosFactor) * 0.75 + 0.15) * h * 0.85;
          const barHeight = Math.max(4, baseHeight);
          const x = i * (barWidth + barGap);
          const y = (h - barHeight) / 2;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else {
        // Calm resting idle state
        phase += 0.02;
        for (let i = 0; i < numBars; i++) {
          const idleWave = (Math.sin(phase + i * 0.1) * 0.2 + 0.3) * (h * 0.18);
          const barHeight = Math.max(3, idleWave);
          const x = i * (barWidth + barGap);
          const y = (h - barHeight) / 2;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 1.5);
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isRecording, stream, barWidth, barGap, colorMode]);

  return (
    <div className={`relative w-full overflow-hidden flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={500}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};

export default WaveformVisualizer;
