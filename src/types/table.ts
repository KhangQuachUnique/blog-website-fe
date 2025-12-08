import type { ReactNode } from "react";

export interface ColumnsDef<T> {
    id: string;
    label: string;
    align?: "right" | "left" | "center";
    width?: string | number;

    accessor: keyof T;
    render?: (item: T) => ReactNode;
}