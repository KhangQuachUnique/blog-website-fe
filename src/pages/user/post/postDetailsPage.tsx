import { useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useGetPostById } from "../../../hooks/usePost";
import TextBlock from "../../../components/block/textBlock";
import ImageBlock from "../../../components/block/imageBlock";
import { EBlockType } from "../../../types/block";
import GridLayout from "react-grid-layout";

const PostDetailsPage = () => {
	const { id } = useParams();
	const postId = Number(id ?? 0);
	const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "vừa xong";
    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
    // return date.toLocaleDateString("vi-VN");
  };

	const { data: post, isLoading, isError, error } = useGetPostById(postId);

	// Measure container width so ResponsiveGridLayout width prop matches real size
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [containerWidth, setContainerWidth] = useState<number>(800);

	useEffect(() => {
		if (!containerRef.current) return;

		// initialize
		setContainerWidth(containerRef.current.clientWidth || 800);

		// use ResizeObserver when available (access via window to avoid TS 'new' errors)
		let ro: any = null;
		const ROCtor = (window as any).ResizeObserver;
		if (typeof ROCtor !== "undefined" && ROCtor) {
			ro = new ROCtor((entries: any) => {
				const w = entries[0]?.contentRect?.width;
				if (w) setContainerWidth(Math.round(w));
			});
			ro.observe(containerRef.current);
		} else {
			const onResize = () => {
				if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
			};
			window.addEventListener("resize", onResize);
			onResize();
			return () => window.removeEventListener("resize", onResize);
		}

		return () => {
			if (ro) ro.disconnect();
		};
	}, []);

	if (!id || Number.isNaN(postId)) {
		return <div className="p-6">Invalid post id</div>;
	}

	if (isLoading) return <div className="p-6">Loading...</div>;
	if (isError) return <div className="p-6">Error loading post: {String(error)}</div>;

	if (!post) return <div className="p-6">Post not found</div>;

	// Blocks from backend include layout info: x, y, width, height
	const blocks = post.blocks || [];

	// Grid configuration (keep in sync with editor)
	const COLS = 16;


	// Map blocks to react-grid-layout `layout` items using stable ids and clamped values
	const layout = blocks.map((b) => {
		const rawX = Math.floor(b.x);
		const rawW = Math.floor(b.width);

		const x = Math.max(0, Math.min(rawX, COLS - 1));
		const wClamped = Math.max(1, Math.min(rawW, COLS));

		// ensure x + w <= COLS
		const w = x + wClamped > COLS ? Math.max(1, COLS - x) : wClamped;

		return {
			i: String(b.id),
			x,
			y: Math.max(0, Math.floor(b.y)),
			w,
			h: Math.max(1, Math.floor(b.height)),
		};
	});

	// Normalize layout to avoid overlaps: simple greedy placer that shifts colliding items down
	const normalizeLayout = (items: { i: string; x: number; y: number; w: number; h: number }[]) => {
		// clone and sort by y then x
		const out = items.map((it) => ({ ...it }));
		out.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));

		const placed: typeof out = [];

		const collides = (a: any, b: any) => {
			if (a.i === b.i) return false;
			return !(a.x + a.w <= b.x || a.x >= b.x + b.w || a.y + a.h <= b.y || a.y >= b.y + b.h);
		};

		for (const item of out) {
			let y = item.y;
			let placedItem = { ...item, y };
			let tries = 0;
			while (true) {
				const collision = placed.find((p) => collides(placedItem, p));
				if (!collision) break;
				// move below the colliding item
				placedItem.y = collision.y + collision.h;
				tries++;
				if (tries > 1000) break;
			}
			placed.push(placedItem);
		}

		// keep original order mapping
		return placed;
	};

	// const normalizedLayout = normalizeLayout(layout).map((it) => ({ ...it }));

	return (
		<article className="max-w-5xl mx-auto p-10">
			<header className="mb-6">
				<h1 className="text-3xl font-bold mb-2">{post.title}</h1>
					<div className="text-sm text-gray-500 mb-4">
						Bởi <Link to="#" className="font-medium">{post.author?.username ?? "Người dùng"}</Link> · {formatDate(String(post.createdAt))}
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
					<div className="w-[800px] mx-auto" ref={containerRef}>
							<GridLayout
								layout={layout}
								cols={16}
								rowHeight={30}
								width={containerWidth}
								isDraggable={false}
								isResizable={false}
								draggableCancel=".rgl-no-drag"
								isDroppable={false}
								compactType={null}
								margin={[20,20]}
								containerPadding={[0,0]}
							>
								{blocks.map((block) => (
									<div
										key={block.id}
										className={`border-lines border-3 rounded-lg border-[#FFE4EC] relative cursor-default bg-white`}
									>
										{block.type === EBlockType.TEXT ? (
											<TextBlock id={String(block.id)} content={block.content || ""} />
										) : (
											<ImageBlock id={String(block.id)} imageUrl={block.content} caption={undefined} objectFit={(block as any).objectFit ?? "cover"} />
										)}
									</div>
								))}
							</GridLayout>
						</div>
				)}
			</section>
		</article>
	);
};

export default PostDetailsPage;
