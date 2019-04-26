var HID = require('node-hid');
var device;
var cmdDelay = 30; // Min time between 2 cmd in ms


// Auto reconnect
var ready = false;
var co = false;
setInterval(function(){
	if(co && !ready){	
		connect('YOUR-ROBOT-VID', 'YOUR-ROBOT-HID');
	}
}, 10000);


// Init HID
function connect(tvid, thid, cbco, cbdata, cberr){
	vid = tvid;
    hid = thid;
	co = true;
	
	try{
		device = new HID.HID(vid, hid);
		
		device.on("data", function(data) {
			if(cbdata){
				cbdata(data);
			}
		});

		device.on("error", function(err) {
			if(cberr){
				cberr(err);
			}			
			ready = false;
		});
		
		ready = true;		
		setTimeout(function(){
			if(cbco){
				cbco();
			}
		}, 500);
		
	}catch(err){
		if(cberr){
			cberr(err);
		}		
		ready = false;
	}
}


// Integer to hexa	
function hex8(val) {
	val &= 0xFF;
	return val;
}


// Send cmd (header + data) to hid device
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

	try{
		device.write(tmp);	
	}catch(err){
		ready = false;
		mod.err(err);
	}
}


// Free a motor
function freeMotor(nb){
	var head = [0XFA, 0XAF];
				// NB	 W/R 
	var tab = [hex8(nb), 0X2, 0X00, 0X00, 0X00, 0X00];
	sendCmd(head, tab);
}


// Set the angle of a motor
function setAngle(nb, val){
	var head = [0XFA, 0XAF];
				// NB	   W/R	 angle
	var tab = [hex8(nb+1), 0X1, hex8(val), 0X00, 0X00, 0X00];
	sendCmd(head, tab);
}


// Set all motor free
var free_id;
function freeAll_(){
	setTimeout(function(){
		freeMotor(free_id);
		if(free_id<16){
			free_id++;
			freeAll_();
		}
		
	}, cmdDelay);
}

function freeAll(){
	free_id = 1;
	freeAll_()
}


// Set position of all motor from tab in parameter
var move_id;
var angles_array;
function move_(){
	setTimeout(function(){
		if(angles_array[move_id] == -1){
			while(angles_array[move_id] == -1 && move_id < 16){
				move_id++;
			}
		}
		setAngle(move_id, angles_array[move_id]);
		if(move_id<16){
			move_id++;
			move_();
		}
		
	}, cmdDelay);
}

function move(tab){
	if(!tab.length && tab.length != 16){
		return;
	}
	angles_array = tab;
	move_id = 0;
	move_();
}


// Disconnect devices
function disconnect(){
	device.close();
}

module.exports.connect = connect;
module.exports.freeMotor = freeMotor;
module.exports.setAngle = setAngle;
module.exports.freeAll = freeAll;
module.exports.move = move;
module.exports.disconnect = disconnect;
