<script setup>

  import { ref } from 'vue'
  import { useFirestore, useCollection } from 'vuefire'
  import { collection } from 'firebase/firestore'

  const db = useFirestore()
  const users = useCollection(collection(db, 'users'))

  const editUsers = ref([])

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


        <div>Edit Users : {{ editUsers }}</div>

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

          <v-divider></v-divider>

        </template>


      </v-container>
    </v-main>
  </v-app>

  <RouterLink class="user-add-holder" :to="'/user/add'">
    <div class="mdi mdi-account-plus user-add"></div>
  </RouterLink>

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

  body {
    position: relative;
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