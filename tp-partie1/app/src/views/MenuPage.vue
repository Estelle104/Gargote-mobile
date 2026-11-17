<template>
  <!-- ion-page : l'enveloppe obligatoire de chaque page -->
  <ion-page>
    <!-- En-tête fixe en haut de l'écran -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Menu du jour</ion-title>
        <ion-searchbar v-model="recherche" placeholder="Rechercher un plat" :debounce="250"></ion-searchbar>
        <ion-segment v-model="categorieChoisie" scrollable @ion-change="charger">
          <ion-segment-button values="toutes"><ion-label>Tout</ion-label></ion-segment-button>
          <ion-segment-button v-for="c in categories" :key="c.id" :value="String(c.id)">
            <ion-label>{{ c.nom }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <!-- Zone qui défile -->
    <ion-content>
      <!-- 1. Chargement en cours -->
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <!-- 2. Erreur -->
      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">Réessayer</ion-button>
      </div>

      <ion-item v-if="platsFiltres.length === 0">
        <ion-label>Aucun plat trouvé</ion-label>
      </ion-item>

      <!-- 3. La liste des plats -->
      <ion-list v-else>
        <ion-item v-for="plat in platsFiltres" :key="plat.id" :router-link="`/tabs/menu/${plat.id}`">
          <!-- <ion-item v-for="plat in platsFiltres" :key="plat.id" "> -->
          <!-- <a href="/tabs/menu/${plat.id}"></a> -->
          <ion-label>
            <h2>{{ plat.nom }}</h2>
            <p>{{ plat.categorie.nom }}</p>
            <p>{{ plat.description }}</p>
            <strong><ion-text color="primary">Prix :{{ plat.prix }}</ion-text> </strong>
          </ion-label>
          <ion-badge v-if="!plat.disponible" color="medium">Epuise</ion-badge>
          <!-- <ion-note slot="end">{{ formatAriary(plat.prix) }}</ion-note> -->
          <ion-button slot="end" fill="clear" :disabled="!plat.disponible" @click.stop.prevent="ajouterAuPanier(plat)">
            <ion-icon slot="icon-only" :icon="addCircleOutline" />
          </ion-button>
        </ion-item>
      </ion-list>
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
        <ion-refresher-content />
      </ion-refresher>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonNote, IonSpinner, IonText, IonButton, IonSearchbar, IonBadge, IonSegment, IonSegmentButton,
  IonRefresher, IonRefresherContent, onIonViewWillEnter, onIonViewDidLeave, IonIcon,
  toastController
} from '@ionic/vue';

import api from '@/services/api';
import { usePanier } from '@/composables/usePanier';
import { addCircleOutline } from 'ionicons/icons';
// import { formatAriary } from '@/utils/format';

const plats = ref([]);
const chargement = ref(true);
const erreur = ref(null);
const recherche = ref('');
const categories = ref([]);
const categorieChoisie = ref('toutes');

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    plats.value = await api.getPlats();
    categories.value = await api.getCategories();
  } catch (e) {
    erreur.value = "Impossible de joindre l'API. Est-elle lancée ?";
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

const platsFiltres = computed(() => {
  const cat = categorieChoisie.value;
  const rech = recherche.value ? recherche.value.toLowerCase() : '';
  const catId = cat && cat !== 'toutes' ? parseInt(cat) : null;

  if (!catId && !rech) {
    return plats.value;
  }

  if (catId && rech) {
    return plats.value.filter((pl) =>
      pl.categorie.id === catId &&
      (pl.nom.toLowerCase().includes(rech) || pl.description.toLowerCase().includes(rech))
    );
  }

  if (catId) {
    return plats.value.filter((pl) => pl.categorie.id === catId);
  }

  return plats.value.filter((pl) =>
    pl.nom.toLowerCase().includes(rech) || pl.description.toLowerCase().includes(rech)
  );
});

async function rafraichir(event) {
  await charger();
  event.target.complete(); // arrête l'animation
}

async function ajouterAuPanier(plat) {
  try {
    await usePanier().ajouter(plat);
    const toast = await toastController.create({
      message: `${plat.nom} ajouté au panier`,
      duration: 1500, position: 'top', color: 'success'
    });

    await toast.present();

  } catch (e) {
    console.error('Erreur lors de l\'ajout au panier :', e);
  }
}

// onMounted(() => console.log('MENU onMounted'));
// onUnmounted(() => console.log('MENU onUnmounted'));
// onIonViewWillEnter(() => console.log('MENU ionViewWillEnter'));
// onIonViewDidLeave(() => console.log('MENU ionViewDidLeave'));


onMounted(charger);
</script>
