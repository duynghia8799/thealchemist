(function( ){
	var $ = window.Owl;
	var hour_opt = "";
	var minute_opt = "";
	var second_opt = "";
	var day_opt = "";
	var month_opt = "";
	var year_opt = "";
	var time = new Date();
	var month_name = ["Một","Hai","Ba","Tư","Năm","Sáu","Bảy","Tám","Chín","Mười","Mười Một","Mười Hai"];
	function round(i){
		i = parseInt(i);
		return i < 10 ? '0'+i : i;
	}
	
	//create string options
	//hour
	for( var i = 1;i < 25;i++ ){
		
		hour_opt +="<option value='"+round(i)+"'>"+round(i)+"</option>";
	}
	hour_opt = "<select j='h'>"+hour_opt+"</select>";
	//minute
	for( var i = 0;i < 60;i++ ){
		minute_opt +="<option value='"+round(i)+"'>"+round(i)+"</option>";
	}
	minute_opt = "<select j='m'>"+minute_opt+"</select>";
	
	//second	
	for( var i = 0;i < 60;i++ ){
		second_opt +="<option value='"+round(i)+"'>"+round(i)+"</option>";
	}
	second_opt = "<select j='s'>"+second_opt+"</select>";

	//day	
	for( var i = 1;i < 32;i++ ){
		day_opt +="<option value='"+round(i)+"'>"+round(i)+"</option>";
	}
	day_opt = "<select j='d'>"+day_opt+"</select>";

	//month
	for( var i = 1;i < 13;i++ ){
		month_opt +="<option value='"+round(i)+"'>"+month_name[i-1]+"</option>";
	}
	month_opt = "<select j='M'>"+month_opt+"</select>";
	
	var current_year = time.getFullYear();
	
	//second	
	for( var i = current_year - 15; i < current_year + 15 ;i++ ){
		year_opt +="<option value='"+round(i)+"'>"+round(i)+"</option>";
	}
	year_opt = "<select j='y'>"+year_opt+"</select>";
	
	var tb_date = "<table cellspacing='1' cellpadding='1' border='1' bordercolor='#cccccc' style='border-collapse:collapse'>"
			+"<tr>"
				+"<th align='center'>Ngày</th><th align='center'>Tháng</th><th align='center'>Năm</th>"
				+"<th align='center'>Giờ</th><th align='center'>Phút</th><th align='center'>Giây</th>"
			+"</tr><tr>"
				+"<td>"+day_opt+"</td><td>"+month_opt+"</td><td>"+year_opt+"</td>"
				+"<td>"+hour_opt+"</td><td>"+minute_opt+"</td><td>"+second_opt+"</td>"
			+"</tr>"
			+"</table>";
	
	$("input.date_picker").each(function(){
		var date_tb = $(tb_date).k(0);
		
		$(this)
			.css("display:none")
			.after("<br/>")	
			.after( date_tb )
			.after("<br/>")			
			.onFocus( function(){
				$(date_tb).show();			
			})
		var OBJ = this;
		var hour_sl 	= $(date_tb).find("select[j=h]").k(0);
		var second_sl = $(date_tb).find("select[j=s]").k(0);
		var minute_sl = $(date_tb).find("select[j=m]").k(0);
		var day_sl 		= $(date_tb).find("select[j=d]").k(0);
		var month_sl 	= $(date_tb).find("select[j=M]").k(0);
		var year_sl 	= $(date_tb).find("select[j=y]").k(0);
		
		$(hour_sl,minute_sl,second_sl,day_sl,month_sl,year_sl)
			.onChange(function( event ){
				//test date is accept
				var day 	= day_sl.value;					
				var month = month_sl.value;
				var year 	= year_sl.value;
				if( month == 2 && (year%4!=0) && (day > 28) ){
					alert("Ngày không hợp lệ , tháng 2 của năm "+ year +" chỉ có 28 ngày.");
					day_sl.value =28
					return false;
				}
				if( month == 2 && day > 29 ){
					alert("Ngày không hợp lệ, tháng 2 chỉ có 30 ngày.");
					day_sl.value =29;
					return false;
				}
				
				if( ",4,6,8,10,12,".match(","+ (parseInt(month)+0)+",") && (day == 31) ){
					alert("Ngày không hợp lệ, tháng " + month + " chỉ có 30 ngày.");
					day_sl.value = 30
					return false
				}
			
				OBJ.value = round(year)+"/"+ round(month) + "/" + round(day)
					+" " + round(hour_sl.value) + ":" + round(minute_sl.value) + ":" + round(second_sl.value)
			})
		
		if( this.value.match(/^(\d+)\/(\d+)\/(\d+)\s(\d+):(\d+):(\d+)$/i)){
			hour_sl.value 	= RegExp.$4;
			minute_sl.value = RegExp.$5;
			second_sl.value = RegExp.$6;
			day_sl.value	 	= RegExp.$3;
			month_sl.value 	= RegExp.$2;
			year_sl.value 	= RegExp.$1;
		}
		
	});
	window.date_picker_init = arguments.callee;
})();