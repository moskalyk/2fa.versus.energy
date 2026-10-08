const readFile = (liveReloadFile) => new Promise((res) => {
	fetch(liveReloadFile).then(async el => {
	   return el.text()
	}).then(text => {
	    res(text)
	})
})

const wait = (ms) => new Promise((res)=> setTimeout(res, ms));

(async () => {
    let lastSave;
	while(true){
	    await wait(180)
	    const indexJs = await readFile('./index.js')
		lastSave = JSON.parse(localStorage.getItem('lastSave'))
	    if(indexJs != lastSave) {
	        lastSave = indexJs
	        localStorage.setItem('lastSave', JSON.stringify(indexJs))
	        location.reload()
	    }
	}
})()
