let filehandler0;

function runner() {
	eval(`
	 class FileHandler extends EventTarget {
    patp
    secret
    priorBasFile
    
	constructor(){
		super()
		this.patp = ''
		
		setTimeout(() => {
		
		    // 1. file upload
		    const form = document.getElementById("fileUpload");
            const data = new FormData(form);
            var self = this
            
            form.addEventListener("change", async (event) => {
              event.preventDefault();
              var reader = new FileReader();
             
                const myColor = document.getElementById('color-chooser')
                const qrContainer = document.getElementById('qr-container')

                myColor.style.display = 'block'
                qrContainer.style.display = 'block'
  
                reader.onload = function(event) {
                    var jsonObj = JSON.parse(event.target.result);
                    self.priorBasFile = jsonObj
                    self.patp = jsonObj.administrator
                    
                    const { generateSecret, generateURI } = otplib;

                    self.secret = generateSecret();
                    const secret = self.secret

                    const uri = generateURI({
                        issuer: "versus",
                        label: jsonObj.administrator,
                        secret,
                    });

                    (async ()=>{
                        const qrDataUrl = await QRCode.toDataURL(uri);
                        var img = document.createElement("img");
                        img.src = qrDataUrl;
                        var src = document.getElementById("knock");
                        src.appendChild(img);

                    })()

                }

              reader.readAsText(event.target.files[0]);
  
            })
            
		    // 2. otp verification token
		    const inputs = document.getElementById("inputs");

            inputs.addEventListener("input",  async (e) => {
                const target = e.target;
                const val = target.value;

                if (isNaN(val)) {
                    target.value = "";
                    return;
                }

                if (val != "") {
                    const next = target.nextElementSibling;
                    if (next) {
                        next.focus();
                    } else {
                        const dc = document.getElementsByClassName('input')
                        var token = ''
                        for(let i = 0; i< dc.length; i++){
                            token +=dc[i].value
                        }

                        const { verify } = otplib;
                        const secret = this.secret
                        const result = await verify({ secret, token });
                        if(result.valid){
                            const twofaDNC = document.getElementById('2fa-dnc')
                            twofaDNC.style.display = 'block'
                        } else {
                            alert('invalid otp')
                        }
                    }
                }
            });

            inputs.addEventListener("keyup", function (e) {
                const target = e.target;
                const key = e.key.toLowerCase();

                if (key == "backspace" || key == "delete") {
                    target.value = "";
                    const prev = target.previousElementSibling;
                    if (prev) {
                        prev.focus();
                    }
                    return;
                }
            });

            // 3. download click post otp
		    document.getElementById("2fa-dnc").addEventListener("click", async (event) => {
                let color = document.getElementById('myColor').value;
			    downloadKeyFile(this.secret, this.priorBasFile, color)
		    })
		    
		}, 0)
	}
	
    publicMembers() {
        return []
    }	
    
	async view (onload, registration) {
		return \`
			<div>
                <h1>Conversion: upload ur tlon bas file</h1>
                <form id="fileUpload" >
                    <input type="file"  class="file-upload"
                           name="fileUpload">
                    <label for="fileUpload" class="custom-button">
                        Choose File
                    </label>
                </form>
                <br/>
                <div id='color-chooser' style='display: none;'>   
                    <span>select a sigil color: </span>
                    <input type="color" id="myColor" value="#000000" >
                </div>
                <button id='2fa-dnc' style='display: none;'>download new key</button>
                <div id='knock'/>
                <br/>
                <div class="container" id='qr-container' style='display: none;'>
                    <span>2fa otp confirmation</span>
                    <br/>
                    <br/>
                    <div id="inputs" class="inputs">
                        <input class="input" type="text" 
                            inputmode="numeric" maxlength="1" />
                        <input class="input" type="text" 
                            inputmode="numeric" maxlength="1" />
                        <input class="input" type="text" 
                            inputmode="numeric" maxlength="1" />
                        <input class="input" type="text" 
                            inputmode="numeric" maxlength="1" />
                        <input class="input" type="text" 
                            inputmode="numeric" maxlength="1" />
                        <input class="input" type="text" 
                            inputmode="numeric" maxlength="1" />
                    </div>
                </div>
			</div>
		\`
	} 
} 


 class Avatar extends EventTarget {
	constructor(){
		super()
		var BLUR_RADIUS = 100;
        var mul_table = [
                512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
                454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
                482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
                437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
                497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
                320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
                446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
                329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
                505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
                399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
                324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
                268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
                451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
                385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
                332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
                289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];
                
           
        var shg_table = [
	             9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 
		        17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 
		        19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
		        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
		        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
		        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 
		        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
		        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 
		        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
		        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
		        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 
		        23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 
		        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
		        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
		        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
		        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];


        function stackBlurCanvasRGBA( canvas, top_x, top_y, width, height, radius ) {
	        if ( isNaN(radius) || radius < 1 ) return;
	        radius |= 0;
	        
	        var context = canvas.getContext("2d");
	        var imageData;
	        
	        try {
	          try {
		        imageData = context.getImageData( top_x, top_y, width, height );
	          } catch(e) {
	          
	            console.log(e)
	          }
	        } catch(e) {
	          alert("Cannot access image");
	          throw new Error("unable to access image data: " + e);
	        }
			        
	        var pixels = imageData.data;
			        
	        var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, 
	        r_out_sum, g_out_sum, b_out_sum, a_out_sum,
	        r_in_sum, g_in_sum, b_in_sum, a_in_sum, 
	        pr, pg, pb, pa, rbs;
			        
	        var div = radius + radius + 1;
	        var w4 = width << 2;
	        var widthMinus1  = width - 1;
	        var heightMinus1 = height - 1;
	        var radiusPlus1  = radius + 1;
	        var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;
	        
	        var stackStart = new BlurStack();
	        var stack = stackStart;
	        for ( i = 1; i < div; i++ )
	        {
		        stack = stack.next = new BlurStack();
		        if ( i == radiusPlus1 ) var stackEnd = stack;
	        }
	        stack.next = stackStart;
	        var stackIn = null;
	        var stackOut = null;
	        
	        yw = yi = 0;
	        
	        var mul_sum = mul_table[radius];
	        var shg_sum = shg_table[radius];
	        
	        for ( y = 0; y < height; y++ )
	        {
		        r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
		        
		        r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
		        g_out_sum = radiusPlus1 * ( pg = pixels[yi+1] );
		        b_out_sum = radiusPlus1 * ( pb = pixels[yi+2] );
		        a_out_sum = radiusPlus1 * ( pa = pixels[yi+3] );
		        
		        r_sum += sumFactor * pr;
		        g_sum += sumFactor * pg;
		        b_sum += sumFactor * pb;
		        a_sum += sumFactor * pa;
		        
		        stack = stackStart;
		        
		        for( i = 0; i < radiusPlus1; i++ )
		        {
			        stack.r = pr;
			        stack.g = pg;
			        stack.b = pb;
			        stack.a = pa;
			        stack = stack.next;
		        }
		        
		        for( i = 1; i < radiusPlus1; i++ )
		        {
			        p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
			        r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
			        g_sum += ( stack.g = ( pg = pixels[p+1])) * rbs;
			        b_sum += ( stack.b = ( pb = pixels[p+2])) * rbs;
			        a_sum += ( stack.a = ( pa = pixels[p+3])) * rbs;
			        
			        r_in_sum += pr;
			        g_in_sum += pg;
			        b_in_sum += pb;
			        a_in_sum += pa;
			        
			        stack = stack.next;
		        }
		        
		        
		        stackIn = stackStart;
		        stackOut = stackEnd;
		        for ( x = 0; x < width; x++ )
		        {
			        pixels[yi+3] = pa = (a_sum * mul_sum) >> shg_sum;
			        if ( pa != 0 )
			        {
				        pa = 255 / pa;
				        pixels[yi]   = ((r_sum * mul_sum) >> shg_sum) * pa;
				        pixels[yi+1] = ((g_sum * mul_sum) >> shg_sum) * pa;
				        pixels[yi+2] = ((b_sum * mul_sum) >> shg_sum) * pa;
			        } else {
				        pixels[yi] = pixels[yi+1] = pixels[yi+2] = 0;
			        }
			        
			        r_sum -= r_out_sum;
			        g_sum -= g_out_sum;
			        b_sum -= b_out_sum;
			        a_sum -= a_out_sum;
			        
			        r_out_sum -= stackIn.r;
			        g_out_sum -= stackIn.g;
			        b_out_sum -= stackIn.b;
			        a_out_sum -= stackIn.a;
			        
			        p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;
			        
			        r_in_sum += ( stackIn.r = pixels[p]);
			        g_in_sum += ( stackIn.g = pixels[p+1]);
			        b_in_sum += ( stackIn.b = pixels[p+2]);
			        a_in_sum += ( stackIn.a = pixels[p+3]);
			        
			        r_sum += r_in_sum;
			        g_sum += g_in_sum;
			        b_sum += b_in_sum;
			        a_sum += a_in_sum;
			        
			        stackIn = stackIn.next;
			        
			        r_out_sum += ( pr = stackOut.r );
			        g_out_sum += ( pg = stackOut.g );
			        b_out_sum += ( pb = stackOut.b );
			        a_out_sum += ( pa = stackOut.a );
			        
			        r_in_sum -= pr;
			        g_in_sum -= pg;
			        b_in_sum -= pb;
			        a_in_sum -= pa;
			        
			        stackOut = stackOut.next;

			        yi += 4;
		        }
		        yw += width;
	        }

	        
	        for ( x = 0; x < width; x++ )
	        {
		        g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
		        
		        yi = x << 2;
		        r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
		        g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
		        b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);
		        a_out_sum = radiusPlus1 * ( pa = pixels[yi+3]);
		        
		        r_sum += sumFactor * pr;
		        g_sum += sumFactor * pg;
		        b_sum += sumFactor * pb;
		        a_sum += sumFactor * pa;
		        
		        stack = stackStart;
		        
		        for( i = 0; i < radiusPlus1; i++ )
		        {
			        stack.r = pr;
			        stack.g = pg;
			        stack.b = pb;
			        stack.a = pa;
			        stack = stack.next;
		        }
		        
		        yp = width;
		        
		        for( i = 1; i <= radius; i++ )
		        {
			        yi = ( yp + x ) << 2;
			        
			        r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
			        g_sum += ( stack.g = ( pg = pixels[yi+1])) * rbs;
			        b_sum += ( stack.b = ( pb = pixels[yi+2])) * rbs;
			        a_sum += ( stack.a = ( pa = pixels[yi+3])) * rbs;
		           
			        r_in_sum += pr;
			        g_in_sum += pg;
			        b_in_sum += pb;
			        a_in_sum += pa;
			        
			        stack = stack.next;
		        
			        if( i < heightMinus1 )
			        {
				        yp += width;
			        }
		        }
		        
		        yi = x;
		        stackIn = stackStart;
		        stackOut = stackEnd;
		        for ( y = 0; y < height; y++ )
		        {
			        p = yi << 2;
			        pixels[p+3] = pa = (a_sum * mul_sum) >> shg_sum;
			        if ( pa > 0 )
			        {
				        pa = 255 / pa;
				        pixels[p]   = ((r_sum * mul_sum) >> shg_sum ) * pa;
				        pixels[p+1] = ((g_sum * mul_sum) >> shg_sum ) * pa;
				        pixels[p+2] = ((b_sum * mul_sum) >> shg_sum ) * pa;
			        } else {
				        pixels[p] = pixels[p+1] = pixels[p+2] = 0;
			        }
			        
			        r_sum -= r_out_sum;
			        g_sum -= g_out_sum;
			        b_sum -= b_out_sum;
			        a_sum -= a_out_sum;
		           
			        r_out_sum -= stackIn.r;
			        g_out_sum -= stackIn.g;
			        b_out_sum -= stackIn.b;
			        a_out_sum -= stackIn.a;
			        
			        p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;
			        
			        r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
			        g_sum += ( g_in_sum += ( stackIn.g = pixels[p+1]));
			        b_sum += ( b_in_sum += ( stackIn.b = pixels[p+2]));
			        a_sum += ( a_in_sum += ( stackIn.a = pixels[p+3]));
		           
			        stackIn = stackIn.next;
			        
			        r_out_sum += ( pr = stackOut.r );
			        g_out_sum += ( pg = stackOut.g );
			        b_out_sum += ( pb = stackOut.b );
			        a_out_sum += ( pa = stackOut.a );
			        
			        r_in_sum -= pr;
			        g_in_sum -= pg;
			        b_in_sum -= pb;
			        a_in_sum -= pa;
			        
			        stackOut = stackOut.next;
			        
			        yi += width;
		        }
	        }
	        
	        context.putImageData( imageData, top_x, top_y );
	        
        }

        function BlurStack(){
	        this.r = 0;
	        this.g = 0;
	        this.b = 0;
	        this.a = 0;
	        this.next = null;
        }

        setTimeout(() => {
            var drawBlur = function(canvas, image) {
            var w = canvas.width;
            var h = canvas.height;
            var canvasContext = canvas.getContext('2d');
            canvasContext.drawImage(image, 0, 0, w, h);
            stackBlurCanvasRGBA(canvas, 0, 0, w, h, BLUR_RADIUS);
            }; 

            var canvas = document.getElementById('header-blur')
            var image = new Image();
            image.crossOrigin = "anonymous";
            image.src = 'https://www.deep6.org/src/assets/deep6.png';
            drawBlur(canvas, image);
            image.onload = function() {
                drawBlur(canvas, image);
            }
        }, 0)
	}
	
    publicMembers() {
        return []
    }	
    
	async view (onload, registration) {
		return \`
			<div>
			    <div class="card">
                  <canvas class="header" width="200" height="140" id="header-blur"></canvas>
                  <div class="avatar">
                     <img src="https://www.deep6.org/src/assets/deep6.png" />
                  </div>
                  <div class="content">
                    <p>deep6.org</p>
                    <p>t: +16479140157</p>
                    <p>e: build@deep6.org</p>
                  </div>
                </div>
			</div>
		\`
	} 
} 


 


class Index extends EventTarget {
	constructor(){
		super()
	}
	
    publicMembers() {
        return [new Date()]
    }	
    
	async view (onload, registration) {
		return \`
			<div>
			    <h1>2fa</h1>
			    <p style="width: 301px; text-align: justify;
  text-justify: inter-word;">versus 2fa allows users to connect to their usbs where data is encrypted and only accessible after a 2fa one-time code has been authorized from a mobile device. the approach allows users to create 2fa profiles that can be at the edge shared from localfile system or tlon identity (mfm or urbit). ▒</p>
			    <br/>
			    <br/>
			    <br/>
			    <FileHandler key={2}/>
			    <a id="downloadAnchorElem" style="display:none"></a>
			    <br/>
			    <br/>
			    <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <span ><span class='blink'>♄</span>&nbsp;&nbsp;<span class="">\$\{this.publicMembers()[0]\}</span></span>
			</div>
		\`
	} 
} 



	
	
	const vf = new VFAASNet({protocol: 'ws', host: '127.0.0.1', port: 8081})

	db = {
		get: async (key, onload, registration) => {

			const promise = (onload) => {
				return new Promise((res, rej) => {
					let update = (datum) => {
					    // TODO: dispatch per component
					    filehandler0.dispatchEvent(new Event('dynamics'));
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
								filehandler0.registration = true;
								filehandler0.dispatchEvent(new Event('dynamics'));
							}, 10)
							if('v' in datum.msg){
								res(datum.msg.v[key])

							} else {
									res(datum.msg.v[key])
							}
						}
						
						const onloadUpdate = (datum) => { 
				 			filehandler0.registration = true;
							filehandler0.dispatchEvent(new Event('dynamics'));
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
	
	
	(async () => {
		let index = new Index();
		let filehandler0 = await (new FileHandler(2));

		const contents = await index.view();
		const element = document.getElementById('anchor');
		let main = contents;
		main = main.replaceAll("<FileHandler key={2}/>", await filehandler0.view((await filehandler0.publicMembers())[0]))
		element.setHTMLUnsafe(main);
		
        filehandler0.addEventListener('dynamics', async (e) => {
		    const secondContents = await filehandler0.view(false, filehandler0.registration)
            index.dispatchEvent(new Event('dynamics'))
		    // const main = document.getElementById('anchor').replaceAll('<FileHandler key={2}/>', secondContents)
		    element.setHTMLUnsafe(main)
	    });
            
         index.addEventListener('dynamics', async (e) => {
         
            main = await index.view(false, index.registration)
            index.dispatchEvent(new Event('^dynamics'))

            main = main.replaceAll("<FileHandler key={2}/>", await filehandler0.view((await filehandler0.publicMembers())[0]));

            element.setHTMLUnsafe(main)
        });   
    
	})();
`)
};

(async () => {
	await runner();
})()
