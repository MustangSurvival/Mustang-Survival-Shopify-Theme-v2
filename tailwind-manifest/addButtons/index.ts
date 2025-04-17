import { consoleError, rem } from "../utils";
import {
  SizingSchemaType,
  SizingSchema,
  TypeSchema,
  TypeSchemaType,
} from "./schema";
import type { PluginAPI } from "tailwindcss/types/config";
import { get } from "lodash";
import { ManifestKeys, ScreenSizeMapping } from "../enums";
import { FontFamilyMapping } from "../types";
import { getCSSRuleObjectForVariant } from "../addTypography/utils";

const addButtonComponents = (
  pluginAPI: PluginAPI,
  config: SizingSchemaType,
  typeConfig: TypeSchemaType,
  fontMapping?: FontFamilyMapping,
  buttonTypename: "body" | "utility" = "body",
  fluidTypography: boolean | "LIMITED_DESKTOP" = true
) => {
  const paddingInline = get(config, "padding-left-right");
  const paddingBlock = get(config, "padding-top-bottom");
  const gap = get(config, "gap");
  const height = get(config, "height");
  const iconSize = get(config, "icon-size");
  const borderRadius = get(config, "radius");
  const fontConfig = getCSSRuleObjectForVariant(
    typeConfig[buttonTypename].sm,
    typeConfig[buttonTypename].lg,
    fontMapping,
    false,
    fluidTypography
  );

  const baseButtonStyles = {
    "min-width": "var(--button-min-width, 160px)",
    "padding-block": paddingBlock
      ? rem(paddingBlock.mobile)
      : `var(--button-padding-block, 10px)`,
    "padding-inline": paddingInline
      ? rem(paddingInline.mobile)
      : "var(--button-padding-inline, 20px)",
    borderRadius: `${
      borderRadius ? rem(borderRadius.mobile) : "var(--button-radius, 4px)"
    }`,
    height: `${height ? rem(height.mobile) : "var(--button-height, 40px)"}`,
    whiteSpace: "nowrap",

    [`@screen ${ScreenSizeMapping.desktop}`]: {
      ...(paddingBlock && {
        "padding-block": rem(paddingBlock.desktop),
      }),
      ...(paddingInline && {
        "padding-inline": rem(paddingInline.desktop),
      }),
      ...(borderRadius && { borderRadius: rem(borderRadius.desktop) }),
      ...(height && { height: rem(height.desktop) }),
    },
  };

  const buttonConfig = {
    ".btn": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "none",
      gap: `${gap ? rem(gap.mobile) : "var(--button-gap, 10px)"}`,
      transitionProperty: "background-color, color",
      transitionDuration: "theme(transitionDuration.150)",
      transitionTimingFunction: "ease-in-out",
      ["&:hover, &:focus, &:focus-within, &:focus-visible"]: {
        textDecoration: "none",
      },

      "--icon-size": `${
        iconSize ? rem(iconSize.mobile) : "var(--button-icon-size, 10px)"
      }`,
      ...fontConfig,

      [`& > svg, & > .icon, & > img`]: {
        width: "var(--icon-size)",
        height: "var(--icon-size)",
        color: "currentColor",
      },

      ["&:disabled, &.disabled"]: {
        pointerEvents: "none",
      },

      "&[variant='primary']": {
        ...baseButtonStyles,
        backgroundColor: "theme(colors.t-brand-primary)",
        color: "theme(colors.t-background)",

        "&:hover": {
          backgroundColor: "theme(colors.t-brand-secondary)",
          color: "theme(colors.t-foreground)",
        },

        ["&:disabled, &.disabled"]: {
          backgroundColor: "theme(colors.t-disabled)",
        },

        ["&:focus, &:focus-within, &:focus-visible"]: {
          outlineColor: "theme(colors.u-focus)",
        },
      },

      "&[variant='secondary']": {
        ...baseButtonStyles,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "theme(colors.t-foreground)",
        color: "theme(colors.t-foreground)",

        "&:hover": {
          backgroundColor: "theme(colors.t-foreground)",
          color: "theme(colors.t-background)",
        },

        ["&:disabled, &.disabled"]: {
          color: "theme(colors.t-disabled)",
          borderColor: "theme(colors.t-disabled)",
        },
      },

      "&[variant='tertiary']": {
        color: "theme(colors.t-foreground)",
        borderBottomWidth: "2px",
        borderBottomStyle: "solid",
        borderColor: "theme(colors.t-foreground)",
        paddingBlockEnd: "theme(spacing.sm-2xs)",
        width: "fit-content",
        lineHeight: 1,

        [`@screen ${ScreenSizeMapping.desktop}`]: {
          paddingBlockEnd: "theme(spacing.lg-2xs)",
        },

        ["&:hover, &[active]"]: {
          color: "theme(colors.t-foreground)",
          borderColor: "theme(colors.t-brand-primary)",
        },

        ["&:disabled, &.disabled"]: {
          color: "theme(colors.t-disabled)",
          borderColor: "theme(colors.t-disabled)",
        },
      },

      [`@screen ${ScreenSizeMapping.desktop}`]: {
        ...get(fontConfig, `@screen ${ScreenSizeMapping.desktop}`, {}),
        ...(gap && { gap: rem(gap.desktop) }),
        ...(iconSize && { "--icon-size": rem(iconSize.desktop) }),
      },
    },
  };
  pluginAPI.addComponents(buttonConfig);
  pluginAPI.addBase({
    a: {
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline",
        color: 'theme("colors.p-dark")',
      },
    },
  });
};

const handler = (
  pluginAPI: PluginAPI,
  manifest: any,
  fontMapping?: FontFamilyMapping,
  buttonTypename: "body" | "utility" = "body",
  fluidTypography: boolean | "LIMITED_DESKTOP" = true
) => {
  const buttonSpacing = SizingSchema.safeParse(manifest[ManifestKeys.Sizing]);
  const typographyBase = TypeSchema.safeParse(
    manifest[ManifestKeys.Typography]
  );

  if (buttonSpacing.success && typographyBase.success) {
    addButtonComponents(
      pluginAPI,
      buttonSpacing.data,
      typographyBase.data,
      fontMapping,
      buttonTypename,
      fluidTypography
    );
  } else {
    !buttonSpacing.success &&
      consoleError(
        buttonSpacing.error.message,
        "Manifest Button Sizings Invalid or Missing"
      );

    !typographyBase.success &&
      consoleError(
        typographyBase.error.message,
        "Manifest Typography Invalid or Missing"
      );
  }
  // addButtonComponents(config, manifest);
};

export default handler;