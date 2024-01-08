"use client"
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import '../app/globals.css'

const types = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'gif', 'heic', 'heif', 'avif']

function ImageConverter() {
  const router = useRouter();
  const { format }: any = router.query;

  const from = format ? format.split('-to-')[0].toLowerCase() : '';
  const to = format ? format.split('-to-')[1].toLowerCase() : '';

  const goToRoute = (obj) => {
    const [beforeTo, afterTo] = format.split('-to-');
    if (obj.from !== null) {
      console.log("from", obj.from);

      const newRoute = `${obj.from}-to-${afterTo}`;
      router.replace(`/${newRoute}`);
    } else if (obj.to !== null) {
      console.log(beforeTo, "to", obj.to);
      const newRoute = `${beforeTo}-to-${obj.to}`;
      router.replace(`/${newRoute}`);
    }

  }

  useEffect(() => {
    setSelectedFrom(from);
    setSelectedTo(to);
  }, [from, to])

  const isValidFormat = (inputFormat) => {
    if (!inputFormat) return false;

    const [from, to] = inputFormat.split('-to-');

    // Check if both from and to are in the types array and are different
    return types.includes(from.toLowerCase()) &&
      types.includes(to.toLowerCase()) &&
      from.toLowerCase() !== to.toLowerCase();
  };

  const [file, setFile] = useState(null);
  const [selectedFrom, setSelectedFrom] = useState(from);
  const [selectedTo, setSelectedTo] = useState(to);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFromChange = (e) => {
    const [beforeTo, afterTo] = format.split('-to-');


    if (e.target.value !== afterTo) {
      setSelectedFrom(e.target.value);
      goToRoute({ from: e.target.value, to: null });
    }

  }

  const handleToChange = (e) => {
    const [beforeTo, afterTo] = format.split('-to-');

    if (e.target.value !== beforeTo) {
      setSelectedTo(e.target.value);
      goToRoute({ from: null, to: e.target.value });
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', selectedTo);

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
        a.download = `converted.${selectedTo}`;
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
  console.log(selectedTo);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className='max-w-md mx-auto p-6 bg-white rounded-md shadow-md'>
        {!isValidFormat(format) || format == null ? <p>Invalid format</p>
          : (<div>
            <h1 className="text-3xl font-semibold mb-4">{from.toUpperCase()} to {to.toUpperCase()} Converter</h1>

            <p>Convert  image from {from.toUpperCase()} to {to.toUpperCase()}</p>


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
            <p className=''>From:</p>
            <select
              value={selectedFrom}
              onChange={handleFromChange}
              className="w-full border p-2 mb-4 rounded-md"
            >
              {types.map((sort, index) => (
                <option key={index} value={sort}>{sort.toUpperCase()}</option>
              ))}

            </select>
            <p className=''>To:</p>
            <select
              value={selectedTo}
              onChange={handleToChange}
              className="w-full border p-2 mb-5 rounded-md"
            >
              {types.map((sort, index) => (
                <option key={index} value={sort}>{sort.toUpperCase()}</option>
              ))}

            </select>

            <button
              onClick={handleConvert}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Convert
            </button>
          </div>
          )}
      </div>
    </div>
  );
}

export default ImageConverter;