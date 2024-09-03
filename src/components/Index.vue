<script setup>

  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import appUtils from '/src/assets/js/app-utils'
  import config from '../config'

  import {
    getAuth,
    signInWithEmailAndPassword
  } from 'firebase/auth'


  const { extractErrContent } = appUtils
  const { DELAY } = config
  const router = useRouter()

  const Credentials = {
    current: {
      email: '',
      password: ''
    }
  }

  const errMessage = ref({
    fr: 'Une erreur est survenue lors de l`authentication',
    eng: 'Authentication caused an error',
  })

  const userMessage = ref('')
  const backdropIsActive = ref(false)
  const backdropColor = ref('blue')
  const messageElShowing = ref(false)


  const submitForm = async e => {

    e.preventDefault()

    try {
      const userCredential = await signin(Credentials.current.email, Credentials.current.password)
      const { user: { accessToken = null } = {} } = userCredential
      if (accessToken === null)
        throw Error('Error: authentication failed')
      return router.push('/users')
    } catch(err) {
      UIAlert(err)
    }
  } 

  const signin = async(email, password) => {
    const auth = getAuth();
    return await signInWithEmailAndPassword(auth, email, password)
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
    setTimeout(() => {
      userMessage.value = ''
      backdropIsActive.value = false
      messageElShowing.value = false
    }, DELAY)
  }


</script>


<template>
  <v-container class="fill-height">
    <v-responsive
      class="align-centerfill-height mx-auto"
      max-width="900"
    >
      <v-img
        class="mb-4"
        height="150"
        src="@/assets/images/ligne-variant-normal-fichier-1white_square_logo.png"
      />

      <div class="text-center">
        <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>

        <h1 class="text-h2 font-weight-bold">L'Atelier</h1>
      </div>

      <div class="py-4" />

        <form style="margin: 0">
          <div style="background-color: #093a7a; border-radius: 10px; width: 655px; margin: 15px auto 0; display: flex; flex-direction: column;">

            <input type="email" placeholder="email" class="latelier-form-input mt-7" style="margin: auto;" v-model="Credentials.current.email">
            <input type="password" placeholder="password" class="latelier-form-input mt-4" style="margin: auto;" v-model="Credentials.current.password">
            <button type="button" class="latelier-form-input latelier-form-submit mt-8 mb-7" style="margin: auto;" @click="submitForm">Login</button>

          </div>
        </form>

    </v-responsive>
  </v-container>

  <div id="confirmation-holder" :class=" backdropIsActive === true ? 'fadein' : 'fadeout' ">
    <div id="backdrop-el" :class=" backdropColor "></div>
    <div id="messagebox-el" :class=" messageElShowing === true ? 'showing' : '' ">
      <span>{{ userMessage }}</span>
    </div>
  </div>


</template>
