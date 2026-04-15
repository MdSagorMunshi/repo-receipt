import QRCode from "qrcode";

export async function createQrDataUri(input: string) {
  return QRCode.toDataURL(input, {
    margin: 0,
    width: 116,
    color: {
      dark: "#1A1814",
      light: "#FDFAF4",
    },
  });
}
