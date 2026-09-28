import { Header } from "@/components/sitio/Header";

export default function LayoutSitio({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
