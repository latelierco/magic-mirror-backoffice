<script setup>

  import { useRouter } from 'vue-router'
  import {
    signOut,
    getAuth
  } from 'firebase/auth'

  const router = useRouter()

  const logout = async() => {
    try {
      const auth = getAuth()
      await signOut(auth)
      return void router.push('/')
    } catch(err) {
      console.error(err)
    }
  }

</script>


<template>

    <v-system-bar>

      <div class="logout-holder" title="Log Out" @click="logout">
        <button class="mdi mdi-power logout-button"></button>
      </div>

    </v-system-bar>

</template>