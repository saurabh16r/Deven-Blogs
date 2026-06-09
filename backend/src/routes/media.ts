import { Router, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middlewares/auth';

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

    if (!isCloudinaryConfigured) {
      console.log('⚠️ Cloudinary keys not found. Returning a simulated image URL.');
      // Return a nice unsplash mock image URL depending on request or generic
      const mockImages = [
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
      ];
      const randomIndex = Math.floor(Math.random() * mockImages.length);
      
      res.json({
        url: mockImages[randomIndex],
        publicId: `mock-public-id-${Date.now()}`,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        size: req.file.size,
      });
      return;
    }

    // Convert buffer to base64 data URI
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'deven_blogs',
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    res.status(500).json({ message: 'Media upload failed', error: (error as Error).message });
  }
});

// GET MEDIA LIBRARY (MOCK)
router.get('/library', requireAuth, async (req, res) => {
  const library = [
    { id: '1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', name: 'Design Abstract' },
    { id: '2', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80', name: 'TS Coding' },
    { id: '3', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=300&q=80', name: 'AI Glowing Neural' },
    { id: '4', url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&q=80', name: 'Hardware Setup' },
  ];
  res.json(library);
});

export default router;
