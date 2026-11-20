<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Panier</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="lignes.length" @click="vider()">Vider</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="!lignes.length" class="ion-padding ion-text-center">
        <p><ion-text color="medium">Votre panier est vide.</ion-text></p>
        <ion-button router-link="/tabs/menu">Voir le menu</ion-button>
      </div>

      <ion-list v-else>
        <ion-item v-for="l in lignes" :key="l.plat.id">
          <ion-label>
            <h2>{{ l.plat.nom }}</h2>
            <p>{{ l.plat.prix }} × {{ l.quantite }}</p>
          </ion-label>
          <ion-button fill="clear" slot="end" @click="changerQuantite(l.plat.id, -1)">
            <ion-icon slot="icon-only" :icon="removeCircleOutline" />
          </ion-button>
          <ion-button fill="clear" slot="end" @click="changerQuantite(l.plat.id, 1)">
            <ion-icon slot="icon-only" :icon="addCircleOutline" />
          </ion-button>
        </ion-item>

        <ion-item>
          <ion-label><strong>Total</strong></ion-label>
          <ion-note slot="end"><strong>{{ total }}</strong></ion-note>
        </ion-item>
      </ion-list>

      <ion-input v-model="table" type="number" label="Numéro de table" label-placement="floating" fill="outline"
        :class="{ 'ion-invalid ion-touched': erreurTable }" :error-text="erreurTable" />
      <ion-button expand="block" class="ion-margin-top" :disabled="envoi" @click="confirmer()">Envoyer la
        commande</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup  lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
  IonText, IonList, IonItem, IonLabel, IonIcon, IonNote, IonInput,
  alertController, useIonRouter, toastController,
  loadingController
} from '@ionic/vue';
import { removeCircleOutline, addCircleOutline } from 'ionicons/icons';
import { usePanier } from '@/composables/usePanier';
import { ref } from 'vue';
import { formatAriary } from '@/utils/format';
import api from '@/services/api';

const { lignes, total, changerQuantite, vider } = usePanier();
const erreurTable = ref('');
const ionrouter = useIonRouter();
const table = ref('');
const envoi = ref(false);

// async function confirmer() {
//   try {
//     const alerte = await alertController.create({
//       header: 'Confirmer la commande',
//       message: `Table ${table.value.nom} : ${formatAriary(total.value)}`,
//       buttons: [
//         { text: 'Annuler', role: 'cancel' },
//         { text: 'Confirmer', role: 'confirm' },
//       ]
//     });
//     await alerte.present();
//     const { role } = await alerte.onDidDismiss();
//     if (role === 'confirm') await envoyer();
//     envoi.value = false;

//   } catch (e) {
//     console.log(e);
//     erreurTable.value = 'Erreur lors de l\'envoi de la commande au table ';
//   }

// }

async function confirmer() {
  erreurTable.value = '';
  if (!table.value) {
    erreurTable.value = 'Veuillez saisir un numéro de table';
    return;
  }
  envoi.value = true;
  try {
    const alerte = await alertController.create({
      header: 'Confirmer la commande',
      message: `Table ${table.value} : ${formatAriary(total.value)}`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Confirmer', role: 'confirm' },
      ]
    });
    await alerte.present();
    const { role } = await alerte.onDidDismiss();
    if (role === 'confirm') await envoyer();
  } catch (e) {
    console.error(e);
    erreurTable.value = "Erreur lors de l'envoi de la commande";
  } finally {
    envoi.value = false;
  }
}


async function envoyer() {
  erreurTable.value = ''
  if (!table.value) {
    erreurTable.value = 'Veuillez saisir un numéro de table';
    return;
  }

  const loading = await loadingController.create({
    message: 'Envoi de la commande...',
    spinner: 'crescent',
  });
  await loading.present();

  try {
    // const commande = lignes.value.map((l) => ({ plat_id: l.plat.id, quantite: l.quantite }));
    const commande = {
      table: Number(table.value),
      lignes: lignes.value.map((l) => ({ plat_id: l.plat.id, quantite: l.quantite }))
    };
    
    await api.createCommande(commande);
    vider();
    await loading.dismiss();

    const toast = await toastController.create({
      message: 'Commande Num ' + table.value + ' envoyée !',
      duration: 1500,
      position: 'top',
      color: 'secondary'
    });
    await toast.present();
    
    ionrouter.navigate('/tabs/commandes', 'forward', 'replace');
  } catch (e) {
    await loading.dismiss();
    if (e.status === 422) {
      erreurTable.value = 'Numéro de table invalide';
    } else {
      console.error('Erreur lors de l\'envoi de la commande :', e);
      erreurTable.value = 'Erreur lors de l\'envoi de la commande';
    }
  } finally{
    envoi.value = false;
    await loading.dismiss();
  }
}

</script>