import React from "react";

// Function declarations
export function navigateTo(to: string): void;
export function replaceTo(to: string): void;
export function goBack(): void;

// BabyLink component
export interface BabyLinkProps {
  to: string;
  children: React.ReactNode;
}

export const BabyLink: React.MemoExoticComponent<React.FC<BabyLinkProps>>;

// BabyRoutes component
export interface RouteComponentProps {
  queryParams: Record<string, string>;
}

export interface BabyRoutesProps {
  routes: {
    [route: string]: React.ComponentType<RouteComponentProps>;
  };
  defaultRoute?: string;
  enableAnimation?: boolean;
  bgColor?: string;
  maxWidth?: string;
}

export const BabyRoutes: React.MemoExoticComponent<React.FC<BabyRoutesProps>>;
