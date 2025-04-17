export enum TypeDecorationEnum {
  NONE = "NONE",
  UNDERLINE = "UNDERLINE",
  STRIKETHROUGH = "STRIKETHROUGH",
}

export enum TextDecorationToCSS {
  NONE = "none",
  UNDERLINE = "underline",
  STRIKETHROUGH = "line-through",
}

export enum TypeCaseEnum {
  ORIGINAL = "ORIGINAL",
  UPPER = "UPPER",
  LOWER = "LOWER",
  TITLE = "TITLE",
}

export enum TypeCaseToCSS {
  ORIGINAL = "none",
  UPPER = "uppercase",
  LOWER = "lowercase",
  TITLE = "capitalize",
}

export enum LineHeightUnitEnum {
  PIXELS = "PIXELS",
  PERCENT = "PERCENT",
  AUTO = "AUTO",
}

export enum LetterSpacingUnitEnum {
  PIXELS = "PIXELS",
  PERCENT = "PERCENT",
}

export enum FontStyleToWeightMapping {
  thin = 100,
  extralight = 200,
  light = 300,
  regular = 400,
  medium = 500,
  semibold = 600,
  bold = 700,
  extrabold = 800,
  black = 900,
}

export const TypographyBaseKeyToTag = {
  "heading-1": "h1",
  "heading-2": "h2",
  "heading-3": "h3",
  "heading-4": "h4",
  "heading-5": "h5",
  "heading-6": "h6",
  body: "p",
  caption: "caption",
  pullquote: "blockquote",
};
