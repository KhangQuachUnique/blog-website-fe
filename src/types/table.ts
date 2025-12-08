import type { ReactNode } from "react";

export interface ColumnsDef<T> {
    id: string;
    label: string;
    align?: "right" | "left" | "center";
    width?: string | number;

    accessor: keyof T;
    render?: (item: T) => ReactNode;
}

// Common table-related types
export type EBlogPostStatus = 'ACTIVE' | 'HIDDEN' | 'DRAFT';

export interface BlogPost {
    id: number;
    title: string;
    status: EBlogPostStatus;
    createdAt: string;
    thumbnailUrl?: string | null;
    upVotes?: number | null;
    downVotes?: number | null;
}