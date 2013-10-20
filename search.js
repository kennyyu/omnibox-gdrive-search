// search.js
// Perform search queries to Google Drive and displays results
// in the omnibox
//
// author: Kenny Yu

MAX_SEARCH_RESULTS = 10;

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
//    suggest([
//      {content: text + " one", description: "the first one"},
//      {content: text + " number two", description: "the second entry"}
//    ]);
    gapi.client.load('drive', 'v2', function() {
      request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {
  //        'q' : 'CS261',
          'maxResults': MAX_SEARCH_RESULTS,
        }
      });
      request.execute(function(response) {
        console.log(response);
        suggestions = [];
        for (var i in response.items) {
          item = response.items[i];
          suggestions.push({
            content: item.title,
            description: "<url>%s</url>".format(item.alternateLink),
          });
        }
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
        chrome.tabs.update(tabs[0].id, {url: text});
      });
  });
