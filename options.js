// options.js

// Called when authorization server replies.
function handleAuthResult(authResult) {
  var authButton = document.getElementById('authorizeButton');
  var authStatus = document.getElementById('authorizeStatus');
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