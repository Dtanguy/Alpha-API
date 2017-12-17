var HID = require('node-hid');
var device;
var cmdDelay = 30;

var ready = false;
var co = false;
var vid;
var hid;
var cbdata; 
var cberr;
var cbco;

setTimeout(function(){
	if(co && !ready){	
		connect(vid, hid, cbco, cbdata, cberr);
	}
}, 30000);


//Init HID
function connect(tvid, thid, tcbco, tcbdata, tcberr){
	vid = tvid;
    hid = thid;
	cbdata = tcbdata; 
	cberr = tcberr;
	cbco = tcbco;
	co = true;
	
	try{
		device = new HID.HID(vid, hid);
		
		device.on("data", function(data) {
			cbdata(data);
		});

		device.on("error", function(err) {
			cberr(err);
			ready = false;
		});
		
		ready = true;		
		setTimeout(cbco, 500);
		
	}catch(e){
		cberr(e);
		ready = false;
	}
}


//Integer to hexa	
function hex8(val) {
	val &= 0xFF;
	return val;
}


//Send cmd (header + data) to hid device
function sendCmd(h, d){
	if(!ready){
		return;
	}
	
	var tmp = [];
	for (var i = 0; i < h.length; i++) {
		tmp.push(h[i]);
	}
	for (var i = 0; i < d.length; i++) {
		tmp.push(d[i]);
	}
	var sum = 0;
	for (var i = 0; i < d.length; i++) {
		sum += d[i];
	}
	while(sum>255){
		sum-=255;
	}
	tmp.push(sum);
	
	tmp.push(0XED);
	//console.log("Writing..");
	device.write(tmp);	
}


//Set the angle of a motor
function setAngle(nb, val){
	var head = [0XFA, 0XAF];
		  //NB	W/R	 //angle
	var tab = [hex8(nb+1), 0X1, hex8(val), 0X00, 0X00, 0X00];
	sendCmd(head, tab);
}


//Free a motor
function freeMotor(nb){
	var head = [0XFA, 0XAF];
	  //NB	W/R	 //angle
	var tab = [hex8(nb), 0X2, 0X00, 0X00, 0X00, 0X00];
	sendCmd(head, tab);
}


//Set all motor free
var nnnn;
function freeAll_(){
	setTimeout(function(){
		freeMotor(nnnn);
		if(nnnn<16){
			nnnn++;
			freeAll_();
		}
		
	}, cmdDelay);
}

function freeAll(){
	nnnn = 1;
	freeAll_()
}


//Set position of all motor from tab in parameter
var mmmm;
var t;
function move_(){
	setTimeout(function(){
		setAngle(mmmm, t[mmmm]);
		if(mmmm<16){
			mmmm++;
			move_();
		}
		
	}, cmdDelay);
}

function move(tab){
	if(!tab.length && tab.length != 16){
		return;
	}
	t = tab;
	mmmm = 1;
	move_();
}

function disconnect(){
	device.close();
}


module.exports.connect = connect;
module.exports.freeMotor = freeMotor;
module.exports.setAngle = setAngle;
module.exports.freeAll = freeAll;
module.exports.move = move;
module.exports.disconnect = disconnect;














// OLD

/*



function freeAll(){
	var t = [];
	for (var i = 0; i < 16; i++) {
		t.push(setTimeout( freeMotor, 1000*i, i+1));
	}
}



function move(tab){
	if(!tab.length && tab.length != 16){
		return;
	}	
	for (var i = 0; i < 16; i++) {
		setTimeout(function(){
			setAngle(i+1, tab[i]);
		}, 30*i);
	}	
}
*/












/*


	var HID = require('node-hid');

	console.log("Open HID port..");
	var device = new HID.HID(1155, 22352);
	console.log("Connected");

	device.on("data", function(data) {
		//console.log("data : " + data);
		console.log('OK');
	});

	device.on("error", function(err) {
		console.log("err : " + err);
	});



	//Integer to hexa	
	function hex8(val) {
		val &= 0xFF;
		return val;
	}


	//Send cmd (header + data) to hid device
	function sendCmd(h, d){
		var tmp = [];
		for (var i = 0; i < h.length; i++) {
			tmp.push(h[i]);
		}
		for (var i = 0; i < d.length; i++) {
			tmp.push(d[i]);
		}
		var sum = 0;
		for (var i = 0; i < d.length; i++) {
			sum += d[i];
		}
		while(sum>255){
			sum-=255;
		}
		tmp.push(sum);
		
		tmp.push(0XED);
		console.log("Writing..");
		device.write(tmp);	
	}


	//Set the angle of a motor
	function setAngle(nb, val){
		var head = [0XFA, 0XAF];
			  //NB	W/R	 //angle
		var tab = [hex8(nb), 0X1, hex8(val), 0X00, 0X00, 0X00];
		sendCmd(head, tab);
	}


	//Free a motor
	function freeMotor(nb){
		var head = [0XFA, 0XAF];
			  //NB	W/R	 //angle
		var tab = [hex8(nb), 0X2, 0X00, 0X00, 0X00, 0X00];
		sendCmd(head, tab);
	}


	//Set all motor free
	function freeAll(){	
		for (var i = 0; i < 16; i++) {
			setTimeout(function(){
				freeMotor(i+1);
			}, 30*i);
		}	
	}


	//Set position of all motor from tab in parameter
	function move(tab){
		if(!tab.length && tab.length != 16){
			return;
		}	
		for (var i = 0; i < 16; i++) {
			setTimeout(function(){
				setAngle(i+1, tab[i]);
			}, 30*i);
		}	
	}



*/



//freeAll();

/*
var nb = 1;
var interval = setInterval(function() {
  setAngle(nb, 150);
  nb++;
}, 1000);
*/


/*
var nnnn;
function freeAll_(){
	setTimeout(function(){
		freeMotor(nnnn);
		if(nnnn<16){
			nnnn++;
			freeAll_();
		}
		
	}, 30);
}

function freeAll(){
	nnnn = 1;
	freeAll_()
}
*/


/*
var devices = HID.devices();
console.log(devices)

var path = -1;
for (var i = 0; i < devices.length; i++) {
	if (devices[i].product && devices[i].product.indexOf('Alpha1') != -1){
		path = devices[i].path;
	}
}

if(path == -1){
	console.log("Alpha not found");
	return;
}
//device.write([0XFA, 0XAF, 0X03, 0X01, 0X02, 0X0A, 0X00, 0X0A, 0X1A, 0XED]);
*/

/*
device.read(function(err, data){
	console.log(data);
});*/
//console.log(device.readSync());

