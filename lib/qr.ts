import QRCode from "qrcode";

export async function createQrDataUri(input: string) {
  const svg = await QRCode.toString(input, {
    type: "svg",
    margin: 0,
    width: 116,
    color: {
      dark: "#1A1814",
      light: "#FDFAF4",
    },
  });

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
