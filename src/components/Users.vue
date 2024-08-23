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
  const isActive = ref(false)
  const backdropColor = ref('blue')


  const populate = async() => {
    const userQuery = query(collection(db, 'users'))
    const snap = await getDocs(userQuery)
    snap.forEach(doc => {
      const userId = doc.id
      users.value.push(Object.assign({}, { id: userId }, doc.data()))
    })
  }

  const iterateDelete = async() => {

    const ps = editUsers.value.map(async(userId) => {
      try {
        await deleteDoc(doc(db, 'users', userId))
        const userToDeleteIndex = users.value.findIndex(user => user.id === userId)
        users.value.splice(userToDeleteIndex, 1)
      } catch(err) {
        console.error(err)
      }
    })

    setTimeout(() => {
      return Promise.all(ps)
        .then(() => editUsers.value = [])
    }, DELAY)
  }

  const UIConfirm = () => {
    const { fr, eng } = confirmation.value
    assignUserMessage(fr)
    isActive.value = true
    console.info(`[INFO] ${ eng }`)
    userMessageFadeOut()
  }

  const UIAlert = err => {
    backdropColor.value = 'red'
    const { fr, eng } = errMessage.value
    assignUserMessage(fr)
    isActive.value = true
    console.error(`[ERROR] ${ eng }`)
    console.error(extractErrContent(err))
    userMessageFadeOut()
  }

  const assignUserMessage = msg => {
    userMessage.value = msg
  }

  const extractErrContent = err => {
    return err?.cause && err.cause || err.stack
  }

  const userMessageFadeOut = () => {
    setTimeout(() => isActive.value = false, DELAY)
  }

  const suppressAction = async() => {
    try {
      await iterateDelete()
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

      <v-container class="py-8 px-6" fluid >

        <v-list-subheader></v-list-subheader>


        <div id="title-and-actions">

          <h1>Les Utilisateurs</h1>

          <div id="suppress-action" v-if="editUsers.length > 0" class="mt-1 ml-10" @click="suppressAction()">
            Supprimer
            <span id="delete-icon" class="mdi mdi-delete"></span>
          </div>
          
        </div>


        <v-divider class="mt-5 mb-2 mr-16"></v-divider>

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

  <div id="confirmation-holder" :class=" isActive === true ? 'fadein' : 'fadeout' ">
    <div id="backdrop-el" :class=" backdropColor "></div>
    <div id="messagebox-el">{{ userMessage }}</div>
  </div>

</template>
