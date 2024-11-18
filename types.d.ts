export type FileActions = {
    file: any;
    file_name: string;
    file_size: number;
    file_from: string;
    file_to: string | null;
    images_count: number;
    is_extracting?:boolean;
    is_extracted?: boolean;
    is_converting?: boolean;
    is_converted?: boolean;
    is_error?: boolean;
    url?: any;
    output?: any;
};

declare module 'gifenc' {
    type Format = "rgb565" | "rgb444" | "rgba4444";
    
    type QuantizeOptions = {
        format?: Format;
        oneBitAlpha?: boolean | number;
        clearAlpha?: boolean;
        clearAlphaThreshold?: number;
        clearAlphaColor?: number;
    };

    type GIFEncoderOpts = {
        auto?: boolean;
        initialCapacity?: number;
    };

    type WriteFrameOpts = {
        palette?: number[][];
        first?: boolean;
        transparent?: boolean;
        transparentIndex?: number;
        delay?: number;
        repeat?: number;
        dispose?: number;
    };

    type Encoder = {
        writeFrame: (
            index: Uint8Array,
            width: number,
            height: number,
            ops?: WriteFrameOpts,
        ) => void;
        finish: () => void;
        bytes: () => Uint8Array;
        bytesView: () => Uint8Array;
        writeHeader: () => void;
        reset: () => void;
        buffer: ArrayBuffer;
        stream: any;
    };

    export function quantize(
        rgba: Uint8Array | Uint8ClampedArray,
        maxColors: number,
        options?: QuantizeOptions,
    ): number[][];

    export function applyPalette(
        rgba: Uint8Array | Uint8ClampedArray,
        palette: number[][],
        format?: Format,
    ): Uint8Array;

    export function GIFEncoder(opts?: GIFEncoderOpts): Encoder;

    export function nearestColorIndex(
        palette: number[][],
        pixel: [number, number, number] | [number, number, number],
    ): number;

    export function nearestColorIndexWithDistance(
        palette: number[][],
        pixel: [number, number, number] | [number, number, number],
    ): [number, number];
}

