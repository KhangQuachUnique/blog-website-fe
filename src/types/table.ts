import type { ReactNode } from "react";

/**
 * Generic table row interface - any data type must have at minimum an `id` field
 */
export interface ITableRow {
  id: number | string;
}

/**
 * Column configuration for GenericTable
 */
export interface TableColumn<T extends ITableRow> {
  id: keyof T;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  searchable?: boolean;
  render?: (row: T) => ReactNode;
}

/**
 * Action configuration for GenericTable
 */
export interface TableAction<T extends ITableRow> {
  id: string;
  label?: string;
  icon?: string | ((row: T) => ReactNode);
  tooltip?: string;
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  onClick: (row: T) => void | Promise<void>;
}

/**
 * Action Column configuration for GenericTable - Multiple action columns support
 */
export interface ActionColumn<T extends ITableRow> {
  id: string;
  label?: string;
  width?: string;
  align?: "left" | "center" | "right";
  actions: TableAction<T>[];
}

/**
 * Bloogie theme color palette for tables
 */
export const BLOOGIE_COLORS = {
  primary: "#6E344D",
  accent: "#FFECF7",
  background: "#ffffff",
  backgroundAlt: "#fffbfc",
  backgroundHover: "#faf5f7",
  text: "#111827",
  textSecondary: "#4b5563",
  border: "#cbd5e1",
  statusActive: {
    bg: "#ecfdf5",
    border: "#a7f3d0",
    text: "#059669",
    badge: "#d1fae5",
  },
  statusHidden: {
    bg: "#f8fafc",
    border: "#cbd5e1",
    text: "#475569",
    badge: "#e2e8f0",
  },
  statusDraft: {
    bg: "#fffbeb",
    border: "#fde68a",
    text: "#b45309",
    badge: "#fef3c7",
  },
} as const;
