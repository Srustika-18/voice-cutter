import React, { useRef, useEffect } from "react";

interface AudioPlayerProps {
	audioBlob: Blob;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
	audioBlob,
}: AudioPlayerProps) => {
	const audioRef = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.src = URL.createObjectURL(audioBlob);
		}
	}, [audioBlob]);

	return (
		<audio
			ref={audioRef}
			controls
		>
			Your browser does not support the audio element.
		</audio>
	);
};

export default AudioPlayer;
