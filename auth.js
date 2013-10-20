// auth.js
// Performs authorization with Google Drive.
//
// author: Kenny Yu

/** Google Drive Client ID */
var CLIENT_ID = '372787255618-aceaf3i3kcv6b5uih4tjtt3kdmd0lcj0.apps.googleusercontent.com';

/** Google Drive API permissions */
var SCOPES = 'https://www.googleapis.com/auth/drive';

/**
 * Called when the client library is loaded to start the auth flow.
 */
function handleClientLoad() {
  window.setTimeout(checkAuth, 1);
}

/**
 * Check if the current user has authorized the application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true},
    handleAuthResult);
}

/**
 * Called when authorization server replies.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authButton = document.getElementById('authorizeButton');
  var authStatus = document.getElementById('authorizeStatus');
  var listButton = document.getElementById('listButton');
  listButton.onclick = listFiles;
  authButton.style.display = 'none';
  if (authResult && !authResult.error) {
    // Access token has been successfully retrieved, requests can be sent to the API.
    authStatus.style.display = 'block';
    if (!(typeof initData === 'undefined')) {
      initData();
    }
  } else {
    // No access token could be retrieved, show the button to start the authorization flow.
    authButton.style.display = 'block';
    authButton.onclick = function() {
      gapi.auth.authorize(
        {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
        handleAuthResult);
    };
  }
}

function listFiles() {
  gapi.client.load('drive', 'v2', function() {
    request = gapi.client.request({
      'path': '/drive/v2/files',
      'method': 'GET',
      'params': {
//        'q' : 'CS261',
        'maxResults' : 20,
      }
    });
    request.execute(function(response) {
      console.log(response);
    });
  });
}
