import set from "lodash/set";
import { ScreenSizeMapping } from "../enums";
import {
  FlattenedManidestTypographySection,
  FontFamilyKey,
  FontFamilyMapping,
  FontWeightMapping,
} from "../types";
import type { ManifestTextStyle } from "./schemas";
import { kebabCase, get } from "lodash";
import { consoleError, getFluidSize, rem } from "../utils";
import { CSSRuleObject } from "tailwindcss/types/config";
import omit from "lodash/omit";

export const flattenTypeSection = (
  section: ManifestTextStyle
): FlattenedManidestTypographySection => {
  const flatSection: FlattenedManidestTypographySection = {};
  Object.entries(section).map(([key, value]) => {
    const [base, viewport] = key.toLowerCase().split("/"); // eg. Heading 1/Desktop, Heading 1/Mobile

    if (!!ScreenSizeMapping[viewport.trim()]) {
      set(
        flatSection,
        [base.trim(), ScreenSizeMapping[viewport.trim()]],
        value
      );
    } else {
      set(flatSection, [base.trim(), ScreenSizeMapping.desktop], value);
      set(flatSection, [base.trim(), ScreenSizeMapping.mobile], value);
    }
  });

  return flatSection;
};

export const getFontFamilyVariable = (
  fontFamily: FontFamilyKey,
  defaultValue: string = "system-ui"
): string => `var(--font-family-${kebabCase(fontFamily)}, "${defaultValue}")`;

export const getFontFamilyFromMapping = (
  manifestFontFamily: string,
  fontMapping?: FontFamilyMapping,
  asVariable = true
) => {
  if (!fontMapping) {
    return manifestFontFamily;
  }

  const currentValue: FontFamilyKey = get(
    fontMapping,
    manifestFontFamily,
    null
  );
  if (currentValue === null) {
    consoleError(
      `Font family ${manifestFontFamily} is not defined in the font mapping`
    );
    return manifestFontFamily;
  }

  return asVariable
    ? getFontFamilyVariable(currentValue, manifestFontFamily)
    : currentValue;
};

export const getFontWeightFromMapping = (
  manifestFontFamily: string,
  fontMapping?: FontFamilyMapping,
  fontNameStyle?: string | undefined,
  fontWeightMapping?: FontWeightMapping
): number | null => {
  if (!fontWeightMapping || !fontMapping || !fontNameStyle) {
    return null;
  }
  const fontFamilyLabel = getFontFamilyFromMapping(
    manifestFontFamily,
    fontMapping,
    false
  );

  const currentFamily: Record<string, number> | null = get(
    fontWeightMapping,
    fontFamilyLabel,
    null
  );

  if (currentFamily === null) {
    return null;
  }

  const currentWeight: number | null = get(currentFamily, fontNameStyle, null);
  return currentWeight;
};

export const getCSSRuleObjectForVariant = (
  mobileConfig: ManifestTextStyle,
  desktopConfig: ManifestTextStyle,
  fontMapping?: FontFamilyMapping,
  fontWeightMapping?: FontWeightMapping,
  fluidTypography: boolean | "LIMITED_DESKTOP" = true
) => {
  const mobileFontWeight = getFontWeightFromMapping(
    mobileConfig.fontFamily,
    fontMapping,
    // @ts-ignore
    mobileConfig.fontNameStyle,
    fontWeightMapping
  );

  const desktopFontWeight = getFontWeightFromMapping(
    desktopConfig.fontFamily,
    fontMapping,
    // @ts-ignore
    desktopConfig.fontNameStyle,
    fontWeightMapping
  );

  return {
    // Add Common styles
    fontSize: fluidTypography
      ? getFluidSize(
          mobileConfig.fontSize,
          desktopConfig.fontSize,
          fluidTypography
        )
      : rem(mobileConfig.fontSize),
    fontFamily: getFontFamilyFromMapping(mobileConfig.fontFamily, fontMapping),
    // Add mobile styles
    ...omit(mobileConfig, ["fontSize", "fontFamily", "fontNameStyle"]),
    ...(mobileFontWeight ? { fontWeight: mobileFontWeight } : {}),

    // Add desktop styles
    [`@screen ${ScreenSizeMapping.desktop}`]: {
      ...(!fluidTypography ? { fontSize: rem(desktopConfig.fontSize) } : {}),
      fontFamily: getFontFamilyFromMapping(
        desktopConfig.fontFamily,
        fontMapping
      ),
      ...omit(desktopConfig, ["fontSize", "fontFamily", "fontNameStyle"]),
      ...(desktopFontWeight ? { fontWeight: desktopFontWeight } : {}),
    },
  } satisfies CSSRuleObject;
};
