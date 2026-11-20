/*
 * 03 — FONCTIONS TYPÉES
 */
import type { Plat } from './02-interfaces.ts';

// A. Paramètre par défaut.
//    formatPrix(500) -> "500 Ar"      formatPrix(2, '€') -> "2 €"
export function formatPrix(montant: number, devise: string = 'Ar') {
  // TODO : ajoutez les paramètres (montant, devise valant 'Ar' par défaut)
  return `${montant} ${devise}`;
}

// B. Paramètre facultatif.
//    Renvoie les plats dont le nom contient « mot » (sans tenir compte des majuscules).
//    Si seulementDisponibles vaut true, ne garde que les plats disponibles.
export function rechercher( plats: Plat[], mot: string, seulementDisponibles?: boolean): Plat[] {
  // TODO : (plats, mot, seulementDisponibles?) -> tableau de Plat
  const plat_res = [];
  for(const p of plats){
    const dispo = p.disponible || !seulementDisponibles;
    if(p.nom.toLowerCase().includes(mot.toLowerCase()) && dispo) {
      plat_res.push(p);
    }
  } 
  return plat_res;
}

// C. Type union et rétrécissement (narrowing).
//    versNombre('6000.00') -> 6000      versNombre(12) -> 12
//    Utilisez  typeof valeur === 'string'  pour distinguer les deux cas.
export function versNombre(valeur: number | string): number {
  // TODO
  if (typeof valeur === 'string') {
    return parseFloat(valeur);
  } else {
    return valeur;
  }
}
