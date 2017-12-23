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

setInterval(function(){
	if(co && !ready){	
		connect(vid, hid, cbco, cbdata, cberr);
	}
}, 10000);


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
	try{
		device.write(tmp);	
	}catch(err){
		ready = false;
		mod.err(err);
	}
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
		if(t[mmmm] == -1){
			while(t[mmmm] == -1 && mmmm < 16){
				mmmm++;
			}
		}
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
	mmmm = 0;
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
