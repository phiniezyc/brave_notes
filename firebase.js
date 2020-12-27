// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// restrict api access: https://console.developers.google.com/apis/credentials/
// https://stackoverflow.com/questions/61706753/unable-to-add-chrome-extension-url-to-firebase-whitelisted-domains
// https://medium.com/@devesu/how-to-secure-your-firebase-project-even-when-your-api-key-is-publicly-available-a462a2a58843
const firebaseConfig = {
  apiKey: 'AIzaSyAXUJuaD2h0pvjyEz6JOijYpMq2WJaAb68',
  authDomain: 'brave-notes.firebaseapp.com',
  projectId: 'brave-notes',
  storageBucket: 'brave-notes.appspot.com',
  messagingSenderId: '580783597062',
  appId: '1:580783597062:web:2c9abf3d4f778ef8260587',
  measurementId: 'G-G2LSJJRDFL',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.command === 'fetchNotes') {
    firebase
      .database()
      .ref('/notes')
      .once('value')
      .then((snapshot) => {
        response({
          type: 'result',
          status: 'success',
          data: snapshot.val(),
          request: msg,
        });
      });
  }

  if (msg.command == 'deleteNote') {
    const noteId = msg.data.id;
    // console.log(noteId)
    if (noteId != '') {
      try {
        const deleteNote = firebase
          .database()
          .ref('/notes/' + noteId)
          .remove();
        response({
          type: 'result',
          status: 'success',
          id: noteId,
          request: msg,
        });
      } catch (e) {
        console.log('error', e);
        response({
          type: 'result',
          status: 'error',
          data: e,
          request: msg,
        });
      }
    }
  }

  if (msg.command == 'postNote') {
    const title = msg.data.title;
    const body = msg.data.body;
    const icon = msg.data.icon;
    const noteId = msg.data.id;

    try {
      if (noteId != 'EMPTY-AUTOGEN--') {
        // MADE THIS UP IN app.js
        const newNote = firebase
          .database()
          .ref('/notes/' + noteId)
          .update({
            title,
            icon,
            body,
          });
        response({
          type: 'result',
          status: 'success',
          id: noteId,
          request: msg,
        });
      } else {
        const newPostKey = firebase.database().ref().child('notes').push().key;
        const newNote = firebase
          .database()
          .ref('/notes/' + newPostKey)
          .set({
            title,
            icon,
            body,
          });
        response({
          type: 'result',
          status: 'error',
          id: newPostKey,
          request: msg,
        });
      }
    } catch (e) {
      console.log('error', e);
      response({
        type: 'result',
        status: 'error',
        data: e,
        request: msg,
      });
    }
  }
  return true; // keeps port open
});
