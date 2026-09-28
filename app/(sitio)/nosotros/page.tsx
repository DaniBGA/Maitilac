import type { Metadata } from "next";
import { OG_BASE } from "@/lib/sitio";
import { FooterClaro } from "@/components/sitio/FooterClaro";
import { IcoTick } from "@/components/sitio/Icono";
import { CarruselHistoria } from "@/components/sitio/nosotros/CarruselHistoria";
import { CarruselPremios } from "@/components/sitio/nosotros/CarruselPremios";
import { LineaTiempo } from "@/components/sitio/nosotros/LineaTiempo";
import {
  getEquipoVisible,
  getFotosHistoria,
  getFotosHoy,
  getHistoria,
  getPasos,
  getPremiosVisibles,
} from "@/lib/datos";
import { connection } from "next/server";
import { Pagina } from "@/components/sitio/Pagina";
import { Foto } from "@/components/sitio/Foto";

// Título y descripción: el título y la bajada de la página, tal cual.
export const metadata: Metadata = {
  title: "Nuestra Historia",
  description: "En MAITILAC creemos que los buenos quesos empiezan mucho antes de llegar a la mesa.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    ...OG_BASE,
    url: "/nosotros",
    title: "Nuestra Historia — Maitilac",
    description: "En MAITILAC creemos que los buenos quesos empiezan mucho antes de llegar a la mesa.",
  },
};

// Página Nosotros: markup de referencia/index.html:631-801, convertido con
// scripts/html_a_jsx.py (estilos en styles/en-linea/nosotros.css). Las partes que
// llenaba el JavaScript viejo usan los componentes de components/sitio/nosotros/.
async function NosotrosContenido() {
  // Se arma en cada pedido con datos en caché: la base no hace falta al compilar (ver app/(sitio)/layout.tsx).
  await connection();
  const [equipo, premios] = await Promise.all([getEquipoVisible(), getPremiosVisibles()]);

  return (
    <main id="page-nosotros" className="page">
      <section className="sec-pad nos-1">
        <h1 className="serif nos-2">Nuestra Historia</h1>
        <p className="serif nos-3">
          &quot;En MAITILAC creemos que los buenos quesos empiezan mucho antes de llegar a la mesa.&quot;
        </p>
      </section>
      <section className="sec-pad nos-4">
        <div className="nos-5">
          <div className="nos-6">
            <span className="nos-7">DESDE 1940</span>
          </div>
          {/* Línea de tiempo vertical a la izquierda.
                 A la derecha: la historia y, debajo, el carrusel de fotos. */}
          <div className="timeline">
            <LineaTiempo hitos={getHistoria()} />
            <div className="tl-panel">
              {/* La historia */}
              <div className="tl-relato">
                <p className="tl-lema">
                  En MAITILAC creemos que los buenos quesos empiezan mucho antes de llegar a la mesa.
                </p>
                <p>
                  Nuestra historia comenzó en <strong>1940</strong>, cuando Miguel Maitia puso en marcha un
                  pequeño tambo en Napaleofú, con ordeñe a mano y mucho trabajo familiar. Con el paso de los
                  años llegaron las primeras innovaciones, el crecimiento de la producción y una convicción
                  que sigue vigente hasta hoy: hacer las cosas bien desde el origen.
                </p>
                <p>
                  En <strong>1997</strong>, Raúl Maitia, hijo de Miguel, tomó la posta y continuó
                  desarrollando la actividad tambera, incorporando tecnología, ampliando la producción y
                  fortaleciendo las bases de lo que vendría después.
                </p>
                <p>
                  La tercera generación se sumó en <strong>2017</strong> y <strong>2018</strong>, aportando
                  nuevas ideas y un sueño compartido: transformar la leche de nuestros tambos en quesos con
                  identidad propia. Así nacieron los primeros quesos MAITILAC en 2018 y, al tiempito,
                  comenzaron a llegar a nuestros locales y a las mesas de Tandil y alrededores.
                </p>
                <p>
                  En <strong>2023</strong> cumplimos uno de nuestros mayores objetivos: inaugurar nuestra
                  propia fábrica en el Parque Industrial de Tandil. Hoy elaboramos quesos con leche producida
                  en nuestros tambos, manteniendo el control de todo el proceso, desde el campo hasta cada
                  horma que sale de la planta.
                </p>
                <p>
                  Somos tres generaciones de una misma familia trabajando con la misma pasión: producir
                  alimentos de calidad y compartir el sabor de nuestras raíces.
                </p>
              </div>
              {/* Dos filas de fotos: arriba las de archivo, abajo las actuales.
                     Cada una se desplaza sola hacia un lado distinto. */}
              <CarruselHistoria fotosHistoria={getFotosHistoria()} fotosHoy={getFotosHoy()} />
            </div>
          </div>
        </div>
      </section>
      {/* Proceso productivo */}
      <section className="nos-8">
        <div className="split sec-pad nos-9">
          <div>
            <h2 className="serif nos-10">El Proceso Productivo</h2>
            <p className="nos-11">
              Nuestra calidad comienza en el campo. Controlamos cada etapa para asegurar un producto genuino y
              saludable.
            </p>
            <div className="nos-12" id="proceso-pasos">
              {getPasos().map((s) => (
                <div key={s.titulo} className="ps-paso">
                  <span className="ps-tick">
                    <IcoTick />
                  </span>
                  <div>
                    <h3 className="serif ps-titulo">{s.titulo}</h3>
                    <p className="ps-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="nos-13">
            <Foto
              className="nos-14"
              src="/img/proceso-tambo.jpg"
              sizes="(max-width:720px) 90vw, (max-width:1024px) 94vw, 540px"
              alt="Vacas Holando en el tambo"
              loading="lazy"
            />
            <Foto
              className="nos-14"
              src="/img/proceso-fabrica.jpg"
              sizes="(max-width:720px) 90vw, (max-width:1024px) 94vw, 540px"
              alt="Elaboración de quesos en la fábrica"
              loading="lazy"
            />
          </div>
        </div>
        {/* Cadena de producción, ilustrada. Basada en el folleto de Maitilac. */}
        <div className="cadena-wrap">
          <div className="cadena-tit">
            <span className="cadena-eyebrow">Nuestra</span>
            <h3>
              CADENA DE <strong>PRODUCCIÓN</strong>
            </h3>
          </div>
          {/* Cinta de fondo */}
          <svg className="cadena-cinta" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0,86 C260,26 420,102 700,58 C900,26 1060,50 1200,34"
              fill="none"
              stroke="#617C52"
              strokeWidth="26"
              opacity=".3"
              strokeLinecap="round"
            ></path>
            <path
              d="M0,98 C260,38 420,114 700,70 C900,38 1060,62 1200,46"
              fill="none"
              stroke="#C67A31"
              strokeWidth="15"
              strokeLinecap="round"
            ></path>
          </svg>
          <ol className="cadena-pasos">
            <li className="cd-paso">
              <span className="cd-circulo">
                <img src="/img/cadena/1-pastando.png" alt="" loading="lazy" />
              </span>{" "}
              <span className="cd-num">1</span> <span className="cd-lbl">El campo</span>
            </li>
            <li className="cd-paso">
              <span className="cd-circulo">
                <img src="/img/cadena/2-ordene.png" alt="" loading="lazy" />
              </span>{" "}
              <span className="cd-num">2</span> <span className="cd-lbl">Ordeñe</span>
            </li>
            <li className="cd-paso">
              <span className="cd-circulo">
                <img src="/img/cadena/3-recoleccion.png" alt="" loading="lazy" />
              </span>{" "}
              <span className="cd-num">3</span> <span className="cd-lbl">Recolección</span>
            </li>
            <li className="cd-paso">
              <span className="cd-circulo">
                <img src="/img/cadena/4-maduracion.png" alt="" loading="lazy" />
              </span>{" "}
              <span className="cd-num">4</span> <span className="cd-lbl">Maduración</span>
            </li>
            <li className="cd-paso">
              <span className="cd-circulo">
                <img src="/img/cadena/5-local.png" alt="" loading="lazy" />
              </span>{" "}
              <span className="cd-num">5</span> <span className="cd-lbl">Nuestros locales</span>
            </li>
            <li className="cd-paso">
              <span className="cd-circulo">
                <img src="/img/cadena/6-horma.png" alt="" loading="lazy" />
              </span>{" "}
              <span className="cd-num">6</span> <span className="cd-lbl">A tu mesa</span>
            </li>
          </ol>
        </div>
      </section>
      {/* Equipo */}
      <section className={`sec-pad nos-15${equipo.length ? "" : " hidden"}`}>
        <h2 className="serif nos-16">Nuestro Equipo</h2>
        <p className="nos-17">Una estructura familiar y profesional, que acompaña cada etapa.</p>
        <div className="grid-centrada-3 nos-5" id="equipo">
          {equipo.map((m) => (
            <div key={m.nombre} className="eq-card">
              {m.foto ? (
                <Foto src={m.foto} sizes="104px" alt={m.nombre} loading="lazy" className="eq-foto" />
              ) : (
                <div className="ph eq-ph" data-ph={`retrato — ${m.nombre}`}></div>
              )}
              <h3 className="serif eq-nombre">{m.nombre}</h3>
              {m.rol ? <div className="eq-rol">{m.rol}</div> : null}
              {m.area ? <div className="eq-area">{m.area}</div> : null}
            </div>
          ))}
        </div>
      </section>
      {/* Premios */}
      <section className={`sec-pad nos-18${premios.length ? "" : " hidden"}`}>
        <div className="nos-5">
          <div className="nos-19">
            <span className="nos-20">DISTINCIONES</span>
            <h2 className="serif nos-21">Premios y Reconocimientos</h2>
            <p className="nos-22">Nuestros quesos, premiados en la Cata Quesos y Sabores de Tandil.</p>
          </div>
          <CarruselPremios premios={premios} className="nos-23" />
        </div>
      </section>
      {/* Cluster */}
      <section className="sec-pad nos-24">
        <img
          className="nos-25"
          src="/img/cluster-quesero.png"
          alt="Cluster Quesero de Tandil"
          loading="lazy"
        />
        <h2 className="serif nos-26">Orgullosos miembros del Cluster Quesero de Tandil</h2>
        <p className="nos-27">
          Trabajamos en conjunto con otros productores locales para fortalecer la identidad y calidad del
          queso tandilero, protegiendo nuestras tradiciones.
        </p>
      </section>

      <FooterClaro />
    </main>
  );
}

export default function Nosotros() {
  return (
    <Pagina>
      <NosotrosContenido />
    </Pagina>
  );
}
