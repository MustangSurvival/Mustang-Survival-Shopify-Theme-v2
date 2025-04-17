import { z } from "zod";
import { getFluidSize, rem } from "../utils";
import { ScreenSizeMapping } from "../enums";
import { kebabCase } from "lodash";

const ResponsiveValuesSchema = z.object({
  desktop: z.number().or(z.string()),
  mobile: z.number().or(z.string()),
});

export const BaseSpacingSchema = z
  .record(z.string(), ResponsiveValuesSchema)
  .transform((data) => {
    return Object.fromEntries(
      Object.entries(data)
        .filter(([_, value]) => typeof value.mobile !== "string")
        .filter(
          ([key]) => key.startsWith("Space/") || key.startsWith("Inputs/")
        )
    );
  })
  .pipe(
    z.record(
      z.string().startsWith("Space/").or(z.string().startsWith("Inputs/")),
      ResponsiveValuesSchema
    )
  )
  .transform((data) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key
          .replace("Space/", "")
          .replace("Inputs/", "")
          .replace(/\s/g, "")
          .replaceAll("/", "-")
          .toLowerCase(),
        value,
      ])
    );
  })
  .pipe(
    z.record(
      z.string(),
      z.object({
        desktop: z.number(),
        mobile: z.number(),
      })
    )
  );

export const SpacingsSchema = BaseSpacingSchema.transform((data) => {
  // Sort Object keys based on the value for of value.mobile
  const sortedData = Object.fromEntries(
    Object.entries(data).sort(([, a], [, b]) => a.mobile - b.mobile)
  );

  return Object.fromEntries(
    Object.entries(sortedData).map(([key, value]) => [
      key,
      getFluidSize(value.mobile, value.desktop, true),
    ])
  );
}).pipe(z.record(z.string(), z.string()));

export const SpacingsSchemaLimitedDesktop = BaseSpacingSchema.transform(
  (data) => {
    // Sort Object keys based on the value for of value.mobile
    const sortedData = Object.fromEntries(
      Object.entries(data).sort(([, a], [, b]) => a.mobile - b.mobile)
    );

    return Object.fromEntries(
      Object.entries(sortedData).map(([key, value]) => [
        key,
        getFluidSize(value.mobile, value.desktop, "LIMITED_DESKTOP"),
      ])
    );
  }
).pipe(z.record(z.string(), z.string()));

export const StaticSpacingsSchema = BaseSpacingSchema.transform((data) => {
  // Sort Object keys based on the value for of value.mobile
  const sortedData = Object.fromEntries(
    Object.entries(data).sort(([, a], [, b]) => a.mobile - b.mobile)
  );

  return Object.fromEntries(
    Object.entries(sortedData)
      .map(([key, value]) => [
        [`${ScreenSizeMapping.mobile}-${key}`, rem(value.mobile)],
        [`${ScreenSizeMapping.desktop}-${key}`, rem(value.desktop)],
      ])
      .flat()
  );
}).pipe(z.record(z.string(), z.string()));

export const ContainerSpacingSchema = BaseSpacingSchema.pipe(
  z.object({
    pagemargin: z.object({
      desktop: z.number(),
      mobile: z.number(),
    }),
  })
);

export const ResponsiveValuesNumberSchema = z.object({
  desktop: z.number(),
  mobile: z.number(),
});

export const BorderRadiusSchema = z
  .record(z.string(), ResponsiveValuesSchema)
  .transform((data) => {
    return Object.fromEntries(
      Object.entries(data)
        .filter(([_, value]) => typeof value.mobile !== "string")
        .filter(
          ([key]) =>
            key.startsWith("Border/Radius") ||
            key.startsWith("Inputs/Forms/Radius")
        )
    );
  })
  .pipe(
    z.record(
      z
        .string()
        .startsWith("Border/Radius")
        .or(z.string().startsWith("Inputs/Forms/Radius")),
      ResponsiveValuesSchema
    )
  )
  .transform((data) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        kebabCase(
          key
            .replace("Border/Radius", "")
            .replace("Inputs/", "")
            .replace(/\s/g, "")
            .replaceAll("/", "-")
        ),
        value,
      ])
    );
  })
  .pipe(
    z.record(
      z.string(),
      z.object({
        desktop: z.number(),
        mobile: z.number(),
      })
    )
  );
