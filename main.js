const textToSpeech = document.getElementById('text_2_voice')
const speechToText = document.getElementById('voice_2_text')
const final_span = document.getElementById('final_span')
const interim_span = document.getElementById('interim_span')
const userText = document.getElementById('textarea1')

const pdfDetails = document.getElementById('pdfDetails');
pdfDetails.style.visibility = 'hidden';

const speech = window.speechSynthesis;
let pageTextToRead;

const PDFJS = window['pdfjs-dist/build/pdf'];
PDFJS.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

// let userInput;

$(document).ready(function () {
  $('.modal').modal({
    dismissible: false
  });
});

document.getElementById('close').onclick = () => {
  userText.value = '';
}

speechToText.onclick = function () {
  startRecording()
}

textToSpeech.onclick = function () {
  startSpeaking(userText.value)
}

let recording = false;
let final_text = '';

if (!('webkitSpeechRecognition' in window)) {
  alert(`Web Speech API is not supported by this browser.
  Upgrade to <a href="//www.google.com/chrome">Chrome</a>
  version 25 or later.`)
} else {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onstart = function () {
    recognizing = true;
  };
  recognition.onerror = function (event) {

  };
  recognition.onend = function () {

  };
  recognition.onresult = function (event) {
    let interim_text = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_text += event.results[i][0].transcript;
      } else {
        interim_text += event.results[i][0].transcript;
      }
    }
    final_text = capitalize(final_text);
    final_span.innerHTML = final_text;
    interim_span.innerHTML = interim_text;
  };
}

const first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function (m) { return m.toUpperCase(); });
}

document.getElementById('clear_text').onclick = () => {
  recording = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  recognition.stop();
}

function startRecording() {
  if (recording) {
    recognition.stop();
  }
  final_text = '';
  recording = true;
  recognition.lang = `en-US`;
  recognition.start()
}

function startSpeaking(e) {
  cancelSpeaking()
  let textToRead
  if (!e) {
    pageTextToRead.then((readThis) => {
      textToRead = new SpeechSynthesisUtterance(readThis)
      speech.speak(textToRead)
    })
  }
  else {
    textToRead = new SpeechSynthesisUtterance(e)
    speech.speak(textToRead)
  }
}
document.getElementById('startSpeech').onclick = () => startSpeaking()

function pauseSpeaking() {
  speech.pause()
}
document.getElementById('pauseSpeech').onclick = () => pauseSpeaking()

function resumeSpeaking() {
  speech.resume()
}
document.getElementById('resumeSpeech').onclick = () => resumeSpeaking()

function cancelSpeaking() {
  speech.cancel()
}
document.getElementById('cancelSpeech').onclick = () => {
  cancelSpeaking()
  pdfElement = document.getElementById('the-canvas')
  if (pdfElement) {
    pdfElement.parentNode.removeChild(pdfElement);
  }
  pdfDetails.style.visibility = 'hidden';
}


const handleFiles = (uploadedFile) => {
  if (uploadedFile[0].type === 'application/pdf') {
    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyCucD8hMWdc4Pg32FQ2Wl9SYLVLncqOEcE",
      authDomain: "checkpoint1-5ff14.firebaseapp.com",
      databaseURL: "https://checkpoint1-5ff14.firebaseio.com",
      projectId: "checkpoint1-5ff14",
      storageBucket: "checkpoint1-5ff14.appspot.com",
      messagingSenderId: "399850816357"
    };

    firebase.initializeApp(config);

    var storage = firebase.storage();

    var storageRef = storage.ref();

    var file = uploadedFile[0]

    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef.child('pdfs/' + file.name).put(file);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function (snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function (error) {

        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      }, function () {
        // Upload completed successfully, now we can get the download URL
        var downloadURL = uploadTask.snapshot.downloadURL;
        const url = downloadURL
        displayPdfinModal(url)
      });
  }
  else {
    alert('Can only handle pdf files at the moment')
  }
}




const displayPdfinModal = (url) => {

  pdfDetails.style.visibility = 'visible';

  var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 0.8,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  function renderPage(num) {
    pageRendering = true;
    cancelSpeaking()
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
      pageTextToRead = Promise.resolve(
        page.getTextContent().then(function (textContent) {
          var textItems = textContent.items;
          var finalString = ""

          // Concatenate the string of the item to the final string
          for (var i = 0; i < textItems.length; i++) {
            var item = textItems[i];

            finalString += item.str + " ";
          }
          return finalString
        })
      );
      // pageTextToRead.then((readThis) => {
      //   startSpeaking(readThis)
      // })
      var viewport = page.getViewport(scale);
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    // Update page counters
    document.getElementById('page_num').textContent = num;
  }

  /**
   * If another page rendering in progress, waits until the rendering is
   * finised. Otherwise, executes rendering immediately.
   */
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  /**
   * Displays previous page.
   */
  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  }
  document.getElementById('prev').addEventListener('click', onPrevPage);

  /**
   * Displays next page.
   */
  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  }
  document.getElementById('next').addEventListener('click', onNextPage);

  /**
   * Asynchronously downloads PDF.
   */
  PDFJS.getDocument(url).then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
  });
}
