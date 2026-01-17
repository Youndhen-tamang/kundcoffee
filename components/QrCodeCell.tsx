"use client";

import { QRCodeCanvas } from "qrcode.react";

type Props = {
  value: string;
};

export default function QRCodeCell({ value }: Props) {
  return (
    <QRCodeCanvas
      value={value}
      size={80}
      bgColor="#ffffff"
      fgColor="#000000"
      level="M"
    />
  );
}
