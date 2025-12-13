export const EBlockType = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
} as const;

export const ObjectFitType = {
  CONTAIN: "CONTAIN",
  COVER: "COVER",
  FILL: "FILL",
} as const;

export type ObjectFitType = (typeof ObjectFitType)[keyof typeof ObjectFitType];

export type EBlockType = (typeof EBlockType)[keyof typeof EBlockType];

export interface ICreateBlockDto {
  x: number;
  y: number;
  width: number;
  height: number;
  type: EBlockType;
  content: string;
  imageCaption?: string;
  objectFit?: ObjectFitType;
}

export interface IBlockResponseDto {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: EBlockType;
  content: string;
  imageCaption?: string;
  objectFit?: ObjectFitType;
}
