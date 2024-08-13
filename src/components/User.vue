<script setup>

  import { useRoute } from 'vue-router'
  import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
  import appUtils from '/src/assets/js/app-utils'

  const route = useRoute()
  const db = getFirestore()
  const { id: userId = null } = route.params;

  const docRef = doc(db, 'users', userId)
  const snap = await getDoc(docRef)
  const currentUser = Object.assign({}, snap.data(), { id: userId })

  const submitForm = async() => {  
    for (const key in currentUser) {
      currentUser[key] = appUtils.capitalize(currentUser[key])
    }
    await setDoc(doc(db, 'users', userId), currentUser)  
    console.info('[INFO] User is updated')
  }

</script>


<template>

  <v-app id="inspire">

    <v-system-bar>

      <v-spacer></v-spacer>

      <v-icon>mdi-square</v-icon>
      <v-icon>mdi-circle</v-icon>
      <v-icon>mdi-triangle</v-icon>

    </v-system-bar>

    <LeftMenu/>

    <v-main>

      <v-container class="py-8 px-6" fluid >

          <form>

            <h1 class="h1-main">{{ currentUser.name_first }} {{ currentUser.name_last }}</h1>

            <v-divider class="h1-hr-main"></v-divider>

            <label for="name_first">Prénom</label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="name_first" name="name_first"  placeholder="Prénom" v-model="currentUser.name_first"/>

            <label for="name_last">Nom de Famille</label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="name_last" name="name_last"  placeholder="Nom de Famille" v-model="currentUser.name_last"/>

            <h2 class="h2-main">Adresse de Résidence</h2>
            <v-divider class="h1-hr-main"></v-divider>

            <label for="address">Adresse <span class="sub">( numéro, type et nom de la voie )</span></label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="address" name="address"  placeholder="Adresse" v-model="currentUser.location_home.address"/>

            <label for="zip_code">Code Postal</label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="zip_code" name="zip_code" placeholder="Code Postal" v-model="currentUser.location_home.zip_code"/>

            <label for="city">Ville ou Localité</label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="city" name="city"  placeholder="Ville" v-model="currentUser.location_home.city"/>

            <button type="button" class="latelier-form-input latelier-form-submit mt-6 mb-4" @click="submitForm">Save</button>

          </form>

      </v-container>
    </v-main>
  </v-app>
</template>


<style>

  .h1-main {
    font-family: 'Montserrat';
    color: #fff;
  }


  .h2-main {
    font-family: 'Montserrat';
    margin-bottom: 20px;
    color: #fff;
    font-weight: normal;
  }


  .h1-hr-main {
    margin-bottom: 35px;
  }


  form {
    margin-left: 150px;
    display: flex;
    flex-direction: column;
  }


  form > label {
    font-family: 'Montserrat';
  }


  .sub {
    font-size: 12px;
  }


  .latelier-form-input {
    background-color: #fff;
    border-radius: 2px;
    width: 400px;
    padding: 3px 10px;
    font-size: 25px;
    color: #797979;
    font-family: 'Montserrat';
  }


  .latelier-form-submit {
    background-color: #00EC7B;
    color: #06326C;
    height: 40px;
    font-size: 20px;
  }


  .latelier-form-submit:hover {
    background-color: #00df75;
  }


  .latelier-form-submit:active {
    background-color: #4deea1;
  }

</style>
