// search.js
// Perform search queries to Google Drive and displays results
// in the omnibox
//
// author: Kenny Yu

// Maximum number of search results for each request
MAX_SEARCH_RESULTS = 10;

// Called when authorization server replies.
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // Access token has been successfully retrieved
    console.log("auth worked");
  } else {
    // auth failed
    console.log("auth failed, must init manually");
  }
}

// This will remove any "&" and """ characters from a string.
function escapeString(s) {
  return s.replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    gapi.client.load('drive', 'v2', function() {
      // Query for any files where the title contains the text query
      request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {
          'q' : 'title contains \'' + text + '\'',
          'maxResults': MAX_SEARCH_RESULTS,
        }
      });
      // Once we have the results, find the part of the title that
      // matches and highlight it with the <match></match> tag.
      request.execute(function(response) {
        console.log(response);
        var suggestions = [];
        text = escapeString(text);
        for (var i in response.items) {
          var item = response.items[i];
          var desc = item.title;
          var index = desc.toLowerCase().search(text.toLowerCase());
          if (index != -1) {
            suggestions.push({
              content: encodeURI(item.alternateLink),
              description: escapeString(
                "<dim>" + desc.slice(0, index) + "</dim>"
                + "<match>" + desc.slice(index, index + text.length) + "</match>"
                + "<dim>" + desc.slice(index + text.length) + "</dim>"
                + " | <url>" + item.alternateLink + "</url>"),
            })
          }
        }
        console.log(suggestions);
        suggest(suggestions);
      });
    });
  });

chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
    chrome.tabs.query(
      {active: true, currentWindow: true},
      function(tabs) {
        // If the text is a url, then redirect to it. Otherwise, default
        // to the normal google drive search.
        if (text.indexOf("https://") == 0 || text.indexOf("http://") == 0) {
          chrome.tabs.update(tabs[0].id, {url: text});
        } else {
          chrome.tabs.update(tabs[0].id, {url: "https://drive.google.com/#search/" + text});
        }
      }
    );
  });

chrome.omnibox.setDefaultSuggestion({
  description: "Search Google Drive: <url>https://drive.google.com/#search/</url>",
});
