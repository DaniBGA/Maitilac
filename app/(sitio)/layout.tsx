import { Header } from "@/components/sitio/Header";
import { getConfig } from "@/lib/datos";

export default function LayoutSitio({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header instagram={getConfig().instagram} />
      {children}
    </>
  );
}
