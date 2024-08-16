const photoCapture = (() => {

  // We will scale the photo
  // width to this
  const width = 640

  // This will be computed based
  // on the input stream
  let height = 0

  let streaming = false
  let video = null
  let canvas = null
  let photoCaptureButton = null
  let canvasInterval = null

  const startup = userPhotos => {

    const {
      video,
      canvas,
      photoCaptureButton
    } = getDomElements()

    webcamStart(video)
    videoSetup(video)
    videoToCanvas({ video, canvas })
    buttonSetup({ video, canvas, photoCaptureButton, userPhotos })
  }

  const getDomElements = () => {
    video = document.getElementById('video')
    canvas = document.getElementById('canvas')
    photoCaptureButton = document.getElementById('photo-capture-button')

    return {
      video,
      canvas,
      photoCaptureButton
    }
  }

  const webcamStart = video => {
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

  const videoSetup = video => {
    video.addEventListener(
      'canplay',
      e => {
        let canvasInterval = null
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

  const videoToCanvas = options => {
    const { video, canvas } = options
    const context = canvas.getContext('2d')
    clearInterval(canvasInterval)
    video.addEventListener('play', () => {
      canvasInterval = setInterval(() => {
        context.drawImage(video, 0, 0, width, height)
      }, 1000 / 30)
    })
  }

  const buttonSetup = options => {
    const { video, canvas, photoCaptureButton, userPhotos } = options
    photoCaptureButton.addEventListener(
      'click',
      e => {
        e.preventDefault()
        const uuid = getUuid()
        const data = takepicture({ video, canvas })
        userPhotos[uuid] = {
          id: uuid,
          savedStatus: false,
          deleteStatus: false,
          captureTime: Date.now(),
          data
        }
        setTimeout(() => video.play(), 1000)
      },
      false,
    )
  }

  const takepicture = options => {
    const { video, canvas } = options
    const context = canvas.getContext('2d')
    video.pause()
    context.drawImage(video, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg')
  }

  const getUuid = () => window.crypto.randomUUID();
  console.info('[INFO] photo script has loaded')

  return { startup }

})()


export default photoCapture
