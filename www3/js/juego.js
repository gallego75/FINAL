var ARBOLES=3;
var alto=document.documentElement.clientHeight;
var ancho=document.documentElement.clientWidth;
var juego = new Phaser.Game(ancho, alto, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var arboles,tractor,hojas,velocidadX=0,velocidadY=0,timerHojas,separados;
var hojasText,numHojas=0,tiempoText,tiempo=0,gameOver,cursors,teclado=false;

if ('addEventListener' in document) {
	document.addEventListener('deviceready', function() {
		navigator.accelerometer.watchAcceleration(onSucess,onError,{frequency: 10});
	},false);
}

function onError(msg) {
	console.log('Error');
}

function onSucess(acceleration) {
	velocidadX=acceleration.x*-200;
	velocidadY=acceleration.y*200;
}

function preload() {
	juego.load.image('arena','assets/arena.png');
	juego.load.spritesheet('arbol','assets/arbol.png',100,100);
	juego.load.image('hoja','assets/hoja.png');
	juego.load.spritesheet('tractor','assets/tractor.png',50,52);
}

function create() {
	var arbol;

	juego.physics.startSystem('Phaser.Physics.ARCADE');

	var arena=juego.add.sprite(0,0,'arena');
	arena.scale.setTo(ancho/450,alto/600);

	var hoja=juego.add.sprite(16,16,'hoja');
	hoja.scale.setTo(2,2);
	hojasText=juego.add.text(0,10,'0',{fontSize: '50px',fill:'#005000'});
	hojasText.setTextBounds(16,10,hoja.width,hoja.height);
	hojasText.boundsAlignH='center';
	hojasText.boundsAlignV='center';
	tiempoText=juego.add.text(0,20,'02:00',{fontSize: '32px',fill:'#000'});
	tiempoText.setTextBounds(ancho-100,20,hoja.width,hoja.height);
	tiempoText.boundsAlignH='center';
	tiempoText.boundsAlignV='center';
	var copyRight=juego.add.text(0,5,'© - P. Carmona',{font: '16px Serif', fill: '#000'});
	copyRight.setTextBounds(0,0,ancho,alto);
	copyRight.boundsAlignH='center';

	tractor=juego.add.sprite(ancho/2,50,'tractor',0);
	juego.physics.arcade.enable(tractor);
	tractor.rotation=Math.PI/2;
	tractor.anchor.setTo(0.5,0.5);
	tractor.body.collideWorldBounds=true;
	tractor.animations.add('barrer',[1,0],10,true);
	arboles=juego.add.group();
	arboles.enableBody=true;
	hojas=juego.add.group();
	hojas.enableBody=true;
	espacioMarcadores=100;
	for (var i=0; i<ARBOLES; i++) {
		arbol=arboles.create(0,0,'arbol',0);
		arbol.anchor.setTo(0.5,0.5);
		if (i%2==0)
			arbol.x=aleatorio(0+arbol.width/2+tractor.width,ancho/2-arbol.width/2);
		else
			arbol.x=aleatorio(ancho/2+arbol.width/2,ancho-arbol.width/2-tractor.width);
		var iniFranjaArbol=i*(alto-espacioMarcadores)/ARBOLES+espacioMarcadores+arbol.height/2;
		var finFranjaArbol=(i+1)*(alto-espacioMarcadores)/ARBOLES+espacioMarcadores-arbol.height/2-tractor.height;
		arbol.y=aleatorio(iniFranjaArbol,finFranjaArbol);
		arbol.body.immovable=true;
		arbol.animations.add('agitar',[1,0,1,0,1,0,1,0,1,0,1,0],10,false);
	}

	gameOver=juego.add.text(0,alto/2,'',{font: 'bold 50px Courier', fill: '#000'});
	gameOver.setTextBounds(0,0,ancho,alto);
	gameOver.boundsAlignH='center';

	timerHojas=juego.time.create(false);
	agitarArbolAleatorio();
	juego.time.events.repeat(Phaser.Timer.SECOND*5, 4, agitarArbolAleatorio, this);

	cursors=juego.input.keyboard.createCursorKeys();
}

function aleatorio(min,max) {
	return (Math.random()*(max-min+1)+min);
}

function agitarArbolAleatorio() {
	var i=Math.floor(aleatorio(0,ARBOLES-1));
	agitarArbol(arboles.children[i]);
}

function agitarArbol(arbol) {
	arbol.animations.play('agitar');
	timerHojas.repeat(Phaser.Timer.SECOND/4,4,function (){
		var hoja=hojas.create(arbol.x,arbol.y,'hoja');
		juego.physics.arcade.enable(hoja);
		hoja.anchor.setTo(0.5,0.5);
		hoja.body.velocity.y=aleatorio(-200,200);
		hoja.body.velocity.x=aleatorio(-200,200);
		hoja.body.bounce.y=0.7+Math.random()*0.2;
		hoja.body.bounce.x=0.7+Math.random()*0.2;
		hoja.body.collideWorldBounds=true;
		actualizarMarcador(++numHojas);
	},this);
	timerHojas.start();
}

function actualizarMarcador(numHojas) {
	hojasText.text=numHojas;
}

function update() {
	var golpeaArbol=juego.physics.arcade.collide(tractor,arboles,golpearArbol,null,this);
	juego.physics.arcade.overlap(tractor,hojas,recogeHoja,null,this);

	var tiempo=90-juego.time.totalElapsedSeconds()+1;
	var minutos=Math.floor(tiempo/60);
	var segundos=Math.floor(tiempo)%60;
	if (minutos+segundos<=0) {
		gameOver.text='TIME OUT!';
		tiempoText.text='00:00';
		setTimeout(reiniciar,4000);
	} else {
		tiempoText.text=(segundos<10)?'0'+minutos+':0'+Math.floor(segundos):'0'+minutos+':'+Math.floor(segundos);
		if (tiempo<10) tiempoText.fill="#A00";
	}

	if (cursors.down.isDown || cursors.up.isDown || cursors.left.isDown || cursors.right.isDown)
		teclado=true;

	if (teclado) {
		if (cursors.down.isDown)
			velocidadY=300;
		else if (cursors.up.isDown)
			velocidadY=-300;
		else
			velocidadY=0;
		if (cursors.right.isDown)
			velocidadX=300;
		else if (cursors.left.isDown)
			velocidadX=-300;
		else
			velocidadX=0;
	}
	tractor.body.velocity.x=velocidadX;
	tractor.body.velocity.y=velocidadY;
	for (var i=0; i<numHojas; i++)
		hojas.children[i].angle+=1;
	if (Math.abs(velocidadX)>200 || Math.abs(velocidadY)>200) {
		tractor.animations.play('barrer');
		var angulo=Math.acos(velocidadX/Math.sqrt(velocidadX*velocidadX+velocidadY*velocidadY)).toPrecision(2);
		tractor.rotation=(velocidadY>0)?angulo:-angulo;
	} else {
		tractor.animations.stop();
		tractor.frame=0;
	}
	separados=!golpeaArbol;
}

function golpearArbol(tractor,arbol) {
	if (separados) {
		agitarArbol(arbol);
		separados=false;
	}
}

function recogeHoja(tractor,hoja) {
	hoja.kill();
	actualizarMarcador(--numHojas);
	if (numHojas===0) {
		gameOver.text='GAME OVER';
		setTimeout(reiniciar,4000);
	}
}

function reiniciar() {
	document.location.reload();
}
