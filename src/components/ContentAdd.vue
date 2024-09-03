<script setup>

  import { ref, inject } from 'vue'
  import { useRouter } from 'vue-router'
  import config from '../config'
  import appUtils from '/src/assets/js/app-utils'

  const {
    doc,
    where,
    query,
    addDoc,
    setDoc,
    getDocs,
    collection,
    getFirestore
  } = inject('firestore')

  const db = getFirestore()

  const {
    capitalize,
    extractErrContent,
    slugify,
    getDate,
    areStringsNotEmpty,
    isDateFormatValid,
    isRadioValueValid,
    isContentActiveValid
  } = appUtils

  const router = useRouter()
  const {
    DELAY,
    CONTENT: {
      MMM_MODULE_NAMES,
      VISIBLE_INTENSITIES,
      PAGE_POSTIONS,
      FONT_SIZES,
      FONT_WEIGHTS,
      TEXT_ALIGNS
    }
  } = config

  const confirmation = ref({
    fr: 'Le contenu a bien été enregistré',
    eng: 'Content has been created successfully',
  })

  const errMessage = ref({
    fr: 'Une erreur est survenue lors de la création du contenu',
    eng: 'Creating content caused an error',
  })

  const moduleNames = ref(MMM_MODULE_NAMES)
  const contentPositions = ref(PAGE_POSTIONS)
  const visibleIntensities = ref(VISIBLE_INTENSITIES)
  const fontSizes = ref(FONT_SIZES)
  const fontWeights = ref(FONT_WEIGHTS)
  const textAligns = ref(TEXT_ALIGNS)

  const userMessage = ref('')
  const backdropIsActive = ref(false)
  const backdropColor = ref('blue')
  const messageElShowing = ref(false)


  const Content = {
    current: {
      module_name: '',
      content_name: '',
      name: '',
      intensity: 'bright',
      font_size: 'semi-medium',
      font_weight: 'regular',
      text_align: 'align-center',
      position: 'top_bar',
      text: '',
      date: '',
      activeRadioButton: 'TRUE',
      active: true
    },
    save: async() => {
      try {
        Content.current.date = getDate()
        Content.current.name = capitalize(Content.current.name)
        Content.current.content_name = slugify(Content.current.name)
        Content.current.active = Content.current.activeRadioButton === 'TRUE' && true || false
        delete Content.current.activeRadioButton
        await addDoc(collection(db, 'contents'), Content.current)
      } catch(err) {
        throw Error('Error: saving content to firebase has caused an error', { cause: err })
      }
    }
  }

  const UIConfirm = () => {
    const { fr, eng } = confirmation.value
    assignUserMessage(fr)
    backdropIsActive.value = true
    console.info(`[INFO] ${ eng }`)
    userMessageFadeOut()
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
    setTimeout(() => backdropIsActive.value = false, DELAY)
  }

  const redirect = () => {
    setTimeout(() => router.push('/contents'), DELAY)
  }

  const deactivateOtherContent = async() => {
    try {
      const active = Content.current.activeRadioButton === 'TRUE' && true || false
      if (active === false)
        return
      const contents = await getAllContentsByModule()
      await iterateDeactivate(contents)
    } catch(err) {
      console.error(err)
    }
  }

  const getAllContentsByModule = async() => {
    let contents = []
    const q = query(collection(db, 'contents'), where('module_name', '==', Content.current.module_name))
    const snap = await getDocs(q)
    snap.forEach(doc => {
      const data = doc.data()
      contents.push(Object.assign({}, { id: doc.id }, data))
    })
    return contents
  }

  const iterateDeactivate = async(contents) => {
    const sequence = async(content) => {
      content.active = false
      await setDoc(doc(db, 'contents', content.id), content)
    }

    const ps = contents
      .map(async(content) => await sequence(content))

    console.debug('iterateDeactivate start 1')
    return Promise.all(ps)
  }

  const isPayloadValid = () => {
    try {
      appUtils.areStringsNotEmpty()
      appUtils.isDateFormatValid()
      appUtils.isRadioValueValid()
      appUtils.isContentActiveValid()
    } catch(err) {
      console.error(err)
    }
  }

  const submitForm = async() => {
    try {
      await deactivateOtherContent()
      await Content.save()
      UIConfirm()
      redirect()
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

      <v-container class="py-8 pr-6 form-container pl-16" fluid >

        <RouterLink class="page-back" title="Retour" :to="'/contents'">
          <button class="mdi mdi-arrow-left-bold"></button>
        </RouterLink>

        <form>

          <h1 class="h1-main">Contenu</h1>

          <v-divider class="h1-hr-main"></v-divider>

          <label for="content_module">Nom du module MagicMirror</label>
          <select id="content_module" name="content_module" class="latelier-form-input mt-2 mb-4" v-model="Content.current.module_name">
            <option value="NONE">---</option>
            <option v-for="module in moduleNames" :value="module.value">
              {{ module.label }}
            </option>
          </select>

          <label for="content_name">Nom du Contenu</label>
          <input type="text" class="latelier-form-input content-management-form-input mt-2 mb-4" id="content_name" name="content_name" placeholder="Nom du Contenu" v-model="Content.current.name"/>

          <label for="content_position">Position</label>
          <select id="content_position" name="content_position" class="latelier-form-input content-management-form-input mt-2 mb-4" v-model="Content.current.position">
            <option value="NONE">---</option>
            <option v-for="position in contentPositions" :value="position.value">
              {{ position.label }}
            </option>
          </select>

          <label for="content_text_intensity">Intensité du texte</label>
          <select id="content_text_intensity" name="content_text_intensity" class="latelier-form-input mt-2 mb-4" v-model="Content.current.intensity">
            <option value="NONE">---</option>
            <option v-for="intensity in visibleIntensities" :value="intensity.value">
              {{ intensity.label }}
            </option>
          </select>

          <label for="content_font_size">Taille du texte</label>
          <select id="content_font_size" name="content_font_size" class="latelier-form-input mt-2 mb-4" v-model="Content.current.font_size">
            <option value="NONE">---</option>
            <option v-for="size in fontSizes" :value="size.value">
              {{ size.label }}
            </option>
          </select>

          <label for="content_font_weight">Graisse du texte</label>
          <select id="content_font_weight" name="content_font_weight" class="latelier-form-input mt-2 mb-4" v-model="Content.current.font_weight">
            <option value="NONE">---</option>
            <option v-for="weight in fontWeights" :value="weight.value">
              {{ weight.label }}
            </option>
          </select>

          <label for="content_text_align">Alignement du texte</label>
          <select id="content_text_align" name="content_text_align" class="latelier-form-input mt-2 mb-4" v-model="Content.current.text_align">
            <option value="NONE">---</option>
            <option v-for="alignment in textAligns" :value="alignment.value">
              {{ alignment.label }}
            </option>
          </select>

          <label style="margin-top: 15px;">Actif</label>
          <div class="radio-holder-group">
            <div class="radio-holder">
              <input id="content_active_true" type="radio" name="active" value="TRUE" v-model="Content.current.activeRadioButton" checked>              
              <label for="content_active_true" style="margin-left: 10px;">Oui</label>
            </div>
            <div class="radio-holder">
              <input id="content_active_false" type="radio" name="active" value="FALSE" v-model="Content.current.activeRadioButton">              
              <label for="content_active_false" style="margin-left: 10px;">Non</label>
            </div>
          </div>


          <label for="content_text">Texte</label>
          <textarea id="content_text" name="content_text" class="latelier-form-input latelier-form-textarea mt-2 mb-4" placeholder="Texte" style="height: 150px;" v-model="Content.current.text"></textarea>

          <button type="button" class="latelier-form-input latelier-form-submit mt-6 mb-4" @click="submitForm">Enregistrer</button>

        </form>

      </v-container>


      <div id="confirmation-holder" :class=" backdropIsActive === true ? 'fadein' : 'fadeout' ">
        <div id="backdrop-el" :class=" backdropColor "></div>

        <div id="messagebox-el" :class=" messageElShowing === true ? 'showing' : '' ">

          <span>{{ userMessage }}</span>

        </div>

      </div>


    </v-main>
  </v-app>
</template>
