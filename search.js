// search.js
// Perform search queries to Google Drive and displays results
// in the omnibox
//
// author: Kenny Yu

MAX_SEARCH_RESULTS = 7;

INIT_SEARCH_RESULTS = 500;

// Mapping from id -> suggestion
var data = {}

// Called when authorization server replies.
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // Access token has been successfully retrieved
    console.log("auth worked");
    initData();
  } else {
    // auth failed
    console.log("auth failed, must init manually");
  }
}

// Since files.list with a "q=QUERY" parameter is down, then
// we must add this hack to prefetch data first, and perform
// a search on the client side instead.
//
// This function will populate data, which we will search over
// when the user enters input.
function initData() {
  console.log("init data...");
  gapi.client.load('drive', 'v2', function() {
    request = gapi.client.request({
      'path': '/drive/v2/files',
      'method': 'GET',
      'params': {
        'maxResults': INIT_SEARCH_RESULTS,
      }
    });
    request.execute(function(response) {
      console.log(response);
      for (var i in response.items) {
        item = response.items[i];
        data[item.id] = {
          content: item.alternateLink,
          description: item.title,
          time: new Date(item.lastViewedByMeDate),
        };
      }
      console.log(data);
    });
  });
}

// This will remove any "&" and """ characters from
// a string.
function escapeString(s) {
  return s.replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    // As of Oct 20, 2013, the files.list call with the 'q' parameter
    // returns a Server Error (Code 500). To get around this, we
    // first prefetch a whole bunch of files and perform searching
    // on the client side.
    gapi.client.load('drive', 'v2', function() {
      request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {
//          'q' : text,
          'maxResults': MAX_SEARCH_RESULTS,
        }
      });
      request.execute(function(response) {
        console.log(response);
        for (var i in response.items) {
          var item = response.items[i];
          data[item.id] = {
            content: item.alternateLink,
            description: item.title,
            time: new Date(item.lastViewedByMeDate),
          };
        }

        var suggestions = [];
        text = escapeString(text);
        for (var i in data) {
          var item = data[i];
          var desc = item.description;
          var index = desc.toLowerCase().search(text.toLowerCase());
          if (index != -1) {
            suggestions.push({
              content: encodeURI(item.content),
              description: escapeString(
                "<dim>" + desc.slice(0, index) + "</dim>"
                + "<match>" + desc.slice(index, index + text.length) + "</match>"
                + "<dim>" + desc.slice(index + text.length) + "</dim>"),
            })
          }
        }
        // Return only the first 8, sorted by the last time user viewed them
        suggestions = suggestions.slice(0, 8);
        suggestions.sort(function(a, b) {return a.time - b.time;});
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
