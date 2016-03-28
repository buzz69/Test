$( document ).bind( "deviceready", function() {
	
});

$(document).on("pageshow", "#home",function(event){
	check_network();
});

$(document).on("pageshow", "#rasp_infos",function(event){
	getInfos();
});

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
		$("#networkStatus").html("You are connected with "+states[networkState]);
	}
			
	//alert('Connection type:\n ' + states[networkState]);
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
			$("#ram").html("<progress value='"+ramVal+"' max='"+ramTotal+"'></progress> "+ramVal+" Mo utilisés sur "+ramTotal+" Mo");
			hddVal=response.machine['hddval'];
			hddTotal=response.machine['hddtotal'];		
			$("#hdd").html("<progress value='"+hddVal+"' max='"+hddTotal+"'></progress> "+hddVal+" Go utilisés sur "+hddTotal+" Go");
			$("#iploc").html(response.network['iploc']);
			$("#ippub").html(response.network['ippub']);
			$("#mac").html(response.network['mac']);
		},
		error      : function() {
		    //console.error("error");
		    alert('Impossible de contacter le serveur !');    
		}
	});
}