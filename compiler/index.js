const fs = require('fs')
const {open, writeFile} = require('node:fs/promises');

const getFileContents = async (filePath) => {
    const file = await open(filePath)

    const fh1 = await file.stat([])
    const buf1 = Buffer.alloc(fh1.size);
    const buffer1 = await file.read(buf1, 0, fh1.size, 0)
    const contents = buffer1.buffer.toString()

    return contents
}

const setupClickHandlers = (componentFile) => {
console.log(componentFile)
        let re = /.+async(.+)\(.*\)\s{([^}]*)\}/g
	    let matchesFuncs = [];
	    let matches = [];
	    let match;

	    while ((match = re.exec(componentFile)) !== null) {
		    matchesFuncs.push(match[1]);
		    matches.push(match[2]);
	    }
	    
	    matchesFuncs.map((matchesFunction, i) => {
	        if(matchesFunction.trim() != 'publicMembers' && matchesFunction.trim() != 'view'){
		        let stringArray = componentFile.indexOf('onclick="this.')
		        let stringArrayEnd = componentFile.indexOf(matchesFunction.trim() + '">')
		        let functionString;
                if(matchesFunction.trim() != 'view'){
        		     functionString = `(async (self) => {${matches[i]}})(\\'\\$\\{this.publicMembers().filter((el,i) => !RegExp.prototype.test.bind(\/\(\<\(\[\^\>\]\+\)\>\)\/i)(el) )\\}\\')"`
                } else {
		         functionString = `(async (self) => {console.log(self)${matches[i]}})()"`
                }
                console.log(stringArray)
                console.log(stringArrayEnd)
                console.log(matchesFunction)
		        componentFile = componentFile.replace(componentFile.slice(stringArray+9, stringArrayEnd+matchesFunction.length-2), functionString)
	        }
	    })
	return componentFile
}

const setupDynamicsDecorators = (componentFile) => {
    const re = /.*@dynamics\("(.+)"\).*/g
    let matches = [];
    let match;

    while ((match = re.exec(componentFile)) !== null) {
	    matches.push(match[1]);
    }
    
    
    matches.forEach((dynamicMatch, i) => {
        componentFile = componentFile.replace('@dynamics("'+ dynamicMatch +'")', '')
	    componentFile = componentFile.replaceAll('{await db.get(\''+ dynamicMatch +'\')}', "\\$\\{await db.get('"+ dynamicMatch +"', onload, registration)\\}")
	    componentFile = componentFile.replaceAll('await db.get(\''+ dynamicMatch +'\')', "await db.get('"+ dynamicMatch +"', false, false)")
	
    })
    
    /// onload and registration
    componentFile = componentFile.replaceAll('async view()', 'async view (onload, registration)')
    componentFile = componentFile.replaceAll('async view ()', 'async view (onload, registration)')
    componentFile = componentFile.replaceAll('^.view()', 'async view (onload, registration)')
    componentFile = componentFile.replaceAll('^.view ()', 'async view (onload, registration)')
    
	return componentFile
}

(async () => {

    // directory path, TODO: needs to be recursive
    const file = './src/tmplts/index.jsx'

    let indexContents = await getFileContents(file)
    const anchorContents = await getFileContents('./anchor.js')
    
    indexContents = "#" + " " + indexContents
    
    // dynamic anchoring
    const matchPackages = /(?<declaration>const|let) (?<component>.+) = require\('(?<package>.+)'\)/g
    
    let composedComponents = {}
    
    while ((packagesMatched = matchPackages.exec(indexContents)) !== null) {
        console.log(packagesMatched)
        composedComponents[packagesMatched.groups.component] = {
            rawPackage: packagesMatched.groups.package,
            c: [],
            components: {}
        }
    }
    
    
    let writtenFile = anchorContents.replace('#', indexContents.toString()).replace('module.exports = Index', '').replace('<>','\\`').replace('</>','\\`')
    
    writtenFile = await setupDynamicsDecorators(writtenFile)

    var varsString = ''
    let tempWrittenFile = writtenFile

    for(let k in composedComponents){
        console.log('k', k)
        let requiredLoading = await getFileContents('./src/tmplts/' + composedComponents[k].rawPackage.replace('./', ''))

        requiredLoading = "#" + " " + requiredLoading
        const dynamicsLoading = await setupClickHandlers(requiredLoading)
        
        const reactiveLoadedFile = await setupDynamicsDecorators(dynamicsLoading)
        writtenFile = writtenFile.replace('#', reactiveLoadedFile.toString()).replace('module.exports = ' + k, '').replace('<>','\\`').replace('</>','\\`')
        console.log('component')
        console.log(`const ${k} = require('${composedComponents[k].rawPackage}')`)
        writtenFile = writtenFile.replace(`const ${k} = require('${composedComponents[k].rawPackage}')`,'' )
        
        let composed = []
        const re = /\<(?<component>[A-Z]+\S+)\b(\s\S+={.+})\/\>(\Z|(?=<)*)/g
           
        let repeats = []
        let x = 0
        do{
            const matches1 = tempWrittenFile.matchAll(re);

            composed = [...matches1]

            if(composed.length==0) break
            for (const match of composed) {
                repeats = match[0]


                if(!composedComponents[match.groups.component].c.includes(match[0])) {
                    const matches1 = match[0].matchAll(re);
                    const metchs = [...matches1]
                    console.log(metchs)
                    if(metchs.length > 0 ) {
                        
                        tempWrittenFile = tempWrittenFile.replace(metchs[0][0],'')
                        // console.log(metchs[0][0])
                        // console.log(tempWrittenFile)
                        composedComponents[match.groups.component].c.push(metchs[0][0])
                        // console.log(composedComponents)
                    }else {
                        tempWrittenFile = tempWrittenFile.replace(match[0],'')
                        composedComponents[match.groups.component].c.push(match[0])
                        // process.exit()
                        break;
                    }
                }
            }
        
        }while((composed.length > 0))

        
        const membersRegex = /((?<key>\S+)={(.+?)})/g
        let keys = []
        Object.keys(composedComponents).map((k) => {
            for(const c of composedComponents[k].c){
                const matches2 = c.trim().matchAll(membersRegex);
                for (const match of matches2) {
                    if(match[2] == 'key') keys.push(match[3])
                }
            }
        })
        
        let i =0
        
        let count = 0

        keys.map((key) => {

            Object.keys(composedComponents).map((k) => {
                let i = 0;
                const arguments = []
                for(const c of composedComponents[k].c) {
                    const matches2 = c.trim().matchAll(membersRegex);
                    for (const match of matches2) {
                        arguments.push([match[2],match[3]])
                    }
                }
                
                let keyIncr = false
                let index = 0
                for(let i = 0; i < arguments.length; i++) {
                    if(arguments[i][0] == 'key') {
                        index = arguments[i][1]
                        if(keyIncr) keyIncr = false
                        else keyIncr = true
                        
                    }
                    
                    if(keyIncr == false && key == index){
                        keyIncr = true
                    }
                    if(keyIncr && key == index){
                        if(composedComponents[k].components[key]) composedComponents[k].components[key].push(arguments[i])
                        else composedComponents[k].components[key] = []
                    }
                }
            })
        })

    }
    
    let index = 0;

    const regexIteration = /(.+)\.reduce.+\{\W*(.+)(.+)\/\>\W*\}\, \'\'\)/gm
    const compRegex = /\<(\w+)\s/
    const members = /(((?<key>\S+)={(.+?)})?)/g

    const iteration = [...writtenFile.matchAll(regexIteration)]

    iteration.forEach((it, i) => {
        const assignment = it[2]
        const compReg = (it[2]+'}').match(compRegex)
        let membersReg = (it[2]+'}').match(members)
        let params = ''
        membersReg = membersReg.filter(mr => mr!=''&&!mr.includes('key='))

        membersReg.forEach(mr => {
            const compRegex = /\<(\w+)\s/

            const paramsParsed = mr.split('=')[1].match(/\{(.+)\}/)
            params += paramsParsed[1]+','
        })

        const assigner = `(await (new ${compReg[1]}(${params.slice(0, params.length-1)})).view(true,true));\n`
        writtenFile = writtenFile.replace(
            it[2]+"}/>",
            "return await Promise.resolve(accumulatorV) + " + assigner
        )        
    })

    Object.entries(composedComponents).map(([k,v]) => {
        let neg = false
        Object.entries(v.components).map(([keys, members]) => {
            const args = members.map((args) => args[1])
            const memberCheck = /\{(.+)\}/
            const membersCheck = /(((?<key>\S+)={(.+?)})?)/g
            let mc = v.c[0].match(membersCheck)
            mc = mc.filter(mr => mr!='').filter(mr =>!mr.includes('key='))
            mc.forEach((m) => {
                if(m.split('=')[1].match(memberCheck)[0] == '\'' || m.split('=')[1].match(memberCheck)[0] == '\"' ||typeof m.split('=')[1].match(memberCheck)[0] == 'number' ) {
                } else {
                    neg = true
                    delete composedComponents[k]
                }
            })
            if(!neg) varsString += `let ${k.toLowerCase()}${index++} = await (new ${k}(${args.toString()}));\n`
        })
    })
    
    const str = writtenFile;
    const str1 = varsString;
    const idx = writtenFile.indexOf('let index = new Index();') + 'let index = new Index();'.length;

    const s1 = str.slice(0, idx);
    const s2 = str.slice(idx);

    writtenFile = `${s1}\n\t\t${str1}${s2}`;
    
    let j=0
    
    const dispatchesForDynamics = []
	const componentRegistrations = []
	const clickHandlers = []
	const globalsComponents = []
	
	let clickHandlersString = ''
    for(let c in composedComponents){
        for(let k of composedComponents[c].c){
            // indexed components
            const string = writtenFile 
            const stringToAdd = `main = main.replaceAll("${k}", await ${c.toLowerCase()+j}.view((await ${c.toLowerCase()+j}.publicMembers())[0]))`;

            const index = writtenFile.indexOf('let main = contents;') + 'let main = contents;'.length;
            const s_1 = string.slice(0, index);
            const s_2 = string.slice(index);
            writtenFile = `${s_1}\n\t\t${stringToAdd}${s_2}`;
            clickHandlersString += stringToAdd + ";"
            // vfaas code creation
            clickHandlers.push(`
        ${c.toLowerCase()+j}.addEventListener('dynamics', async (e) => {
		    const secondContents = await ${c.toLowerCase()+j}.view(false, ${c.toLowerCase()+j}.registration)
            index.dispatchEvent(new Event('dynamics'))
		    // const main = document.getElementById('anchor').replaceAll('${k}', secondContents)
		    element.setHTMLUnsafe(main)
	    });
            `)
            globalsComponents.push("let " + c.toLowerCase()+j+";")
            dispatchesForDynamics.push(c.toLowerCase()+j+`.dispatchEvent(new Event('dynamics'));`)
            componentRegistrations.push(c.toLowerCase()+j+`.registration = true;`)
            j++
        }
    }
    
    clickHandlers.push(`
         index.addEventListener('dynamics', async (e) => {
         
            main = await index.view(false, index.registration)
            index.dispatchEvent(new Event('^dynamics'))

            ${clickHandlersString}

            element.setHTMLUnsafe(main)
        });   
    `)
	
    // vfaas code creation
    const vfaasCode = `
	const vf = new VFAASNet({protocol: 'ws', host: '127.0.0.1', port: 8081})

	db = {
		get: async (key, onload, registration) => {

			const promise = (onload) => {
				return new Promise((res, rej) => {
					let update = (datum) => {
					    // TODO: dispatch per component
					    ${dispatchesForDynamics.toString().replace(',','')}
						res(datum.msg.value)	
									
						onload && vf.webSocket.send('update', JSON.stringify({status: 170, msg: {key: key, value: value}}))

					}			
					vf.aPath(update)
				})
			}
			
			if(onload && registration) {
				const pr = () => {
					return new Promise((res) => {
						const loadDatabase = (datum) => {
							setTimeout(() => {
								${componentRegistrations.toString().replace(',','')}
								${dispatchesForDynamics.toString().replace(',','')}
							}, 10)
							if('v' in datum.msg){
								res(datum.msg.v[key])

							} else {
									res(datum.msg.v[key])
							}
						}
						
						const onloadUpdate = (datum) => { 
				 			${componentRegistrations.toString().replace(',','')}
							${dispatchesForDynamics.toString().replace(',','')}
						}
						
						vf.aPath(onloadUpdate)
						vf.aPath(loadDatabase)
						
						setTimeout(() => {
							vf.webSocket.send('loadDatabase', JSON.stringify({ status: 139, msg: {key : key} }))
						}, 10)
					})
				}

				return await pr()
			}
			else if(!onload && registration) {
				return await promise(false)
			}
		},
		put: async (key, value) => {
			vf.webSocket.send('update', JSON.stringify({status: 170, msg: {key: key, value: value}}))
		}
	};
	
	
	vf.aBoot(({boot}) => {
	   vf.webSocket.send('client', JSON.stringify({status: 204, msg: 'msg send'}))
	});
	`
	const stringifyArray = (total, increment) => total + increment
	// console.log(clickHandlers)
	// console.log(stringifyArray)
	writtenFile = writtenFile.replace('&)', clickHandlers.reduce(stringifyArray,'')) // onlick handlers
	writtenFile = writtenFile.replace('// %!', globalsComponents.reduce(stringifyArray,''))
	writtenFile = writtenFile.replace('^&', vfaasCode.toString())

    // TODO: add onchange handlers
    // let rey = /(.+)\(.+\)\s{([^}]*)\}/g
	// let matchesFuncsHandlers = [];
	// let matchesHandlers = [];
	
	// while ((match = rey.exec(nlContents)) !== null) {
	// 	matchesFuncsHandlers.push(match[1]);
	// 	matchesHandlers.push(match[2]);
	// }
	
	// matchesFuncsHandlers.map((matchesFunc, i) => {
	// 	const reg = /onchange="(.+)"/
	// 	const reg1 = /onchange=".+\((.+)\)"/
	// 	const thisValChange = nlContents.match(reg)
	// 	const thisValChangeValue = nlContents.match(reg1)
	// 	const functionString = `(async (val, self) => {email = val;db.put('name', email);${matchesHandlers[i]}})(${thisValChangeValue[1]}, indexPage)`
	// 	nlContents = nlContents.replace(thisValChange[1], functionString)
	// })
	
    // clean up sign anchors
    writtenFile = writtenFile.replace('#', '')
    
    // write to index
    await writeFile('./index.js', writtenFile)

})()
