import type { Config } from "tailwindcss";
import type { ManifestTextStyle } from "./addTypography/schemas";

export type FigmaTypography = TextStyle;
export type TypeScreenSizes<T> = {
  sm: T; // Fix the type declaration
  lg: T;
};

export type ManifestTypographySection = Record<string, FigmaTypography>;
export type FlattenedManidestTypographySection = Record<
  string,
  TypeScreenSizes<ManifestTextStyle>
>;

export type FontFamilyKey =
  | "Primary"
  | "Secondary"
  | "Tertiary"
  | "Quaternary"
  | "Quinary";
export type FontFamilyMapping = Record<string, FontFamilyKey>;
export type FontWeightMapping = Partial<
  Record<FontFamilyKey, Record<string, number>>
>;
export type ExtendedConfig = Omit<Config, "content" | "prefix">;
