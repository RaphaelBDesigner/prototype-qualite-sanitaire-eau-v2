import { useEffect } from "react";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";

/** Acceptation mémorisée pour la session de l'onglet (cf. NOTES.md). */
const CLE_ACCEPTATION = "avertissement-prototype-accepte";

function dejaAccepte() {
  try {
    return window.sessionStorage.getItem(CLE_ACCEPTATION) === "oui";
  } catch {
    return false;
  }
}

function memoriserAcceptation() {
  try {
    window.sessionStorage.setItem(CLE_ACCEPTATION, "oui");
  } catch {
    // Stockage indisponible : la modale réapparaîtra au prochain chargement.
  }
}

const modale = createModal({ id: "avertissement-prototype", isOpenedByDefault: !dejaAccepte() });

/**
 * Modale d'accueil bloquante : volontairement sans bouton « Fermer », ni fermeture par Échap
 * ou par un clic sur le fond (exception validée, cf. NOTES.md). Seul « J'ai compris » la ferme.
 */
export function AvertissementPrototype() {
  // Échap : intercepté avant le JS DSFR (phase de capture) tant que la modale est ouverte.
  useEffect(() => {
    if (!modale.isOpenedByDefault) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!document.getElementById(modale.id)?.classList.contains("fr-modal--opened")) return;
      event.stopPropagation();
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });

    // Contenu derrière la modale inaccessible tant qu'elle est ouverte : le DSFR 1.14 piège
    // le focus mais ne rend pas le reste de la page inerte.
    const dialogue = document.getElementById(modale.id);
    const freres = [...(dialogue?.parentElement?.children ?? [])].filter(
      (element) => element !== dialogue && !element.hasAttribute("inert"),
    );
    freres.forEach((element) => element.setAttribute("inert", ""));
    const liberer = () => freres.forEach((element) => element.removeAttribute("inert"));
    dialogue?.addEventListener("dsfr.conceal", liberer);

    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      dialogue?.removeEventListener("dsfr.conceal", liberer);
      liberer();
    };
  }, []);

  if (!modale.isOpenedByDefault) return null;

  const valider = () => {
    memoriserAcceptation();
    modale.close();
  };

  return (
    <modale.Component
      className="avertissement-prototype modale-centree"
      title={
        <>
          Bienvenue
          <br />
          sur ce prototype
        </>
      }
      // Option native du DSFR : un clic sur le fond ne ferme pas la modale.
      concealingBackdrop={false}
    >
      <p>Cette expérience a été créée et utilisée dans le cadre de tests utilisateurs.</p>
      <ul>
        <li>
          <strong>En cours de conception</strong>
        </li>
        <li>
          <strong>Réservé à l'équipe projet et aux testeurs</strong>
        </li>
      </ul>
      <p>Je m'engage à ne pas partager ce prototype.</p>
      <ButtonsGroup buttons={[{ children: "J'ai compris", priority: "tertiary", onClick: valider }]} />
    </modale.Component>
  );
}
