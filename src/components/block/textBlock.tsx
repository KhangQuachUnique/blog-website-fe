interface TextBlockProps {
  id: string;
  content?: string; // HTML content
}

const TextBlock = ({ id, content }: TextBlockProps) => {
  return (
    <div
      id={`text-block-${id}`}
      className="text-block rgl-no-drag w-full pl-1 pr-3 pt-0 flex flex-col prose prose-lg max-w-none px-2 py-1 text-lg break-words select-text
        [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:my-4
        [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:my-3
        [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:my-2
        [&_ul]:list-disc [&_ul]:ml-6
        [&_ol]:list-decimal [&_ol]:ml-6
        [&_li]:my-1
        [&_a]:text-[#F295B6] [&_a]:underline
        [&_strong]:font-bold
        [&_em]:italic
        [&_u]:underline
        [&_blockquote]:border-l-4 [&_blockquote]:border-[#F295B6] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
        [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto
        [&_code]:font-mono [&_code]:text-sm"
      dangerouslySetInnerHTML={{ __html: content || "" }}
    />
  );
};

export default TextBlock;
