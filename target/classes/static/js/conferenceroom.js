/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var ws = new WebSocket('wss://' + location.host + '/groupcall');
var participants = {};
var name;
var room;
var joinUser;
var joinRoom;
var listOnline;
var listRoom;
var hostOfRoom;
window.onbeforeunload = function() {
	ws.close();
};

ws.onmessage = function(message) {
	var parsedMessage = JSON.parse(message.data);
	console.info('Received message: ' + message.data);

	switch (parsedMessage.id) {
	case 'existingParticipants':
	    console.log("existingParticipants");
		onExistingParticipants(parsedMessage);
		break;
	case 'newParticipantArrived':
	    console.log("newParticipantArrived");
		onNewParticipant(parsedMessage);
		break;
	case 'participantLeft':
	    console.log("participantLeft");
		onParticipantLeft(parsedMessage);
		break;
	case 'receiveVideoAnswer':
	    console.log("receiveVideoAnswer");
		receiveVideoResponse(parsedMessage);
		break;
	case 'iceCandidate':
	    console.log("iceCandidate");
		participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function (error) {
	        if (error) {
		      console.error("Error adding candidate: " + error);
		      return;
	        }
	    });
	    break;
	case 'leave':
	    if(parsedMessage.typeuser === "1"){
    	    console.log("You had out of room");
    	    for(var propName in participants) {
                 if(propName != name){
                     participants[propName].removeOut();
                 }
            }
	    }
	    if(parsedMessage.typeuser === "0"){
	        console.log("Duoi thanh cong");
	    }
	    if(parsedMessage.typeuser === "2"){
	        console.log("Ban bi duoi khoi phong");
            console.log(participants);
//            participants["chiennv2"].dispose();
            for(var propName in participants) {
                if(propName != name){
                    participants[propName].removeOut();
                }
            }
	    }
//        participants[parsedMessage.user].
//        participants[parsedMessage.user].dispose();

//        document.getElementById('join').style.display = 'block';
//        document.getElementById('room').style.display = 'none';
//        ws.close();
	    break;
	case 'permisson':
	    console.log("you haven't permisson");
	    break;
	case 'soundtoggle':
	    if(parsedMessage.type == "disable"){
	        participants[parsedMessage.user].setSound(false);
	        participants[parsedMessage.user].soundToggleEnable();
	    }
	    if(parsedMessage.type == "enable"){
	        participants[parsedMessage.user].setSound(true);
            participants[parsedMessage.user].soundToggleDisable();
	    }
	    break;
	case 'disableSound':
	    if(parsedMessage.type==0){
	        console.log("ban da tat tieng");
	    }
	    if(parsedMessage.type==1){
	        console.log("ban bi tat tieng");
	    }
	    break;
    case 'enableSound':
        if(parsedMessage.type==0){
   	        console.log("ban da bat tieng");
  	    }
        if(parsedMessage.type==1){
            console.log("ban duoc bat tieng");
        }
	    break;
	case 'requestJoin':
	    console.log(parsedMessage.user + "yeu cau join");
	    joinUser = parsedMessage.user;
        joinRoom = parsedMessage.room;
        var userJoin = joinUser;
	    var parent = document.getElementById('msg');
	    var newChild = '<div name="'+joinUser+'" class="card w-10 well"><div class="card-block"><h3 class="card-title">'+joinUser+' want talk with you</h3><div class="OkCe"><input type="button" class="btn btn-info" onmouseup="acceptJoin(\'' + userJoin + '\');" value="OK"><input type="button" class="btn btn-warning" onmouseup="cancel(\'' + userJoin + '\');" value="Cancel"></div></div></div>';
        parent.insertAdjacentHTML('beforeend', newChild);
	    break;
	case 'getListOnline':
        listOnline = parsedMessage.listOnline;
        console.log("list online");
        console.log(listOnline);
	    break;
	case 'getListRoom':
         listRoom = parsedMessage.listRoom;
         console.log("list room");
         console.log(listRoom);
    	 break;
    case 'getHostOfRoom':
        hostOfRoom = parsedMessage.hostOfRoom;
        console.log("host of room");
        console.log(hostOfRoom);
        break;
	default:
	    console.log("default");
		console.error('Unrecognized message', parsedMessage);
	}
}
function login(){
    name = document.getElementById('name').value;
    document.getElementById('index').style.display = 'none';
    document.getElementById('join').style.display = 'none';
    document.getElementById('call').style.display = 'none';
    document.getElementById('home').style.display = 'block';
    var message = {
        id: 'login',
        name: name,
    }
    sendMessage(message);
    getListOnline();
    getListRoom();
}
function register() {
//	name = document.getElementById('name').value;
	room = document.getElementById('roomName').value;

	document.getElementById('room-header').innerText = 'ROOM ' + room;
	document.getElementById('home').style.display = 'none';
	document.getElementById('index').style.display = 'none';
	document.getElementById('join').style.display = 'none';
	document.getElementById('call').style.display = 'block';


	var message = {
		id : 'joinRoom',
		name : name,
		room : room,
	}
	sendMessage(message);
//	getHostOfRoom();
}

function home() {
    document.getElementById('call').style.display = 'none';
    document.getElementById('login').style.display = 'none';
    document.getElementById('join').style.display = 'none';
    document.getElementById('home').style.display = 'block';
}

function call() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('index').style.display = 'none';
    document.getElementById('call').style.display = 'none';
    document.getElementById('join').style.display = 'block';

}

function wall() {
    alert("Chuc nang dang phat trien !!!");
}

function Logout() {

}

function loginAlert() {
    alert("Please, login!");
}

function onNewParticipant(request) {
	receiveVideo(request.name);
}

function receiveVideoResponse(result) {
	participants[result.name].rtcPeer.processAnswer (result.sdpAnswer, function (error) {
		if (error) return console.error (error);
	});
}

function callResponse(message) {
	if (message.response != 'accepted') {
		console.info('Call not accepted by peer. Closing call');
		stop();
	} else {
		webRtcPeer.processAnswer(message.sdpAnswer, function (error) {
			if (error) return console.error (error);
		});
	}
}

function onExistingParticipants(msg) {
	var constraints = {
		audio : true,
		video : {
			mandatory : {
				maxWidth : 320,
				maxFrameRate : 15,
				minFrameRate : 15
			}
		}
	};
	console.log(name + " registered in room " + room);
	var participant = new Participant(name);
	participants[name] = participant;
	var video = participant.getVideoElement();

	var options = {
	      localVideo: video,
	      mediaConstraints: constraints,
	      onicecandidate: participant.onIceCandidate.bind(participant)
	    }
	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
		function (error) {
		  if(error) {
			  return console.error(error);
		  }
		  this.generateOffer (participant.offerToReceiveVideo.bind(participant));
	});

	msg.data.forEach(receiveVideo);
}

function leaveRoom() {
    x = document.getElementsByClassName('participant main');
    c = x[0].id;
    console.log(c);
	sendMessage({
		id : 'leaveRoom',
		leaver: c,
	    requester: name
	});

//	for ( var key in participants) {
//		participants[key].dispose();
//	}
//
//	document.getElementById('join').style.display = 'block';
//	document.getElementById('room').style.display = 'none';

//	ws.close();
}
function disableSound(){
//
    x = document.getElementsByClassName('participant main');
    c = x[0].id;
    sound = participants[c].getSound();
    if(sound == true){
//        document.getElementById('button-sound').value = "Enable Sound";
//        participants[c].setSound(false);
        sendMessage({
            id : 'disableSound',
           	disabler: c,
           	requester: name
        });
        console.log("gui request");
    }
    if(sound == false){
//        document.getElementById('button-sound').value = "Disable Sound";
//        participants[c].setSound(true);
        sendMessage({
            id : 'enableSound',
           	disabler: c,
           	requester: name
        });
        console.log("gui request");
    }
//    console.log(c);


}
//function disableVideo(){
////    console.log("day la log ......");
////    console.log(name);
//    x = document.getElementsByClassName('participant main');
//    c = x[0].id;
//    console.log(c);
//    sendMessage({
//    	id : 'disableVideo',
//    	disabler: c
//    });
//}

function acceptJoin(userJoin){

    sendMessage({
       	id : 'acceptJoin',
    	userAccept: userJoin,
    	roomAccept: joinRoom
    });
    console.log("da gui mess");
    document.getElementsByName(userJoin)[0].style.display='none';
}

function receiveVideo(sender) {
	var participant = new Participant(sender);
	participants[sender] = participant;
	var video = participant.getVideoElement();

	var options = {
      remoteVideo: video,
      onicecandidate: participant.onIceCandidate.bind(participant)
    }

	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
			function (error) {
			  if(error) {
				  return console.error(error);
			  }
			  this.generateOffer (participant.offerToReceiveVideo.bind(participant));
	});;
}

function onParticipantLeft(request) {
	console.log('Participant ' + request.name + ' left');
	var participant = participants[request.name];
	participant.dispose();
	delete participants[request.name];
}

function sendMessage(message) {
	var jsonMessage = JSON.stringify(message);
	console.log('Senging message: ' + jsonMessage);
	ws.send(jsonMessage);
}
function nameButton(){
    return "chiennv";
}
function getListOnline(){
    sendMessage({
           	id : 'getListOnline'
    });
}

function cancel(){
    document.getElementsByName(userJoin)[0].style.display = 'none';
    console.log(userJoin);
}

function getListRoom(){
    sendMessage({
       	id : 'getListRoom'
    });
}
function getHostOfRoom(){
    sendMessage({
       	id : 'getHostOfRoom'
    });
}
