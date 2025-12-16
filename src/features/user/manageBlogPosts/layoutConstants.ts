export const GRID_SETTINGS = {
  cols: 16,
  rowHeight: 20, // Reduced for better precision
  width: 800,
  defaultItem: { w: 8, h: 8 },
  margin: [8, 8] as [number, number],
};

export const TITLE_SX = {
  fontSize: "48px",
  fontWeight: "bold",
  fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
};

export const SHORT_DESC_SX = {
  fontSize: "18px",
  fontStyle: "italic",
  marginTop: "12px",
  color: "#8c1d35",
  fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
};

export const BLOCK_WRAPPER = {
  base: "border-dashed border-2 rounded-lg border-gray-300 relative",
  readMode: "border-transparent",
  ctrlPressed: "cursor-move border-pink-400 select-none",
  default: "cursor-default",
};

export const BUTTON_STYLE_PRIMARY = {
  backgroundColor: "#F295B6",
  color: "white",
  fontWeight: 600,
};

export const BUTTON_STYLE_OUTLINE = {
  color: "#F295B6",
  border: "2px solid #F295B6",
  fontWeight: 600,
};

export default {
  GRID_SETTINGS,
  TITLE_SX,
  SHORT_DESC_SX,
  BLOCK_WRAPPER,
  BUTTON_STYLE_PRIMARY,
  BUTTON_STYLE_OUTLINE,
};
