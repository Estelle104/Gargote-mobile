import type { Plat, Ligne } from '@/types/gargote';
import { ref, computed } from 'vue';

// Déclaré EN DEHORS de la fonction : un seul panier pour toute l'application
const lignes = ref<Ligne[]>([]); // chaque ligne : { plat, quantite }

export function usePanier() {
    function ajouter(plat: Plat) {
        // TODO : si le plat est déjà dans le panier, quantite + 1,
        //        sinon ajouter une ligne { plat, quantite: 1 }
        const ligne = lignes.value.find((l) => l.plat.id === plat.id);
        if (ligne) {
            ligne.quantite++;
        } else {
            lignes.value.push({ plat, quantite: 1 });
        }
    }

    function changerQuantite(platId : number, delta : number) {
        // TODO : ajoute delta (+1 ou -1) à la quantité ;
        //        si la quantité tombe à 0, retirer la ligne
        const ligne = lignes.value.find((l) => l.plat.id === platId);
        if (!ligne) return;
        ligne.quantite += delta;
        if (ligne.quantite <= 0) {
            lignes.value = lignes.value.filter((l) => l.plat.id !== platId);
        }
    }

    function vider() {
        lignes.value = [];
    }

/* TODO : somme des quantités */ 0
    const nombreArticles = computed(() => {
        return lignes.value.reduce((acc, ligne) => acc + Number(ligne.quantite), 0);

    });

    /* TODO : somme des prix × quantittotalés */
    const total = computed(() => {
        return lignes.value.reduce((acc, ligne) => acc + Number(ligne.plat.prix) * Number(ligne.quantite), 0);
    }); total

    return { lignes, ajouter, changerQuantite, vider, nombreArticles, total };
}