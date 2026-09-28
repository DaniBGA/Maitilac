CREATE TABLE "anuncios" (
	"clave" text PRIMARY KEY NOT NULL,
	"ver" boolean DEFAULT true NOT NULL,
	"texto" text DEFAULT '' NOT NULL,
	"color" text DEFAULT 'marron' NOT NULL,
	CONSTRAINT "anuncios_clave" CHECK ("anuncios"."clave" in ('barra','badge1','badge2')),
	CONSTRAINT "anuncios_color" CHECK ("anuncios"."color" in ('marron','naranja','verde'))
);
--> statement-breakpoint
CREATE TABLE "combo_quesos" (
	"combo_id" uuid NOT NULL,
	"queso_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	CONSTRAINT "combo_quesos_combo_id_queso_id_pk" PRIMARY KEY("combo_id","queso_id")
);
--> statement-breakpoint
CREATE TABLE "config" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"whatsapp" text NOT NULL,
	"whatsapp_mayorista" text NOT NULL,
	"telefono" text NOT NULL,
	"email" text NOT NULL,
	"instagram" text NOT NULL,
	"facebook" text NOT NULL,
	CONSTRAINT "config_una_fila" CHECK ("config"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "equipo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text DEFAULT '' NOT NULL,
	"rol" text DEFAULT '' NOT NULL,
	"area" text DEFAULT '' NOT NULL,
	"foto_id" uuid,
	"ver" boolean DEFAULT true NOT NULL,
	"orden" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fotos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"archivo" text NOT NULL,
	"variantes" jsonb,
	"alt" text,
	"ancho" integer,
	"alto" integer,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fotos_archivo_unique" UNIQUE("archivo")
);
--> statement-breakpoint
CREATE TABLE "locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"direccion" text NOT NULL,
	"horario_semana" text DEFAULT '' NOT NULL,
	"horario_domingo" text DEFAULT '' NOT NULL,
	"abre" text NOT NULL,
	"cierra" text NOT NULL,
	"dom_abre" text,
	"dom_cierra" text,
	"foto_id" uuid,
	"foto_detalle_id" uuid,
	"como_llegar" text DEFAULT '' NOT NULL,
	"mapa_url" text DEFAULT '' NOT NULL,
	"orden" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ocasion_productos" (
	"ocasion_id" uuid NOT NULL,
	"producto_id" uuid NOT NULL,
	CONSTRAINT "ocasion_productos_ocasion_id_producto_id_pk" PRIMARY KEY("ocasion_id","producto_id")
);
--> statement-breakpoint
CREATE TABLE "ocasiones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clave" text NOT NULL,
	"label" text NOT NULL,
	"ver" boolean DEFAULT true NOT NULL,
	"orden" integer NOT NULL,
	CONSTRAINT "ocasiones_clave_unique" UNIQUE("clave")
);
--> statement-breakpoint
CREATE TABLE "premios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anio" text DEFAULT '' NOT NULL,
	"titulo" text DEFAULT '' NOT NULL,
	"evento" text DEFAULT '' NOT NULL,
	"detalle" text DEFAULT '' NOT NULL,
	"foto_id" uuid,
	"ver" boolean DEFAULT true NOT NULL,
	"orden" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "producto_del_mes" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"producto_id" uuid,
	"texto" text DEFAULT '' NOT NULL,
	"foto_id" uuid,
	CONSTRAINT "producto_del_mes_una_fila" CHECK ("producto_del_mes"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "producto_fotos" (
	"producto_id" uuid NOT NULL,
	"foto_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	CONSTRAINT "producto_fotos_producto_id_foto_id_pk" PRIMARY KEY("producto_id","foto_id")
);
--> statement-breakpoint
CREATE TABLE "productos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nombre" text NOT NULL,
	"tipo" text DEFAULT '' NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"precio" numeric(10, 2),
	"precio_prefijo" text,
	"unidad" text DEFAULT '' NOT NULL,
	"ver_precio" boolean DEFAULT true NOT NULL,
	"badge" text DEFAULT '' NOT NULL,
	"destacado" boolean DEFAULT false NOT NULL,
	"presentaciones" text[] DEFAULT '{}'::text[] NOT NULL,
	"maridaje_comida" text[] DEFAULT '{}'::text[] NOT NULL,
	"maridaje_bebida" text[] DEFAULT '{}'::text[] NOT NULL,
	"premios_texto" text DEFAULT '' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"orden" integer NOT NULL,
	"eliminado_en" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "productos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "combo_quesos" ADD CONSTRAINT "combo_quesos_combo_id_productos_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_quesos" ADD CONSTRAINT "combo_quesos_queso_id_productos_id_fk" FOREIGN KEY ("queso_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipo" ADD CONSTRAINT "equipo_foto_id_fotos_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."fotos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locales" ADD CONSTRAINT "locales_foto_id_fotos_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."fotos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locales" ADD CONSTRAINT "locales_foto_detalle_id_fotos_id_fk" FOREIGN KEY ("foto_detalle_id") REFERENCES "public"."fotos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocasion_productos" ADD CONSTRAINT "ocasion_productos_ocasion_id_ocasiones_id_fk" FOREIGN KEY ("ocasion_id") REFERENCES "public"."ocasiones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocasion_productos" ADD CONSTRAINT "ocasion_productos_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premios" ADD CONSTRAINT "premios_foto_id_fotos_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."fotos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "producto_del_mes" ADD CONSTRAINT "producto_del_mes_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "producto_del_mes" ADD CONSTRAINT "producto_del_mes_foto_id_fotos_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."fotos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "producto_fotos" ADD CONSTRAINT "producto_fotos_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "producto_fotos" ADD CONSTRAINT "producto_fotos_foto_id_fotos_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."fotos"("id") ON DELETE restrict ON UPDATE no action;