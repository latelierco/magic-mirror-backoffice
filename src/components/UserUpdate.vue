<script setup>

  import { ref, inject } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import config from '../config'
  import appUtils from '/src/assets/js/app-utils'

  const {
    doc,
    getDoc,
    setDoc,
    getFirestore
  } = inject('firestore')

  const {
    slugify,
    obectFormatstrings,
    extractErrContent
  } = appUtils


  const route = useRoute()
  const router = useRouter()
  const db = getFirestore()
  const { id = null } = route.params;
  const { DELAY } = config

  const confirmation = ref({
    fr: 'L\'utilisateur a bien été modifié',
    eng: 'User has been updated successfully',
  })

  const errMessage = ref({
    fr: 'Une erreur est survenue lors de la modification de l\'utilisateur',
    eng: 'Updating user caused an error',
  })

  const userMessage = ref('')
  const backdropIsActive = ref(false)
  const backdropColor = ref('blue')
  const messageElShowing = ref(false)
  const userId = ref(id);

  const User = {
    current: {},
    stringFormat: () => obectFormatstrings(User.current),
    save: async() => {
      try {
        User.current.user_name = slugify(User.current.name_first)
        await setDoc(doc(db, 'users', userId.value), User.current)
      } catch(err) {
        throw Error('Error: saving user to firebase has caused an error', { cause: err })
      }
    }
  }

  const docRef = doc(db, 'users', userId.value)
  const snap = await getDoc(docRef)
  User.current = Object.assign({}, snap.data(), { id: userId.value })

  const UIConfirm = () => {
    const { fr, eng } = confirmation.value
    assignUserMessage(fr)
    backdropIsActive.value = true
    console.info(`[INFO] ${ eng }`)
    userMessageFadeOut()
  }

  const UIAlert = err => {
    backdropColor.value = 'red'
    const { fr, eng } = errMessage.value
    assignUserMessage(fr)
    backdropIsActive.value = true
    console.error(`[ERROR] ${ eng }`)
    console.error(extractErrContent(err))
    userMessageFadeOut()
  }

  const assignUserMessage = msg => {
    userMessage.value = msg
    backdropIsActive.value = true
    messageElShowing.value = true
  }

  const userMessageFadeOut = () => {
    setTimeout(() => backdropIsActive.value = false, DELAY)
  }

  const redirect = () => {
    setTimeout(() => router.push('/users'), DELAY)
  }

  const submitForm = async() => {
    try {
      User.stringFormat()
      await User.save()
      UIConfirm()
      redirect()
    } catch(err) {
      UIAlert(err)
    }
  }


 </script>


<template>

  <v-app id="inspire">

    <Logout />

    <LeftMenu/>

    <v-main>

      <v-container class="py-8 pr-6 form-container pl-16" fluid >

        <RouterLink class="page-back" title="Retour" :to="'/users'">
          <button class="mdi mdi-arrow-left-bold"></button>
        </RouterLink>


        <form>

          <h1 class="h1-main">Informations principales</h1>            

          <v-divider class="h1-hr-main"></v-divider>

          <label for="name_first">Prénom</label>
          <input type="text" class="latelier-form-input mt-2 mb-4" id="name_first" placeholder="Prénom" v-model="User.current.name_first"/>

          <label for="name_last">Nom de Famille</label>
          <input type="text" class="latelier-form-input mt-2 mb-4" id="name_last" placeholder="Nom de Famille" v-model="User.current.name_last"/>

          <h2 class="h2-main">Adresse de Résidence</h2>
          <v-divider class="h2-hr-main"></v-divider>

          <label for="home_address">Adresse <span class="sub">( numéro, type et nom de la voie )</span></label>
          <input type="text" class="latelier-form-input mt-2 mb-4" id="home_address" placeholder="Adresse" v-model="User.current.location_home.address"/>

          <label for="home_zip_code">Code Postal</label>
          <input type="text" class="latelier-form-input mt-2 mb-4" id="home_zip_code" placeholder="Code Postal" v-model="User.current.location_home.zip_code"/>

          <label for="home_city">Ville ou Localité</label>
          <input type="text" class="latelier-form-input mt-2 mb-4" id="home_city" placeholder="Ville" v-model="User.current.location_home.city"/>


          <h2 class="h2-main">Adresse du Lieu de Travail</h2>
          <v-divider class="h2-hr-main"></v-divider>

          <label for="work_address">Adresse <span class="sub">( numéro, type et nom de la voie )</span></label>
          <input type="text" class="latelier-form-input mt-2 mb-4" id="work_address" placeholder="Adresse" v-model="User.current.location_work.address" />

          <label for="work_zip_code">Code Postal</label>
          <input type="text" class="latelier-form-input mt-2 mb-4" id="work_zip_code" placeholder="Code Postal" v-model="User.current.location_work.zip_code" />

          <label for="work_city">Ville ou Localité</label>
          <input type="text" class="latelier-form-input mt-2 mb-4" id="work_city" placeholder="Ville" v-model="User.current.location_work.city" />

          <v-divider class="h2-hr-main"></v-divider>

          <button type="button" class="latelier-form-input latelier-form-submit mt-6 mb-4" @click="submitForm">Enregistrer</button>

        </form>

      </v-container>

      <RouterLink class="user-add-holder" :to="`/users/${ userId }/photo/add/`">
        <button class="mdi mdi-camera-plus user-add"></button>
      </RouterLink>

      <div id="confirmation-holder" :class=" backdropIsActive === true ? 'fadein' : 'fadeout' ">
        <div id="backdrop-el" :class=" backdropColor "></div>
        <div id="messagebox-el" :class=" messageElShowing === true ? 'showing' : '' ">
          {{ userMessage }}
        </div>
      </div>

    </v-main>
  </v-app>
</template>
