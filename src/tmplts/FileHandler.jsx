const downloadKeyFile = (secret, bas, c) => {
    var time = Date.now()
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({...bas, color: c, time: time, secret: secret}));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "keyFile.json");
    dlAnchorElem.click();
}

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
    
	async view() {
		return <>
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
		</>
	} 
} 

module.exports = FileHandler
