//Import necessary dependencies
import { useState, useEffect, useRef } from 'react';
import { saveAs } from 'file-saver';

// Define the worker message types
interface WorkerProgress {
  type: 'progress';
  progress: number;                 // Progress percentage (0-100)
}

interface WorkerComplete {
  type: 'complete';
  zipBlob: Blob;                    // Final ZIP file for PNG downloads
}

interface GifWorkerComplete {
    type: 'complete';
    gifBlob: Blob;                  // Final GIF file
}


// Union type for all possile worker messages
type WorkerMessage = WorkerProgress | WorkerComplete | GifWorkerComplete;


/**
 * Custom hook for handling image downloads in both PNG and GIF formats
 * Manages web workers and download progress
 */
//Define the custom hook
export const useImageDownload = () => {
    //State to track the download progress
    const [downloadProgress, setDownloadProgress] = useState<number>(0);

    //Reference to the worker instances
    const pngWorkerRef = useRef<Worker | null>(null);
    const gifWorkerRef = useRef<Worker | null>(null);

    /**
     * Initialize workers and set up cleanup on unmount
     */

    //Setup the web worker when the hook is forst called
    useEffect(() => {
        //Create a new web worker instances, passing the relative path to the worker script
        pngWorkerRef.current = new Worker(
            new URL('../workers/image-worker.ts', import.meta.url),
            { type: 'module' }
        );

        gifWorkerRef.current = new Worker(
            new URL('../workers/gif-worker.ts', import.meta.url),
            { type: 'module' }
        );

        // Attach message handlers to both workers
        pngWorkerRef.current.onmessage = handleWorkerMessage;
        gifWorkerRef.current.onmessage = handleWorkerMessage;

        //Cleanup function to terminate workers when component unmounts
        return () => {
            pngWorkerRef.current?.terminate();
            gifWorkerRef.current?.terminate();
        };

       
    }, []);

    /**
     * Handles messages received from either worker
     * Updates progress and handles file downloads
     * @param e - MessageEvent containing worker message
     */

    const handleWorkerMessage = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.type === 'progress') {
            //Update progress bar
            setDownloadProgress(e.data.progress);
        } else if (e.data.type === 'complete') {
            // Handle completed downloads
            if ('zipBlob' in e.data) {
                //Save ZIP file for PNG downloads
                saveAs(e.data.zipBlob, 'extracted_images.zip');
            } else if ('gifBlob' in e.data) {
                // Save GIF file
                saveAs(e.data.gifBlob, 'animated.gif');
            }
            // Reset progress after download
            setDownloadProgress(0);
        }
    };

    /**
     * Initiates the download process for either PNG or GIF format
     * @param selectedThumbnails - Array of indices for selected thumbnails
     * @param imageThumbnailURLs - Object mapping file names to arrays of thumbnail URLs
     * @param selectedFile - Name of the currently selected file
     * @param asGif - Boolean flag to determine if output should be GIF
     */

    //Function to initiate the image download
    const handleDownload = (
        selectedThumbnails: number[],
        imageThumbnailURLs: { [key: string]: string[] },
        selectedFile: string, 
        asGif: boolean = false      
    ) => {
        //Check if a file is selected
        if (!selectedFile) return;

        //Get the URLs of the selected thumbnails
        const selectedUrls = selectedThumbnails.map(
            index => imageThumbnailURLs[selectedFile][index]
        );

        if (asGif && gifWorkerRef.current) {
            //For GIF creation: Load first image to get dimensions
            const img = new Image();
            img.onload = () => {
                // Send data to GIF worker once dimensions are known
                gifWorkerRef.current?.postMessage({
                    imageUrls: selectedUrls,
                    fileName: selectedFile,
                    width: img.width,
                    height: img.height
                });
            };
            //Start loading the first image
            img.src = selectedUrls[0];
        } else if (pngWorkerRef.current) {
            //For PNG downloads: Send data directly to PNG worker
            pngWorkerRef.current.postMessage({
                imageUrls: selectedUrls,
                fileName: selectedFile
            });
        }

    };

    //Return the necessary functions and state
    return { handleDownload, downloadProgress };
};