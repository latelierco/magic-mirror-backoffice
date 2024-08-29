<script setup>

  import { ref, inject, reactive, onMounted, onBeforeUnmount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import config from '../config'
  import appUtils from '/src/assets/js/app-utils'

  const {
    addDoc,
    collection,
    doc,
    getDoc,
    getFirestore
  } = inject('firestore')


  import {
    AddUserPhotosError,
    GetExistingPhotosError,
    SaveUserPhotosError
  } from '../assets/js/errors'

  const {
    obectFormatstrings,
    extractErrContent,
    slugify,
    getPhotoId,
    getUuid,
  } = appUtils


  const route = useRoute()
  const router = useRouter()
  const db = getFirestore()

  const { id: userId = null } = route.params;

  const {
    VIDEO_VIEWPORT : {
      WIDTH
    },
    DELAY,
    HTTP_SERVICE: {
      URL,
      PORT
    }
  } = config


  const suspendMesssage = ref({
    fr: 'Génération du modèle, merci de bien vouloir patienter ..',
    eng: 'Generating model.',
  })

  const confirmation = ref({
    fr: 'Les images de l\'utilisateur ont bien été enregistrées',
    eng: 'User pictures have been saved successfully',
  })

  const errMessage = ref({
    AddUserPhotosError: {
      fr: 'Une erreur inconnue est survenue sur la page',
      eng: 'An unknown error occured on page',
    },
    GetExistingPhotosError: {
      fr: 'Une erreur est survenue lors de la récupération des photos de l\'utilisateur',
      eng: 'Getting user photos caused an error',
    },
    SaveUserPhotosError: {
      fr: 'Une erreur est survenue lors de l\'enregistrement des photos de l\'utilisateur',
      eng: 'Saving user photos caused an error',
    },
  })

  const warningMessage = ref({
    fr: 'Etes-vous certain de vouloir supprimer cette image ?'
  })

  const User = {
    current: {
      name_first: '',
      name_last: '',
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
    getSlug: () => slugify(User.current.name_first),
    capitalize: () => obectFormatstrings(User.current),
    save: () => {
      const errMessage = 'Error: calling backoffice HTTP service failed with status code'
      const url = getHttpServiceUrl()
      const body = reduceHttpBody()

      return fetch(url, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      })
        .then(resp => {
          if (!resp.ok)
            return Promise.reject(new SaveUserPhotosError(`${ errMessage } ${ resp.status }`))
          return resp.json()
        })
        .then(list => toPhotoList(list))
    }
  }

  let streaming = false
  let canvasInterval = null

  const width = 640
  // height will be computed
  // based on the input stream
  let height = 0


  let state = null
  let video = null
  let canvas = null
  let appBody = null

  const backdropIsActive = ref(false)
  const backdropColor = ref('blue')
  const hasFlash = ref(false)
  const featured = ref()
  const translateValue = ref()
  const stripShowing = ref(false)
  const userMessage = ref('')
  const suspendMessage = ref(false)
  const messageElShowing = ref(false)
  const alertConfirmShowing = ref(false)
  const promptShowing = ref(false)
  const backdropZIndexHigher = ref(false)
  const imageToDelete = ref()
  const promptMode = ref()


  const docRef = doc(db, 'users', userId)
  const snap = await getDoc(docRef)
  User.current = Object.assign({}, snap.data(), { id: userId })
  console.debug('User.current', User.current)

  const UISuspend = () => {
    backdropColor.value = 'blue'
    const { fr, eng } = suspendMesssage.value
    suspendMessage.value = true
    assignUserMessage(fr)
    console.info(`[INFO] ${ eng }`)
  }

  const UIConfirm = async() => {
    backdropColor.value = 'blue'
    const { fr, eng } = confirmation.value
    suspendMessage.value = false
    assignUserMessage(fr)
    console.info(`[INFO] ${ eng }`)
    await userMessageFadeOut()
  }

  const UIAlert = async(err) => {
    backdropColor.value = 'red'
    const errName = getErrorName(err)

    const { fr, eng } = errMessage?.value?.[errName] ||
      errMessage.value['AddUserPhotosError']

    suspendMessage.value = false
    assignUserMessage(fr)
    alertConfirmShowing.value = true

    console.error(`[ERROR] ${ eng }`)
    console.error(err)
  }

  const UIWarning = async() => {
    backdropColor.value = 'red'
    const { fr } = warningMessage.value
    suspendMessage.value = false
    assignUserMessage(fr)
    backdropZIndexHigher.value = true
  }

  const getErrorName = err => {
    return err.constructor.name
  }

  const assignUserMessage = msg => {
    userMessage.value = msg
    backdropIsActive.value = true
    messageElShowing.value = true
  }

  const backdropToLower = () => {
    backdropColor.value = 'blue'
    messageElShowing.value = false
    alertConfirmShowing.value = false
    promptShowing.value = false
    backdropZIndexHigher.value = false
  }

  const userMessageFadeOut = (delay = null) => {

    if (suspendMessage.value === true)
      return

    return new Promise(resolve => {
      return setTimeout(() => {
        stripShowing.value = false
        backdropIsActive.value = false
        backdropToLower()
        return resolve()
      }, !!delay && delay || DELAY)
    })
  }

  const redirect = () => {
    setTimeout(() => router.push(`/users/${ userId }`), DELAY)
  }

  const capturePhoto = e => {

    e.preventDefault()

    hasFlash.value = true;
    video.pause()

    const data = getCaptureData()

    const photoObj = {
      id: getUuid(),
      deleteStatus: false,
      fileToBase64: data,
      mimeType: 'image/jpeg',
      saveStatus: false
    }

    state.photoList.push(photoObj)
    state.stripList.push(photoObj)

    setTimeout(() => {
      video.play()
      hasFlash.value = false
    }, 1000)
  }

  const getCaptureData = () => {
    const height = getVideoHeight()
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, WIDTH, height)
    return canvas.toDataURL('image/jpeg')
  }

  const getVideoHeight = () => {
    return video.videoHeight
  }

  const submitForm = async() => {
    try {
      User.capitalize()
      UISuspend()
      await User.save()
      userMessage.value = ''
      suspendMessage.value = false
      await userMessageFadeOut(DELAY / 10)
      setTimeout(() => {
        UIConfirm()
        redirect()        
      }, 500)
    } catch(err) {
      UIAlert(err)
    }
  } 

  const reduceHttpBody = () => {
    return state.photoList.filter(photo => {
      return photo.saveStatus === false ||
        (
          photo.saveStatus === true &&
          photo.deleteStatus === true
        )
    })
      .map(photo => {
        if (photo.deleteStatus)
          delete photo.fileToBase64
        return photo
      })
  }

  const getExistingPhotos = () => {

    const url = getHttpServiceUrl()

    return fetch(url)
      .then(resp => {
        if (!resp.ok)
          return Promise.reject(new GetExistingPhotosError(`Error: calling backoffice HTTP service failed with status code ${ resp.status }`))
        return resp.json()
      })
      .then(list => concatToPhotoList(list))
      .catch(err => UIAlert(err))
  };

  const getStripList = () => {
    return state.photoList.filter(photo => photo.deleteStatus !== true)
  }

  const getHttpServiceUrl = () => {
    const userName = User.getSlug()
    return `http://${ URL }:${ PORT }/users/${ userName }/photos`
  }

  const concatToPhotoList = list => {
    if (!list?.length)
      return []
    return list.forEach(photo => {
      photo.id = getPhotoId(photo.fileName)
      state.photoList.push(photo)
      state.stripList.push(photo)
    })
  }

  const toPhotoList = list => {
    if (!list?.length)
      return []
    state.photoList = []
    return list.forEach(photo => {
      photo.id = getPhotoId(photo.fileName)
      state.photoList.push(photo)
    })
  }


  /**
   * Video Setup
   */

  const videoStartup = () => {
    webcamStart()
    videoSetup()
    videoToCanvas()
  }

  const webcamStart = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream
        video.play()
      })
      .catch((err) => {
        console.error(Error('[ERROR] camera device caused an error', { cause: err }))
      })
  }

  const videoSetup = () => {

    console.debug('videoSetup video', video)
    console.debug('video.addEventListener', typeof video.addEventListener)

    video.addEventListener(
      'canplay',
      e => {
        canvasInterval = null
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width)

          // Firefox currently has a bug where
          // the height can't be read from
          // the video, so we will make
          // assumptions if this happens.
          if (isNaN(height))
            height = width / (4 / 3)

          video.setAttribute('width', width)
          video.setAttribute('height', height)
          canvas.setAttribute('width', width)
          canvas.setAttribute('height', height)
          streaming = true
        }
      },
      false,
    )
  }

  const videoToCanvas = () => {
    video.removeEventListener('play', videoDraw)
    video.addEventListener('play', videoDraw)
    console.debug('videoToCanvas video', video)
    console.debug('video.addEventListener', typeof video.addEventListener)
  }

  const videoDraw = () => {
    const context = canvas.getContext('2d')
    clearInterval(canvasInterval)
    canvasInterval = setInterval(() => {
      if (!video) {
        clearInterval(canvasInterval)
        return
      }
      context && context.drawImage(video, 0, 0, width, height)
    }, 1000 / 30)
  }

  /**
   * 
   */

  const zoom = e => {

    e.preventDefault()

    backdropIsActive.value = true
    stripShowing.value = true
    backdropColor.value = 'blue'

    const element = getEventElement(e)
    console.debug('element', element)
    featured.value = getPhotoIndex(element)

    state.stripList = getStripList()
    translateValue.value = getTranslateValue(featured.value)
  }

  const deletePicture = e => {

    e.preventDefault()

    const element = getEventElement(e)
    const photoIndex = getPhotoIndex(element)

    promptMode.value = getPromptMode(element)

    imageToDelete.value = element.id
    UIWarning()
    promptShowing.value = true
  }

  const deleteConfirmed = e => {

    e.preventDefault()

    const photo = state.photoList
      .find(image => image.id === imageToDelete.value)
      .deleteStatus = true

    if (promptMode.value === 'THUMBNAIL') {
      backdropIsActive.value = false
      return void backdropToLower()
    }

    state.stripList = getStripList()
    featured.value = getNextIndex()
    translateValue.value = getTranslateValue(featured.value)

    return void backdropToLower()
  }

  const getPromptMode = el => {
    return el?.getAttribute('prompt-mode')
  }

  const getPhotoIndex = el => {
    const idx = el?.getAttribute('array-position')
    return parseInt(idx, 10)
  }

  const getNextIndex = () => {
    if (
      isPhotoStripsLast() === true &&
      isPhotoStripsFirst() === false
    ) --featured.value

    return featured.value
  }

  const isPhotoStripsLast = () => {
    console.debug('state.stripList.length', state.stripList.length)
    console.debug('featured.value', featured.value)
    return state.stripList.length === featured.value
  }

  const isPhotoStripsFirst = () => {
    return featured.value === 0
  }

  const nextPicture = e => {
    e.preventDefault()
    const element = getEventElement(e)
    const elementId = getPhotoIndex(element)
    const next = getNext(elementId)
    featured.value = next
    translateValue.value = getTranslateValue(next)
  }

  const getNext = n => {
    const max = state.photoList.length
    const next = + n + 1
    if (next >= max)
      return + n
    return next
  }

  const previonsPicture = e => {
    e.preventDefault()
    const min = 0
    const element = getEventElement(e)
    const elementId = getPhotoIndex(element)
    const prev = getPrev(elementId)
    featured.value = prev
    translateValue.value = getTranslateValue(prev)
  }

  const getPrev = n => {
    const min = 0
    const prev = + n - 1
    if (prev < min)
      return + n
    return prev
  }

  const getTranslateValue = featuredIdx => {
    return featuredIdx * (640 + 120) * -1
  }

  const getParentNodeImageElement = element => {

    const parentNodeList = element
      .parentNode
      .parentNode
      .parentNode
      .childNodes

    return Array
      .prototype
      .find
      .call(
        parentNodeList,
        el => el instanceof HTMLImageElement
    )
  }

  const getEventElement = e => {
    return e.target
  }

  onMounted(() => {

    state = reactive({
      photoList: [],
      stripList: []
    })

    getExistingPhotos();
    setTimeout(() => {

      video = document.querySelector('video')
      canvas = document.querySelector('canvas')
      appBody = document.querySelector('#app')

      console.debug('appBody', appBody)

      appBody.addEventListener('keydown', async(e) => {
        if (
          e.key !== 'Escape' ||
          backdropIsActive.value === false
        ) return
        await userMessageFadeOut()
      })

      videoStartup()

    }, 1000)
  })

  onBeforeUnmount(() => {
    video.removeEventListener('play', videoDraw)
    clearInterval(canvasInterval)
  })

</script>


<template>

  <v-app id="inspire">

    <v-system-bar>
      <v-spacer></v-spacer>
    </v-system-bar>

    <LeftMenu/>

    <v-main>

      <v-container class="py-8 px-6 form-container" fluid >

          <RouterLink class="page-back" title="Retour" :to="'/users'">
            <button class="mdi mdi-arrow-left-bold"></button>
          </RouterLink>

          <form>

            <h1 class="h1-main">Photos</h1>

            <v-divider class="h1-hr-main" style="margin-bottom: 20px;"></v-divider>

            <div id="form-main-container">


              <div id="photo-capture">

                <video id="video">Video stream not available.</video>
                <canvas id="canvas" :class=" hasFlash ? 'flash' : '' "></canvas>

              </div>


              <div id="photo-list-holder">

                <div id="photo-list">

                  <template v-for="(picture, index) in state.stripList" :key="picture.id">

                    <div v-if="picture.deleteStatus === false" class="picture-item">

                      <div class="user-thumbnail-holder thumnail-action-margin-right">
                        <img class="user-thumbnail fadein" :src="picture.fileToBase64">
                        <div class="thumbnail-actions">
                          <div class="actions">
                            <button class="mdi mdi-magnify-plus-outline action-button" v-bind="{ id: picture.id, 'array-position': index }" @click="zoom"></button>
                            <button class="mdi mdi-delete-forever action-button" v-bind="{ id: picture.id, 'prompt-mode': 'THUMBNAIL', 'array-position': index }" @click="deletePicture"></button>
                          </div>
                        </div>
                      </div>
                      <v-divider class="hr-thumbnail thumnail-action-margin-right"></v-divider>

                    </div>

                  </template>

                </div>

              </div>

            </div>

            <v-divider class="h2-hr-main mt-5"></v-divider>

            <button id="photo-capture-button" type="button" class="latelier-form-input latelier-form-submit mt-4" @click="capturePhoto">
              Prendre une photo
            </button> 

            <button id="savebutton" type="button" class="latelier-form-input latelier-form-submit mt-6 mb-4" @click="submitForm">
              Enregistrer
            </button>



          </form>

      </v-container>

      <div id="confirmation-holder" :class=" backdropIsActive === true ? 'fadein' : 'fadeout' ">

        <div v-if="backdropZIndexHigher === true" id="backdrop-el" :class="[ backdropColor, 'higher' ]"></div>
        <div v-else id="backdrop-el" :class="[ backdropColor ]" @click="userMessageFadeOut"></div>

        <div id="messagebox-el" :class=" messageElShowing === true ? 'showing' : '' ">


          <span v-if=" suspendMessage === true " class="suspend-message">{{ userMessage }} <div class="loader"></div></span>
          <span v-else>{{ userMessage }}</span>

          <div id="prompt" :class=" promptShowing === true ? 'showing' : '' ">
            <button @click="deleteConfirmed">Oui</button>
            <button v-if="promptMode === 'THUMBNAIL'" @click="userMessageFadeOut">Non</button>
            <button v-else @click="backdropToLower">Non</button>
          </div>

          <div id="alert-confirm" :class=" alertConfirmShowing === true ? 'showing' : '' ">
            <button @click="userMessageFadeOut">Ok</button>
          </div>

        </div>


        <button id="backdrop-close" title="Fermer" class="mdi mdi-close" @click="userMessageFadeOut"></button>

        <div id="picture-strip-holder" :class=" stripShowing === true ? 'showing' : '' ">

          <div id="picture-strip" :style="{ transform: 'translate(' + translateValue + 'px )' }">



            <template v-for="(picture, index) in state.stripList">


              <div v-if="picture.deleteStatus === false" class="picture-block" :class=" featured === index ? 'featured' : '' ">

                <img class="picture-el" :src="picture.fileToBase64" />


                <div class="picture-actions-block" :class=" featured === index  ? 'action-featured' : '' ">
                  
                  <div class="picture-actions left">

                    <div>

                      <button title="Image précédente" class="mdi mdi-arrow-left-drop-circle-outline large-action-button" v-bind="{ id: index, 'array-position': index }" @click="previonsPicture"></button>

                    </div>

                  </div>

                </div>



                <div class="picture-actions-block" :class=" featured === index  ? 'action-featured' : '' ">

                  <div class="picture-actions right">

                    <div>

                      <button title="Image suivante" class="mdi mdi-arrow-right-drop-circle-outline large-action-button" v-bind="{ id: index, 'array-position': index }" @click="nextPicture"></button>

                      <v-divider class="hr-picture-actions"></v-divider>

                    </div>

                    <div>

                      <button title="Supprimer cette image" class="mdi mdi-delete-forever large-action-button" v-bind="{ id: picture.id, 'prompt-mode': 'STRIP', 'array-position': index }" @click="deletePicture"></button>

                    </div>

                  </div>

                </div>



              </div>

            </template>

          </div>

        </div>

      </div>

    </v-main>
  </v-app>
</template>


<style scoped>

  form {
    display: flex;
    flex-direction: column;
  }

  #form-main-container {
    display: flex;
    flex-direction: row;
  }

  #photo-list-holder {
    position: absolute;
    margin-left: calc(640px + 65px);
  }

  #photo-capture,
  #photo-list {
    display: flex;
    flex-direction: column;
  }

  #photo-capture {
    background-color: #fff;
  }

  #photo-list {
    max-width: 675px;
    max-height: 600px;
    flex-wrap: wrap;
    overflow: hidden;
  }

  .user-thumbnail-holder {
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
  }

  .picture-item {
/*    display: none;*/
    margin-bottom: 18px;
  }
/*
  .picture-item.showing {
    display: block;
  }*/

  .user-thumbnail-holder:hover > .thumbnail-actions {
    display: block;
    opacity: 1;
    animation: .5s ease-out fadein;
  }

  .user-thumbnail {
    width: 128px;
    height: 96px;
  }

  .thumnail-action-margin-right {
    margin-right: 25px;
  }

  .thumbnail-actions {
    opacity: 0;
    display: none;
    animation: .5s ease-out fadeout;
  }

  .actions {
    position: relative;
    display: flex;
    flex-direction: column;
    position: absolute;
  }

  .action-button {
    font-size: 28px;
    width: 20px;
    height: 30px;
    position: relative; 
    right: 30px;
  }

  .user-thumbnail.fadein {
    box-shadow: 0px 0px 5px 2px #082750;
    display: block;
    opacity: 1;
    animation: .5s ease-out fadein;
  }

  .user-thumbnail.fadeout {
    opacity: 0;
    display: none;
    animation: .5s ease-out fadeout;
  }

  #video {
    display: none;
  }

  #canvas {
    box-shadow: 2px 2px 3px #082750;
    width: 640px;
    height: 480px;
  }

  .flash {
    animation: .75s ease-in flash;
  }

  @keyframes flash {
    0% {
      opacity: 1;
      box-shadow: 2px 2px 3px #082750;
    }
    5% {
      opacity: .5;
      box-shadow: 0 0 45px 15px #0068FF;
    }
    100% {
      opacity: 1;
      box-shadow: 2px 2px 3px #082750;
    }
  }

  .camera {
    width: 640px;
  }

  .picture-block {
    position: relative;
    margin-right: 120px;
    transition: opacity .75s ease-out;
    opacity: .1;
    will-change: opacity;
  }

  .picture-block.featured {
    opacity: 1;
  }

  .picture-block.deleted {
    display: none;
  }

  #backdrop-close {
    position: absolute;
    top: 30px;
    right: 30px;
    font-size: 55px;
    opacity: 0.5;
    z-index: 1250;
    top: 15px;
    right: 50px;
  }

  #backdrop-close:hover {
    opacity: 0.8;
  }

  #picture-strip-holder {
    display: none;
    position: relative;
    width: 100%;
    height: calc(480px + 30px);
    z-index: 1200;
    top: calc(50% - (480px / 2) - (30px / 2));
    background-color: #06264f;
    overflow-x: hidden;
  }

  #picture-strip-holder.showing {
    display: block;
  }

  #picture-strip {
    margin: calc(30px / 2) 0;
    left: calc(50% - (640px / 2));
    display: flex;
    flex-direction: row;
    position: absolute;
    width: 100%;
    z-index: 1200;
    transition: transform .75s ease-out;
    transform: translateY(0px);
    will-change: transform;
  }

  .picture-el {
    width: 640px;
    box-shadow: 0 0 15px 5px #072142;
  }

  .picture-actions-block {
    display: none;
  }

  .picture-actions-block.action-featured {
    display: block;
  }

  .picture-actions {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: calc((480px / 2) - (120px / 2));
  }

  .picture-actions.right {
    right: -54px;
  }

  .picture-actions.left {
    left: -54px;
  }

  .hr-picture-actions {
    margin-top: 7px;
    border-bottom: 1px solid rgba(255, 255, 255, .5);
  }

  .large-action-button {
    position: relative;
    opacity: .5;
    z-index: 1250;
    font-size: 40px;
    width: 38px;
    height: 55px;
  }

  .large-action-button:hover {
    opacity: .8;
  }

  #prompt,
  #alert-confirm {
    display: none;
    width: 450px;
    margin: 0 auto;
    margin-top: 25px;
  }

  #prompt.showing,
  #alert-confirm.showing {
    display: flex;
    flex-direction: row;
  }

  #prompt > button,
  #alert-confirm > button {
    display: block;
    width: 200px;
    height: 100px;
    color: #F80086;
    font-size: 54px;
    background-color: #fff;
    position: relative;
    z-index: 1550;
    opacity: .8;
    margin: 0 auto;
  }

  #prompt > button:hover {
    opacity: 1;
  }

  #prompt > button:last-child {
    margin-left: 50px;
  }



</style>
