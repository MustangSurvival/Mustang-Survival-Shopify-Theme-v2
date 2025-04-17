import { z } from "zod";
import { kebabCase } from "lodash";
import {
  schema as BaseTypographySchema,
  TextCSSRuleSchema,
} from "../addTypography/schemas";
import { flattenTypeSection } from "../addTypography/utils";
import { ScreenSizeMapping } from "../enums";

const ResponsiveValuesSchema = z.object({
  desktop: z.number().or(z.string()),
  mobile: z.number().or(z.string()),
});

const ResponsiveValuesSchemaNumber = z.object({
  desktop: z.number(),
  mobile: z.number(),
});

export const BaseSpacingSchema = z
  .record(z.string(), ResponsiveValuesSchema)
  .transform((data) => {
    return Object.fromEntries(
      Object.entries(data)
        .filter(([_, value]) => typeof value.mobile !== "string")
        .filter(([key]) => key.startsWith("Inputs/Button/"))
    );
  })
  .pipe(
    z.record(z.string().startsWith("Inputs/Button/"), ResponsiveValuesSchema)
  )
  .transform((data) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        kebabCase(key.replace("Inputs/Button/", "").replace(/\s/g, "")),
        value,
      ])
    );
  })
  .pipe(
    z.object({
      "padding-left-right": ResponsiveValuesSchemaNumber.optional(),
      "padding-top-bottom": ResponsiveValuesSchemaNumber.optional(),
      gap: ResponsiveValuesSchemaNumber.optional(),
      "icon-size": ResponsiveValuesSchemaNumber.optional(),
      radius: ResponsiveValuesSchemaNumber.optional(),
      height: ResponsiveValuesSchemaNumber.optional(),
    })
  );

export const SizingSchema = BaseSpacingSchema;
export type SizingSchemaType = z.infer<typeof SizingSchema>;

export const TypeSchema = BaseTypographySchema.transform(
  flattenTypeSection
).pipe(
  z.object({
    body: z.object({
      [ScreenSizeMapping.mobile]: TextCSSRuleSchema,
      [ScreenSizeMapping.desktop]: TextCSSRuleSchema,
    }),
    utility: z.object({
      [ScreenSizeMapping.mobile]: TextCSSRuleSchema,
      [ScreenSizeMapping.desktop]: TextCSSRuleSchema,
    }),
  })
);

export type TypeSchemaType = z.infer<typeof TypeSchema>;
