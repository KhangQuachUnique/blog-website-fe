export enum EBlockType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
}

export interface ICreateBlockDto {
  x: number;
  y: number;
  width: number;
  height: number;
  type: EBlockType;
  content: string;
}
