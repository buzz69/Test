var serverURL='';
var serverIP='';
var motionURL='';
var motionIP='';
var play='off';
var currentPage='';

navigator.splashscreen.show();

$( document ).bind( "deviceready", function() {
	$.mobile.allowCrossDomainPages = true;
	document.addEventListener("backbutton", backKeyDown, true);
	document.addEventListener("menubutton", doMenu, true);
});

$(document).on("pageshow", "#splash",function(event){
	setTimeout('$.mobile.changePage( "#home", { transition: "slideup"});',2000);
});

$(document).on("pageshow", "#home",function(event){
	currentPage='home';
	check_network();
});

$(document).on("pageshow", "#rasp_infos",function(event){
	currentPage='services';
	getInfos();
});

$(document).on("pageshow", "#services",function(event){
	currentPage='services';
	getStatus('all');
});

$(document).on("pageshow", "#cam_monitor",function(event){
	currentPage='setup';
	getStatus('motion');
	startMotionLive();
});

$(document).on("pageshow", "#setup_raspberry",function(event){
	currentPage='setup';
	getParams();
});

function backKeyDown() { 
    if(currentPage=='home'){
		exitFromApp();
	}else{
		$.mobile.changePage( "#home", { transition: "slide"});
	}
}

function doMenu(){
	alert('menu button');
	$("#leftpanel").panel( "toggle" );
}

function getParams(){
	error='';
	$('#publicIpInput').val('');
	$('#motionIpInput').val('');
	if (storageAvailable('localStorage')) {
		if(!localStorage.getItem('serverIP')) {
			error+='<p style="color:red">RaspBerry IP address not set !</p>';
		}else{
			serverIP=localStorage.getItem('serverIP');
			serverURL='http://'+serverIP+'/COMDROID/ajax.php';
			$('#publicIpInput').val(serverIP);
		}
		if(!localStorage.getItem('motionIP')) {
			error+='<p style="color:red">Motion IP address not set !</p>';
		}else{
			motionIP=localStorage.getItem('motionIP');
			motionURL='http://'+motionIP+'/?time=';
			$('#motionIpInput').val(motionIP);
		}
		if(error==''){
			$('#localStorageStatus').html('');
			checkConnect();
		}else{
			$('#localStorageStatus').html(error);
		}
	}else{
		$('#localStorageStatus').html('<p style="color:red">LocalStorage unavailable !</p>');
	}
}

function checkConnect(){
	$.ajax({
		type       : "GET",
		url        : serverURL,
		contentType: "application/json;charset=utf8",  
        dataType   : 'jsonp',  
        data       : {action: 'HELLO'},
		success    : function(response) {
			if(response.text=='HELLO'){
				$('#checkConnectStatus1').html('<p style="color:green">Connected to server</p>');
				$('#checkConnectStatus2').html('<p style="color:green">Connected to server</p>');
			}else{
				$('#checkConnectStatus1').html('<p style="color:red">Bad response from server</p>');
				$('#checkConnectStatus2').html('<p style="color:red">Bad response from server</p>');
			}
		},
		error      : function() {
		    $('#checkConnectStatus1').html('<p style="color:red">Connect to server failed</p>');
			$('#checkConnectStatus2').html('<p style="color:red">Connect to server failed</p>');			
		}
	});
}

function check_network() {
	var networkState = navigator.network.connection.type;

	var states = {};
	states[Connection.UNKNOWN]  = 'Unknow connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI]     = 'WiFi connection';
	states[Connection.CELL_2G]  = 'Cell 2G connection';
	states[Connection.CELL_3G]  = 'Cell 3G connection';
	states[Connection.CELL_4G]  = 'Cell 4G connection';
	states[Connection.NONE]     = 'NONE';
			
	if(states[networkState]=='NONE'){
		$("#networkStatus").html("<p>Internet connexion needed !</p><a href='#' data-role='button' onclick='check_network();return false;'>Reload</a>");
	}else{
		$("#networkStatus").html("You are connected over <font style='color:blue'>"+states[networkState]+"</font>");
		getParams();
	}
			
	//alert('Connection type:\n ' + states[networkState]);
}

function savePublicIp(){
	value=$('#publicIpInput').val();
	if(value==''){
		alert('Public IP error !');
		return false;
	}
	localStorage.setItem('serverIP',value);
	$.mobile.changePage( "#home", { transition: "slide"});
}

function saveMotionIp(){
	value=$('#motionIpInput').val();
	if(value==''){
		alert('Motion IP error !');
		return false;
	}
	localStorage.setItem('motionIP',value);
	$.mobile.changePage( "#home", { transition: "slide"});
}

function getInfos(){
	$.ajax({
		type       : "GET",
		url        : serverURL,
		contentType: "application/json;charset=utf8",  
        dataType   : 'jsonp',  
        data       : {action: 'SYSINFO'},
		success    : function(response) {
			$("#hostname").html(response.machine['hostname']);
			$("#os").html(response.machine['os']);
			ramVal=response.machine['ramval'];
			ramTotal=response.machine['ramtotal'];		
			$("#ram").html("<progress value='"+ramVal+"' max='"+ramTotal+"'></progress> "+ramVal+"/"+ramTotal+" Mo");
			hddVal=response.machine['hddval'];
			hddTotal=response.machine['hddtotal'];		
			$("#hdd").html("<progress value='"+hddVal+"' max='"+hddTotal+"'></progress> "+hddVal+"/"+hddTotal+" Go");
			$("#iploc").html(response.network['iploc']);
			$("#ippub").html(response.network['ippub']);
			$("#mac").html(response.network['mac']);
		},
		error      : function() {
		    //console.error("error");
		    alert('Unable to contact server !');    
		}
	});
}

function getStatus(service){
	$.ajax({
		type       : "GET",
		url        : serverURL,
		contentType: "application/json;charset=utf8",  
        dataType   : 'jsonp',  
        data       : {action: 'GET_STATUS'},
		success    : function(response) {
			fail2banState=response.fail2banstate;
			motionState=response.motionstate;
			//
			(fail2banState=='on')? fail2banState='<i style="color:green">running</i>' : fail2banState='<i style="color:red">stopped</i>';
			(motionState=='on')? motionState='<i style="color:green">running</i>' : motionState='<i style="color:red">stopped</i>';
			//
			if(service=='fail2ban'){
				if($('#fail2banStatus')){				
					$('#fail2banStatus').html('Fail2ban - '+fail2banState);
				}
			}
			if(service=='motion'){
				if($('#motionStatus')){	
					$('#motionStatus').html('Motion - '+motionState);
					$('#motionStatus2').html('Motion - '+motionState);
				}
			}
			if(service=='all'){
				if($('#fail2banStatus')){				
					$('#fail2banStatus').html('Fail2ban - '+fail2banState);
				}
				if($('#motionStatus')){	
					$('#motionStatus').html('Motion - '+motionState);
					$('#motionStatus2').html('Motion - '+motionState);
				}
			}
		},
		error      : function() {
		    //console.error("error");
		    alert('Unable to contact server !');    
		}
	});
}

function changeState(service,state,page){
	showLoader('Please wait...');	
	if(page=='surveillance'){
		$('#liveView').attr('src',"css/blank.png");
	}
	$.ajax({
		type       : "GET",
		url        : serverURL,
		contentType: "application/json;charset=utf8",  
        dataType   : 'jsonp',  
        data       : {action: 'SET_STATUS' , module: service, etat: state},		
		success    : function(response) {
			hideLoader();
			//alert(response.text);
			if(page=='services'){
				getStatus('all');
			}
			if(page=='surveillance'){
				getStatus('motion');
				setTimeout("startMotionLive();",1000);
			}
		},
		error      : function() {
		   	 //console.error("error");
		    	 hideLoader();
		   	 alert('Unable to contact server !');
		}
	});
}

function startMotionLive(){
	randomNum=Date.now();
	$('#liveView').attr('src',"css/blank.png");
	tmpUrl=motionURL+randomNum;
	tmpIMG=new Image();
	tmpIMG.src=tmpUrl;
	//console.log("load image: ("+motionURL+randomNum+")");
	tmpIMG.onload= function(){
		//console.log('image chargée');		
		$('#liveView').attr('src',tmpIMG.src);
		tmpIMG=null;
		$('#cameraStatus').html("");
	};
	tmpIMG.onerror=function(){
		//console.log("load error: ("+tmpIMG.src+")");
		$('#liveView').attr('src',"css/blank.png");
		$('#cameraStatus').html("<div style='color:red'>Unable to connect to camera</div>");
		setTimeout("startMotionLive()",3000);
	};
}

function power(mode){
	showLoader('Please wait...');	
	$.ajax({
		type       : "GET",
		url        : serverURL,
		contentType: "application/json;charset=utf8",  
        dataType   : 'jsonp',  
        data       : {action: 'POWER', mode: mode },		
		success    : function(response) {
			hideLoader();
		},
		error      : function() {
		    	 hideLoader();
		   	 alert('Unable to contact server !');
		}
	});
}

function exitFromApp(){
	if (navigator.app) {
	   navigator.app.exitApp();
	}
	else if (navigator.device) {
		navigator.device.exitApp();
	}
}

function showLoader(msg){
	loaderDiv='<div id="loaderDiv">';
	loaderDiv+='<table width=100%>';
	loaderDiv+='<tr><td valign=center align=center width=20><img src="css/loader.gif" width=20/></td>';
	loaderDiv+='<td valign=center align=left>'+msg+'</td></tr>';
	loaderDiv+='</table>';
	loaderDiv+='</div>';
	$('body').append(loaderDiv);
	$( '#loaderDiv' ).center();
}
function hideLoader(){
	$( '#loaderDiv' ).hide().remove();
}

function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

jQuery.fn.center = function () {
	this.css("position", "fixed");
	this.css("top", ($(window).height() - this.height()) / 2 + "px");
	this.css("left", ($(window).width() - this.width()) / 2 + "px");
	return this
}
