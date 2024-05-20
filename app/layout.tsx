// app/layout.tsx
import "./globals.css";

export const metadata = {
	title: "Audio Cutter",
	description: "A serverless audio cutter app built with Next.js",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
