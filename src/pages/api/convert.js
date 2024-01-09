import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';
import multiparty from 'multiparty';
import imageSize from 'image-size';
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

      const image = await loadImage(inputFile);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, image.width, image.height);

      // Save the buffer to the output file
      writeFileSync(outputFile, canvas.toBuffer());

      console.log('Conversion successful');

      // Set response headers for download
      res.setHeader('Content-Disposition', `attachment; filename=${outputFileName}`);
      res.setHeader('Content-Type', 'image/' + format);

      // Send the file as response
      res.send(canvas.toBuffer());
    } catch (error) {
      console.error('Error during conversion');
      res.status(500).json({ error: 'Conversion failed' });
    } finally {
      try {
        // Delete the output file
        await fs.access(outputFile);
        await fs.unlink(outputFile);
        console.log('Deleted output file:', outputFile);
      } catch (deleteError) {
        console.error('Error deleting output file');
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
    const dimensions = imageSize(file.path);
    return isValidFormat(dimensions.type);
  } catch (error) {
    console.error('Error checking image format:', error);
    return false;
  }
}