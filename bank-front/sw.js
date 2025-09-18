self.addEventListener('fetch',  (e) => {
    console.log(`fetch: ${e}`);
    
})
self.addEventListener('install', (e) =>{
    console.log(`install: ${e}`);
    
})