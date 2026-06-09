import { Router, Request, Response } from 'express';
import { recordAnalyticsEvent, parseTokenUserId } from '../utils/analytics';

const router = Router();

router.post('/track', async (req: Request, res: Response) => {
  try {
    const authorizationHeader = req.headers.authorization as string | undefined;
    const userId = parseTokenUserId(authorizationHeader);
    const { eventType, blogId, pageUrl, duration, amount, source, metadata } = req.body;

    if (!eventType) {
      return res.status(400).json({ message: 'eventType is required' });
    }

    await recordAnalyticsEvent({
      eventType,
      blogId,
      userId: userId || undefined,
      pageUrl,
      duration,
      amount,
      source,
      metadata,
    });

    res.json({ message: 'Analytics event recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record analytics event', error: (error as Error).message });
  }
});

export default router;
