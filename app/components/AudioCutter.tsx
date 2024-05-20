import { useAudioTrimmer } from "@/app/utils/useAudioTrimmer";
import { useState, useEffect, useRef } from "react";
import WavesurferPlayer from "@wavesurfer/react";
import type WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

interface AudioCutterProps {
	audioFile: File;
	onCrop: (trimmedAudio: Blob) => void;
	url: string;
}

const AudioCutter: React.FC<AudioCutterProps> = ({
	audioFile,
	onCrop,
	url,
}) => {
	const [startTime, setStartTime] = useState<number>(0);
	const [endTime, setEndTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);
	const audioRef = useRef<HTMLAudioElement>(null);
	const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [activeRegion, setActiveRegion] = useState(null);

	const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
	const [trimmedAudio, setTrimmedAudio] = useState<Blob | null>(null);

	// Play/pause the audio
	const onPlayPause = () => {
		setIsPlaying((playing) => {
			if (wavesurfer?.isPlaying() !== !playing) {
				wavesurfer?.playPause();
				return !playing;
			}
			return playing;
		});
	};

	useEffect(() => {
		const reader = new FileReader();
		reader.onload = async () => {
			const audioContext = new AudioContext();
			const buffer = await audioContext.decodeAudioData(
				reader.result as ArrayBuffer
			);
			setDuration(buffer.duration);
			setEndTime(buffer.duration);
			setAudioBuffer(buffer);
		};
		reader.readAsArrayBuffer(audioFile);
	}, [audioFile]);

	useEffect(() => {
		console.log("🚀 ~ useEffect ~ startTime:", startTime);
		console.log("🚀 ~ useEffect ~ endTime:", endTime);
	}, [startTime, endTime]);

	useEffect(() => {
		console.log("🚀 ~ useEffect ~ trimmedAudio:", trimmedAudio);
	}, [trimmedAudio]);

	const { trimAudio } = useAudioTrimmer();

	const handleTrim = () => {
		if (audioRef.current && audioFile) {
			trimAudio(audioFile, startTime, endTime)
				.then((trimmedBlob) => setTrimmedAudio(trimmedBlob))
				.catch((error) =>
					console.error("Error trimming audio:", error)
				);
		}
	};

	return (
		<div className="max-w-md mx-auto">
			<WavesurferPlayer
				height={100}
				waveColor={"#77dd77"}
				dragToSeek
				autoplay
				url={url}
				onDecode={(ws) => {
					const wsRegions = ws.registerPlugin(RegionsPlugin.create());
					console.log("🚀 ~ wsRegions:", wsRegions);
					wsRegions.addRegion({
						start: 0,
						end: 100000,
						color: "rgba(255, 255, 255, 0.25)",
						content: "Cramped region",
						minLength: 1,
						// maxLength: 10,
					});
					console.log("🚀 ~ ws.on ~ wsRegions:", wsRegions);
					{
						let activeRegion: any = null;
						wsRegions.on("region-in", (region) => {
							setStartTime(region?.start);
							setEndTime(region?.end);
							activeRegion = region;
						});
						wsRegions.on('region-updated', (region) => {
							setStartTime(region?.start);
							console.log('Updated region', region)
							setEndTime(region?.end);
						  })
						wsRegions.on("region-out", (region) => {
							console.log("region-out", region?.end);
							setStartTime(region?.start);
							setEndTime(region?.end);
							if (activeRegion === region) {
								if (true) {
									region.play();
								} else {
									activeRegion = null;
								}
							}
						});
						wsRegions.on("region-clicked", (region, e) => {
							e.stopPropagation(); // prevent triggering a click on the waveform
							activeRegion = region;
							region.play();
							// region.setOptions({ color: "ffffffaa" });
						});
						// Reset the active region when the user clicks anywhere in the waveform
						ws.on("interaction", () => {
							activeRegion = null;
						});
					}
				}}
				onReady={(ws) => {
					setWavesurfer(ws);
				}}
				onPlay={(ws) => {
					setIsPlaying(true);
				}}
				onPause={() => setIsPlaying(false)}
			/>
			<audio
				ref={audioRef}
				src={URL.createObjectURL(audioFile)}
				controls
				className="w-full"
			/>
			<br />
			{/* <div className="flex items-center justify-center my-4">
				<label className="mr-4">
					Start Time:
					<input
						type="range"
						min="0"
						max={audioRef.current ? duration : 0}
						step="0.01"
						value={startTime}
						onChange={(e) => setStartTime(e.target.valueAsNumber)}
						className="ml-2"
					/>
				</label>
				<label className="ml-4">
					End Time:
					<input
						type="range"
						min="0"
						max={audioRef.current ? duration : 0}
						step="0.01"
						value={endTime}
						onChange={(e) => setEndTime(e.target.valueAsNumber)}
						className="ml-2"
					/>
				</label>
			</div> */}
			<button
				onClick={handleTrim}
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
			>
				Trim Audio
			</button>
			<br />
			<br />
			<button
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				onClick={onPlayPause}
				style={{ minWidth: "5em" }}
			>
				{isPlaying ? "Pause" : "Play"}
			</button>
			<br />
			<br />
			{trimmedAudio && (
				<audio
					src={URL.createObjectURL(trimmedAudio)}
					controls
				>
					Your browser does not support the audio element.
				</audio>
			)}
			<br />
			<button
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				onClick={() => {
					// Create a new blob URL
					const url = URL.createObjectURL(trimmedAudio as Blob);

					// Create a new anchor element
					const link = document.createElement("a");

					// Set the href and download attributes of the anchor
					link.href = url;
					link.download = "trimmed-audio.wav"; // or any other filename

					// Append the anchor to the body
					document.body.appendChild(link);

					// Programmatically click the anchor
					link.click();

					// Remove the anchor from the body
					document.body.removeChild(link);
				}}
			>
				Download
			</button>
		</div>
	);
};

export default AudioCutter;
