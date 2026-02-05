import { Request, Response } from 'express';
import axios from 'axios';

export default async function bratHdHandler(req: Request, res: Response) {
    const text = (req.query.text || req.body.text) as string;

    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' diperlukan."
        });
    }

    try {
        const url = `https://api-faa.my.id/faa/brathd?text=${encodeURIComponent(text)}`;
        
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/*,*/*;q=0.8',
                'Referer': 'https://api-faa.my.id/',
                'Connection': 'keep-alive'
            }
        });

        // Periksa content-type dari response
        const contentType = response.headers['content-type'] || 'image/png';
        res.set('Content-Type', contentType);
        res.send(response.data);

    } catch (error: any) {
        console.error('Error fetching brathd image:', error.message);
        
        // Berikan error response yang lebih informatif
        res.status(500).json({ 
            status: false, 
            message: 'Gagal mengambil gambar dari API',
            error: error.message 
        });
    }
}