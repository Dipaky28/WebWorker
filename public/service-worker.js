addEventListener('install', () => {
    self.skipWaiting();
});
addEventListener('activate', () => {
    self.clients.claim();
});
  
let resolver;
  
addEventListener('message', event => {
    if (event.data.type == "SET_INPUT_VALUE") {
        console.log(event.data);
        console.log('service resolving input promise');
        resolver(new Response(event.data.inputValue, {status: 200}));
        resolver = null;
    }
});
  
addEventListener('fetch', e => {
    const u = new URL(e.request.url);
    if (u.pathname === '/wait_for_user_input/') {
        console.log('received service invitation')
        e.respondWith(new Promise(r => resolver = r));
    }
});
