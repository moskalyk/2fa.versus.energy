const { watch } = require("node:fs");
const { exec, spawn } = require('child_process');

// start server
const startServer = async () => {
    console.log()
    console.log('starting server...')
    
    const RESET = "\x1b[0m"
    const GREEN = "\x1b[32m"
    const RED = "\x1b[31m"
    const CYAN = "\x1b[36m"
    
        const npx = spawn('npx', ['serve', '.', '--no-port-switching', '-p','3030'])
    
    let isAcceptingConnections = false;
    let matchConnections = /(.+) Accepting connections at (.+)/   
    let matchIndexReload = /(.+) GET \/index.js/   

    npx.stdout.on('data', (data) => {

        // const matched = data.toString().match(matchIndexReloader)
        let matched;
        if(isAcceptingConnections == false) {
            matched = data.toString().match(matchConnections)
        }
        
        if(isAcceptingConnections == true) {
            matched = data.toString().match(matchIndexReload)
        }
        
        if(!isAcceptingConnections && matched && matched.length > 0){
            isAcceptingConnections = true

            console.log(`${GREEN}${data}${RESET}`);
        } else if(isAcceptingConnections && matched && matched.length > 0){
            // noop
        }
        
    });
    
    npx.stderr.on('data', (err) => {
        console.log(`${RED}${err}${RESET}`);
    });

    npx.on('close', (code) => {
        console.log(`${CYAN}${'Child process exited with code'}${code}${RESET}`);
    });
}

// compile
const compileFiles = async () => {
    console.log('beginning: compiling files...')
    console.log('done: compiling files')
    exec('npm run build', async (err, stdOut, stdErr) => {
        if (err) {
            console.error(`Error executing command: ${err.message}`);
            return;
        }

        if (stdErr) {
            console.error(`Command stderr: ${stdErr}`);
        }

        console.log(`built success`);
  
        await startServer()
    })
};

(async () => {
    compileFiles()
    var fsTimeout
    watch("src/tmplts", async (event, filename) => {
        if (event === 'change' && filename) {
            if (!fsTimeout) {
                console.log(filename + ' has been changed');
                
                // check for file updates over a certain time of 2 seconds
                fsTimeout = setTimeout(function() { fsTimeout=null }, 2000) // give 5 seconds for multiple events
                
                // start
                await compileFiles()
            }
        }
    });
})()
