import { z } from "zod";
import {
  TypeDecorationEnum,
  TextDecorationToCSS,
  TypeCaseEnum,
  TypeCaseToCSS,
  LineHeightUnitEnum,
  LetterSpacingUnitEnum,
  FontStyleToWeightMapping,
} from "./enums";
import { percentToEm, rem } from "../utils";

const TextDecorationSchema = z
  .nativeEnum(TypeDecorationEnum)
  .default(TypeDecorationEnum.NONE)
  .transform((data) => TextDecorationToCSS[data]);

const TextCaseSchema = z
  .nativeEnum(TypeCaseEnum)
  .default(TypeCaseEnum.ORIGINAL)
  .transform((data) => TypeCaseToCSS[data]);

const LineHeightSchema = z
  .union([
    z.object({
      value: z.number(),
      unit: z.nativeEnum(LineHeightUnitEnum),
    }),
    z.object({
      unit: z.literal(LineHeightUnitEnum.AUTO),
    }),
  ])
  .transform((data) => {
    if (data.unit === LineHeightUnitEnum.PERCENT) {
      return percentToEm(data.value, false);
    }
    if (data.unit === LineHeightUnitEnum.AUTO) {
      return "inherit";
    }

    return rem(data.value);
  });

const LetterSpacingSchema = z
  .object({
    value: z.number(),
    unit: z.nativeEnum(LetterSpacingUnitEnum),
  })
  .transform((data) => {
    if (data.unit === LetterSpacingUnitEnum.PERCENT) {
      return data.value ? percentToEm(data.value) : 0;
    }

    return data.value;
  });

const FontNameStyleSchema = z.string().transform((data) => {
  const [fontWeight, textStyle] = data.toLowerCase().split(" "); // eg. Bold Italic or Regular
  const matchingSize: number | void = FontStyleToWeightMapping[fontWeight];
  return {
    fontWeight: matchingSize || 400,
    fontStyle: (textStyle || "normal") as string,
    fontNameStyle: data,
  };
});

const FontNameSchema = z
  .object({
    family: z.string().default("system-ui"),
    style: FontNameStyleSchema.default("normal"),
  })
  .transform((data) => {
    return {
      fontFamily: data.family,
      ...data.style,
    };
  });

const BaseTypeSchema = z.object({
  fontSize: z.number(),
  textCase: TextCaseSchema, // has default
  textDecoration: TextDecorationSchema, // has default
  fontName: FontNameSchema,
  letterSpacing: LetterSpacingSchema.optional(),
  lineHeight: LineHeightSchema.optional(),
  paragraphIndent: z.number().optional(),
});

export const TextCSSRuleSchema = z.object({
  fontSize: z.number(),
  textDecoration: z.string(),
  letterSpacing: z.string().or(z.number()).optional(),
  lineHeight: z.string().or(z.number()).optional(),
  textTransform: z.string().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.number().optional(),
  fontStyle: z.string().optional(),
  fontNameStyle: z.string().optional(),
});

const TextStyleSchema = BaseTypeSchema.transform(
  ({ fontName, paragraphIndent, textCase, ...data }) => ({
    ...data,
    textTransform: textCase,
    ...(fontName && { ...fontName }),
    ...(paragraphIndent && { textIndent: paragraphIndent }),
  })
).pipe(TextCSSRuleSchema);

export const schema = z.record(z.string(), TextStyleSchema);
export type ManifestTextStyle = z.infer<typeof schema> & {
  fontFamily: string;
  fontWeight: number;
};
