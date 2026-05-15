import { useEffect, useState } from 'react';
import { Image as KonvaImage, Layer } from 'react-konva';

interface Props {
  src: string | null;
  canvasWidth: number;
  canvasHeight: number;
  opacity?: number;
  sizeScale?: number;
}

export function BackgroundLayer({ src, canvasWidth, canvasHeight, opacity = 0.5, sizeScale = 1 }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) { setImg(null); return; }
    const image = new window.Image();
    image.onload = () => setImg(image);
    image.src = src;
  }, [src]);

  if (!img) return null;

  const scaleX = canvasWidth / img.width;
  const scaleY = canvasHeight / img.height;
  const fitScale = Math.min(scaleX, scaleY) * sizeScale;
  const x = (canvasWidth - img.width * fitScale) / 2;
  const y = (canvasHeight - img.height * fitScale) / 2;

  return (
    <Layer listening={false}>
      <KonvaImage
        image={img}
        x={x}
        y={y}
        width={img.width * fitScale}
        height={img.height * fitScale}
        opacity={opacity}
      />
    </Layer>
  );
}
