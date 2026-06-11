import { Router, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middlewares/auth';
import Media from '../models/Media';
import { getMockMedia, addMockMedia, deleteMockMedia } from '../config/mockData';

const router = Router();

// Set up multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

let isCloudinaryConfigured = false;
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  isCloudinaryConfigured = true;
}

// UPLOAD IMAGE FILE
router.post('/upload', requireAuth, upload.single('file'), async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    let uploadUrl = '';
    let uploadPublicId = '';

    if (!isCloudinaryConfigured) {
      console.log('⚠️ Cloudinary keys not found. Returning a simulated image URL.');
      const mockImages = [
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1531535934027-667f6787eda4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      ];
      const randomIndex = Math.floor(Math.random() * mockImages.length);
      uploadUrl = mockImages[randomIndex];
      uploadPublicId = `mock-public-id-${Date.now()}`;
    } else {
      // Convert buffer to base64 data URI
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(fileBase64, {
        folder: 'deven_blogs',
      });
      uploadUrl = result.secure_url;
      uploadPublicId = result.public_id;
    }

    const newMediaData = {
      url: uploadUrl,
      publicId: uploadPublicId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size,
    };

    if (process.env.MOCK_MODE === 'true') {
      const mockItem = {
        id: `media-${Date.now()}`,
        ...newMediaData,
        createdAt: new Date().toISOString(),
      };
      addMockMedia(mockItem);
      res.json(mockItem);
      return;
    }

    // Real DB Mode
    const media = await Media.create(newMediaData);
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Media upload failed', error: (error as Error).message });
  }
});

// GET MEDIA LIBRARY
router.get('/library', requireAuth, async (req, res) => {
  try {
    if (process.env.MOCK_MODE === 'true') {
      res.json(getMockMedia());
      return;
    }
    const media = await Media.find().sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Error loading media library', error: (error as Error).message });
  }
});

// DELETE MEDIA ITEM
router.delete('/:id', requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;
  try {
    if (process.env.MOCK_MODE === 'true') {
      deleteMockMedia(id);
      res.json({ message: 'Media deleted successfully' });
      return;
    }

    // DB Mode
    const media = await Media.findById(id);
    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    // Delete from Cloudinary if configured
    if (isCloudinaryConfigured && media.publicId && !media.publicId.startsWith('mock-')) {
      try {
        await cloudinary.uploader.destroy(media.publicId);
      } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
      }
    }

    await Media.findByIdAndDelete(id);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting media', error: (error as Error).message });
  }
});

export default router;
