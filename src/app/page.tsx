"use client"
import React, { useState } from 'react';
import ImageConverter from '@/pages/[format]';
import Ad from './components/ad';

const Home = () => {
  
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('jpg');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const handleConvert = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Convert response to blob
        const blob = await response.blob();

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${format}`;
        document.body.appendChild(a);

        // Trigger a click on the link to start the download
        a.click();

        // Remove the link from the DOM
        document.body.removeChild(a);

        // Revoke the object URL to free up resources
        window.URL.revokeObjectURL(url);

        console.log('Conversion successful!');
      } else {
        console.error('Conversion failed!');
      }
    } catch (error) {
      console.error('Error during conversion:', error);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (

    <div className='h-screen flex flex-col'>
    <div className="flex justify-center items-center h-full">
      <div className='max-w-md mx-auto p-6 bg-white rounded-md shadow-md'>
      <h1 className="text-3xl font-semibold mb-4">Image Converter</h1>

      <div
        className="border-dashed border-2 border-gray-300 p-4 mb-4 rounded-md relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p className="text-gray-500">
          Drag & Drop your image here or{' '}
          <label htmlFor="file-input" className="cursor-pointer text-blue-500">
            click to select
          </label>
        </p>
        <input
          id="file-input"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        {file && <p className="mt-2 text-sm">{file.name}</p>}
      </div>

      <select
        value={format}
        onChange={handleFormatChange}
        className="w-full border p-2 mb-4 rounded-md"
      >
        <option value="jpg">JPG</option>
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
        <option value="webp">WebP</option>
        <option value="tiff">TIFF</option>
        <option value="gif">GIF</option>
        <option value="heic">HEIC</option>
        <option value="heif">HEIF</option>
        <option value="avif">AVIF</option>
      </select>

      <button
        onClick={handleConvert}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
      >
        Convert
      </button>
      </div>
    </div>
    <Ad/>
    </div>
  );
};

export default Home;