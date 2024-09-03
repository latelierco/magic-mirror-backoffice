<script setup>

  import { ref, inject, onMounted } from 'vue'

  const {
    collection,
    deleteDoc,
    doc,
    getFirestore,
    getDocs,
    query
  } = inject('firestore')

  const db = getFirestore()

  import config from '../config'
  import appUtils from '/src/assets/js/app-utils'

  const confirmation = ref({
    fr: 'Les contenus ont bien été supprimés',
    eng: 'Selected contents have been deleted',
  })

  const errMessage = ref({
    fr: 'Une erreur est survenue lors de la suppression des contenus sélectionnés',
    eng: 'Deleting selected contents caused an error',
  })


  const { DELAY } = config
  const contents = ref([])
  const editContents = ref([])
  const userMessage = ref('')
  const backdropIsActive = ref(false)
  const backdropColor = ref('blue')
  const messageElShowing = ref(false)

  const populate = async() => {
    const contentsQuery = query(collection(db, 'contents'))
    const snap = await getDocs(contentsQuery)
    snap.forEach(doc => {
      const contentId = doc.id
      const content = Object.assign({}, { id: contentId }, doc.data())
      contents.value.push(content)
    })
  }

  const iterateDelete = async() => {
    const sequence = async(contentId) => {
      await deleteDoc(doc(db, 'contents', contentId))
      const contentsToDeleteIndex = contents.value.findIndex(content => content.id === contentId)
      contents.value.splice(contentsToDeleteIndex, 1)
    }

    const ps = editContents
      .value
      .map(async(contentId, idx) => await sequence(contentId, idx))

    return await Promise.all(ps)
  }

  const UIConfirm = () => {
    const { fr, eng } = confirmation.value
    assignUserMessage(fr)
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

  const extractErrContent = err => {
    return err?.cause && err.cause || err.stack
  }

  const userMessageFadeOut = () => {
    setTimeout(() => backdropIsActive.value = false, DELAY)
  }

  const suppressAction = async() => {
    try {
      await iterateDelete()
      editContents.value = []
      UIConfirm()
    } catch(err) {
      UIAlert(err)
    }
  }


  onMounted(async() => await populate())

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

      <v-container class="py-8 pr-6 pl-16" fluid >

        <v-list-subheader></v-list-subheader>


        <div id="title-and-actions">

          <h1>Les Contenus</h1>

          <div id="suppress-action" v-if="editContents.length > 0" class="mt-1 ml-10" @click="suppressAction()">
            Supprimer
            <span id="delete-icon" class="mdi mdi-delete"></span>
          </div>
          
        </div>


        <v-divider class="mt-5 mb-2 mr-16"></v-divider>

        <template v-for="content in contents" :key="content.id">

          <v-list-item>

            <div class="content-item">

              <button v-if="editContents.includes(content.id)" class="mdi mdi-pencil-circle contents-icon-checked"></button>

              <button v-else class="mdi mdi-pencil-circle contents-icon"></button>

              <input title="Sélectionner l'utilisateur" style="cursor: pointer;" :id="content.id" :value="content.id" type="checkbox" v-model="editContents" class="content-item-input">

              <RouterLink class="content-link" :to="'/contents/' + content.id" title="Modifier le contenu">

                <span>{{ content.name }}</span>
                <span>{{ content.date }}</span>
                <span v-if="content.active === true">actif</span>
                <span v-else>non-actif</span>

              </RouterLink>

            </div>

          </v-list-item>

          <v-divider class="mr-16"></v-divider>

        </template>


      </v-container>
    </v-main>
  </v-app>


  <RouterLink class="content-add-holder" title="Ajouter un contenu" :to="'/contents/add'">
    <button class="mdi mdi-pencil-plus content-add"></button>
  </RouterLink>


  <div id="confirmation-holder" :class=" backdropIsActive === true ? 'fadein' : 'fadeout' ">
    <div id="backdrop-el" :class=" backdropColor "></div>

    <div id="messagebox-el" :class=" messageElShowing === true ? 'showing' : '' ">
      <span>{{ userMessage }}</span>
    </div>

  </div>


</template>
