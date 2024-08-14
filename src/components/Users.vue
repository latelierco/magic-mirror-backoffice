<script setup>

  import { ref } from 'vue'
  import { useFirestore, useCollection } from 'vuefire'
  import { doc , collection, deleteDoc } from 'firebase/firestore'

  const db = useFirestore()
  const users = useCollection(collection(db, 'users'))
  const delay = 1500

  const confirmation = ref({
    fr: 'Les utilisateurs ont bien été supprimés',
    eng: 'Selected users have been deleted',
  })

  const errMessage = ref({
    fr: 'Une erreur est survenue lors de la suppression des utilisateurs sélectionnés',
    eng: 'Deleting selected users caused an error',
  })

  const userMessage = ref('')
  const editUsers = ref([])
  const isActive = ref(false)
  const backdropColor = ref('blue')

  const iterateDelete = async(users) => {
    const ps = users.value.map(async(user) => {
      console.debug('user', user)
      return await deleteDoc(doc(db, 'users', user));
    })
    setTimeout(() => Promise.all(ps), delay)
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
    setTimeout(() => isActive.value = false, delay)
  }

  const suppressAction = async() => {
    try {
      await iterateDelete(editUsers)
      UIConfirm()
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

              <div v-if="editUsers.includes(user.id)" class="mdi mdi-account-circle users-icon-checked"></div>

              <div v-else class="mdi mdi-account-circle users-icon"></div>

              <input style="cursor: pointer;" :id="user.id" :value="user.id" type="checkbox" v-model="editUsers" class="user-item-input">

              <RouterLink :to="'/user/' + user.id">

                <span>{{ user.name_first }} {{ user.name_last }} - User {{ $route.params.id }}</span>

              </RouterLink>

            </div>

          </v-list-item>

          <v-divider class="mr-16"></v-divider>

        </template>


      </v-container>
    </v-main>
  </v-app>

  <RouterLink class="user-add-holder" :to="'/user/add'">
    <div class="mdi mdi-account-plus user-add"></div>
  </RouterLink>

  <div id="confirmation-holder" :class=" isActive === true ? 'fadein' : 'fadeout' ">
    <div id="backdrop-el" :class=" backdropColor "></div>
    <div id="messagebox-el">{{ userMessage }}</div>
  </div>

</template>

<script>

  export default {
    data: () => ({}),
    mounted: () => {
      const userItems = document.querySelectorAll('.user-item')
      console.debug('userItems', userItems.length)
    }
  }

</script>


<style>

  #title-and-actions {
    display: flex;
    flex-direction: row;
  }


  #suppress-action {
    font-size: 24px;
    font-style: italic;
    cursor: pointer;
  }


  #suppress-action::before {
    content: '|';
    font-style: normal;
    margin-right: 28px;
    opacity: .4;
  }


  #delete-icon {
    font-size: 28px;
  }

  .user-add-holder {
    position: absolute;
    right: 80px;
    bottom: 80px;
    width: 80px;
    height: 80px;
    border: 3px solid #fff;
    box-sizing: border-box;
    border-radius: 40px;
    opacity: .4;
    color: #fff;
    background-color: #06326C;
  }


  .user-add-holder:hover {
    opacity: .8;
  }

  .user-add {
    position: absolute;
    font-size: 52px;
    width: 52px;
    height: 52px;
    margin: auto;
    top: -3px;
    left: 7px;
  }

</style>