self.addEventListener('message', (event) => {
  if (event.data === 'hi') {
    event.ports[0].postMessage('Nice to meet you');
  }
});
