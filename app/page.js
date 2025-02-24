'use client';

import { useState, useEffect, Suspense } from "react";
import { saveAs } from "file-saver";
import axios from "axios";
import MarkdownEditor from "./components/MarkdownEditor";

export default function Home() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [loading, setLoading] = useState(false);

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
You are an expert technical writer. Based on the following project details, generate a detailed Project Requirements Document in markdown format. Expand on the description and features by adding insights, examples, or potential use cases. Make it sound professional and thorough.

# Project Details
Project Name: ${projectName}
Description: ${description}

Features:
${features.split("\n").map(f => `- ${f.trim()}`).join("\n")}

Please include in your output:
1. An expanded project description that provides context and potential use cases
2. Detailed feature explanations with implementation suggestions
3. Any technical considerations or dependencies
4. Use proper markdown formatting with clear section headers

Format the output as a professional markdown document.
`;

      const response = await axios.post(
        "https://api-inference.huggingface.co/models/facebook/bart-large",
        { 
          inputs: prompt,
          parameters: { 
            max_length: 1000,
            temperature: 0.7
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      // Try to extract just the text, assuming bart returns it in generated_text
      console.log("Full response:", response.data);
      let generatedMarkdown;
      if (response.data[0] && response.data[0].generated_text) {
        generatedMarkdown = response.data[0].generated_text.trim();
      } else if (response.data.generated_text) {
        generatedMarkdown = response.data.generated_text.trim();
      } else {
        generatedMarkdown = "No valid markdown generated.";
      }

      // Clean up the response
      generatedMarkdown = generatedMarkdown
        .replace(/[^\n]*Summarize.*$/g, "") // Remove the prompt echo
        .replace(/[^\n]*Output only.*$/g, "")
        .replace(/\s{2,}/g, " ") // Collapse multiple spaces
        .replace(/\n\n+/g, "\n\n") // Normalize line breaks
        .trim();

      // Fallback if it's still bad
      if (!generatedMarkdown || !generatedMarkdown.startsWith("# ")) {
        generatedMarkdown = `
# ${projectName}
## Description
${description}
## Features
${features.split("\n").map(f => `- ${f.trim()}`).join("\n")}
        `.trim();
      }

      setMarkdown(generatedMarkdown);
    } catch (error) {
      console.error("Error generating docs:", error);
      setMarkdown(`# Error\nFailed to generate: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, `${projectName || "project"}-requirements.md`);
  };

  const handleApiTokenSave = () => {
    localStorage.setItem("huggingFaceApiToken", apiToken);
    alert("API token saved!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6">OpenCodeGuide Lite</h1>

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
        />
        <textarea
          placeholder="Features (one per line)"
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full p-2 rounded text-white ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Generating..." : "Generate Documentation"}
        </button>
      </div>

      {markdown && (
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Edit Documentation</h2>
          <Suspense fallback={<div>Loading editor...</div>}>
            <MarkdownEditor
              initialValue={markdown}
              onChange={setMarkdown}
            />
          </Suspense>
          <button
            onClick={handleDownload}
            className="w-full mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Download Markdown
          </button>
        </div>
      )}
    </div>
  );
}
