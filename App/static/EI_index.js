function Check(box_id){
    if (document.getElementById(box_id).checked){
        document.getElementById(box_id + "Hidden").disabled = true;
    }
}

function Check_Name(){
    var name = $("#new_name").val();
    $.ajax({
        url: "/new",
        data: { "name": name},
        success: function(data){
            if (data == "True"){
                $("button[value='new']").attr("disabled", true);
                $("#warning").show();
            } else{
                $("#warning").hide();
                $("button[value='new']").attr("disabled", false);
            }
        },
        error: function (xhr, errorThrown){
            console.log(xhr.responseText);
            console.log(errorThrown);
        }
    });
}
