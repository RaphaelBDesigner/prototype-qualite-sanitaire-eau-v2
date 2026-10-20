import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Application } from "./Application";
import { REQUETE_GRAND_ECRAN, type MessageRoute } from "../lib/cadreMobile";

function abonnerGrandEcran(rappel: () => void) {
  const requete = window.matchMedia(REQUETE_GRAND_ECRAN);
  requete.addEventListener("change", rappel);
  return () => requete.removeEventListener("change", rappel);
}

const estGrandEcran = () => window.matchMedia(REQUETE_GRAND_ECRAN).matches;

/**
 * Page principale : sur mobile, l'application s'affiche directement ;
 * à partir de 576 px, elle s'affiche dans une colonne de 390 px sur fond noir.
 */
export function CadreMobile() {
  const grandEcran = useSyncExternalStore(abonnerGrandEcran, estGrandEcran);
  return grandEcran ? <Colonne /> : <Application />;
}

function Colonne() {
  const iframe = useRef<HTMLIFrameElement>(null);
  // L'iframe ouvre la route demandée (lien direct, rechargement, retour depuis le mode mobile).
  const [src] = useState(() => window.location.pathname + window.location.search + window.location.hash);

  useEffect(() => {
    document.documentElement.classList.add("cadre-mobile");
    return () => document.documentElement.classList.remove("cadre-mobile");
  }, []);

  useEffect(() => {
    const recevoir = (event: MessageEvent<MessageRoute>) => {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow) return;
      if (event.data?.type !== "route") return;
      const actuelle = window.location.pathname + window.location.search + window.location.hash;
      if (event.data.url !== actuelle) window.history.replaceState(window.history.state, "", event.data.url);
      document.title = event.data.titre;
    };
    window.addEventListener("message", recevoir);
    return () => window.removeEventListener("message", recevoir);
  }, []);

  return <iframe ref={iframe} className="cadre-mobile__iframe" src={src} title="Qualité sanitaire des eaux" />;
}
