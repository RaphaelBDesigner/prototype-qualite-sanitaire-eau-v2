import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { Link } from "react-router-dom";
import "@codegouvfr/react-dsfr/main.css";
// Utilitaires de couleur DSFR (fr-background-alt--*…), non inclus dans main.css.
import "@codegouvfr/react-dsfr/dsfr/utility/colors/colors.main.min.css";
import "./styles/app.css";
import { Application } from "./components/Application";
import { CadreMobile } from "./components/CadreMobile";
import { dansLeCadre, ouvrirLiensExternesHorsDuCadre } from "./lib/cadreMobile";

startReactDsfr({ defaultColorScheme: "system", Link });

declare module "@codegouvfr/react-dsfr/spa" {
  interface RegisterLink {
    Link: typeof Link;
  }
}

if (dansLeCadre) ouvrirLiensExternesHorsDuCadre();

createRoot(document.getElementById("root")!).render(
  <StrictMode>{dansLeCadre ? <Application /> : <CadreMobile />}</StrictMode>,
);
