"use client";

import React from 'react';
import Image, { ImageProps } from 'next/image';

const ClientSafeImage: React.FC<ImageProps> = (props) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={props.className} style={props.style} suppressHydrationWarning />;
  }

  return <Image {...props} />;
};

export default ClientSafeImage;
