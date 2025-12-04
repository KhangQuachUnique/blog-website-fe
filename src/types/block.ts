export const EBlockType = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
} as const;

export type EBlockType = (typeof EBlockType)[keyof typeof EBlockType];

export interface ICreateBlockDto {
  x: number;
  y: number;
  width: number;
  height: number;
  type: EBlockType;
  content: string;
}
