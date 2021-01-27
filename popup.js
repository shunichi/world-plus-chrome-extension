currentTab = (callback) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      callback(tabs[0]);
    }
  });
}

sendMessageToCurrentTab = (message) => {
  currentTab((tab) => {
    chrome.tabs.sendMessage(tab.id, message);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('archive-all');
  button.addEventListener('click', () => {
    sendMessageToCurrentTab({method: 'archiveAll'});
  })
});
