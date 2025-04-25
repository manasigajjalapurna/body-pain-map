//check if user is set, then load initial page, 
// if user is not set, or not remebered, loads the select/create user page

// Main Pain Management page
//  select area of pain
//  define pain type (muscle, joint, skin/surface, or combination
//  rate pain from 1-10
//  start/Stop to record time period (minutes, hours, days, etc.)

// 
$( document ).ready(function() {
    if (typeof(Storage) !== "undefined") {
        
        //alert("storage available");
        firstStart(); 
        
} else {
    alert("Unsupoorted Browser, Please try using a modern browser such as Mozilla Firefox or Google Chrome");
}
});

function firstStart(){   

            var thisUser =  get_current_user();
            if(thisUser===null){
                loadPage("front");
            }else{
                var cPage = db_local_get_settings("current_page");
                if(cPage!==undefined)loadPage(cPage);
                else loadPage("main");
            }
//        });

    }

function loadPage(pagename){
    
    if(pagename in pages){
       
        
        
        if(pages[pagename].needs_login===true && get_current_user()===null){
            alert_modal("Error : Please select user", "<p>Before loading some pages, you must select or create a user. </p>");
            pagename = 'front';
        }
        generateMenu(pagename);
        change_page_content(pagename);
        if(pages[pagename].js_run!==false){
            pages[pagename].js_run();
        }
        
        //set this as the last loaded page
        db_local_set_setting("current_page",pagename);
      
    }else{
        console.log("could not load page");
    }
    
}

function alert_modal(title, content){
    $("#alert_modal_title").html(title);
    $("#alert_modal_body").html(content);
    $("#alert_modal_wrap").modal('show');
    
}

function load_modal(title,div){
    $("#alert_modal_title").html(title);
    $("#alert_modal_body").html($("#"+div).html());
    $("#alert_modal_wrap").modal('show');
}

function generateMenu(activePage){
    //clear menu
    $("#div_menu_left").html("");
    $("#div_menu_right").html("");
    $.each(pages,function(i,p){
        var thisMenu = "#div_menu_" + p.menu;
        $(thisMenu).append('<li><a href="#" onclick="loadPage(\''+i+'\')">'+p.name+'</a></li> ');
        if(i===activePage){
            $(thisMenu + " li:last").addClass("active");
           
        }
    });
     
    
}

function change_page_content(pagename){
     //move the old poge back to its holding area
    var old_page = $("#current_page").val();
    
    if(old_page in pages){
        $("#"+pages[old_page].div_id).html($("#page_content").html());
    }
    $("#page_content").html($("#"+pages[pagename].div_id).html());
    $("#current_page").val(pagename);
    $("#"+pages[pagename].div_id).html("");
    
}

function start_front_page(){
    var users = get_users();
     $("#front_existing_users ul").html('');
    if(users!==null){
        $.each(users,function(i,u){
           $("#front_existing_users ul").append('<li><a href="#" onclick="select_user(\''+u.name+'\')">'+u.name+'</a></li>'); 
        });
    }else{
       $("#front_existing_users").append('<p><strong>No Users Found!</strong></p>'); 
       console.log("no users found");
    }
    
}

function get_users(){
    return db_local_get_users();
}

function get_user(user){
   return db_local_get_user(user);
}


function delete_user_current(){
    
    var cUser = get_current_user();
    if(cUser!== null && cUser.name !== undefined){
        console.log('removing user ' +cUser.name+" & all their data" );
        db_local_remove_user(cUser.name);
        
        localStorage.removeItem('user');
        loadPage('front');
    }else{
        console.log("could not select user to delete : "+cUser)
    }
   
}

function add_user(){
    var addUserResult = db_local_add_user($("#front_input_name").val());
    if(addUserResult==="true"){
        start_front_page();
    }
    else{
        
         alert_modal("Error", $("#front_input_name").val() + " - " + addUserResult);
          
    }
    
    
}

function select_user(user){
    
    localStorage.setItem('user', JSON.stringify(get_user(user)));
    loadPage('main');
}

function get_points(type, loc, level, startTime, endTime, notesContain){
    return db_local_get_points(type,loc, level, startTime, endTime, notesContain);
}

function get_current_user(){
    return db_local_get_current_user();
}

function get_point_data(pid){
    return db_local_get_point(pid);
}

function save_point(point){
    db_local_save_point(point);
}


// MAIN PAGE FUNCTIONS
function start_main_page(){
    
    $(window).off();
   
    $("#main_img_body_outline").click(function(e) {
        main_click_img_add_dot(this,e);
      });
    
    
    //checking for existing points (defaults to last 24 hours, 24 hours * 60 minutes)
    
    main_load_dots(12*60);
    
    $('.clickItem').popover({trigger:'hover'});
    $('.main_point_timeframe').click(function(){
        //convert hours for timeframe into minutes
        main_load_dots($(this).find("input").val());
    });
    $('.main_point_paintype').click(function(){
        //convert hours for timeframe into minutes
        main_load_dots(undefined,$(this).find("input").val());
    });
    $('.main_point_painloc').click(function(){
        // convert hours for timeframe into minutes
        main_load_dots(undefined,undefined,$(this).find("input").val());
    });
    
    $(window).on('resize', function(){
        
        start_main_page();
    });

}

function main_resize(){
    $(".clickItem").remove();
    
    var exPoints = get_points();
    $.each(exPoints,function(i,p){main_place_dot(p.position_x,p.position_y,"dot_id_"+i,p)});
    
    $('.clickItem').popover({trigger:'hover'});
}

function main_point_save_data(){
    //get the form data

    var timeId = new Date().getTime();
    var formData = {};
    $.each($("#alert_modal_wrap").find("form").serializeArray(),function(i,d){
        formData[d.name]=d.value;
    });
    
    //add location as percentages
    //if ID is new
    if(formData['id']==='new' || formData['id']===undefined){
        formData['id']=timeId;
    }
    
    
    save_point(formData);
    $("#alert_modal_wrap").modal('hide');
    
    //remove the new marker point, and any points with this ID & re-add it
    
    
    $("#newMarker").remove();
    $("#"+formData['id']).remove();
    main_place_dot(formData['position_x'],formData['position_y'],"dot_id_"+formData['id'],formData);
//    $("#newMarker").attr('id',"dot_id_"+formData['id']);
    
}

// edit a point when clicked
function main_point_click(pid){
    main_point_edit(pid);
}

function main_point_edit(point_id){
    // loads the point in the div into the edit window
    
    load_modal("Pain Details", "page_wrap_main_modal_data");
    var pid = point_id.substring(8);
 
    var pointDat = get_point_data(pid);
    $.each(pointDat,function(k,v){
        $("#alert_modal_wrap").find("#"+k).val(v);
    });
    
    
    
}

function main_click_img_add_dot(thisCx, e){
    
        // check for existing marker, if it does, remove it (only should have one new marker
        if($("#newMarker").position()!== undefined){
            $("#newMarker").detach();
        }
        var offset = $(thisCx).offset();
        
        var imgX = $("#main_img_body_outline").width();
        var imgY = $("#main_img_body_outline").height();
        
        var pointX = (e.pageX - offset.left +9) / imgX;    //15 px margin in bootstrap
        var pointY = (e.pageY - offset.top-9) / imgY;
        
        $("#position_x").val(pointX);
        $("#position_y").val(pointY);
        
        main_place_dot(pointX, pointY);
        
        
        load_modal("Pain Details", "page_wrap_main_modal_data");
    
}

function main_load_dots(timeframe, pType,pLoc){
    
    //remove any newmarker if it exists

     if($("#newMarker").position()!== undefined){
            $("#newMarker").detach();
            
        }
    
    //if the time frame is undefined, see if we can get it -- same with pain type & location
    if(timeframe===undefined)timeframe = $("#main_buttons_group_timeframe .active input").val();
  
    if(pType===undefined)pType = $("#main_buttons_group_type .active input").val();
    
    if(pLoc===undefined)pLoc = $("#main_buttons_group_loc .active input").val();
    
    $(".main_pain_point_marker").remove();
    
    // timeframe should be in hours
    var startTime = new Date().getTime()-(timeframe*60*60*1000);
    
    if(timeframe==='all')startTime = undefined;
    
    var exPoints = get_points(pType,pLoc,undefined,startTime);
    $.each(exPoints,function(i,p){main_place_dot(p.position_x,p.position_y,"dot_id_"+i,p);});
}

function main_place_dot(pos_pc_x,pox_pc_y,id,pData){
    
    
        var imgX = $("#main_img_body_outline").width();
        var imgY = $("#main_img_body_outline").height();
        if(id===undefined){
            id="newMarker";
        }
        
        var div = $("<div />");
        div.attr("id", id);
        div.attr("class", 'clickItem main_pain_point_marker');
        div.attr("position", 'absolute');
        div.css("top", pox_pc_y * imgY);
        div.css("left", pos_pc_x * imgX);
        div.css("width", '12px');
        div.css("height", "12px");
        div.css("z-index", "99");
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.id     = "CursorLayer";
        canvas.width  = 12;
        canvas.height = 12;
        canvas.style.zIndex   = 8;
        canvas.style.position = "absolute";
        context.globalAlpha = 0.5;
        context.beginPath();
        context.arc(6,6, 6, 0, 2 * Math.PI, false);
        
        
        if(pData!==undefined && id!=="newMarker"){
                        
            var timeFriendlyStart = get_time_string(pData.time_start, pData.time_end);
            

            div.attr("data-toggle", 'popover');
            div.attr("title", pData.pain_type + " pain"); 
            div.attr("data-html", 'true'); 
            div.attr("data-content", timeFriendlyStart + "<br>" +  pData.notes); 
            div.attr("onclick","main_point_click('#"+id+"')");

            
            switch (pData.pain_type.toLowerCase()){
                case "joint":
                  context.fillStyle = '#F00000';
                break;
                case "muscle":
                  context.fillStyle = '#F000F0';
                break;
                case "skin":
                  context.fillStyle = '#F0F000';
                break;
                case "other":
                  context.fillStyle = '#404040';
                break;
                default:
                    context.fillStyle = '#b08040';
                break;
            }
        }
        else{
            
            context.fillStyle = 'red';
        }
        context.fill();
        
         div.append(canvas);
        $("#main_img_body_wrap").append(div);
        
        if(pData!==undefined && id!=="newMarker"){
            
            $('.clickItem').popover({trigger:'hover'});
        }
        
}

function main_time_select(time){
    var startTime = new Date().getTime();
    var endTime = startTime + 600000;
    
    switch(time){
        case '30 Secs':
            endTime = startTime + 30000;
        break;
        case '10 Mins':
            endTime = startTime + 10 * 60 * 1000;
        break;
        case '1 Hour':
            endTime = startTime + 60 * 60 * 1000;
        break;
        case '8 Hours':
            endTime = startTime + 8 * 60 * 60 * 1000;
        break;
        case '1 Day':
            endTime = startTime + 24 * 60 * 60 * 1000;
        break;
    }
    
    main_set_time_fields(startTime,endTime);
    
}

function main_set_time_fields(startTimeStamp, endTimeStamp){
    var startT = new Date(startTimeStamp);
    var endT = new Date(endTimeStamp);
    
    //if this is a new ID, set the start time.
    if($("#alert_modal_wrap").find("#id").val() ==='new'){
        $("#alert_modal_wrap").find('#time_start').val(dt_to_string(startT));
        console.log("Found value to be new : " + $("#alert_modal_wrap").find("#id").val());
    }
    
    $("#alert_modal_wrap").find('#time_end').val(dt_to_string(endT));
    
    
}


// REPORTS PAGE

function start_reports_page(){
    reports_show_available();
}

function reports_show_available(){
    $("#reports_left_menu ul").html("");
    $.each(reports,function(i,d){
        $("#reports_left_menu ul").append(
                '<li><a href="#" onclick="reports_load_options(\''+i+'\')"><strong>'+d.name+'</strong><br><i>'+d.description+'</i></a></li>');
        
    });
}

function reports_load_options(report){
    var rDat = reports[report];
    
    reports_generate_paramaters(rDat);
    
}

function reports_generate_paramaters(rdata){

    $("#reports_content").html("<h1 class='text-center'>"+rdata.name+"</h1><hr>");

    if(rdata.filters.length>=1){

        var filterHTML = $("<div><h3>Report Filters</h3><form class='form-horizontal' id='report_generate_filter'></form></div>");
        if(rdata.filters[0]==='all'){
            var requiredFilters = {};
            $.each(db_fields,function(i,d){
     
                if('required' in d){
                    requiredFilters[i]=d;
                }
            });
            
            $.each(requiredFilters,function(i,k){
                filterHTML.find('form').append(reports_filter_html(i,k));
            });
        }
  
        $("#reports_content").append(filterHTML.html());
        
       
    }
    
    if(Object.keys(rdata.options).length>=1){
        var optionsHTML = $("<div><hr><h3>Report Options</h3><form class='form-horizontal' id='report_generate_options'></form></div>");
        
        $.each(rdata.options, function(i,oD){
            optionsHTML.find("#report_generate_options").append(reports_options_html(i,oD));
        });
        
        $("#reports_content").append(optionsHTML.html());
       
    }
    else{
        $("#reports_content").append("<hr><p>No other options available for this report " + rdata.options.length + " </p>");
    }
    
     
    $("#reports_content").append('<hr><div class="btn btn-default btn-block btn-lg" onclick="reports_generate_form_submit(\''+rdata.id+'\')">Generate Report</div>');

   
    $("#reports_content").find(".checkbox-toggle").bootstrapToggle({on: 'Enabled',off: 'Disabled'}).change(function(){reports_filter_action_checkboxes();});
    reports_filter_action_checkboxes();
}

function reports_filter_action_checkboxes(){
    $('.checkbox-toggle').each(function(i,d){
       
        var fG = $(d).parent().parent().parent();
        
        var inputD = fG.find(".filter-input input");
        
        if(!inputD.length)inputD = fG.find(".filter-input select");
        
        if(fG.find(".checkbox-toggle").prop('checked')===true){
            inputD.prop('disabled',false);
        }else{
            
            inputD.prop('disabled',true);
            
        }
        
    });
}

function reports_filter_html(i,fD){
    var html = $("<div><div class='form-group'>"+
        "<label for='"+i+"' class='col-sm-4 control-label'>"+fD.display+"</label>"+
        "<div class='col-sm-6 filter-input'></div>" +
        "</div></div>");

    //if this is not required, put an option to disable/enable the filter
    if(fD.required===false){
        $(html).find('.form-group').prepend("<div class='col-sm-2'><input type='checkbox' class='checkbox-toggle' id='filter_enabled_"+i+"'></div>");
    }else{
 
        html.find("label").addClass("col-sm-offset-2");
    }
    switch(fD.type){
        case ('number'):
            html.find('.filter-input').append("<input name='"+i+"' described_by='helpblock_"+i+"' class='form-control' type='number' id='"+i+"'>");
            
            if("int_min" in fD && "int_max" in fD){
                html.find("#"+i).attr('min',fD.int_min);
                html.find("#"+i).attr('max',fD.int_max); 
            }
            
        break;
        case ('select'):
            html.find('.filter-input').append("<select name='"+i+"' described_by='helpblock_"+i+"' class='form-control' id='"+i+"'></select");
            if("values" in fD)$.each(fD.values, function(k,d){
                html.find("#"+i).append('<option value="'+d.value+'">'+d.name+'</option>');
            });
            //if min/max values are set
            if("int_min" in fD && "int_max" in fD){
                html.find("#"+i).attr('min',fD.int_min);
                html.find("#"+i).attr('max',fD.int_max); 
            }
        break;
        case ('datetime'):
            html.find('.filter-input').append("<input name='"+i+"' described_by='helpblock_"+i+"' class='form-control' type='datetime-local' id='"+i+"'>");
            
        break;
        case ('text'):
            html.find('.filter-input').append("<input name='"+i+"' described_by='helpblock_"+i+"' class='form-control' type='text' id='"+i+"'>");
            
        break;
    }
    
    
    //if there is a default value
     if('default_value' in fD){
         if(html.find("#"+i).is('select')){
             html.find("#"+i+ " option[value="+fD.default_value+"]").attr('selected','selected');
         }
         else if(html.find("#"+i).attr('type')==="datetime-local"){
             var formattedDate = dt_to_string(new Date(fD.default_value)).replace(" ","T");
             html.find("#"+i).attr('value',formattedDate);
         }
         else{
            html.find("#"+i).attr('value',fD.default_value);
         }
     }

    
     if('description' in fD){
          html.find("#"+i).after( "<span id='helpblock_"+i+"' class='help-block'>"+fD.description+"</span>");
      }
      
      
    return html.html();
    
    
}

function reports_options_html(i,oD){
    //create a jquery object for putting HTML into
    var html = $("<div><div class='form-group'>"+
        "<label for='opt_"+i+"' class='col-sm-4 col-sm-offset-2 control-label'>"+oD.display+"</label>"+
        "<div class='col-sm-6 option-input'></div>" +
        "</div></div>");
    
    switch (i){
        case('fields'):
            html.find(".option-input").append('<select multiple size="10" class="form-control" id="opt_'+i+'" name="opt_'+i+'"></select>');
            var selectableFields = [];
            
            if(oD.available.length===0){
                //foreach
                $.each(db_fields, function(fi,fd){
                    selectableFields.push(fi);
                });
            }
            else{
                selectableFields = oD.available;
            }
            
            //for each selectable field
            $.each(selectableFields,function(sI,sD){
                html.find("#opt_"+i).append('<option value="'+sD+'">'+db_fields[sD].display+"</option>");
                if('required' in db_fields[sD]){
                    html.find("#opt_"+i + " option:last").attr('selected','true');
                }
            });
            
            html.find("#opt_"+i).attr('size',selectableFields.length)
            
        break;
    }
    
    
    //return appropriate HTML
    return html.html();
}

//serializes the filter inputs and passes them to the generate report function
function reports_generate_form_submit(fID){
    var filters = new Array(6);
    filters.fill(undefined);
    
    $.each($("#report_generate_filter").serializeArray(), function(k,v){
        if(v.name==='pain_type')filters[0]=v.value;
        else if(v.name==='pain_location')filters[1]=v.value;
        else if(v.name==='pain_level')filters[2]=v.value;
        else if(v.name==='time_start')filters[3]=new Date(v.value).getTime();
        else if(v.name==='time_end')filters[4]=new Date(v.value).getTime();
        else if(v.name==='notes')filters[5]=v.value;
    });
    var filteredPoints = get_points.apply(this,filters);
    
    var optData = $("#report_generate_options").serializeArray();
    var options = {};
    if(optData.length>='1'){
        $.each(optData,function(i,v){
            if(v.name in options){
                if(options[v.name].constructor !== Array){
                    options[v.name]=[options[v.name]];
                }
                options[v.name].push(v.value);
            }
            else options[v.name]=v.value;
        });
    }
    console.log(options);
    
    var organised_points = [];
    
    var opCount = 0;
    
    var columns = [];
    
    if('opt_fields' in options){
        $.each(options.opt_fields, function(i,f){
            columns.push(f);
        });
    }
    
    else{
        $.each(db_fields,function(i,d){columns.push(i);});
    }
    
    $.each(filteredPoints, function(i,p){
        organised_points[opCount] = {};
        $.each(columns,function(k,v){
            
            if(v in p){
                organised_points[opCount][v]=p[v];
            }
            else{
                 organised_points[opCount][v]="";
            }
        });
        opCount+=1;
    });
    
    window[reports[fID].js_generate](organised_points);
    
}
function reports_generate_simple(points,options){
    $("#reports_content").html('<table class="table table-striped" id="report_generated_table"><thead></thead><tbody></tbody></table>');
    
    $.each(points,function(k,p){
        if(k===0){
            $("#report_generated_table thead").append("<tr></tr>");
            $.each(p,function(k,v){
                $("#report_generated_table thead tr:first").append("<th>"+db_fields[k].display+"</th>");
            });
        }
        $("#report_generated_table tbody").append("<tr></tr>");
        $.each(p,function(k,v){
            $("#report_generated_table tbody tr:last").append("<td>"+v+"</td>");
        });
        
    });
}

function reports_generate_file(points,options){
    $("#reports_content").html("");
    var csvContent = "";
    var csvRay = [];
    var count = 0 ; 
    $.each(points,function(i ,d){
        
        if(count<1){
            csvRay[count]=[];
            $.each(d,function(k,r){
                csvRay[count].push(k);
            });
            count +=1;
        }
        if(csvRay[count]===undefined)csvRay[count]=[];
        
        $.each(d,function(k,r){
              csvRay[count].push('"'+r+'"');
          });
          count +=1;

    }); 
    
    console.log(csvRay);
    $.each(csvRay,function(i,d){
        csvContent += d.toString() + "\n";
    });
    
    var encodedUri = "data:text/csv;charset=utf-8," + encodeURI(csvContent);
    
    if(Object.keys(points).length<1){
        $("#reports_content").html("<div class='alert alert-warning alert-dissmissable'>No data found</div>");
    }else{
     $("#reports_content").html("<a class='btn btn-block btn-lg btn-info' download='pain_points_data.csv' href='"+encodedUri+"' target='_blank'>Download Data</a>");
  
    }
}

//GENERAL FUNCTIONS
function get_time_string(strTimeStart, strTimeEnd){
    var timeFriendlyStart = get_time_offset_string(new Date(strTimeStart).getTime());
    var timeDuration = get_time_offset_string(new Date().getTime() - (new Date(strTimeEnd).getTime()-new Date(strTimeStart).getTime()));
    var timeFriendlyEnd = get_time_offset_string(strTimeEnd);
    
    //Math.floor((new Date().getTime() - new Date(time).getTime())
    
    return timeFriendlyStart + " ago : Duration = " + timeDuration;
}

function get_time_offset_string(timestamp){
    var timeSeconds = Math.floor((new Date().getTime() - timestamp) /1000);
    var friendlyTime = "";
    if(timeSeconds < 61){
        var friendlyTime = timeSeconds + "s"; 
    }
    else if(timeSeconds < 3600){
        var friendlyTime = Math.floor(timeSeconds/60) + "m"; 
    }
    else if(timeSeconds < 86400){        //24 Hours
        var friendlyTime = Math.floor(timeSeconds/60/60) +"h " + Math.floor((timeSeconds/60)%60) + "m"; 
    }
    else if(timeSeconds < 604800){        //7 days
        var friendlyTime = Math.floor(timeSeconds/24/60/60) +"d " + Math.floor((timeSeconds/60/60)%24) + "h"; 
    }
    else if(timeSeconds > 604800){        //7 days
        var friendlyTime = Math.floor(timeSeconds/7/24/60/60) +"w " + Math.floor(timeSeconds/60/60/24%7) + "d"; 
    }
    
    return friendlyTime;
}

function dt_to_string(dt){
   
 
    var time = dt.getFullYear() + '-'
            + pad('00',dt.getMonth()+1,true) + '-' 
            + pad('00',dt.getDate(),true) + ' ' 
            + pad('00',dt.getHours(),true) + ':' 
            + pad('00',dt.getMinutes(),true) + ':' 
            + pad('00',dt.getSeconds(),true) ;
    return time;
}

function pad(pad, str, padLeft) {
  if (typeof str === 'undefined') 
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}

    
function db_local_get_points(pain_type, pain_location, pain_level, startTime, endTime, notesContain){
    
    var thisUser =  JSON.parse(localStorage.getItem("user"));
    
    var points = JSON.parse(localStorage.getItem(thisUser.name + "_points"));
    if (points===null)return {};

    var filteredPoints = {};
    
    
    
    $.each(points,function(i,p){
        var tyAcc, loAcc, plAcc, tsAcc, teAcc, noAcc = false;
        
       
        //now checking for pain type
        if(pain_type===undefined || pain_type==="all"){
            tyAcc=true;
        }
        else{
            if(pain_type===p.pain_type )tyAcc=true;
        }
        
        
        if(pain_location===undefined || pain_location==='all'){
            loAcc=true;
        }
        else{
            if(pain_location===p.pain_location)loAcc=true;
        }
        
        
        if(pain_level===undefined || pain_level==='all'){
            plAcc=true;
        }
        else{
            if(pain_level<=p.pain_level)plAcc=true;
        }
        
        if(startTime===undefined || startTime==='all'){
            tsAcc=true;
        }
        else{
            var startTimeStamp = new Date(p.time_start).getTime();
            var endTimeStamp = new Date(p.time_end).getTime();
            
            if(startTimeStamp >= startTime || startTimeStamp > endTimeStamp){
                tsAcc = true;
            }
        }
        
        if(endTime===undefined || endTime==='all'){
            teAcc=true;
        }
        else{
             var endTimeStamp = new Date(p.time_end).getTime();
             
             if(endTimeStamp <= endTime && tsAcc){
                 teAcc=true;
             }
        }
        
        // check for notes filter
        if(notesContain===undefined){
            noAcc=true;
        }
        else{
           if(p.notes.indexOf(notesContain)!== -1){
               noAcc=true;
           }
        }
        
        
        
        if(tyAcc===true && loAcc===true && tsAcc===true && teAcc===true && noAcc===true)filteredPoints[i]=p;
        
    });
    
    return filteredPoints;
   
}

function db_local_get_point(pid){
    var allPoints = db_local_get_points();
    var foundP = undefined;
    $.each(allPoints,function(i,p){
        if(i===pid){
            foundP = p;
            return false;   
        }
    });
    
    return foundP;
    
}

function db_local_save_point(point){
    var existingPoints = get_points();
    
    var cUser = JSON.parse(localStorage.getItem("user"));
    existingPoints[point.id]=point;
    localStorage.setItem(cUser.name+ "_points", JSON.stringify(existingPoints));
}

function db_local_get_current_user(){
    return JSON.parse(localStorage.getItem("user"));
}

function db_local_get_settings(setting){
    var cUser = db_local_get_current_user();
    
    var settings = JSON.parse(localStorage.getItem(cUser.name+"_settings"));
    
    if(setting !== undefined){
        var filteredOption = undefined;
        $.each(settings, function(i,s){
            if(i===setting)filteredOption=s;
        });
        return filteredOption;
    }
    else if(settings===null)return{};
    
    else{
        return settings;
    }
}

function db_local_set_setting(optionName,optionValue){
    var exSettings = db_local_get_settings();
    exSettings[optionName]=optionValue;
    
    var cUser = db_local_get_current_user();
    localStorage.setItem(cUser.name+"_settings", JSON.stringify(exSettings));
    
}
function db_local_get_user(user){
    var users = db_local_get_users();
    var foundUser = null;
    $.each(users,function(i,u){
        if(u.name.toLowerCase()===user.toLowerCase()){
            foundUser = u;
        }
    });
   return foundUser;
}

function db_local_get_users(){
     return JSON.parse(localStorage.getItem("users"));
}

function db_local_remove_user(user){
    if(db_local_get_user(user)!==null){
        //remove user's data
        localStorage.removeItem(user + "_points");
        
        //remove the user from the list
        var users = db_local_get_users();
        
        var newUsers = [];
        $.each(users,function(i,u){
            if(u.name.toLowerCase()!==user.toLowerCase()){
                newUsers.push(u);
            }
            else{
                console.log("removing " + u.name + " from local DB");
            }
        });
        
        localStorage.setItem('users', JSON.stringify(newUsers));
        
        
    }
    else{
        console.log("could not delete user "+user + ".  Not found in local DB.");
    }
    
}

function db_local_add_user(user){
    
    if(user.length > 3){
        //check if this user is already in the system
        var users = get_users();
        
        if(users===null)users=[];
        
        var userExists = false;
        $.each(users,function(i,u){
            if(u.name.toLowerCase()===user.toLowerCase())userExists = true;
            
        });
        if(userExists===true){
            return "<p>This account already exists; please select it from the 'Existing Users' section.</p>";
          
        }else{

            users.push({
                name:user
            });


            localStorage.setItem('users', JSON.stringify(users));
    
            return "true"; 
        }
      
    }else{
         return "<p>The name must be <strong>at least 4 characters long</strong> to be added.</p>";
          
    }
}