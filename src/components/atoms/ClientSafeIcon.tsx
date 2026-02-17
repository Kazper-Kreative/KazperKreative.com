"use client";

import React from 'react';
import { ExternalLink, Menu, X, ArrowDown, ArrowRight, Search, Command, Terminal, UserPlus, FileText, Globe, Volume2, VolumeX, LucideProps } from 'lucide-react';

const iconMap = {
  ExternalLink,
  Menu,
  X,
  ArrowDown,
  ArrowRight,
  Search,
  Command,
  Terminal,
  UserPlus,
  FileText,
  Globe,
  Volume2,
  VolumeX
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
