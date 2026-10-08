const Avatar = require('./Avatar.jsx')
const FileHandler = require('./FileHandler.jsx')

class Index extends EventTarget {
	constructor(){
		super()
	}
	
    publicMembers() {
        return [new Date()]
    }	
    
	async view() {
		return <>
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
		</>
	} 
} 

module.exports = Index
