import JSZip from 'jszip';

//Define the input data structure for the worker
//This includes an array of image URLs and the desired file name for the ZIP archive
interface WorkerInput {
    imageUrls: string[];
    fileName: string;
}

//Define the progress and completion message structures
//The worker will send these message back to the main thread
interface WorkerProgress {
    type: 'progress';
    progress: number;
}

interface WorkerComplete {
    type: 'complete';
    zipBlob: Blob; //The final ZIP file containing the processed images
}

//Union type for the worker messages
type WorkerMessage = WorkerProgress | WorkerComplete;

//Helper function to convert an image blob to a PNG using the OffscreenCanvas API
async function convertToPng(blob: Blob): Promise<Blob> {
    //Create an image bitmap from the input blob
    const imageBitmap = await createImageBitmap(blob);

    //Create a new new OffscreenCanavas with the same same dimensions as the image
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');

    // Ensure the canvas context was created successfully
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    //Draw the image bitmap onto the canvas
    ctx.drawImage(imageBitmap, 0, 0);

    //Convert the canvas contents to a PNG blob
    return canvas.convertToBlob({
        type: 'image/png'
    });
}


//This is the main entry point for the worker
//It is called when the worker receives a message from the main thread
self.onmessage = async function(e: MessageEvent<WorkerInput>) {
    const { imageUrls, fileName } = e.data;

    //Create a new JSZip instance to store the processed images
    const zip = new JSZip();
    const folder = zip.folder(fileName);

    //Ensure the folder was created successfully
    if (!folder) {
        throw new Error("Failed to create zip folder");
    }

    let processedCount = 0;
    const totalImages = imageUrls.length;

    //Process image in batches of 3 to avoid overwhelming the system
    const batchSize = 3;
    for (let i = 0; i < imageUrls.length; i += batchSize) {
        const batch = imageUrls.slice(i, i + batchSize);

        //Process each image in the batch
        await Promise.all(batch.map(async (url, batchIndex) => {
            try {
                //Fetch the image from the URL
                const response = await fetch(url);
                const originalBlob = await response.blob();
                const index = i + batchIndex;

                //Convert the image to a PNG blob
                const pngBlob = await convertToPng(originalBlob);

                //Add the PNG blob to the ZIP folder with a filename like "image_1.png"
                folder.file(`image_${index + 1}.png`, pngBlob);
                processedCount++;

                //Send a progress update message to the main thread
                self.postMessage({
                    type: 'progress',
                    progress: (processedCount / totalImages) * 100
                } as WorkerProgress);
            } catch (error) {
                console.error(`Failed to process image ${i + batchIndex + 1}:`, error);
                //Incase the error needs to be handled differently, here is the place to do so
            }
        }));
    }

    //Generate the final ZIP file blob
    const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
    }, (metadata) => {
        //Send progress updates during ZIP file generation
        self.postMessage({
            type: 'progress',
            progress: metadata.percent
        } as WorkerProgress);
    });

    //Send the completed ZIP file blob back to the main thread
    self.postMessage({
        type: 'complete',
        zipBlob
    } as WorkerComplete);
};