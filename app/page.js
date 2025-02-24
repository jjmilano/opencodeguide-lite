'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

// Dynamically import the MarkdownEditor component
const MarkdownEditor = dynamic(() => import('./components/MarkdownEditor'), {
  ssr: false
});

export default function Home() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [loading, setLoading] = useState(false);

  // Load API token from local storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("huggingFaceApiToken");
    if (storedToken) setApiToken(storedToken);
  }, []);

  const handleGenerate = async () => {
    if (!apiToken) {
      alert("Please enter a Hugging Face API token first!");
      return;
    }

    setLoading(true);
    try {
      const prompt = `
        Create a Project Requirements Document in markdown format for a project with:
        - Name: ${projectName}
        - Description: ${description}
        - Features: ${features}
        Provide the response in markdown.
      `;

      const response = await axios.post(
        "https://api-inference.huggingface.co/models/facebook/bart-large",
        {
          inputs: prompt,
          parameters: { max_length: 500, temperature: 0.7 },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      const generatedMarkdown = response.data[0].generated_text;
      setMarkdown(generatedMarkdown);
    } catch (error) {
      console.error("Error generating docs:", error);
      setMarkdown(`# Error\nFailed to generate: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApiTokenSave = () => {
    localStorage.setItem("huggingFaceApiToken", apiToken);
    alert("API token saved!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6">OpenCodeGuide Lite</h1>

      {/* API Token Input */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Hugging Face API Token</h2>
        <input
          type="text"
          placeholder="Enter your Hugging Face API token"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleApiTokenSave}
          className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Save API Token
        </button>
      </div>

      {/* Input Form */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Project Details</h2>
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          rows={4}
        />
        <textarea
          placeholder="Features (one per line)"
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          rows={4}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full p-2 rounded text-white ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
        >
          {loading ? "Generating..." : "Generate Documentation"}
        </button>
      </div>

      {/* Markdown Editor */}
      {markdown && (
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Edit Documentation</h2>
          <MarkdownEditor />
        </div>
      )}
    </div>
  );
}
