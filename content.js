const macOs = /Mac OS/.test(window.navigator.userAgent);

function getGroupInfoV2() {
  const parent = document.getElementById('BoardHeader_clipboard')?.parentNode;
  if (parent == null) return null;

  let found = null;
  Array.from(parent.querySelectorAll('a[target="_blank"')).find((elem) => {
    const match = /\/groups\/(\d+)/.exec(elem.href);
    if (match) {
      found = { id: parseInt(match[1], 10), name: elem.text };
      return true;
    } else {
      return false;
    }
  })
  return found;
}

function getGroupInfoV1() {
  const groupNameNode = document.querySelector('.js-group-header .js-group-name');
  if (!groupNameNode) {
    return null;
  }
  const linkNode = groupNameNode.querySelector('a');
  if (!linkNode) {
    return null;
  }

  const match = /\/groups\/(\d+)/.exec(linkNode.href);
  if (match) {
    return { id: parseInt(match[1], 10), name: groupNameNode.title };
  }
  return null;
}

function headers(type) {
  let accept = type === 'js' ? 'text/javascript' : 'application/json';
  return {'Accept': accept, 'x-csrf-token': document.querySelector('meta[name="csrf-token"]')['content']};
}

function fetchOptions(type) {
  return { 'credentials': 'include', 'headers': headers(type) };
}

function archiveAll() {
  const info = getGroupInfoV1() || getGroupInfoV2();
  if (info == null) return;

  if (window.confirm(`${info.name}のスレッドをすべてアーカイブします`)) {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#xhr_and_fetch
    // In Firefox, extensions that need to perform requests that behave as if they were sent by the content itself can use  content.XMLHttpRequest and content.fetch() instead.
    const fetch = (window.content && window.content.fetch) ? content.fetch : window.fetch;
    fetch(`https://www.sonicgarden.world/groups/${info.id}/entries/archive_all`, {'method': 'DELETE', ...fetchOptions('json')})
    .then((response) => {
      if (response.ok) {
        console.log(`Archive finished: ${info.name}`)
      } else {
        console.log(`Acrhive failed:`, response);
      }
    });
  }
}

chrome.runtime.onMessage.addListener(({method}, sender, sendResponse) => {
  if (method === 'archiveAll') {
    archiveAll();
  }
});

document.addEventListener('keydown', (e) => {
  // console.log(`code=${e.code}, ctrlKey=${e.ctrlKey}, altKey=${e.altKey}`);
  const modifier = macOs ? (e.ctrlKey && e.metaKey) : (e.ctrlKey && e.altKey);
  if (modifier && e.code === 'KeyA') {
    e.preventDefault();
    e.stopPropagation();
    archiveAll();
  }
});
