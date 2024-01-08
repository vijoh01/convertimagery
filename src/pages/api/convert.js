import multiparty from 'multiparty';
import sharp from 'sharp';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
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
      const outputDirectory = './converted'; // Adjust the directory as needed
      const outputFile = `${outputDirectory}/${outputFileName}`;

      try {
        console.log('Converting image...');

        // Use toBuffer to get the image buffer
        const imageBuffer = await sharp(inputFile).toBuffer();

        // Save the buffer to the output file
        await fs.mkdir(outputDirectory, { recursive: true }); // Create the directory if it doesn't exist
        await fs.writeFile(outputFile, imageBuffer);

        console.log('Conversion successful');

        // Set response headers for download
        res.setHeader('Content-Disposition', `attachment; filename=${outputFileName}`);
        res.setHeader('Content-Type', 'image/' + format);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Set appropriate cache control
        res.setHeader('Content-Length', imageBuffer.length);

        // Send the file as response
        res.send(imageBuffer);
      } catch (error) {
        console.error('Error during conversion:', error);
        res.status(500).json({ error: 'Conversion failed' });
      } finally {
        try {
          await fs.access(outputFile);
          await fs.unlink(outputFile);
          console.log('Deleted output file:', outputFile);
        } catch (deleteError) {
          console.error('Error deleting output file:', deleteError);
        }
      }
    });
  }
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
    const imageInfo = await sharp(file.path).metadata();
    return imageInfo.format !== undefined && isValidFormat(imageInfo.format.toLowerCase());
  } catch (error) {
    if (error.message.includes('unsupported image format')) {
      console.error('Unsupported image format');
      return false;
    } else {
      console.error('Error checking image format:', error);
      return false;
    }
  }
}