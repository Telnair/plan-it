import { useEffect, useState } from 'react';
import { Image as KonvaImage, Layer } from 'react-konva';

interface Props {
  src: string | null;
  canvasWidth: number;
  canvasHeight: number;
}

export function BackgroundLayer({ src, canvasWidth, canvasHeight }: Props) {
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
  const scale = Math.min(scaleX, scaleY);
  const x = (canvasWidth - img.width * scale) / 2;
  const y = (canvasHeight - img.height * scale) / 2;

  return (
    <Layer listening={false}>
      <KonvaImage
        image={img}
        x={x}
        y={y}
        width={img.width * scale}
        height={img.height * scale}
        opacity={0.5}
      />
    </Layer>
  );
}
