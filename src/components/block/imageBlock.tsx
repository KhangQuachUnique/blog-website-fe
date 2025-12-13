import { ObjectFitType } from "../../types/block";

interface ImageBlockProps {
  id: string;
  imageUrl?: string;
  imageCaption?: string;
  objectFit?: ObjectFitType;
}

const ImageBlock = ({
  id,
  imageUrl,
  imageCaption,
  objectFit = ObjectFitType.COVER,
}: ImageBlockProps) => {
  if (!imageUrl) {
    return (
      <div
        id={id}
        className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg"
      >
        <div className="text-gray-400 text-sm">Không có ảnh</div>
      </div>
    );
  }

  return (
    <figure id={id} className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={imageCaption || "Blog image"}
          className="w-full h-full"
          style={{
            objectFit: objectFit.toLowerCase() as "contain" | "cover" | "fill",
          }}
          loading="lazy"
        />
      </div>
      {imageCaption && (
        <figcaption className="mt-2 text-sm text-gray-600 italic text-center">
          {imageCaption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageBlock;
