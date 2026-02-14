"use client";

import React from 'react';
import { ExternalLink, Menu, X, ArrowDown, ArrowRight, LucideProps } from 'lucide-react';

const iconMap = {
  ExternalLink,
  Menu,
  X,
  ArrowDown,
  ArrowRight
};

export type IconName = keyof typeof iconMap;

interface ClientSafeIconProps extends LucideProps {
  name: IconName;
}

const ClientSafeIcon: React.FC<ClientSafeIconProps> = ({ name, ...props }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const Icon = iconMap[name];

  if (!mounted || !Icon) {
    return <div className={props.className} style={{ width: props.size, height: props.size }} suppressHydrationWarning />;
  }

  return <Icon {...props} />;
};

export default ClientSafeIcon;
