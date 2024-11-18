import { encode } from 'modern-gif';// I tried to use this library but it gave me a hard time, I might come back to it if the other library fails me
import { GIFEncoder, quantize, applyPalette,} from "gifenc"; //I tried to manually add types for the GIF encoder based on the work done by "https://github.com/mattdesl/gifenc" but I still couldn't get rid of the type error in my code editor

// Type definitions for worker input/output messages
interface GifWorkerInput {
    imageUrls: string[];    // Array of image URLs to process
    fileName: string;       // Name for the output file
    width: number;          // Desired width of the GIF
    height: number;         // Desired height of the GIF
}

// Interface for progress updates sent to main thread
interface GifWorkerProgress {
    type: 'progress';
    progress: number;       // Progress percentage (0-100)
}

// Interface for completion message with final GIF blob
interface GifWorkerComplete {
    type: 'complete';
    gifBlob: Blob;          // The final encoded GIF as a Blob
}

// Union type for all possible worker messages
type GifWorkerMessage = GifWorkerProgress | GifWorkerComplete;


{/**
 * Processes an array of image URLs into a format suitable for GIF encoding
 * @param urls - Array of image URLs to process
 * @returns Promise resolving to array of processed image data with delay timings
 **/}

 async function processImageForGif(urls: string[], width: number, height: number): Promise<Uint8Array[]> {
    // Process all URLs in parallel using Promise.all
    const frames = await Promise.all(
        urls.map(async (url) => {
            //Fetch the image from the URL
            const response = await fetch(url);
            const blob = await response.blob();

            //Convert the blob to a CanvasImageSource
            const imageBitmap = await createImageBitmap(blob);

            //Create a temporary canvas and draw the image
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error ('Failed to get canvas context');
            }
            ctx.drawImage(imageBitmap, 0, 0, width, height);

            //Get the image data and convert it to a Uint8Array
            const imageData = ctx.getImageData(0, 0, width, height);
            return new Uint8Array(imageData.data);
        })
    );

    return frames;
}


{/**
    *Main worker message handler
    *Receives image data, processes it, and returns an encoded GIF
     */}

self.onmessage = async function(e: MessageEvent<GifWorkerInput>) {
    const { imageUrls, fileName, width, height } = e.data;

    try {
        // Step 1: Process all images into the correct format for GIF encoding
        const frames = await processImageForGif(imageUrls, width, height);
        console.log(frames); //Debugging the image types that are being returned to the encoder for encoding.

        // Send 50% progress update after image processing is complete
        self.postMessage({
            type: 'progress',
            progress: 50
        } as GifWorkerProgress);

        // Step 2: Encode the processed frames into a GIF
        const gif = GIFEncoder();
        

        // Quantize the first frame and apply the palette to all frames
        const palette = quantize(frames[0], 256);
        //const transparentIndex = findTransparentIndex(palette);

        frames.forEach((frame, index) => {
          const indexedFrame = applyPalette(frame, palette);
          gif.writeFrame(indexedFrame, width, height, {
            palette: index === 0 ? palette : undefined,
            first: index === 0,
            transparent: false,
            transparentIndex: 0,
            delay: 100,
            repeat: 0,
          });
        });

        gif.finish();

        // Step 3: Create a blob from the encoded GIF data
        const gifData = new Uint8Array(gif.bytes());
        const gifBlob = new Blob([gifData], { type: 'image/gif' });

        //Step 4: Send the completed GIF back to the main thread
        self.postMessage({
            type: 'complete',
            gifBlob
        } as GifWorkerComplete);

    } catch (error) {
        // Log any errors that occur during processing
        console.error('Error creating GIF: ', error);
        throw error;
    }
}