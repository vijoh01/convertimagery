import sharp from 'sharp';
import multiparty from 'multiparty';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('API route hit');

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const file = files.file ? files.file[0] : null;
    const format = Array.isArray(fields.format) ? fields.format[0] : fields.format;

    console.log('Received file:', file);
    console.log('Received format:', format);

    if (!file || !isValidFormat(format) || !isValidImageFormat(file)) {
      console.error('Invalid file or image format');
      return res.status(400).json({ error: 'Invalid file or image format' });
    }

    const inputFile = file.path;
    const outputFileName = `converted.${format}`;
    const outputFile = `./public/${outputFileName}`; // Adjust the path as needed

    try {
      console.log('Converting image...');
  
      // Use local sharp binary for image processing
      await sharp(inputFile)
        .toFormat(format)
        .toFile(outputFile);
  
      console.log('Conversion successful');
  
      // Set response headers for download
      res.setHeader('Content-Disposition', `attachment; filename=${outputFileName}`);
      res.setHeader('Content-Type', `image/${format}`);
  
      // Send the file as response
      res.sendFile(outputFile);
    } catch (error) {
      console.error('Error during conversion');
      res.status(500).json({ error: 'Conversion failed' });
    } finally {
      try {
        // Delete the output file using fs.unlink
        await fs.unlink(outputFile);
        console.log('Deleted output file:', outputFile);
      } catch (deleteError) {
        console.error('Error deleting output file:', deleteError);
      }
    }
  });
}

function isValidFormat(format) {
  const validFormats = ['heic', 'heif', 'avif', 'jpeg', 'jpg', 'png', 'tiff', 'webp', 'gif'];

  if (typeof format === 'string') {
    return validFormats.includes(format.toLowerCase());
  }

  return false;
}

async function isValidImageFormat(file) {
  // Check if the file format is one of the valid image formats
  try {
    await sharp(file.path).metadata();
    return true;
  } catch (error) {
    console.error('Error checking image format:', error);
    return false;
  }
}