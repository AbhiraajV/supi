"use client";

import React, { useState } from "react";
import { uploadToVectorStore } from "../actions/vector-store.action";

const FileUploadComponent: React.FC<{ vectorStoreId: string }> = ({ vectorStoreId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("Idle");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    try {
      setUploadStatus("Uploading...");
      console.log('called vector store')
      const emitter = await uploadToVectorStore(files, vectorStoreId);

      emitter.on("progress", (status) => {
        setProgress(`Status: ${status.status} | Processed: ${status.processedCount}/${status.totalCount}`);
      });

      emitter.on("complete", (result) => {
        if (result.status === "succeeded") {
          setUploadStatus("Upload completed successfully!");
        } else {
          setUploadStatus("Upload failed.");
        }
        setProgress("Idle");
      });

      emitter.on("error", (error) => {
        console.error("Error during upload:", error);
        setUploadStatus("Upload failed due to an error.");
        setProgress("Idle");
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      setUploadStatus("Unexpected error occurred during upload.");
      setProgress("Idle");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Upload Files to Vector Store</h1>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="mb-4 block w-full border p-2"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white py-2 px-4 rounded"
        disabled={uploadStatus === "Uploading..."}
      >
        Upload
      </button>
      <div className="mt-4">
        <p><strong>Status:</strong> {uploadStatus || "No upload in progress."}</p>
        <p><strong>Progress:</strong> {progress}</p>
      </div>
    </div>
  );
};

export default FileUploadComponent;
