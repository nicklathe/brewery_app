$(function() {
	$("#map").on("click", ".addButton", function(event) {
		// alert("clicked");
		event.preventDefault();
		var button = $(this);
		$.post("/list", {
			brewery_name: button.data("name"),
			brewery_id: button.data("id")
		}, function(data){
			// button.remove();
			button.fadeOut(function(){
				$this.remove();
			})
		});
	});

	$(".deleteBrewery").on("click", function(event){
		event.preventDefault();
		var thisDeleteButton = $(this);
		$.ajax({
			url: "/brewery/" + thisDeleteButton.data("id"),
			type: "DELETE",
			success:function(result){
				thisDeleteButton.closest("li").fadeOut(function(){
					$(this).remove();
				});
			}
		});
	});
});