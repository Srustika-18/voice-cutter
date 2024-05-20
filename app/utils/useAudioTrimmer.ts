import { useCallback } from "react";
import toWav from 'audiobuffer-to-wav';

export const useAudioTrimmer = () => {
	const trimAudio = useCallback(
		async (
			audioFile: File,
			startTime: number,
			endTime: number
		): Promise<Blob> => {
			const audioContext = new AudioContext();
			const audioBuffer = await audioContext.decodeAudioData(
				await audioFile.arrayBuffer()
			);

			const offlineContext = new OfflineAudioContext(
				audioBuffer.numberOfChannels,
				(endTime - startTime) * audioBuffer.sampleRate,
				audioBuffer.sampleRate
			);

			const source = offlineContext.createBufferSource();
			source.buffer = audioBuffer;
			source.start(0, startTime);
			source.stop(endTime);

			source.connect(offlineContext.destination);

			const renderedBuffer = await offlineContext.startRendering();

			// Convert the rendered buffer to a WAV file and then to a Blob
			const wav = toWav(renderedBuffer);
			const blob = new Blob([new DataView(wav)], { type: 'audio/wav' });

			return blob;
		},
		[]
	);

	return { trimAudio };
};
