"use client";

//imports

import ReactDropzone from "react-dropzone";
import {useState, useEffect, useRef, useMemo, useCallback} from "react";
import Image from "next/image";
import type { FileActions } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { OctagonAlert } from 'lucide-react';
import { ImageUp } from 'lucide-react';
import { Square } from 'lucide-react';
import { CloudUpload } from 'lucide-react';
import { LoaderPinwheel } from 'lucide-react';
import { CircleChevronDown } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { loadLibheif } from "@/utility/load-libheif";
import { countImages, extractImageData } from "@/utility/extract";
import fileIconSetter from "@/utility/file-icon-setter";
import compressFileName from "@/utility/compress-file-name";
import formatFileSize from "@/utility/format-file-size";
import { useImageDownload } from '@/hooks/use-image-download';
import { BackgroundGradient } from "@/components/ui/background-gradient";




export default function Dropzone() {
    const accepted_files = {"image/heic": [".heic"], "image/heif":[".heif"]};
    const { toast } = useToast();
    const [is_hover, setIsHover] = useState<boolean>(false);
    const [decoder, setDecoder] = useState<any>(null); 
    const [is_Decoder_Loading, setIsDecoderLoading] = useState<boolean>(true); 
    const [is_Decoder_Loaded, setIsDecoderLoaded] = useState<boolean>(false);
    const [retryDecoder, setRetryDecoder] = useState<boolean>(false);
    const [uploadedFilesCount, setUploadedFilesCount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null); 
    const [is_Converting, setIsConverting] = useState<boolean>(false);
    const [files, setFiles] = useState<Array<any>>([]);
    const [actions, setActions] = useState<FileActions[]>([]);
    const [progressData, setProgressData] = useState<{ [key: string]: number }>({}); // To track progress for each file
    const [is_Files_Decoded, setFilesDecoded] = useState<boolean>(false);
    const [image_Thumbnails, setImageThumbnails] = useState<{ [key: string]: HTMLCanvasElement[] }>({});
    const [imageThumbnailURLs, setImageThumbnailURLs] = useState<{ [key: string]: string[]}>({});
    const [thumbnailScale, setThumbnailScale] = useState<number>(75);
    const [selectedFile, setSelectedFile] = useState<string | null>(null); // Track the selected file for thumbnails preview
    const [selectedThumbnails, setSelectedThumbnails] = useState<number[]>([]);
    const { handleDownload, downloadProgress } = useImageDownload();

      //Settings for icons
    const iconStrokeWidth: number = 0.9;
    const iconSize:number = 70;
    const iconColor: string = "#3e9392";

    //

    // Check if all thumbnails are selected
    const areAllSelected = selectedFile && selectedFile !== null && selectedThumbnails.length === (image_Thumbnails[selectedFile]?.length || 0);
    const toggleThumbnailSelection = (index: number) => {
        setSelectedThumbnails((prevSelected) => {
          // Toggle selection of the current thumbnail
          const isSelected = prevSelected.includes(index);
          const updatedSelection = isSelected
            ? prevSelected.filter((i) => i !== index)
            : [...prevSelected, index];
    
          // Ensure thumbnails are sorted by index
          return updatedSelection.sort((a, b) => a - b);
        });
    };

    const selectAllThumbnails = () => {
        if (selectedFile !== null && selectedFile !== undefined) {
            const allIndices = image_Thumbnails[selectedFile]?.map((_, idx: number) => idx) || [];
            setSelectedThumbnails(allIndices);
        }
    };
    
    const deselectAllThumbnails = () => {
        setSelectedThumbnails([]);
    };

    const deleteFile = (action: FileActions): void => {
        // Remove from actions array
        setActions(actions.filter((element) => element !== action));
        
        // Remove from files array
        setFiles(files.filter((element) => element.name !== action.file_name));
        
        // Remove thumbnails for this file
        setImageThumbnails(prevThumbnails => {
            const newThumbnails = { ...prevThumbnails };
            delete newThumbnails[action.file_name];
            return newThumbnails;
        });
        
        // Remove thumbnail URLs for this file
        setImageThumbnailURLs(prevURLs => {
            const newURLs = { ...prevURLs };
            delete newURLs[action.file_name];
            return newURLs;
        });
    
        // Clear progress data for this file
        setProgressData(prevProgress => {
            const newProgress = { ...prevProgress };
            delete newProgress[action.file_name];
            return newProgress;
        });
        
        // Reset selected file if it's the one being deleted
        if (selectedFile === action.file_name) {
            setSelectedFile(null);
            setSelectedThumbnails([]);
        }
        
        // Update the count
        setUploadedFilesCount(uploadedFilesCount - 1);
    };

    
    const handleHover = (): void => setIsHover(true);
    const handleExitHover = (): void => setIsHover(false);
    const handleUpload = (uploadedFiles: Array<any>): void => {

        if (!is_Decoder_Loaded) {
            setError("There is an issue with loading necessary libraries. Please try again.");
            toast({variant: "destructive", title:"Initialization Error", description:"There is an issue with loading necessary libraries. Please try again.. " , duration: 5000});
            setRetryDecoder(true); // Set retry flag to true, triggering useEffect
            return;  // Exit the function if is_Decoder_Loaded is false
        }

        handleExitHover();
        
        setFiles(uploadedFiles);
        setUploadedFilesCount(uploadedFiles.length); //updates the number of files uploaded when a user uploads files
        console.log("Uploaded Files Length is " + uploadedFiles.length);
        
        const tmp: FileActions[] = [];
        let completedFilesCount = 0; // Track the number of files that have completed extraction
        
        uploadedFiles.forEach((file: any) => {
            const reader = new FileReader();
            
            reader.onloadend = async () => {
                const arrayBuffer = reader.result as ArrayBuffer;
              
                const imagesCount = countImages(arrayBuffer, decoder);
                
                tmp.push({
                  file: file,
                  file_name: file.name,
                  file_size: file.size,
                  file_from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
                  file_to: null,
                  images_count: (imagesCount),                  
                  is_extracting: true,
                  is_extracted: false,
                  is_converting: false,
                  is_converted: false,
                  is_error: false,
                });
              
                setActions(tmp);
              
                // Initialize the progress for this file to 0%
                setProgressData(prev => ({ ...prev, [file.name]: 0 }));
              
                // Track progress during the extraction process for this file
                const extractedImageData = await extractImageData(arrayBuffer, decoder, file.name, (fileId, progress) => {
                  // Update the progress for the specific file
                  setProgressData(prev => ({ ...prev, [fileId]: progress }));
                  //console.log(`Progress for file ${fileId}: ${progress.toFixed(2)}%`);
                });

                const thumbnails = extractedImageData.map((imageData) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = imageData.imageWidth;
                    canvas.height = imageData.imageHeight;
                    const ctx = canvas.getContext('2d');
                    const imageDataArray = new ImageData(imageData.imageRGBA, imageData.imageWidth, imageData.imageHeight);
                    ctx?.putImageData(imageDataArray, 0, 0);
                    return canvas;
                });

                setImageThumbnails(prev => ({ ...prev, [file.name]: thumbnails }));

                const thumbnailUrls = thumbnails.map(canvas => canvas.toDataURL());
                setImageThumbnailURLs(prev => ({ ...prev, [file.name]: thumbnailUrls}));

                  // Update the individual file status to mark extraction as done
                  setActions(prevActions => {
                      const updatedActions = prevActions.map(action =>
                          action.file_name === file.name ? { ...action, is_extracting: false, is_extracted: true } : action
                      );
                      return updatedActions;
                  });
            
                // Increment the completed file count and check if all files are done
                completedFilesCount += 1;                
                if (completedFilesCount === uploadedFiles.length) {
                    console.log("All files have completed extraction.");
                    setFilesDecoded(true);
                    // Additional logic for when all files are done, if needed
                }
            
                    //console.log(extractedImageData); // Handle extracted image data
                };
            
            reader.readAsArrayBuffer(file);
          });
    };
    

    // This section is for calling the function that initializes the libheif library once the page has been loaded. 
    //It also contains a flag to retry the initialization when a user tries to upload a file but the library wasn't initialized properly.
    useEffect(() => {
        const fetchDecoder = async () => {
          try {
            setIsDecoderLoading(true);
            const heifDecoder = await loadLibheif(); // Call the function that loads libheif
            setDecoder(heifDecoder);
            setIsDecoderLoaded(true);   
            toast({title: "Necessary Libraries Loaded", description: "You can now upload your files", duration: 5000});        
          } catch (err) {
            setError(() => 'Failed to initialize libheif: ' + err);
            toast({variant: "destructive", title: "Initialization Error", description: error, duration: 5000});                    
          } finally {
            setIsDecoderLoading(false);    
            setRetryDecoder(false);
          }
        };
    
        if (!is_Decoder_Loaded || retryDecoder) {
            fetchDecoder();
        }
           
    }, [is_Decoder_Loaded, retryDecoder, toast, error]);

      
    if (uploadedFilesCount > 0) {
        return (
            <div className="space-y-6>">
                {actions.map((action:FileActions, i:any) => {
                    // Retrieve the progress for each file using the file's name as the key
                    const progressValue = progressData[action.file_name] || 0; // Default to 0 if not available

                return (
                    <div key={i} className="w-full py-4 my-4 space-y-2 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between">
                        {!is_Files_Decoded && (<Progress value={progressValue} className="h-full w-full opacity-10 cursor-progress absolute rounded-xl -ml-4 -mr-4 lg:-ml-10 lg:-mr-10" />)}
                        <div className="flex gap-4 items-center">
                            <span className="text-2xl">                                
                                {fileIconSetter(action.images_count)}
                            </span>
                            <div className="flex items-center gap-1 w-96">
                                <span className="text-md font-medium overflow-x-hidden">
                                    {compressFileName(action.file_name)}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    ({formatFileSize(action.file_size)})
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 items-center justify-center">
                            {action.is_error ? (
                                <Badge variant="destructive" className="h-7 flex gap-2">
                                    <span>Error Converting/Extracting File</span>
                                    <OctagonAlert strokeWidth={iconStrokeWidth}/>
                                </Badge>
                            ) : action.is_extracting ? (
                                <Badge variant="default" className="h-7 flex gap-2">
                                    <span>Analysing File</span>
                                    <span className="animate-spin">
                                        <LoaderPinwheel strokeWidth={iconStrokeWidth}/>
                                    </span>
                                </Badge>
                            ) : (
                                <Badge variant="default" className="h-7 flex gap-2 bg-green-500">
                                    <span>Analysis Done</span>
                                </Badge>
                            )}

                            {action.is_extracted ? (
                                <Drawer onClose={() => deselectAllThumbnails()}>
                                    <DrawerTrigger>
                                        <div className="cursor-pointer rounded-full hover:bg-muted h-10 w-10 flex items-center justify-center" onClick={() => setSelectedFile(action.file_name)}>
                                            <CircleChevronDown strokeWidth={iconStrokeWidth}/>
                                        </div>
                                    </DrawerTrigger>
                                    <DrawerContent>
                                        <div className="flex justify-center w-full">
                                            <div className="flex items-center justify-between w-[90%] py-5">
                                                <DrawerHeader>
                                                    <DrawerTitle className= "flex justify-left capitalize">{action.file_name}</DrawerTitle>
                                                    <DrawerDescription className= "flex items-left capitalize">Select the frames you need to extract</DrawerDescription>                                            
                                                </DrawerHeader> 
                                                {/* Select/Deselect All Button */}
                                                <Button onClick={areAllSelected ? deselectAllThumbnails : selectAllThumbnails}>
                                                  {areAllSelected ? 'Deselect All' : 'Select All'}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center w-full">
                                            {/* Scrollable, Scalable Thumbnail Grid */}
                                            <div className="w-[90%] overflow-y-auto max-h-150 border-2 rounded-lg">
                                                <div className="p-5 w-full">
                                                    <div className="inline-flex gap-1" >
                                                      {selectedFile &&
                                                        image_Thumbnails[selectedFile]?.map((thumbnail, idx) => {
                                                            const aspectRatio = Math.max(thumbnail.width / thumbnail.height, 0.1);                                                            
                                                            const containerHeight = thumbnailScale; // Standard container height in pixels
                                                            const containerWidth = containerHeight * aspectRatio;
                                                            const thumbnailId = `${selectedFile}-${idx}`;
                                                            //console.log("width: " + containerWidth + " height: " + containerHeight);

                                                            //Get the corresponding URL from imageThumbnailURLs
                                                            const thumbnailUrl = imageThumbnailURLs[selectedFile][idx];
                                                            if (!thumbnailUrl) {
                                                                return (<div key={`placeholder-${thumbnailId}`} className="w-full h-full bg-gray-200 animate-pulse" />);
                                                            }

                                                            return(
                                                            <div key={thumbnailId} className="relative border border-gray-300 rounded-lg overflow-hidden" style={{ width: containerWidth, height: containerHeight }}>
                                                            
                                                            <div className="absolute top-1 right-1 z-10 cursor-pointer">
                                                                <Checkbox className="bg-white" checked={selectedThumbnails.includes(idx)} onCheckedChange={() => toggleThumbnailSelection(idx)}/>                                                                
                                                            </div>
                                                            
                                                            
                                                            <Image src={thumbnailUrl} alt={`Thumbnail ${idx + 1}`} fill={true} className="object-cover" loading= "lazy"/>
                                                            
                                                            
                                                            </div>
                                                        )})
                                                      }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-center w-full py-5">                                         
                                            <DrawerFooter className="w-[90%] flex flex-row p-0 md:flex-row justify-between space-y-4 md:space-y-0">
                                                <div className="flex justify-start md:w-auto">
                                                <DrawerClose asChild>
                                                    <Button variant="outline">Close</Button>
                                                </DrawerClose>
                                                </div>
                                                <div className="flex justify-center align-middle">
                                                    {selectedFile !== null && (
                                                    <span className="text-opacity-40 items-center">
                                                        {`${selectedThumbnails.length} frames selected/`}{image_Thumbnails[selectedFile]?.length === 1 ? "1 frame" : `${image_Thumbnails[selectedFile]?.length} frames`}</span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 md:w-auto">

                                                    <Button variant="default" 
                                                        disabled={selectedThumbnails.length === 0 || downloadProgress > 0}
                                                        onClick={() => {
                                                            if (selectedFile) {
                                                                handleDownload(selectedThumbnails, imageThumbnailURLs, selectedFile, true);
                                                            }
                                                            }}>
                                                            {downloadProgress > 0 ? `Creating GIF... ${Math.round(downloadProgress)}%` : "Download As .GIF"}
                                                    </Button>


                                                    <Button variant="default" 
                                                        disabled={selectedThumbnails.length === 0 || downloadProgress > 0 || !selectedFile}
                                                        onClick={() => {
                                                            if (selectedFile) {
                                                                handleDownload(selectedThumbnails, imageThumbnailURLs, selectedFile, false);
                                                            }
                                                            }}>
                                                            {downloadProgress > 0 ? ( 
                                                                <div className="flex items-center gap-2">
                                                                    <Progress value={downloadProgress} className="w-full h-full" />                                                  
                                                                    <span>Downloading... {Math.round(downloadProgress)}%</span>
                                                                    
                                                                </div>
                                                            ) : ( "Download As .PNG" )} 
                                                    </Button>
                                                    
                                                </div>
                                            </DrawerFooter>

                                        </div>
                                    </DrawerContent>
                                </Drawer>
                            ) : (
                                <div className="cursor-progress rounded-full muted h-10 w-10 flex items-center justify-center">

                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 items-center justify-end">
                            <Button onClick={() => deleteFile(action)} variant="destructive" className="rounded-full h-10 w-10 ">
                                <div className="cursor-pointer rounded-full   flex items-center justify-center">
                                    <Trash2 strokeWidth="1.7" color="#ffffff"/>
                                </div>
                            </Button>
                        </div>

                    </div>
                );
            })}
            </div>

            
        );

    }
    

    return (
        
        <ReactDropzone
        onDropAccepted={handleUpload}
        onDragEnter={handleHover}
        onDragLeave={handleExitHover}
        accept={accepted_files}
        
        onDropRejected={() => {handleExitHover();
            toast({variant: "destructive", title: "Upload Rejected", description: "You've tried to upload files that are not .heic and .heif.", duration: 5000});
        }}
        onError={() => {handleExitHover();
            toast({variant: "destructive", title:"Upload Error", description:"Only .heic and .heif files are allowed. " , duration: 5000});
        }}>

            
            
            {({getRootProps, getInputProps }) => (
                <BackgroundGradient className="rounded-[40px] p-4 sm:p-10 bg-white dark:bg-zinc-900 opacity-70">
                <div {...getRootProps()} className="bg-background h-72 lg:h-80 xl:h-96 rounded-[40px] shadow-sm border-secondary border-2 border-dashed cursor-pointer flex items-center justify-center opacity-70">
                    <input {...getInputProps()} />
                    
                    <div className="space-y-4 text-foreground">
                        {is_hover ? (
                            <>
                                <div className="justify-center flex text-6xl">
                                    <CloudUpload color={iconColor} size={iconSize} strokeWidth={iconStrokeWidth}/>
                                </div>
                                <h3 className="text-center font-medium text-2xl">
                                    Yes, right there
                                </h3>
                            </>
                        ) : (
                            <>
                                <div className="justify-center flex text-6xl">
                                    <ImageUp color={iconColor} size={iconSize} strokeWidth={iconStrokeWidth}/>
                                </div>
                                <h3>
                                    Click, or drop your files here
                                </h3>
                            </>
                        )}
                    </div>
                    
                </div>
                </BackgroundGradient>

            
            )}
        </ReactDropzone>
        
    );
}

