"use client";
import { useState } from "react";
import AudioPlayer from "./components/AudioPlayer";
import AudioCutter from "./components/AudioCutter";

export default function Home() {
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [croppedAudio, setCroppedAudio] = useState<Blob | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null;
		setAudioFile(file);
	};

	const handleCrop = (trimmedAudio: Blob) => {
		setCroppedAudio(trimmedAudio);
	};

	return (
		<div className="max-w-md mx-auto">
			<h1 className="text-3xl font-bold text-center my-8">
				Audio Cutter
			</h1>
			<label className="block mb-4">
				<span className="block mb-2">Upload Audio File</span>
				<input
					type="file"
					accept="audio/*"
					onChange={handleFileChange}
					className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
			{audioFile && (
				<AudioCutter
					audioFile={audioFile}
					onCrop={handleCrop}
				/>
			)}
			{/* {croppedAudio && <AudioPlayer audioData={croppedAudio} />} */}
		</div>
	);
}
