interface ImageBlockProps {
  id: string;
  imageUrl?: string;
  caption?: string;
  objectFit?: "contain" | "cover" | "fill";
}

const ImageBlock = ({
  id,
  imageUrl,
  caption,
  objectFit = "cover",
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
          alt={caption || "Blog image"}
          className="w-full h-full"
          style={{ objectFit }}
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 italic text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageBlock;
