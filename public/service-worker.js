addEventListener('install', () => {
    self.skipWaiting();
});
addEventListener('activate', () => {
    self.clients.claim();
});
  
const callbacks = {};
  
addEventListener('message', event => {
    if (event.data.type == "SET_INPUT_VALUE") {
        console.log('service resolving input promise');
        let messageID = event.data.id;
        console.log('responding to id: '+messageID);
        let resolver = callbacks[messageID];
        delete callbacks[messageID];
        resolver(new Response(event.data.inputValue, {status: 200}));
    }
});
  
addEventListener('fetch', async e => {
    const requestedURL = new URL(e.request.url);
    if (requestedURL.pathname === '/wait_for_user_input/' && e.request.method === 'POST') {
        console.log('received service invitation');
        e.respondWith(handleRequest(e.request));
    }
});

async function handleRequest(request) {
    let requestJSON = await request.json();
    let messageID = requestJSON.id;
    console.log('handling id: '+messageID);
    return new Promise(resolve => callbacks[messageID] = resolve);
}