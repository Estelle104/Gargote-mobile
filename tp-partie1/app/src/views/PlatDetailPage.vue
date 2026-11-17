<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button default-href="/tabs/menu" text="Menu" />
                </ion-buttons>
                <ion-title>Details plat</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-spinner v-if="chargement" name="crescent"></ion-spinner>
            <ion-label v-else-if="erreur">{{ erreur }}</ion-label>
            <ion-card v-else-if="plat">
                <ion-card-header>
                    <ion-card-subtitle>{{ plat?.categorie?.nom }}</ion-card-subtitle>
                    <ion-card-title>{{ plat?.nom }}</ion-card-title>
                    <ion-card-content>{{ plat?.description }}
                        <p v-if="riz"> Avec du riz : {{ formatAriary(plat.prix + riz.prix) }} </p>
                        <ion-button slot="end" fill="clear" :disabled="!plat.disponible"
                            @click.stop.prevent="ajouterAuPanier(plat)" expand="block">Ajouter au panier</ion-button>
                    </ion-card-content>
                </ion-card-header>
            </ion-card>
        </ion-content>
    </ion-page>

</template>

<script setup>
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent,
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonLabel, IonSpinner,
    useIonRouter, IonButton
} from '@ionic/vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import { ref, onMounted } from 'vue';
import { usePanier } from '@/composables/usePanier';
import { toastController } from '@ionic/vue';
import { formatAriary } from '@/utils/format';

const route = useRoute();
const ionrouter = useIonRouter();
// ionrouter.navigate('tabs/commandes', 'forward', 'replace')
const idplat = route.params.id;

const plat = ref(null);
const erreur = ref('');
const chargement = ref(true);

const riz = ref(null);

const { ajouter } = usePanier();

async function chargerPlat() {
    try {
        plat.value = await api.getPlat(idplat);
        riz.value = await api.getPlat(7);
        chargement.value = false;

    } catch (e) {
        if (e.status || e.message === 404) {
            erreur.value = "Ce plat n'existe pas";
        } else {
            erreur.value = "Erreur lors du chargement du plat";
        }
    } finally {
        chargement.value = false;
    }
}


async function ajouterAuPanier(plat) {
    try {
        ajouter(plat);
        const toast = await toastController.create({
            message: `${plat.nom} ajouté au panier`,
            duration: 1500, position: 'top', color: 'success'
        });
        ionrouter.back();


        await toast.present();

    } catch (e) {
        console.error('Erreur lors de l\'ajout au panier :', e);
    }
}

onMounted(chargerPlat);

</script>