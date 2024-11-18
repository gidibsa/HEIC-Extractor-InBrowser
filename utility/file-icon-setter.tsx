//imports

import { Images } from 'lucide-react';
import { Image } from 'lucide-react';

export default function fileIconSetter(images_count: number): any {
    const iconStrokeWidth: number = 0.9;
    const iconSize:number = 40;
    const iconColor: string = "#3e9392";

    if (images_count > 1) return <Images color={iconColor} size={iconSize} strokeWidth={iconStrokeWidth}/>;
    else return <Image color={iconColor} size={iconSize} strokeWidth={iconStrokeWidth}/>;
}