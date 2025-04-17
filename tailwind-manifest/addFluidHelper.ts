import { getFluidSize } from "./utils";
import type { PluginAPI } from "tailwindcss/types/config";

const generateFluidHandlerForProperty = (
  property: string | string[],
  fluidTypography: boolean | "LIMITED_DESKTOP" = true
) => {
  return (value: string) => {
    const [mobileSize, desktopSize] = value
      .split("|")
      .filter(Boolean)
      .map(Number);
    if (
      !mobileSize ||
      !desktopSize ||
      isNaN(mobileSize) ||
      isNaN(desktopSize)
    ) {
      return null;
    }

    if (Array.isArray(property)) {
      return property.reduce((acc, prop) => {
        return {
          ...acc,
          [prop]: getFluidSize(mobileSize, desktopSize, fluidTypography),
        };
      }, {});
    }

    return {
      [property]: getFluidSize(mobileSize, desktopSize, fluidTypography),
    };
  };
};

export const handler = (
  pluginAPI: PluginAPI,
  fluidTypography: boolean | "LIMITED_DESKTOP" = true
) => {
  // Dybanic Fluid Value support
  pluginAPI.matchComponents({
    "fluid-text": generateFluidHandlerForProperty("fontSize", fluidTypography),
    "fluid-line-height": generateFluidHandlerForProperty(
      "lineHeight",
      fluidTypography
    ),
    "fluid-gap": generateFluidHandlerForProperty("gap", fluidTypography),
    "fluid-pl": generateFluidHandlerForProperty("paddingLeft", fluidTypography),
    "fluid-pr": generateFluidHandlerForProperty(
      "paddingRight",
      fluidTypography
    ),
    "fluid-pb": generateFluidHandlerForProperty(
      "paddingBottom",
      fluidTypography
    ),
    "fluid-pt": generateFluidHandlerForProperty("paddingTop", fluidTypography),
    "fluid-ml": generateFluidHandlerForProperty("marginLeft", fluidTypography),
    "fluid-mr": generateFluidHandlerForProperty("marginRight", fluidTypography),
    "fluid-mb": generateFluidHandlerForProperty(
      "marginBottom",
      fluidTypography
    ),
    "fluid-mt": generateFluidHandlerForProperty("marginTop", fluidTypography),
    "fluid-inset": generateFluidHandlerForProperty("inset", fluidTypography),
    "fluid-top": generateFluidHandlerForProperty("top", fluidTypography),
    "fluid-right": generateFluidHandlerForProperty("right", fluidTypography),
    "fluid-bottom": generateFluidHandlerForProperty("bottom", fluidTypography),
    "fluid-left": generateFluidHandlerForProperty("left", fluidTypography),
    "fluid-size": generateFluidHandlerForProperty(
      ["width", "height"],
      fluidTypography
    ),
    "fluid-w": generateFluidHandlerForProperty("width", fluidTypography),
    "fluid-h": generateFluidHandlerForProperty("height", fluidTypography),
  });
};

export default handler;
