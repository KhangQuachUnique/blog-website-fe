interface TextBlockProps {
  id: string;
  content?: string; // HTML content
}

const TextBlock = ({ id, content }: TextBlockProps) => {
  return (
    <div
      id={id}
      className="prose prose-lg max-w-none p-4 text-lg [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:my-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 [&_a]:text-[#F295B6] [&_a]:underline [&_strong]:font-bold [&_em]:italic [&_u]:underline"
      dangerouslySetInnerHTML={{ __html: content || "" }}
    />
  );
};

export default TextBlock;
