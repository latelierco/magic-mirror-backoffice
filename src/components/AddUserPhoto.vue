<script setup>

  import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { doc, collection, getDoc, addDoc, getFirestore } from 'firebase/firestore';
  import config from '../config'
  import appUtils from '/src/assets/js/app-utils'


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
      user_name: '',
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
      const body = stripBody()

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


  let video = null
  let canvas = null
  const pictureIdx = ref()
  const photoList = ref([])
  const backdropIsActive = ref(false)
  const backdropColor = ref('blue')
  const hasFlash = ref(false)
  const featured = ref()
  const translateValue = ref()
  const stripShowing = ref(false)
  const userMessage = ref('')
  const messageElShowing = ref(false)
  const alertConfirmShowing = ref(false)
  const promptShowing = ref(false)
  const backdropZIndexHigher = ref(false)
  const imageToDelete = ref()


  const docRef = doc(db, 'users', userId)
  const snap = await getDoc(docRef)
  User.current = Object.assign({}, snap.data(), { id: userId })


  const UIConfirm = async() => {
    backdropColor.value = 'blue'
    const { fr, eng } = confirmation.value
    assignUserMessage(fr)
    console.info(`[INFO] ${ eng }`)
    await userMessageFadeOut()
  }

  const UIAlert = async(err) => {
    backdropColor.value = 'red'
    const errName = getErrorName(err)

    const { fr, eng } = errMessage?.value?.[errName] ||
      errMessage.value['AddUserPhotosError']

    assignUserMessage(fr)
    alertConfirmShowing.value = true

    console.error(`[ERROR] ${ eng }`)
    console.error(err)
  }

  const UIWarning = async() => {
    backdropColor.value = 'red'
    const { fr } = warningMessage.value
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

  const userMessageFadeOut = (delay = null) => {
    return new Promise(resolve => {
      return setTimeout(() => {
        stripShowing.value = false
        alertConfirmShowing.value = false
        promptShowing.value = false
        messageElShowing.value = false
        backdropIsActive.value = false
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
    photoList.value.push(photoObj)

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
      await User.save()
      UIConfirm()
      redirect()
    } catch(err) {
      UIAlert(err)
    }
  }

  const stripBody = () => {
    return photoList.value.filter(photo => {
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

  const getHttpServiceUrl = () => {
    const userName = User.getSlug()
    return `http://${ URL }:${ PORT }/users/${ userName }/photos`
  }

  const concatToPhotoList = list => {
    if (!list?.length)
      return []
    return list.forEach(photo => {
      photo.id = getPhotoId(photo.fileName)
      photoList.value.push(photo)
    })
  }

  const toPhotoList = list => {
    if (!list?.length)
      return []
    photoList.value = []
    return list.forEach(photo => {
      photo.id = getPhotoId(photo.fileName)
      photoList.value.push(photo)
    })
  }


  /**
   * Video Setup
   */

  const videoStartup = photoList => {
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
    const pictureId = e.target.id;
    backdropIsActive.value = true
    stripShowing.value = true
    backdropColor.value = 'blue'

    pictureIdx.value = getPictureIndex(pictureId)
    featured.value = pictureIdx.value
    translateValue.value = getTranslateValue(pictureIdx.value)
  }

  const deletePicture = e => {
    e.preventDefault()
    const pictureId = e.target.id
    imageToDelete.value = pictureId
    UIWarning()
    promptShowing.value = true
  }

  const deleteConfirmed = () => {
    backdropIsActive.value = false
    promptShowing.value = false
    photoList.value
      .find(image => image.id === imageToDelete.value)
      .deleteStatus = true
  }

  const nextPicture = e => {
    e.preventDefault()
    const next = getNext(e.target.id)
    featured.value = next
    translateValue.value = getTranslateValue(next)
  }

  const getNext = n => {
    const max = photoList.value.length
    const next = + n + 1
    if (next >= max)
      return + n
    return next
  }

  const previonsPicture = e => {
    e.preventDefault()
    const min = 0
    const prev = getPrev(e.target.id)
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

  const getPictureIndex = pictureId => {
    return photoList
      .value
      .findIndex(
        picture => picture.id === pictureId
      )
  }

  const getTranslateValue = pictureIdx => {
    return pictureIdx * (640 + 120) * -1
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

  onMounted(() => {

    video = document.querySelector('video')
    canvas = document.querySelector('canvas')

    document.body.addEventListener('keydown', async(e) => {
      if (
        e.key !== 'Escape' ||
        backdropIsActive.value === false
      ) return
      await userMessageFadeOut()
    })

    getExistingPhotos();

    setTimeout(() => {
      videoStartup(photoList.value)
    }, 250)
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

      <v-container class="py-8 px-6" fluid >

          <form>

            <h1 class="h1-main">Photos</h1>

            <v-divider class="h1-hr-main" style="margin-bottom: 20px;"></v-divider>

            <div id="form-main-container">


              <div id="photo-capture">

                <video id="video" ref="video">Video stream not available.</video>
                <canvas id="canvas" ref="canvas" :class=" hasFlash ? 'flash' : '' "></canvas>

              </div>


              <div id="photo-list-holder">

                <div id="photo-list">

                  <template v-for="picture in photoList" :key="picture.id">

                    <div class="picture-item" :class=" picture.deleteStatus === false ? 'showing' : '' " >

                      <div class="user-thumbnail-holder thumnail-action-margin-right">
                        <img ref="picture.id" class="user-thumbnail fadein" :src="picture.fileToBase64">
                        <div class="thumbnail-actions">
                          <div class="actions">
                            <button class="mdi mdi-magnify-plus-outline action-button" v-bind="{ id: picture.id }" @click="zoom"></button>
                            <button class="mdi mdi-delete-forever action-button" v-bind="{ id: picture.id }" @click="deletePicture"></button>
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

            <button id="savebutton" ref="savebutton" type="button" class="latelier-form-input latelier-form-submit mt-6 mb-4" @click="submitForm">
              Enregistrer
            </button>



          </form>

      </v-container>

      <div id="confirmation-holder" :class=" backdropIsActive === true ? 'fadein' : 'fadeout' ">

        <div id="backdrop-el" :class="[ backdropColor  ]" @click="userMessageFadeOut"></div>

        <div id="messagebox-el" :class=" messageElShowing === true ? 'showing' : '' ">

          <span>{{ userMessage }}</span>

          <div id="prompt" :class=" promptShowing === true ? 'showing' : '' ">
            <button @click="deleteConfirmed">Oui</button>
            <button @click="userMessageFadeOut">Non</button>
          </div>

          <div id="alert-confirm" :class=" alertConfirmShowing === true ? 'showing' : '' ">
            <button @click="userMessageFadeOut">Ok</button>
          </div>

        </div>


        <button id="backdrop-close" title="Fermer" class="mdi mdi-close" @click="userMessageFadeOut"></button>

        <div id="picture-strip-holder" :class=" stripShowing === true ? 'showing' : '' ">

          <div id="picture-strip" :style="{ transform: 'translate(' + translateValue + 'px )' }">

            <template v-for="(picture, index) in photoList">



              <div class="picture-block" :class=" featured === index ? 'featured' : '' ">

                <img class="picture-el" :src="picture.fileToBase64" />

                <div class="picture-actions-block" :class=" featured === index  ? 'action-featured' : '' ">
                  
                  <div class="picture-actions left">

                    <div>

                      <button title="Image précédente" class="mdi mdi-arrow-left-drop-circle-outline large-action-button" v-bind="{ id: index }" @click="previonsPicture"></button>

                    </div>

                  </div>

                </div>


                <div class="picture-actions-block" :class=" featured === index  ? 'action-featured' : '' ">


                  <div class="picture-actions right">

                    <div>

                      <button title="Image suivante" class="mdi mdi-arrow-right-drop-circle-outline large-action-button" v-bind="{ id: index }" @click="nextPicture"></button>

                      <v-divider class="hr-picture-actions"></v-divider>

                    </div>

                    <div>
                      
                      <button title="Supprimer cette image" class="mdi mdi-delete-forever large-action-button" v-bind="{ id: picture.id }"></button>

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


<style>

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