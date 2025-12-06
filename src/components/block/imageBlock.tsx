interface ImageBlockProps {
  id: string;
  blockId?: number; // Block ID for comments
  imageUrl?: string;
  caption?: string;
  objectFit?: "contain" | "cover" | "fill";
  onClick?: (blockId: number, imageUrl: string) => void; // Callback when image clicked
}

const ImageBlock = ({
  id,
  blockId,
  imageUrl,
  caption,
  objectFit = "cover",
  onClick,
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

  const handleClick = () => {
    if (onClick && blockId && imageUrl) {
      onClick(blockId, imageUrl);
    }
  };

  return (
    <figure id={id} className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={caption || "Blog image"}
          className={`w-full h-full ${onClick && blockId ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
          style={{ objectFit }}
          loading="lazy"
          onClick={handleClick}
          role={onClick && blockId ? 'button' : undefined}
          tabIndex={onClick && blockId ? 0 : undefined}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onClick && blockId) {
              handleClick();
            }
          }}
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
