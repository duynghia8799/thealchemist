function checkAll( obj ){
	var check = !!obj.checked;
	$("input[type='checkbox']").each(function(){
		this.checked = check;
	})
}
$("#submenu li.maintab").each(function(){
	var ia = this.getElementsByTagName('a');
	if( ia.length == 0 ) return true;
	var link = ia[0].href;
	if( location.href.split("/").slice(0,6).join("/") == link ){
		$(this).addClass("tab_active");
		return false;
	}	
});
$("#submenu li.maintab")
	.each(function(){
		this.objUL = $(this).find("ul").k(0); 
	})
	.onMouseenter(function(){
		$("#submenu li.maintab")
			.each(function(){
				$( this.objUL ).hide("speed:300-height");
			});	
		//$(this.objUL).show("speed:200-height");	
		$(this.objUL).show("speed:300-height");
	})
	.onMouseleave(function(){
		$(this.objUL).hide("speed:300-height");
	})
	.onClick(function(){
		$("#submenu li.maintab").removeClass("tab_active");
		$(this).addClass("tab_active");
	});	

function hightlight_row(){	
	$("#content table[cellpadding='8'][width='100%']")
		.setAttr("bordercolor","#8c8c8c")
		.find("tr")
		.each(function( i ){
			if( i % 2 == 0 ){
				$(this).css("background:#eee");
			}
		});
}

hightlight_row();		

$('#cptime')
	.css('text-align:right;padding:10px 5px 10px 0px;color:#bbb')
	.htm(function(){
		var obj = this, fc =arguments.callee;
		setTimeout( function(){ $( obj ).htm(fc) },1000)
		var time = new Date();
		return (time+'').replace(/\(.*?\)/gi,'');
	})