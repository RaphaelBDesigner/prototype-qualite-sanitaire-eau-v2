/**
 * Affichage « colonne mobile » sur ordinateur et tablette (cf. NOTES.md) :
 * à partir du point de rupture sm du DSFR, la page affiche l'application dans une iframe
 * de largeur mobile, pour que les media queries du DSFR s'appliquent comme sur un téléphone.
 */

/** Point de rupture sm du DSFR (576 px). */
export const REQUETE_GRAND_ECRAN = "(min-width: 36em)";

/** Vrai quand la page est l'application chargée dans l'iframe de la colonne mobile. */
export const dansLeCadre = window.self !== window.top;

/** Message envoyé par l'iframe à la page parente à chaque changement de route. */
export type MessageRoute = { type: "route"; url: string; titre: string };

export function signalerRoute(url: string) {
  const message: MessageRoute = { type: "route", url, titre: document.title };
  window.parent.postMessage(message, window.location.origin);
}

/**
 * Dans l'iframe, les liens vers d'autres sites s'ouvrent dans la fenêtre entière
 * (beaucoup de sites refusent d'être affichés dans un cadre).
 */
export function ouvrirLiensExternesHorsDuCadre() {
  document.addEventListener(
    "click",
    (event) => {
      const lien = (event.target as Element | null)?.closest?.("a[href]");
      if (lien instanceof HTMLAnchorElement && !lien.target && lien.origin !== window.location.origin) {
        lien.target = "_top";
      }
    },
    true,
  );
}
