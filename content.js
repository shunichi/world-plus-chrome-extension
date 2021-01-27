const macOs = /Mac OS/.test(window.navigator.userAgent);

function getGroupInfo() {
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
  const info = getGroupInfo();
  if (info == null) return;

  if (window.confirm(`${info.name}のスレッドをすべてアーカイブします`)) {
    fetch(`/groups/${info.id}/entries/archive_all`, {'method': 'DELETE', ...fetchOptions('json')})
      .then((response) => console.log(`archive finished: ${info.name}`));
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
