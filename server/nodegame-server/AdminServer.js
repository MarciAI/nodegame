module.exports = AdminServer;

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var ServerLog = require('./ServerLog');
var GameServer = require('./GameServer');
var GameMsgManager = require('./GameMsgManager');


var Utils = require('nodegame-client').Utils;
var GameState = require('nodegame-client').GameState;
var GameMsg = require('nodegame-client').GameMsg;

var PlayerList = require('nodegame-client').PlayerList;
var Player = require('nodegame-client').Player;

AdminServer.prototype.__proto__ = GameServer.prototype;
AdminServer.prototype.constructor = AdminServer;

function AdminServer(options) {
	GameServer.call(this,options);	
}

// AdminServer hides the id of the sender when forwarding msgs
// AdminServer transform all SET messages in SAY messages when forwarding them

AdminServer.prototype.attachCustomListeners = function() {	
	var that = this;
	var log = this.log;
	var say = GameMsg.actions.SAY + '.';
	var set = GameMsg.actions.SET + '.';
	var get = GameMsg.actions.GET + '.'; 
	
	this.on(say+'HI', function(msg) {
		// Add the player to to the list
		log.log('------------------------INPLAYER');
		log.log(msg.data);
		that.pl.add(msg.data);
		// Tell everybody a new player is connected;
		var connected = new Player(msg.data) + ' connected.';
		this.gmm.sendTXT(connected,'ALL');
		
		// Send the list of connected players
		that.gmm.sendPLIST(that.partner, msg.from);
	});

	this.on(say+'TXT', function(msg) {
		if (that.isValidRecipient(msg.to)) {
			that.gmm.forwardTXT (msg.text, msg.to);
			that.gmm.sendTXT(msg.from + ' sent MSG to ' + msg.to, 'ALL');
		}
	});

	this.on(say+'DATA', function(msg) { 
		if (that.isValidRecipient(msg.to)) {
			that.gmm.forwardDATA (GameMsg.actions.SAY, msg.data, msg.to, msg.text);
			that.gmm.sendTXT(msg.from + ' sent DATA to ' + msg.to, 'ALL');
		}
	});

	this.on(say+'STATE', function(msg){
		if (!that.checkSync) {
			that.gmm.sendTXT('**Not possible to change state: some players are not ready**', msg.from);
		}
		else {
			
			//that.log.log('----------------onSTATE.ADMIN: ' + util.inspect(msg));
			// Send it to players and other monitors
			that.gmm.forwardSTATE (GameMsg.actions.SAY,msg.data, msg.to);
			that.gmm.broadcast(msg, msg.from);
			//that.gmm.sendSTATE (GameMsg.actions.SAY,msg.data, msg.to);
		}
	});
	
	this.on(get+'DATA', function (msg) {
		console.log('HERE A!!!');
		
		// Ask a random player to send the game;
		var p = this.pl.getRandom();

		var game = {game: 'ohyes'};

		if (msg.text === 'LOOP') {
		
//			var func = function(){
//				node.emit('out.say.DATA')
//			}
			
			
			
			that.gmm.sendDATA(GameMsg.actions.GET, 'GAME', msg.from, msg.txt);
			
			that.gmm.sendDATA(GameMsg.actions.SAY, game, msg.from, msg.text);
		}		
	});
	
	// SET
	
	// Transform in say
	this.on(set+'STATE', function(msg){
		//this.emit(say+'STATE', msg);
	});
	
	
};