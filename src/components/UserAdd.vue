<script setup>

  import { ref, inject } from 'vue'
  import { useRouter } from 'vue-router'
  import config from '../config'
  import appUtils from '/src/assets/js/app-utils'

  const {
    addDoc,
    collection,
    getFirestore
  } = inject('firestore')

  const db = getFirestore()


  const {
    slugify,
    obectFormatstrings,
    extractErrContent
  } = appUtils

  const router = useRouter()
  const { DELAY, USER_GROUP } = config

  const confirmation = ref({
    fr: 'L\'utilisateur a bien été créé',
    eng: 'User has been created successfully',
  })

  const errMessage = ref({
    fr: 'Une erreur est survenue lors de la création de l\'utilisateur',
    eng: 'Creating user caused an error',
  })

  const userMessage = ref('')
  const backdropIsActive = ref(false)
  const backdropColor = ref('blue')
  const messageElShowing = ref(false)


  const User = {
    current: {
      name_first: '',
      name_last: '',
      user_name: '',
      location_home: {
        address: '',
        zip_code: '',
        city: '',
      },
      location_work: {
        address: '46 rue de l\'Arbre Sec',
        zip_code: '75001',
        city: 'Paris',
      }
    },
    stringFormat: () => obectFormatstrings(User.current),
    save: async() => {
      try {
        User.current.user_name = slugify(User.current.name_first)
        await addDoc(collection(db, 'users'), User.current)
      } catch(err) {
        throw Error('Error: saving user to firebase has caused an error', { cause: err })
      }
    }
  }

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

    <v-system-bar>

      <v-spacer></v-spacer>

      <v-icon>mdi-square</v-icon>
      <v-icon>mdi-circle</v-icon>
      <v-icon>mdi-triangle</v-icon>

    </v-system-bar>

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

            <label for="address">Adresse <span class="sub">( numéro, type et nom de la voie )</span></label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="address" placeholder="Adresse" v-model="User.current.location_home.address"/>

            <label for="zip_code">Code Postal</label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="zip_code" placeholder="Code Postal" v-model="User.current.location_home.zip_code"/>

            <label for="city">Ville ou Localité</label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="city" placeholder="Ville" v-model="User.current.location_home.city"/>


            <h2 class="h2-main">Adresse du Lieu de Travail</h2>
            <v-divider class="h2-hr-main"></v-divider>

            <label for="address">Adresse <span class="sub">( numéro, type et nom de la voie )</span></label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="address" placeholder="Adresse" v-model="User.current.location_work.address" />

            <label for="zip_code">Code Postal</label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="zip_code" placeholder="Code Postal" v-model="User.current.location_work.zip_code" />

            <label for="city">Ville ou Localité</label>
            <input type="text" class="latelier-form-input mt-2 mb-4" id="city" placeholder="Ville" v-model="User.current.location_work.city" />

            <v-divider class="h2-hr-main"></v-divider>

            <button type="button" class="latelier-form-input latelier-form-submit mt-6 mb-4" @click="submitForm">Enregistrer</button>

          </form>

      </v-container>

      <div id="confirmation-holder" :class=" backdropIsActive === true ? 'fadein' : 'fadeout' ">
        <div id="backdrop-el" :class=" backdropColor "></div>

        <div id="messagebox-el" :class=" messageElShowing === true ? 'showing' : '' ">

          <span>{{ userMessage }}</span>

        </div>

      </div>

    </v-main>
  </v-app>
</template>
