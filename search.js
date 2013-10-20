// search.js
// Perform search queries to Google Drive and displays results
// in the omnibox
//
// author: Kenny Yu

MAX_SEARCH_RESULTS = 7;

var data = []

function initData() {
  console.log("initData");
  gapi.client.load('drive', 'v2', function() {
    request = gapi.client.request({
      'path': '/drive/v2/files',
      'method': 'GET',
      'params': {
        'maxResults': 1000,
      }
    });
    request.execute(function(response) {
      console.log(response);
      for (var i in response.items) {
        item = response.items[i];
        data.push({
          content: item.alternateLink,
          description: item.title,
        });
      }
      console.log(data);
    });
  });
}

function escapeString(s) {
  return s.replace(/&/g, "&amp;")
    .replace(/>/g, "&gt;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    /*
    gapi.client.load('drive', 'v2', function() {
      request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {
          'q' : text,
          'maxResults': MAX_SEARCH_RESULTS,
        }
      });
      request.execute(function(response) {
        console.log(response);
        suggestions = [];
        for (var i in response.items) {
          var item = response.items[i];
          suggestions.push({
            content: item.alternateLink,
            description: "<dim>" + item.title + "</dim>",
          });
        }
        suggest(suggestions);
      });
      */
//    if (data.length == 0) {
//      initData();
//    }
    suggestions = [];
    for (var i in data) {
      var item = data[i];
      var desc = escapeString(item.description);
      var index = desc.toLowerCase().search(text.toLowerCase());
      if (index != -1) {
        suggestions.push({
          content: encodeURI(item.content),
          description: "<dim>" + desc.slice(0, index) + "</dim>"
            + "<match>" + desc.slice(index, index + text.length) + "</match>"
            + "<dim>" + desc.slice(index + text.length) + "</dim>",
        })
      }
    }
    console.log(suggestions);
    suggest(suggestions);
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
