import { Request, Response, NextFunction } from 'express';

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction): void {
  res.on('finish', () => {
    // Log non-OK responses (status codes >= 400)
    if (res.statusCode >= 400) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
    }
  });

  next();
}
