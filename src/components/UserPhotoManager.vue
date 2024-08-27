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


  const suspendMesssage = {
    fr: 'Génération du modèle, merci de bien vouloir patienter ..',
    eng: 'Generating model.',
  }

  const confirmation = {
    fr: 'Les images de l\'utilisateur ont bien été enregistrées',
    eng: 'User pictures have been saved successfully',
  }

  const errMessage = {
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
  }

  const warningMessage = {
    fr: 'Etes-vous certain de vouloir supprimer cette image ?'
  }


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

  let state = null
  let video = null
  let canvas = null
  let streaming = false
  let canvasInterval = null
  const width = 640
  // height will be computed
  // based on the input stream
  let height = 0


  const UIAlert = async(err) => {
    // backdropColor.value = 'red'
    // const errName = getErrorName(err)

    // const { fr, eng } = errMessage?.value?.[errName] ||
    //   errMessage.value['AddUserPhotosError']

    // suspendMessage.value = false
    // assignUserMessage(fr)
    // alertConfirmShowing.value = true

    // console.error(`[ERROR] ${ eng }`)
    // console.error(err)
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
    })
  }

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


  const capturePhoto = e => {

    e.preventDefault()

    // hasFlash.value = true;
    // video.pause()

    const data = getCaptureData()

    const photoObj = {
      id: getUuid(),
      deleteStatus: false,
      fileToBase64: data,
      mimeType: 'image/jpeg',
      saveStatus: false
    }

    state.photoList.push(photoObj)

    console.debug('state.photoList', state.photoList)

    // setTimeout(() => {
    //   video.play()
    //   hasFlash.value = false
    // }, 1000)
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


  onMounted(() => {

    state = reactive({
      photoList: [],
      stripList: []
    })

    getExistingPhotos();

    console.debug('state.photoList', state.photoList)

    setTimeout(() => {

      video = document.querySelector('video')
      canvas = document.querySelector('canvas')
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

                  <template v-for="(picture, index) in state.photoList" :key="picture.id">

                    <div class="picture-item" :class=" picture.deleteStatus === false ? 'showing' : '' " >

                      <div class="user-thumbnail-holder thumnail-action-margin-right">
                        <img class="user-thumbnail fadein" :src="picture.fileToBase64">
                        <div class="thumbnail-actions">
                          <div class="actions">
                            <button class="mdi mdi-magnify-plus-outline action-button" v-bind="{ id: picture.id, 'array-position': index }" @click="zoom"></button>
                            <button class="mdi mdi-delete-forever action-button" v-bind="{ id: picture.id, mode: 'thumbnail', 'array-position': index }" @click="deletePicture"></button>
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


          </form>

      </v-container>

    </v-main>
  </v-app>
</template>

<style scped>

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
    display: none;
    margin-bottom: 18px;
  }

  .picture-item.showing {
    display: block;
  }

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

  #messagebox-el {
    display: none;
  }

  #messagebox-el.showing {
    display: block;
  }

  #messagebox-el > span {
    text-align: center;
    width: 90%;
    margin: 0 auto;
    display: none;
  }

  #messagebox-el.showing > span {
    display: block;
  }

  #messagebox-el.showing > span.suspend-message {
    display: inline-block;
    width: 80%;
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

  /* ref. : https://css-loaders.com/bars */
  /* HTML: <div class="loader"></div> */
  .loader {
    margin-left: 20px;
    display: inline-block;
    width: 45px;
    aspect-ratio: 1;
    --c: no-repeat linear-gradient(#00EC7B calc(50% - 10px),#0000 0 calc(50% + 10px),#00EC7B 0);
    background: 
      var(--c) 0%   100%,
      var(--c) 50%  100%,
      var(--c) 100% 100%;
    background-size: 20% calc(200% + 20px);
    animation:l4 1s infinite linear;
  }

  @keyframes l4 {
      33%  {background-position: 0% 50%,50% 100%,100% 100%}
      50%  {background-position: 0%  0%,50%  50%,100% 100%}
      66%  {background-position: 0%  0%,50%   0%,100%  50%}
      100% {background-position: 0%  0%,50%   0%,100%   0%}
  }

</style>
