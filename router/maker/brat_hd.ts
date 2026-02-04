import { Request, Response } from 'express';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

export default async function bratHandler(req: Request, res: Response) {
    const text = (req.query.text || req.body.text || 'BRAT') as string;
    const width = parseInt((req.query.width as string) || '512');
    const height = parseInt((req.query.height as string) || '512');
    const fontSize = parseInt((req.query.fontSize as string) || '48');
    const brickColor = (req.query.brickColor as string) || '#8B4513';
    const bgColor = (req.query.bgColor as string) || '#F5F5DC';
    const textColor = (req.query.textColor as string) || '#FFFFFF';
    const format = (req.query.format as 'png' | 'jpeg' | 'webp') || 'png';

    try {
        // Create canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Calculate brick dimensions
        const brickWidth = Math.floor(width / 16);
        const brickHeight = Math.floor(brickWidth / 2);
        const brickSpacing = 2;
        const rowSpacing = 2;
        
        const totalBrickHeight = brickHeight + rowSpacing;
        const totalBrickWidth = brickWidth + brickSpacing;
        
        const rows = Math.ceil(height / totalBrickHeight);
        const cols = Math.ceil(width / totalBrickWidth);

        // Draw brick pattern
        for (let row = 0; row < rows; row++) {
            const y = row * totalBrickHeight;
            const rowOffset = row % 2 === 1 ? totalBrickWidth / 2 : 0;

            for (let col = 0; col < cols; col++) {
                const x = col * totalBrickWidth + rowOffset;
                
                // Skip if outside canvas
                if (x >= width || y >= height) continue;

                // Calculate actual dimensions
                const actualWidth = Math.min(brickWidth, width - x);
                const actualHeight = Math.min(brickHeight, height - y);

                // Draw brick with 3D effect
                drawBrick(ctx, x, y, actualWidth, actualHeight, brickColor);
            }
        }

        // Draw text with shadow
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Load font if available
        try {
            registerFont(path.join(__dirname, '../fonts/Arial.ttf'), { family: 'Arial' });
            ctx.font = `bold ${fontSize}px Arial`;
        } catch {
            ctx.font = `bold ${fontSize}px sans-serif`;
        }

        // Text shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText(text, width / 2 + 3, height / 2 + 3);

        // Main text
        ctx.fillStyle = textColor;
        ctx.fillText(text, width / 2, height / 2);

        // Set response headers
        const mimeType = 
            format === 'jpeg' ? 'image/jpeg' :
            format === 'webp' ? 'image/webp' : 'image/png';
        
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('X-Generator', 'BRAT Image Generator');

        // Send image
        const buffer = canvas.toBuffer(mimeType);
        res.send(buffer);

    } catch (error: any) {
        console.error('Error generating BRAT image:', error);
        res.status(500).json({
            status: false,
            message: error.message || 'Failed to generate image'
        });
    }
}

function drawBrick(
    ctx: any,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
) {
    // Main brick body
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

    // Top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x, y, width, 2);
    
    // Left highlight
    ctx.fillRect(x, y, 2, height);

    // Bottom shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y + height - 2, width, 2);
    
    // Right shadow
    ctx.fillRect(x + width - 2, y, 2, height);

    // Brick texture
    drawBrickTexture(ctx, x, y, width, height, color);
}

function drawBrickTexture(
    ctx: any,
    x: number,
    y: number,
    width: number,
    height: number,
    baseColor: string
) {
    // Convert hex to RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    // Create subtle texture
    for (let i = 0; i < 5; i++) {
        const textureX = x + Math.random() * width;
        const textureY = y + Math.random() * height;
        const textureSize = Math.random() * 5 + 2;
        
        // Darker variant for texture
        ctx.fillStyle = `rgba(${r * 0.8}, ${g * 0.8}, ${b * 0.8}, 0.2)`;
        ctx.fillRect(textureX, textureY, textureSize, textureSize);
    }
}