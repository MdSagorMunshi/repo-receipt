import QRCode from "qrcode";

const qrOptions = {
  margin: 0,
  width: 116,
  color: {
    dark: "#1A1814",
    light: "#FDFAF4",
  },
} as const;

export interface QrMatrix {
  size: number;
  cells: boolean[][];
}

export async function createQrPngDataUri(input: string) {
  return QRCode.toDataURL(input, qrOptions);
}

export async function createQrSvgDataUri(input: string) {
  const svg = await QRCode.toString(input, {
    ...qrOptions,
    type: "svg",
  });

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function createQrDataUri(input: string) {
  return createQrPngDataUri(input);
}

export function createQrMatrix(input: string, quietZone = 4): QrMatrix {
  const qr = QRCode.create(input, {
    errorCorrectionLevel: "M",
  });
  const { size } = qr.modules;
  const totalSize = size + quietZone * 2;
  const cells = Array.from({ length: totalSize }, (_, rowIndex) => {
    return Array.from({ length: totalSize }, (_, columnIndex) => {
      const row = rowIndex - quietZone;
      const column = columnIndex - quietZone;

      if (row < 0 || column < 0 || row >= size || column >= size) {
        return false;
      }

      return qr.modules.get(row, column) === 1;
    });
  });

  return {
    size: totalSize,
    cells,
  };
}
