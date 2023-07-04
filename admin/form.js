/*
	FORM QUICK AJAX 
	Copyright: DOSVN.COM
	Author: ducminh_ajax
*/

function show_load(){
	$("#loading").remove();
	$("<div id='loading'>Ðang tải dữ liệu...</div>")
		.css({
			'border-radius':'5px',
			opacity:'0.8',
			background:'#FEF693',
			padding:'10px 20px',
			position:'absolute',
			top:'20px',
			left: ($('body').width()/2-80)+"px",
			color:'#A07E19',
			'font-size':'15px',
			'font-weight': 'bold'
		})
		.appendTo("body");
}

function hide_load(){
	$("#loading").remove();
}

function show_error(){
	$("#loading")
		.htm("Có lỗi xảy ra, không thể tải dữ liệu.")
		.animate("color:#ff0000;background:#F1CDB7;speed:500");
}

function callback(){
	date_picker_init();
	hightlight_row();
	initAjax();
}

function getText(obj){
	var a = ["innerText","text","textContent"];
	for( var i = 0 ; i < a.length; i++ ){
		if( ( a[i] in obj ) && ( typeof obj[a[i]] == "string")){
			return obj[a[i]];
		} 
	}
	return "";
}

function initAjax(){
	//QUICK EDIT 
	$("a.quick_ord").onClick(function(){
		var url = $(this).getAttr('u');
		var ord = getText(this);
		var old_element = this;
		
		var input = $("<input type='text' size='1' value="+ord+" class='input_quick_edit'/>").k(0);

		$(input)
			.replaceTo(this)
			.onBlur(function( e ){
				if( this.value == ord ){
					$(input).replace(old_element);
					return false;
				}
				if( window.AJAX_LOAD ){
					window.AJAX_LOAD.abort();
				}
				show_load();				
				window.AJAX_LOAD = $.Ajax( url,{
					type: 'POST',
					data: 'ajax=1&ord='+input.value,
					cache: false,					
					success: function(){
						hide_load();
						$("#content").htm(this.responseText)
						callback();
					},
					error: function(){
						show_error();
						$(input).replace(old_element);
					}
				})
			})
			.k(0)
			.focus()
	});
	
	
	//QUICK EDIT TITLE
	$("a.quick_edit_title").onClick(function(){
		var url = $(this).getAttr('u');
		var title = getText(this);
		var old_element = this;
		
		var input = $("<input type='text' size='45' value='" + title.replace(/'/gi,"\\'") + "' class='input_quick_edit'/>").k(0);

		$(input)
			.replaceTo(this)
			.onBlur(function( e ){
				if( this.value == title ){
					$(input).replace(old_element);
					return false;
				}

				if( window.AJAX_LOAD ){
					window.AJAX_LOAD.abort();
				}
				show_load();
				window.AJAX_LOAD = $.Ajax( url,{
					type: 'POST',
					data: 'ajax=1&title='+input.value,
					cache: false,
					success: function(){
						hide_load();
						$("#content").htm(this.responseText)
						callback();
					},
					error: function(){
						show_error();
						$(input).replace(old_element);
					}
				})
			})
			.k(0)
			.focus()
	});	
	
		
	//QUICK DELETE
	$("a.down,a.up,a.edit,a.add,a.view,a.page_item,a.ajax,label.ajax a")
		.onClick(function(e){
			if( window.AJAX_LOAD ){
				window.AJAX_LOAD.abort();
			}
			show_load();
			window.AJAX_LOAD = $.Ajax( this.href +(this.href.indexOf('?') > -1 ? "&ajax=1" : "?ajax=1"),{
				cache: false,
				success: function(){
					$('#content').htm(this.responseText);
					hide_load();
					callback();
				},
				error: function(){
					show_error();					
				}		
			})
			return false;
		});
	
	$("a.delete,input.deleteall")
		.onClick(function(e){
			var q=confirm('Bạn có muốn xóa không ?');
			if(!q){
				return false;
			}
			if( window.AJAX_LOAD ){
				window.AJAX_LOAD.abort();
			}
			show_load();
			window.AJAX_LOAD = $.Ajax( this.href +(this.href.indexOf('?') > -1 ? "&ajax=1" : "?ajax=1"),{
				cache: false,
				success: function(){
					$('#content').htm(this.responseText);
					hide_load();
					callback();
				},
				error: function(){
					show_error();					
				}		
			})
			return false;
		});
	//ajax for form
	$("form.formajax")
		.onSubmit(function( event ){
			event.preventDefault();
			$("input[type=submit]").set('disabled', true );	
			if( window.AJAX_LOAD ){
				window.AJAX_LOAD.abort();
			}
			show_load();
			data = $.queryForm( this );
			data.ajax = 1;
			window.AJAX_LOAD =$.Ajax( this.action ,{
				data:data,
				type: this.method||'get',
				cache: false,
				success: function(){
					$("input[type=submit]").set('disabled', false );	
					$('#content').htm(this.responseText);
					hide_load();
					callback();
				},
				error: function(){
					show_error();	
					$("input[type=submit]").set('disabled', false );	
				}
			});	
		});
}

//AJAX menu
$("#submenu a").onClick(function(){
		if( window.AJAX_LOAD ){
			window.AJAX_LOAD.abort();
		}
		show_load();		
		window.AJAX_LOAD = $.Ajax( this.href + (this.href.indexOf('?') > -1 ? "&ajax=1" : "?ajax=1"),{
		cache:false,
		success: function(){
			$("#content").htm(this.responseText)
			hide_load();
			callback();
		},
		error:function(){
			show_error();
		}});
	return false;
})

initAjax();