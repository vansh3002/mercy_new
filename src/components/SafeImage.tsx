"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { ProductPlaceholder } from "./ProductPlaceholder";

type Props = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined;
  alt: string;
  title: string;
  rounded?: string;
  fallbackClassName?: string;
};

export function SafeImage({
  src,
  alt,
  title,
  rounded = "",
  fallbackClassName = "",
  className = "",
  ...rest
}: Props) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <ProductPlaceholder
        title={title}
        className={`${fallbackClassName} ${rounded} ${className}`}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`${rounded} ${className}`}
      {...rest}
    />
  );
}
