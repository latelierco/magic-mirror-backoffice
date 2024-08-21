<script setup>

  import { ref, watch, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { doc, collection, getDoc, addDoc, getFirestore } from 'firebase/firestore';
  import config from '../config'
  import appUtils from '/src/assets/js/app-utils'
  import photoCapture from '/src/assets/js/photo'


  const {
    obectFormatstrings,
    extractErrContent,
    slugify,
    getUuid,
  } = appUtils


  const route = useRoute()
  const router = useRouter()
  const db = getFirestore()
  const { id = null } = route.params;
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
    fr: 'L\'utilisateur a bien été créé',
    eng: 'User has been created successfully',
  })

  const errMessage = ref({
    fr: 'Une erreur est survenue lors de la création de l\'utilisateur',
    eng: 'Creating user caused an error',
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
      },
      photos: [],
    },
    stringFormat: () => obectFormatstrings(User.current),
    save: async() => {
      try {
        await addDoc(collection(db, 'users'), User.current);
      } catch(err) {
        throw Error('Error: saving user to firebase has caused an error', { cause: err })
      }
    }
  }


  const video = ref()
  const canvas = ref()
  const photo = ref()
  // const photoCaptureButton = ref()
  const pictureIdx = ref()

  const userId = ref(id);
  const userMessage = ref('')
  const slug = ref('')
  const isActive = ref(false)
  const backdropColor = ref('blue')
  const photoList = ref(User.current.photos)
  const hasFlash = ref(false)
  const featured = ref()
  const translateValue = ref()
  const stripShowing = ref(false)
  const promptShowing = ref(false)
  const backdropHigher = ref(false)
  const imageToDelete = ref()


  const docRef = doc(db, 'users', userId.value)
  const snap = await getDoc(docRef)
  User.current = Object.assign({}, snap.data(), { id: userId.value })


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

  const UIWarning = () => {
    backdropColor.value = 'red'
    const { fr } = warningMessage.value
    assignUserMessage(fr)
    isActive.value = true
    backdropHigher.value = true
  }

  const assignUserMessage = msg => {
    userMessage.value = msg
  }

  const backdropClose = () => {
    stripShowing.value = false
    promptShowing.value = false
    setTimeout(() => isActive.value = false, 250)
  }

  const redirect = () => {
    setTimeout(() => router.push('/users'), DELAY)
  }

  const capturePhoto = e => {

    e.preventDefault()
    hasFlash.value = true;
    video.value.pause()
    const data = getCaptureData()

    const photoObj = {
      id: getUuid(),
      deleteStatus: false,
      fileToBase64: data,
      saveStatus: false
    }
    photoList.value.push(photoObj)

    setTimeout(() => {
      video.value.play()
      hasFlash.value = false
    }, 1000)
  }

  const getCaptureData = () => {
    const height = getVideoHeight()
    const context = canvas.value.getContext('2d')
    context.drawImage(video.value, 0, 0, WIDTH, height)
    return canvas.value.toDataURL('image/jpeg')
  }

  const getVideoHeight = () => {
    return video.value.videoHeight
  }

  const submitForm = async() => {
    try {
      User.stringFormat()
      await User.save()
      UIConfirm()
      redirect()
    } catch(err) {
      UIAlert(err)
    }
  }

  const getExistingPhotos = () => {
    const { user_name: userName } = User.current;

    return new Promise((resolve, reject) => {
      const url = `http://${ URL }:${ PORT }/users/${ userName }/photos`
      return fetch(url)
        .then(resp => {
          if (!resp.ok)
            return reject(`Error: calling backoffice service failed with status code ${ resp.status }`);
          return resp.json()
        })
        .then(list => {
          return list.forEach(photo => {
            photo.id = getUuid()
            photoList.value.push(photo)
          })
        })
    });
  };

  onMounted(() => {

    document.body.addEventListener('keydown', e => {
      if (
        e.key !== 'Escape' ||
        isActive.value === false
      ) return
      backdropClose()
    })

    getExistingPhotos();

    setTimeout(() => {
      photoCapture.startup(photoList.value)
    }, 250)
  })

  const zoom = e => {

    e.preventDefault()
    const pictureId = e.target.id;
    isActive.value = true
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
    isActive.value = false
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

            <button id="savebutton" ref="savebutton" type="button" class="latelier-form-input latelier-form-submit mt-6 mb-4">
              Enregistrer
            </button>



          </form>

      </v-container>

      <div id="confirmation-holder" :class=" isActive === true ? 'fadein' : 'fadeout' ">

        <div id="backdrop-el" :class="[ backdropColor, backdropHigher === true ? 'backdrop-higher' : '' ]" @click="backdropClose">></div>

        <div id="messagebox-el" :class=" promptShowing === true ? 'showing' : '' ">

          {{ userMessage }}

          <div id="prompt">

            <button @click="deleteConfirmed">Oui</button>
            <button @click="backdropClose">Non</button>

          </div>

        </div>


        <button id="backdrop-close" title="Fermer" class="mdi mdi-close" @click="backdropClose"></button>

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

  .backdrop-higher {
    z-index: 1500;
  }

  #messagebox-el {
    display: none;
  }

  #messagebox-el.showing {
    display: block;
  }

  #prompt {
    width: 450px;
    display: flex;
    flex-direction: row;
    margin: 0 auto;
    margin-top: 25px;
  }


  #prompt > button {
    display: block;
    width: 200px;
    height: 100px;
    color: #F80086;
    font-size: 54px;
    background-color: #fff;
    position: relative;
    z-index: 1550;
    opacity: .8;
  }

  #prompt > button:hover {
    opacity: 1;
  }

  #prompt > button:last-child {
    margin-left: 50px;
  }


</style>