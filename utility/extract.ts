export function countImages(fileData: ArrayBuffer, decoder: any): number {
    const decodedData = decoder.decode(fileData); // decoder should return an array of images
    if (Array.isArray(decodedData)) {
        return decodedData.length; // Return the number of images decoded
    }
    return 0; // Return 0 if there are no images
}

export function extractImageData(
    fileData: ArrayBuffer,
    decoder: any,
    fileId: string, // Unique file identifier (e.g., file name or a unique ID)
    onProgress: (fileId: string, percentage: number) => void // Callback to handle progress updates for each file
  ): Promise<Array<{ index: number; imageWidth: number; imageHeight: number; imageRGBA: Uint8ClampedArray }>> {
  
    const decodedData = decoder.decode(fileData); // Decode the HEIC/HEIF file data
    const imagesInfo: Array<{ index: number; imageWidth: number; imageHeight: number; imageRGBA: Uint8ClampedArray }> = [];
    
    const totalImages = decodedData.length; // Get the total number of images
    let index = 0;
  
    return new Promise((resolve, reject) => {
  
      const processNextImage = () => {
        if (index >= totalImages) {
          resolve(imagesInfo); // Finish once all images are processed
          return;
        }
  
        const imageData = decodedData[index];
        const imageWidth = imageData.get_width();
        const imageHeight = imageData.get_height();
        const imageRGBA = new Uint8ClampedArray(imageWidth * imageHeight * 4);
  
        imageData.display({ data: imageRGBA, width: imageWidth, height: imageHeight }, (displayData: any) => {
          if (!displayData) {
            reject(new Error("Failed to retrieve RGBA data from HEIF image."));
            return;
          }
  
          imagesInfo.push({
            index,
            imageWidth,
            imageHeight,
            imageRGBA
          });
  
          index++;
  
          // Calculate the progress percentage for the current file
          const progress = (index / totalImages) * 100;
          onProgress(fileId, progress); // Call the callback with the current progress for this file
  
          // Schedule the next image processing on the next frame
          requestAnimationFrame(processNextImage); // Schedule on the next frame
        });
      };
  
      processNextImage(); // Start processing the images
    });
  }
  
  

  