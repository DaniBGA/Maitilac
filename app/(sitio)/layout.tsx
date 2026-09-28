import { Header } from "@/components/sitio/Header";
import { RedireccionHash } from "@/components/sitio/RedireccionHash";
import { getConfig } from "@/lib/datos";

export default function LayoutSitio({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <Header instagram={getConfig().instagram} />
      {children}
      {modal}
      <RedireccionHash />
    </>
  );
}
