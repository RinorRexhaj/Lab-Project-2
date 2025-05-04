import { ReactNode } from "react";

export interface Tab {
  id: number;
  name: string;
  component: ReactNode;
}
