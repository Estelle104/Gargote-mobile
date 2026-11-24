import { Preferences } from "@capacitor/preferences";

export async function lire<T>(cle: string, defaut: T, valide: (x: unknown) => x is T): Promise<T> {
        const result = await Preferences.get({ key: cle });

        try {
                if (result.value === null) {
                        return defaut;
                }

                const json = JSON.parse(result.value);
                if (valide(json)) {
                        return json;
                }
                return defaut;
        } catch (e) {
                console.error("Erreur de lecture du stockage pour la clé " + cle + " : " + e);
                return defaut;
        }

}


export async function ecrire<T>(cle: string, valeur: T): Promise<void> {
        await Preferences.set({ key: cle, value: JSON.stringify(valeur) || "" });
}

