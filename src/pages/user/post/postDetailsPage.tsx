import { useParams, Link } from "react-router-dom";
import { useGetPostById } from "../../../hooks/usePost";
import TextBlock from "../../../components/block/textBlock";
import ImageBlock from "../../../components/block/imageBlock";
import { EBlockType } from "../../../types/block";
import ResponsiveGridLayout from "../../../components/responsiveGridLayout/responsiveGridLayout";

const PostDetailsPage = () => {
	const { id } = useParams();
	const postId = Number(id ?? 0);

	const { data: post, isLoading, isError, error } = useGetPostById(postId);

	if (!id || Number.isNaN(postId)) {
		return <div className="p-6">Invalid post id</div>;
	}

	if (isLoading) return <div className="p-6">Loading...</div>;
	if (isError) return <div className="p-6">Error loading post: {String(error)}</div>;

	if (!post) return <div className="p-6">Post not found</div>;

	// Blocks from backend include layout info: x, y, width, height
	const blocks = post.blocks || [];

	// Map blocks to react-grid-layout `layout` items
	const layout = blocks.map((b, index) => ({
		i: String(index),
		x: Math.max(0, Math.floor(b.x)),
		y: Math.max(0, Math.floor(b.y)),
		w: Math.max(1, Math.floor(b.width)),
		h: Math.max(1, Math.floor(b.height)),
	}));

	return (
		<article className="max-w-5xl mx-auto p-10">
			<header className="mb-6">
				<h1 className="text-3xl font-bold mb-2">{post.title}</h1>
				<div className="text-sm text-gray-500 mb-4">
					Bởi <Link to="#" className="font-medium">{post.author.username}</Link> · {new Date(post.createdAt).toLocaleString()}
				</div>
				{post.thumbnailUrl && (
					<div className="mb-4">
						<img src={post.thumbnailUrl} alt={post.title} className="w-full rounded-lg" />
					</div>
				)}
				{post.shortDescription && (
					<p className="text-lg text-gray-700 mb-4">{post.shortDescription}</p>
				)}
				{post.hashtags && post.hashtags.length > 0 && (
					<div className="mb-4">
						{post.hashtags.map((h) => (
							<span key={h.id} className="mr-2 text-sm text-[#F295B6]">#{h.name}</span>
						))}
					</div>
				)}
			</header>

			<section className="mb-8">
				{blocks.length === 0 && (
					<div className="text-gray-500">Không có nội dung.</div>
				)}

				{blocks.length > 0 && (
					<ResponsiveGridLayout
						layout={layout}
						cols={16}
						rowHeight={40}
						isDraggable={false}
						isResizable={false}
						measureBeforeMount={true}
						useCSSTransforms={true}
						margin={[20, 20]}
						containerPadding={[0, 0]}
						preventCollision={true}
					>
						{blocks.map((block, idx) => {
							const key = String(idx);

							return (
								<div key={key} data-grid={layout[idx]} className="rounded overflow-hidden bg-white shadow-sm">
									<div className="p-4 h-full">
										{block.type === EBlockType.TEXT ? (
											<TextBlock id={key} content={block.content} />
										) : block.type === EBlockType.IMAGE ? (
											<ImageBlock id={key} imageUrl={block.content} caption={undefined} objectFit={"cover"} />
										) : (
											<div className="p-4">
												<pre className="whitespace-pre-wrap">{String(block.content)}</pre>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</ResponsiveGridLayout>
				)}
			</section>
		</article>
	);
};

export default PostDetailsPage;
