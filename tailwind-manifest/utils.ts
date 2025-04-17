import boxen from "boxen";

export const getFluidSize = (
  mobileSize: number,
  desktopSize: number,
  fluidTypography: boolean | "LIMITED_DESKTOP",
  mobileViewport = 390,
  desktopViewport = 1440
) => {
  // const viewportRange = desktopViewport - mobileViewport;
  // const sizeRange = desktopSize - mobileSize;
  if (fluidTypography === "LIMITED_DESKTOP") {
    return `min(max( calc(${mobileSize} * 1px), calc( calc( 100vw / ${desktopViewport} ) * ${desktopSize})) , ${desktopSize}px)`;
  }

  return `max( calc(${mobileSize} * 1px), calc( calc( 100vw / ${desktopViewport} ) * ${desktopSize}))`;
  // return `max( ${mobileSize}px, calc( ${sizeRange} * (100dvw - ${mobileSize}px) / ${viewportRange} + ${mobileSize}px) )`;
};

export const percentToEm = (value: number, withUnits = true) => {
  const emValue = (value / 100).toFixed(2);
  if (withUnits) {
    return `${emValue}em`;
  }

  return Number(emValue);
};

export const consoleError = (message: string, title = "") =>
  console.log(
    boxen(message, {
      title: `Error in TW Plugin: ${title}`,
      padding: 1,
      borderColor: "red",
      margin: 1,
      borderStyle: "double",
      backgroundColor: "red",
    })
  );

export const rem = (px: number) => {
  return (parseFloat(String(px)) / 16).toFixed(4).replace(/\.?0+$/, "") + "rem";
};
