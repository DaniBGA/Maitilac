"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Local } from "@/lib/tipos";
import { enlaceWhatsApp, mensajeContacto, type Pestana } from "@/lib/whatsapp";

// Sección de canales y formulario de Contacto: markup de referencia/index.html:963-1101,
// convertido con scripts/html_a_jsx.py (estilos en styles/en-linea/contacto.css),
// con pintarTabs() y el envío por WhatsApp de referencia/index.html:2248-2281.
export function SeccionContacto({
  whatsapp,
  whatsappMayorista,
  locales,
}: {
  whatsapp: string;
  whatsappMayorista: string;
  locales: Local[];
}) {
  const [pestana, setPestana] = useState<Pestana>("consulta");
  const form = useRef<HTMLFormElement>(null);

  // "Pedir presupuesto mayorista" abre el formulario ya en la pestaña mayorista
  const irMayorista = (e: React.MouseEvent) => {
    e.preventDefault();
    setPestana("mayorista");
    form.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const texto = mensajeContacto(pestana, {
      nombre: String(d.get("nombre") ?? ""),
      email: String(d.get("email") ?? ""),
      telefono: String(d.get("telefono") ?? ""),
      mensaje: String(d.get("mensaje") ?? ""),
    });
    // Según la pestaña elegida, el mensaje va al local o al celular mayorista
    window.open(enlaceWhatsApp(pestana === "mayorista" ? whatsappMayorista : whatsapp, texto), "_blank");
  };

  return (
    <section className="sec-pad con-4">
      {/* Tres columnas: canales del local a la izquierda, el formulario en el
             medio y compras por mayor a la derecha. En pantallas chicas la clase
             'split' las apila una debajo de otra. */}
      <div className="split contacto-grid con-5">
        <div>
          {/* Compras en el local */}
          <div className="canal">
            <div className="canal-tit">
              <span className="canal-ico con-6">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                >
                  <path d="M3 9l1.5-5h15L21 9"></path>
                  <path d="M3 9h18v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"></path>
                  <path d="M8 20v-6h5v6"></path>
                </svg>
              </span>
              <div>
                <h2 className="serif">Compras en el local</h2>
                <p>Vení a nuestros locales o consultanos por tu pedido.</p>
              </div>
            </div>
            <div className="con-7">
              <a
                className="canal-item"
                href="https://wa.me/542494538291?text=Hola!%20Quer%C3%ADa%20hacer%20una%20consulta%20sobre%20los%20quesos"
                target="_blank"
                rel="noopener"
              >
                <span className="canal-item-ico">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm5.7 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"></path>
                  </svg>
                </span>{" "}
                <span>
                  <span className="canal-lbl">WhatsApp</span>
                  <span className="canal-val">249 4538291</span>
                </span>
              </a>
              <a className="canal-item" href="tel:2494538291">
                <span className="canal-item-ico">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"></path>
                  </svg>
                </span>{" "}
                <span>
                  <span className="canal-lbl">Teléfono</span>
                  <span className="canal-val">249 4538291</span>
                </span>
              </a>
            </div>
            <div className="canal-locales">
              <div className="canal-loc-tit">NUESTROS LOCALES</div>
              <div className="con-8">
                {/* Los mismos datos que la página Locales; el sitio viejo mostraba la
                    dirección sin la ciudad ("Maipú 1135"). */}
                {locales.map((l) => (
                  <div className="canal-loc" key={l.nombre}>
                    <strong>{l.direccion.split(",")[0]}</strong>
                    <span>
                      {`Lun a Sáb · ${l.semana}`}
                      {l.domingo ? (
                        <>
                          <br />
                          {`Domingos · ${l.domingo}`}
                        </>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
              <Link className="canal-link" href="/locales" data-go="locales">
                Cómo llegar{" "}
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M9 6l6 6-6 6"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
        {/* COLUMNA DERECHA: compras por mayor y redes */}
        <div className="contacto-col-mayor">
          {/* Compras por mayor */}
          <div className="canal canal-mayor">
            <div className="canal-tit">
              <span className="canal-ico con-9">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                >
                  <path d="M2 8.5L12 4l10 4.5v7L12 20 2 15.5v-7z"></path>
                  <path d="M2 8.5L12 13l10-4.5"></path>
                  <path d="M12 13v7"></path>
                </svg>
              </span>
              <div>
                <h2 className="serif">Compras por mayor</h2>
                <p>Revendedores, restaurantes y distribuidores.</p>
              </div>
            </div>
            <div className="con-7">
              <a
                className="canal-item"
                href="https://wa.me/542494650236?text=Hola!%20Quer%C3%ADa%20consultar%20por%20precios%20mayoristas"
                target="_blank"
                rel="noopener"
              >
                <span className="canal-item-ico">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm5.7 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"></path>
                  </svg>
                </span>{" "}
                <span>
                  <span className="canal-lbl">WhatsApp mayorista</span>
                  <span className="canal-val">2494 650236</span>
                </span>
              </a>
              <a className="canal-item" href="mailto:ventas1@maitilac.com?subject=Consulta%20mayorista">
                <span className="canal-item-ico">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                    <path d="M3 7l9 6 9-6"></path>
                  </svg>
                </span>{" "}
                <span>
                  <span className="canal-lbl">Email</span>
                  <span className="canal-val">ventas1@maitilac.com</span>
                </span>
              </a>
              <a
                className="canal-item"
                href="https://wa.me/542494610999?text=Hola!%20Quer%C3%ADa%20consultar%20por%20precios%20mayoristas"
                target="_blank"
                rel="noopener"
              >
                <span className="canal-item-ico">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm5.7 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"></path>
                  </svg>
                </span>{" "}
                <span>
                  <span className="canal-lbl">WhatsApp mayorista</span>
                  <span className="canal-val">2494 610999</span>
                </span>
              </a>
              <a className="canal-item" href="mailto:ventas2@gmail.com?subject=Consulta%20mayorista">
                <span className="canal-item-ico">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                    <path d="M3 7l9 6 9-6"></path>
                  </svg>
                </span>{" "}
                <span>
                  <span className="canal-lbl">Email</span>
                  <span className="canal-val">ventas2@gmail.com</span>
                </span>
              </a>
            </div>
            <ul className="canal-lista">
              <li>Precios especiales por volumen</li>
              <li>Entregas programadas en Tandil y zona</li>
              <li>Asesoramiento en variedades y presentaciones</li>
            </ul>
            <a className="canal-cta" href="#" id="ir-mayorista" onClick={irMayorista}>
              Pedir presupuesto mayorista{" "}
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M9 6l6 6-6 6"></path>
              </svg>
            </a>
          </div>
          <h2 className="serif con-10">Redes Sociales</h2>
          <div className="con-11">
            <a className="con-12" href="https://www.instagram.com/maitilac" target="_blank" rel="noopener">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                <circle cx="12" cy="12" r="4"></circle>
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle>
              </svg>
            </a>
            <a className="con-12" href="https://www.facebook.com/maitilac" target="_blank" rel="noopener">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 9H16V6h-2.5C11.6 6 10 7.6 10 9.5V11H8v3h2v7h3v-7h2.2l.8-3H13V9.3c0-.2.2-.3.5-.3z"></path>
              </svg>
            </a>
          </div>
        </div>
        {/* COLUMNA DEL MEDIO: el formulario */}
        <div className="contacto-col-form">
          <div className="con-13">
            <button
              type="button"
              id="tab-consulta"
              className={`tab ct-tab${pestana === "consulta" ? " ct-on" : ""}`}
              onClick={() => setPestana("consulta")}
            >
              Compra en el local
            </button>
            <button
              type="button"
              id="tab-mayorista"
              className={`tab ct-tab${pestana === "mayorista" ? " ct-on" : ""}`}
              onClick={() => setPestana("mayorista")}
            >
              Compra por mayor
            </button>
          </div>
          <form className="con-14" id="form-contacto" ref={form} onSubmit={enviar}>
            <h3 className="serif con-15">Envianos un mensaje</h3>
            <p className="con-16" id="form-help">
              {pestana === "mayorista"
                ? "Contanos qué volúmenes y con qué frecuencia necesitás; te armamos una propuesta."
                : "Consultanos por variedades, precios o disponibilidad en nuestros locales."}
            </p>
            <div className="grid-2 con-17">
              <label className="con-18">
                <span className="con-19">Nombre Completo</span>{" "}
                <input className="con-20" type="text" name="nombre" required placeholder="Tu nombre" />
              </label>
              <label className="con-18">
                <span className="con-19">Email</span>{" "}
                <input className="con-20" type="email" name="email" required placeholder="tu@email.com" />
              </label>
              <label className="con-18">
                <span className="con-19">Teléfono (Opcional)</span>{" "}
                <input className="con-20" type="tel" name="telefono" placeholder="249 4..." />
              </label>
            </div>
            <label className="con-21">
              <span className="con-19">Mensaje</span>{" "}
              <textarea
                className="con-22"
                name="mensaje"
                rows={5}
                required
                placeholder="¿En qué podemos ayudarte?"
              ></textarea>
            </label>
            <button className="con-23" type="submit">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 2L11 13"></path>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
              </svg>{" "}
              Enviar por WhatsApp
            </button>
            <p className="con-24">Se abrirá WhatsApp con tu mensaje listo para enviar.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
