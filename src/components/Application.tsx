import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { creerRouteur } from "../router";
import { dansLeCadre, signalerRoute } from "../lib/cadreMobile";

export function Application() {
  const [routeur] = useState(creerRouteur);

  // Dans l'iframe, la page parente reflète la route affichée (adresse et titre).
  useEffect(() => {
    if (!dansLeCadre) return;
    const signaler = () => signalerRoute(routeur.createHref(routeur.state.location));
    signaler();
    return routeur.subscribe(signaler);
  }, [routeur]);

  return <RouterProvider router={routeur} />;
}
