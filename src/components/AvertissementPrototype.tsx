import { useEffect, useState } from "react";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
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
// Le composant Checkbox numérote ses cases : `${id}-0` pour la première.
const ID_ENGAGEMENT = "avertissement-prototype-engagement";
const ID_CASE = `${ID_ENGAGEMENT}-0`;

/**
 * Modale d'accueil bloquante : volontairement sans bouton « Fermer », ni fermeture par Échap
 * ou par un clic sur le fond (exception validée, cf. NOTES.md). Seul « J'ai compris » la ferme,
 * une fois l'engagement coché.
 */
export function AvertissementPrototype() {
  const [engage, setEngage] = useState(false);
  const [erreur, setErreur] = useState(false);

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
    if (!engage) {
      setErreur(true);
      document.getElementById(ID_CASE)?.focus();
      return;
    }
    memoriserAcceptation();
    modale.close();
  };

  return (
    <modale.Component
      className="avertissement-prototype"
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
      <p>Ce prototype IA sert à tester une idée auprès d'utilisateurs.</p>
      <ul>
        <li>
          <strong>Il n'est pas terminé et voué à évoluer.</strong>
        </li>
        <li>
          <strong>Il est réservé à l'équipe projet et aux testeurs.</strong>
        </li>
      </ul>
      <Checkbox
        id={ID_ENGAGEMENT}
        options={[
          {
            label: "Je m'engage à ne pas partager ce prototype.",
            nativeInputProps: {
              checked: engage,
              // Message d'erreur DSFR lié à la case (annoncé aussi par la zone aria-live du composant).
              "aria-describedby": erreur ? `${ID_ENGAGEMENT}-desc-error` : undefined,
              onChange: (event) => {
                setEngage(event.target.checked);
                if (event.target.checked) setErreur(false);
              },
            },
          },
        ]}
        state={erreur ? "error" : "default"}
        stateRelatedMessage="Vous devez vous engager à ne pas partager ce prototype pour continuer."
      />
      <ButtonsGroup buttons={[{ children: "J'ai compris", priority: "tertiary", onClick: valider }]} />
    </modale.Component>
  );
}
