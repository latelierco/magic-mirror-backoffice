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


  const suspendMesssage = ref({
    fr: 'Génération du modèle, merci de bien vouloir patienter ..',
    eng: 'Generating model.',
  })

  const confirmation = ref({
    fr: 'Les utilisateurs ont bien été supprimés',
    eng: 'Selected users have been deleted',
  })

  const errMessage = ref({
    fr: 'Une erreur est survenue lors de la suppression des utilisateurs sélectionnés',
    eng: 'Deleting selected users caused an error',
  })


  const { DELAY } = config
  const users = ref([])
  const editUsers = ref([])
  const userMessage = ref('')
  const backdropIsActive = ref(false)
  const backdropColor = ref('blue')
  const messageElShowing = ref(false)
  const suspendMessage = ref(false)


  const populate = async() => {
    const userQuery = query(collection(db, 'users'))
    const snap = await getDocs(userQuery)
    snap.forEach(doc => {
      const userId = doc.id
      const user = Object.assign({}, { id: userId }, doc.data())
      users.value.push(user)
    })
  }

  const iterateDelete = async() => {

    const sequence = async(userId) => {
      await deleteUserPhotos(userId)
      await deleteDoc(doc(db, 'users', userId))
      const userToDeleteIndex = users.value.findIndex(user => user.id === userId)
      users.value.splice(userToDeleteIndex, 1)
    }

    const ps = editUsers
      .value
      .map(async(userId, idx) => await sequence(userId, idx))

    return await Promise.all(ps)
  }

  const deleteUserPhotos = async(userId) => {
    const userSlug = getUserSlug(userId)
    const url = getServiceUrl(userSlug)
    return await sendDeleteQuery(url, userSlug)
  }

  const getUserSlug = userId => {
    const userObj = users.value.find(user => user.id === userId)
    const { name_first } = userObj
    return appUtils.slugify(name_first)
  }

  const getServiceUrl = userSlug => {
    const { HTTP_SERVICE: { URL, PORT } } = config
    return `http://${ URL }:${ PORT }/users/${ userSlug }/photos`
  }

  const sendDeleteQuery = async(url) => {
    const resp = await fetch(url, { method: 'DELETE' })
    if (!resp.ok)
      throw Error(`delete query caused an error with status code ${ resp.status }`)
    return true
  }

  const UISuspend = () => {
    backdropColor.value = 'blue'
    const { fr, eng } = suspendMesssage.value
    suspendMessage.value = true
    assignUserMessage(fr)
    console.info(`[INFO] ${ eng }`)
  }

  const UIConfirm = () => {
    const { fr, eng } = confirmation.value
    assignUserMessage(fr)
    suspendMessage.value = false
    console.info(`[INFO] ${ eng }`)
    userMessageFadeOut()
  }

  const UIAlert = err => {
    backdropColor.value = 'red'
    const { fr, eng } = errMessage.value
    suspendMessage.value = false
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
      UISuspend()
      await iterateDelete()
      editUsers.value = []
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

          <h1>Les Utilisateurs</h1>

          <div id="suppress-action" v-if="editUsers.length > 0" class="mt-1 ml-10" @click="suppressAction()">
            Supprimer
            <span id="delete-icon" class="mdi mdi-delete"></span>
          </div>
          
        </div>


        <v-divider class="mt-5 mb-1 mr-16"></v-divider>

        <template v-for="user in users" :key="user.id">

          <v-list-item>

            <div class="user-item">

              <button v-if="editUsers.includes(user.id)" class="mdi mdi-account-circle users-icon-checked"></button>

              <button v-else class="mdi mdi-account-circle users-icon"></button>

              <input title="Sélectionner l'utilisateur" style="cursor: pointer;" :id="user.id" :value="user.id" type="checkbox" v-model="editUsers" class="user-item-input">

              <RouterLink :to="'/users/' + user.id" title="Modifier l'utilisateur">

                <span>{{ user.name_first }} {{ user.name_last }}</span>

              </RouterLink>

            </div>

          </v-list-item>

          <v-divider class="mr-16"></v-divider>

        </template>


      </v-container>
    </v-main>
  </v-app>

  <RouterLink class="user-add-holder" title="Ajouter un utilisateur" :to="'/users/add'">
    <button class="mdi mdi-account-plus user-add"></button>
  </RouterLink>

  <div id="confirmation-holder" :class=" backdropIsActive === true ? 'fadein' : 'fadeout' ">
    <div id="backdrop-el" :class=" backdropColor "></div>

    <div id="messagebox-el" :class=" messageElShowing === true ? 'showing' : '' ">
      
      <span v-if=" suspendMessage === true " class="suspend-message">{{ userMessage }} <div class="loader"></div></span>
      <span v-else>{{ userMessage }}</span>

    </div>

  </div>

</template>
