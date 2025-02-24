'use client';

import { useState } from "react";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });
import { saveAs } from "file-saver";

export default function Home() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [markdown, setMarkdown] = useState("");

  const handleGenerate = () => {
    const fakeAIResponse = `
# ${projectName} - Project Requirements Document

## Description
${description}

## Features
${features.split("\n").map((line) => `- ${line}`).join("\n")}
    `;
    setMarkdown(fakeAIResponse);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, `${projectName || "project"}-requirements.md`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">OpenCodeGuide Lite</h1>

      {/* Input Form */}
      <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Project Details</h2>
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full p-2 mb-4 border rounded bg-transparent dark:border-white/[.145]"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 border rounded bg-transparent dark:border-white/[.145]"
          rows={4}
        />
        <textarea
          placeholder="Features (one per line)"
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          className="w-full p-2 mb-4 border rounded bg-transparent dark:border-white/[.145]"
          rows={4}
        />
        <button
          onClick={handleGenerate}
          className="w-full bg-foreground text-background p-2 rounded hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
        >
          Generate Documentation
        </button>
      </div>

      {/* Markdown Editor */}
      {markdown && (
        <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Edit Documentation</h2>
          <SimpleMDE
            value={markdown}
            onChange={setMarkdown}
            options={{
              spellChecker: false,
              toolbar: ["bold", "italic", "heading", "|", "unordered-list", "ordered-list"],
              status: false
            }}
          />
          <button
            onClick={handleDownload}
            className="w-full mt-4 bg-foreground text-background p-2 rounded hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
          >
            Download Markdown
          </button>
        </div>
      )}
    </div>
  );
}
