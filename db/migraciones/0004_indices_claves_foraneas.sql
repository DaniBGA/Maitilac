CREATE INDEX "combo_quesos_queso_idx" ON "combo_quesos" USING btree ("queso_id");--> statement-breakpoint
CREATE INDEX "equipo_foto_idx" ON "equipo" USING btree ("foto_id");--> statement-breakpoint
CREATE INDEX "locales_foto_idx" ON "locales" USING btree ("foto_id");--> statement-breakpoint
CREATE INDEX "locales_foto_detalle_idx" ON "locales" USING btree ("foto_detalle_id");--> statement-breakpoint
CREATE INDEX "ocasion_productos_producto_idx" ON "ocasion_productos" USING btree ("producto_id");--> statement-breakpoint
CREATE INDEX "premios_foto_idx" ON "premios" USING btree ("foto_id");--> statement-breakpoint
CREATE INDEX "producto_fotos_foto_idx" ON "producto_fotos" USING btree ("foto_id");