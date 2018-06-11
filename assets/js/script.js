// https://tutorialzine.com/2013/11/javascript-file-encrypter
// put keys in backtick (``) to avoid errors caused by spaces or tabs
const pubkey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQENBFrbuEIBCAC9Ph3p2SyYrZvpxAfiLg5Hj1EbZM4Lto5h+ZsUbud9uEqCUlgB
lPWwjq+N8S2PmD9+NcCf3Yy5EfAZqjkRP4lN2gp+B03rdpCCm9F5s0EPnv/wC1E9
SRLGuM/I81lM7Pdn7BbAkIRl9JxmVyeMacDp8fClJHZlihCXcZbNNf2cxvvf035Y
GZd9JfyUJn/Ur16KuXphWxdKfxefa/RzTYSF8puL5zKHiHlvz4RzOOD5FhPdCbdS
hP4jjLXri3ARvlOahA56Ma73OY+hKcGIPuKFzXLQfs2TC1fbTR/UNKdqnHffKLUs
M8jM1uyz7qiGfx/xuuaE/NPv5IOVHGL5ZJ3hABEBAAG0GXpqemVpdCA8emp6ZWl0
QGdtYWlsLmNvbT6JAU4EEwEIADgWIQQT+KIt94EwHmTxYdw7h66JarXZXAUCWtu4
QgIbAwULCQgHAgYVCgkICwIEFgIDAQIeAQIXgAAKCRA7h66JarXZXPpQB/9ujCZJ
J9dZStHRkI06OpyF8yKHnNAuGxo1Kr5rhqWmujwEWuaYMvjVSkmNIeKNYYzSwCUo
2mFL/AqD6Jsf7LCY3Nk1v1qPtcsEoPYH3yZmhgMJXobjrBwt/6dM1/HKMJ7RrohZ
4xyd+AB9Z4NDkchLPu74LmR2MnrTI5VsvneHj/h1zCLdwX9qtVL7bATE/r6qNn6N
jiYnAqwOAwcWgqsIxCh/aOh7bAHav7vEXPkORvcCPifcGSv4LKGIY8nQtdRNGR8r
T/WplVAUZXO2eCP46l33QvGz2R8YJkyFRBZvrod1GQ8WAd4qs/vAh9AXwyxijDSS
97PyqgcLpSBZMxwIuQENBFrbuEIBCADA0/UOQCPJtxyOA54XRxPeSJrtH5T82S+F
/oMXOLqtpwgtSgcwEuzGXgMM/6cdXZJUwOqaOlVU5UyY7AucaZvUV2F9PcCFGKEt
AOTDNnQ11veh2h5EtP+a620qqUvuQAL6pKMP8Xn7N+UAjes/nZT/UXI7kgw4vVSj
pmboUDNbcTKVjD74fYb/rowXRD2X+j49pA7v0zmYEeLq9qS29pQ247AWX+dC+K8a
iHlxzpeW9IGZbh0KGuSkYBj75jA+WAwkYkOUQgnZWkniejQIsOdQ31HU+T+rDAgq
GuRCOcOziun7o7/RrSnT+Oi7cQvZ7oIOl7mU0ZT9YeSo4rxHXtk5ABEBAAGJATYE
GAEIACAWIQQT+KIt94EwHmTxYdw7h66JarXZXAUCWtu4QgIbDAAKCRA7h66JarXZ
XDvVCACzi4j/FZve36k4u99BuhAr4H2C25YUMkM687duB+EBMJtWl6Mw+g0mmSKJ
0An1NdrXL6ntX8+xNa3EQiZ6IWjsh96s6vjy04wwCAEr7KIqnCsNvR96exPfuiR1
8joVeyqUE36UdDUVpzIZ8pHGr0TML+mFf1Fmz78WqGPWuCyld+su+7uBnP8g9MSx
x9+PYoxRDQfmBYBhEFc8Z/GJxIl2HVMto3Cga7UivFJlV9bPcfRtflFDGBFrf6Rs
niN087uCHMxKfWZ45VnqAqbkWqNj6exA8HKqrQAx1d70h74RQz+iKoNfHT64yOOI
3tr+K1YoFx73s2kSOw5CkGjErk6R
=A/Lm
-----END PGP PUBLIC KEY BLOCK-----`;

$(function(){
	var body = $('body');
	var stage = $('#stage');
	var back = $('a.back');

	/* Step 1: Determine User Action */
	$('#step1 .encrypt.gpg').click(function(){
		body.attr('class', 'encrypt gpg');
		// Slide to step 2 div
		step(2);
	});
	$('#step1 .encrypt.aes').click(function(){
		body.attr('class', 'encrypt aes');
		step(2);
	});
	$('#step1 .decrypt.gpg').click(function(){
		body.attr('class', 'decrypt gpg');
		step(2);
	});
	$('#step1 .decrypt.aes').click(function(){
		body.attr('class', 'decrypt aes');
		step(2);
	});

	/* Step 2: File Input */
	$('#step2 .button').click(function(){
		// Trigger the file browser dialog
		$(this).parent().find('input').click();
	});

	// Set up events for the file inputs
	var file = null;

	$('#step2').on('change', '#file-input', function(e){
		// Has a file been selected?
		if(e.target.files.length!=1){
			alert('Please select a file!');
			return false;
		}
		file = e.target.files[0];

		// Set GPG key to default public key
		if(body.hasClass('encrypt')){
			$('#step3 textarea.public-key').val(pubkey);
		}
		step(3);
	});

	/* Step 3: Get Passphrase (AES) or Public Key (GPG)  */
	$('a.button.process').click(function(){
		// The HTML5 FileReader object reads the selected file.
		var reader = new FileReader();
		
		// AES
		if(body.hasClass('aes')){
			var input = $(this).parent().find('input[type=password]');
			var a = $('#step4 a.download');
			var password = input.val();

			input.val('');
			if(password.length<5){
				alert('Please choose a longer password!');
				return;
			}

			// AES: Encrypt
			if(body.hasClass('encrypt')){
				reader.onload = function(e){
					var encrypted = CryptoJS.AES.encrypt(e.target.result, password);
					console.log(encrypted);
					// TODO: make encrypted a uint8array
					var blob = new Blob([encrypted], {type: "application/octet-binary;charset=utf-8"});
					var url = URL.createObjectURL(blob);
					a.attr('href', url);
					a.attr('download', file.name + ".gpg");
		// https://discourse.threejs.org/t/how-to-create-a-new-file-and-save-it-with-arraybuffer-content/628/3
					step(4);
				};

				reader.readAsArrayBuffer(file);
			}

			// AES: Decrypt
			else {
				reader.onload = function(e){
					var decrypted = CryptoJS.AES.decrypt(e.target.result, password).toString(CryptoJS.enc.Latin1);

					if(!/^data:/.test(decrypted)){
						alert("Invalid pass phrase or file! Please try again.");
						return false;
					}

					a.attr('href', decrypted);
					a.attr('download', file.name.replace('.encrypted',''));

					step(4);
				};
				reader.readAsText(file);
			}
		}
		// GPG
		else if(body.hasClass('gpg')){
			var a = $('#step4 a.download');
			// GPG: Encrypt
			if(body.hasClass('encrypt')){
				var publicKey = $('#step3 textarea.public-key').val();
				reader.onload = function(e){
					var fileToEncrypt =  new Uint8Array(e.target.result);
					var options = {
						data: fileToEncrypt,
						publicKeys: openpgp.key.readArmored(publicKey).keys,
						armor: false // Don't ASCII-armor, just keep it as a binary blob
					};
					openpgp.encrypt(options).then(ciphertext => {
						encrypted = ciphertext.message.packets.write(); //Uint8Array
						var blob = new Blob([encrypted], {type: "application/octet-binary;charset=utf-8"});
						var url = URL.createObjectURL(blob);
						a.attr('href', url);
						a.attr('download', file.name + ".gpg");
						step(4);
					}).catch(error => {
						alert("Error: Bad key entered.");
						console.log(error);
					})
				}
				// Read file and trigger reader.onload()
				reader.readAsArrayBuffer(file);
			}
			// GPG: Decrypt
			else if(body.hasClass('decrypt')){
				var privateKey = $('#step3 textarea.private-key').val();
				const privateKeyObj = openpgp.key.readArmored(privateKey).keys[0];
				var keyPassphrase = $('#step3 input.passphrase').val();
				reader.onload = function(e){
					var fileToDecrypt = new Uint8Array(e.target.result);
					console.log(openpgp.message.fromBinary(fileToDecrypt));
					var options = {
						message: openpgp.message.fromBinary(fileToDecrypt),
						privateKeys: [privateKeyObj],
						armor: false // Don't ASCII-armor, just keep it as a binary blob
					};
					privateKeyObj.decrypt(keyPassphrase).then(something => {;
					openpgp.decrypt(options)}).then(plaintext => {
						console.log(plaintext);
						decrypted = plaintext.message.packets.write(); //Uint8Array
						var blob = new Blob([decrypted], {type: "application/octet-binary;charset=utf-8"});
						var url = URL.createObjectURL(blob);
						a.attr('href', url);
						a.attr('download', file.name + ".decrypted");
						step(4);
					}).catch(error => {
						alert("Error: Bad key/passphrase combination.");
						console.log(error);
					})
				}
				// Read file and trigger reader.onload()
				reader.readAsArrayBuffer(file);
			}
		}

	});


	/* The back button */
	back.click(function(){
		// Reinitialize the hidden file inputs,
		// so that they don't hold the selection 
		// from last time
		$('#step2 input[type=file]').replaceWith(function(){
			return $(this).clone();
		});

		step(1);
	});


	// Helper function that moves the viewport to the correct step div
	function step(i){
		if(i == 1){
			back.fadeOut();
		}
		else{
			back.fadeIn();
		}

		// Move the #stage div. Changing the top property will trigger
		// a css transition on the element. i-1 because we want the
		// steps to start from 1:

		stage.css('top',(-(i-1)*100)+'%');
	}
});
