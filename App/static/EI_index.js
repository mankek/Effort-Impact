$(document).ready(function(){

    function Check(box_id){
        if (document.getElementById(box_id).checked){
            document.getElementById(box_id + "Hidden").disabled = true;
        }
    }

    function Check_Name(){
        var name = $("#new_name").val()
        $ajax({
            url: "/new",
            data: { "name": name},
            success: function(data){
                console.log(data)
            },
            error: function (xhr, errorThrown){
                console.log(xhr.responseText);
                console.log(errorThrown);
            }
        })
    }
}