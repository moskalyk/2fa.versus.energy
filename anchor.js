// %!

function runner() {
	eval(`
	#
	
	^&
	
	(async () => {
		let index = new Index();
		const contents = await index.view();
		const element = document.getElementById('anchor');
		let main = contents;
		element.setHTMLUnsafe(main);
		&)
	})();
`)
};

(async () => {
	await runner();
})()
