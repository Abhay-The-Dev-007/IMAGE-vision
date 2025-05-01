import { useEffect, useState } from "react";

const App = () => {
	const [image, setImage] = useState(null);
	const [prompt, setPrompt] = useState("");
	const [response, setResponse] = useState("");
	const [theme, setTheme] = useState('light');

	useEffect(() => {
		document.body.className = theme;
	}, [theme])

	const toggleTheme = () => {
		setTheme(prev => (prev === 'light' ? "dark" : 'light'))
	}
	const handleFileUpload = async (file) => {
		setResponse("");
		const formData = new FormData();
		formData.append("file", file);

		try {
			const options = {
				method: "POST",
				body: formData,
			};
			const res = await fetch("http://localhost:3001/upload", options);
			const data = await res.json();
			console.log(data);
		} catch (err) {
			console.error(err);
		}
	};


	const analyzeImage = async () => {
		const formData = new FormData();
		formData.append("file", image);
		formData.append("prompt", prompt);

		try {
			const res = await fetch("http://localhost:3001/analyze", {
				method: "POST",
				body: formData,
			});

			const text = await res.text();
			setResponse(text);
		} catch (err) {
			console.error(err);
			setResponse("Error analyzing image.");
		}
	};

	return (
		<div className={`app-container ${theme}`}>
			<button onClick={toggleTheme} className="theme-toogle">
				{theme === 'light' ? '🌙' : '☀️'}
			</button>



			<h2>IMAGE Vision</h2>

			<div
				className="drop-zone"
				onDragOver={(e) => e.preventDefault()}
				onDrop={(e) => {
					e.preventDefault();
					const droppedFile = e.dataTransfer.files[0];
					if (droppedFile && droppedFile.type.startsWith("image/")) {
						setImage(droppedFile);
						handleFileUpload(droppedFile); // we'll define this next
					}
				}}>
				<p>Drag & Drop an image here, or <label htmlFor="files">browse</label>.</p>
				<input
					onChange={(e) => {
						setImage(e.target.files[0]);
						handleFileUpload(e.target.files[0]);
					}}
					id="files"
					type="file"
					accept="image/*"
					hidden
				/>
			</div>
			{image && (
				<div style={{ marginTop: "20px" }}>
					<p><strong>Selected Image:</strong></p>
					<img
						src={URL.createObjectURL(image)}
						alt="Uploaded preview"
						style={{ maxWidth: "300px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
					/>
					<p>{image.name}</p>
				</div>
			)}

			<input
				type="text"
				placeholder="Enter your prompt"
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
			/>

			<button className="Analyze-img" onClick={analyzeImage} disabled={!image || !prompt}>
				Analyze Image
			</button>
			<p><strong>Response:</strong> {response}</p>
		</div>
	);
};

export default App;
