<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Commandes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="rafraichir">
        <ion-refresher-content />
      </ion-refresher>

      <p v-if="erreur" class="ion-padding">{{ erreur }}</p>
      <p v-else-if="!commandes.length && !chargement" class="ion-padding">
        Aucune commande pour le moment.
      </p>

      <ion-list>
        <ion-item v-for="c in commandes" :key="c.id">
          <ion-label class="ion-text-wrap">
            <h2>Commande n° {{ c.id }} · Table {{ c.table }}</h2>
            <p>{{ formatDate(c.date) }}</p>
            <p>{{ detailLignes(c) }}</p>
            <p><strong>Total : {{ c.total }} Ar</strong></p>
          </ion-label>
          <ion-badge slot="end" :color="infoStatut(c.statut).couleur">
            {{ infoStatut(c.statut).libelle }}
          </ion-badge>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup  lang="ts">
import { ref } from 'vue';
import type { Commande, Ligne, LigneCommande, StatutCommande } from '@/types/gargote';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonBadge, IonRefresher, IonRefresherContent, onIonViewWillEnter,
  type RefresherCustomEvent,
} from '@ionic/vue';
import api from '@/services/api';
import { formatDate } from '@/utils/format'; // adapte le chemin

const commandes = ref(<Commande[]>[]);
const chargement = ref(false);
const erreur = ref('');

async function charger() {
  chargement.value = true;
  erreur.value = '';
  try {
    commandes.value = await api.getCommandes();
  } catch (e) {
    erreur.value = 'Impossible de charger les commandes.';
  } finally {
    chargement.value = false;
  }
}

async function rafraichir(event : RefresherCustomEvent) {
  await charger();
  event.target.complete();
}
function detailLignes(c : Commande) {
  return c.lignes.map(l => `${l.quantite} × ${l.nom}`).join(', ');
}

function formatTotal(total: number) {
  return Number(total).toLocaleString('fr-FR') + ' Ar';
}

const STATUTS = {
  en_attente: { libelle: 'En attente', couleur: 'warning' },
  en_cours:   { libelle: 'En cours',   couleur: 'primary' },
  servie:     { libelle: 'Servie',     couleur: 'success' },
  annulee:    { libelle: 'Annulée',    couleur: 'danger' },
};


function infoStatut(statut: StatutCommande) {
  return STATUTS[statut] || { libelle: statut, couleur: 'medium' };
}

onIonViewWillEnter(charger);
</script>