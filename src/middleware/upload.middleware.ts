// middleware/upload.middleware.ts
import { Request, Response, NextFunction } from "express";
import multer from "multer";

// Define the interface to extend the express Request type
export interface MulterRequest extends Request {
    file?: Express.Multer.File; // Make it optional to avoid issues
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
    },
}).single("image");

class UploadMiddleware {
    // The method to process file uploads
    ProcessFiles(req: MulterRequest, res: Response, next: NextFunction): void {
        upload(req, res, (error) => {
            if (error) {
                return res.status(500).json({ message: "File upload failed", error });
            }
            next();
        });
    }
}

export default new UploadMiddleware();
