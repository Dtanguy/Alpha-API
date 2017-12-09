var HID = require('node-hid');
var device;
var cmdDelay = 30;


//Init HID
function connect(vid, hid, cbdata, cberr){
	try{
		device = new HID.HID(vid, hid);
		
		device.on("data", function(data) {
			cbdata(data);
		});

		device.on("error", function(err) {
			cberr(err);
		});
	}catch(e){
		console.log(e);
	}
}


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
	device.write(tmp);	
}


//Set the angle of a motor
function setAngle(nb, val){
	var head = [0XFA, 0XAF];
		       //NB	    W//R  angle
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