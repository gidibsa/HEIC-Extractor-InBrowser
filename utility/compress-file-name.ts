export default function compressFileName(fileName: any): string {
    //Define the maximum length for the filename
    const maxFilenameLength = 18;

    //Check if filename is longer than the maximum length
    if (fileName.length > maxFilenameLength) {
        //Extract the first  part of the filename (before the extension)
        const fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.');

        //Extract the extension from the filename
        const fileExtension = fileName.split('.').pop();

        //Calculate the length of characters to keep in the middle
        const charsToKeep = maxFilenameLength - (fileNameWithoutExtension.length + fileExtension.length + 3);

        //create the compressed filename
        const compressedFileName = fileNameWithoutExtension.substring(0, maxFilenameLength - fileExtension.length - 3) + '...' + fileNameWithoutExtension.slice(-charsToKeep) + '.' + fileExtension;

        return compressedFileName;
    }

    else {
        //If the filename is shorter than the maximum length, return as it is
        return fileName.trim();
    }

}


