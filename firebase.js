// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.command == 'fetchNotes') {
    firebase
      .database()
      .ref('/notes')
      .once('value')
      .then(function (snapshot) {
        response({
          type: 'result',
          status: 'success',
          data: snapshot.val(),
          request: msg,
        });
      });
  }

  if (msg.command == 'deleteNote') {
    var noteId = msg.data.id;
    //console.log(noteId)
    if (noteId != '') {
      try {
        var deleteNote = firebase
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
        response({ type: 'result', status: 'error', data: e, request: msg });
      }
    }
  }

  if (msg.command == 'postNote') {
    var title = msg.data.title;
    var body = msg.data.body;
    var icon = msg.data.icon;
    var noteId = msg.data.id;

    try {
      if (noteId != 'EMPTY-AUTOGEN--') {
        // MADE THIS UP IN app.js
        var newNote = firebase
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
        var newPostKey = firebase.database().ref().child('notes').push().key;
        var newNote = firebase
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
