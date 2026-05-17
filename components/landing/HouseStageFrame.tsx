import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  variant?: "mobile" | "desktop";
};

/**
 * Full-bleed обёртка для canvas sequence.
 * Заполняет родительский контейнер без отступов, border и overflow.
 */
export function HouseStageFrame({ children }: Props) {
  return (
    <div className="absolute inset-0">
      {children}
    </div>
  );
}
