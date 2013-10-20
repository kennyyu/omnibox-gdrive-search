// auth.js
// Performs authorization with Google Drive.
//
// author: Kenny Yu

// Google Drive Client ID
var CLIENT_ID = '372787255618-aceaf3i3kcv6b5uih4tjtt3kdmd0lcj0.apps.googleusercontent.com';

// Google Drive API permissions */
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

// Called when the client library is loaded to start the auth flow.
function handleClientLoad() {
  window.setTimeout(checkAuth, 1);
}

// Check if the current user has authorized the application.
function checkAuth() {
  gapi.auth.authorize(
    {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true},
    handleAuthResult);
}
