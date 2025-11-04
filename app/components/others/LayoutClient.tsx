"use client";

import { usePathname } from "next/navigation";
import { Header } from "../layout/Header";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlayground = pathname === "/playground";

  return (
    <>
      {!isPlayground && <Header />}
      {children}
    </>
  );
}
