$(function() {
	$("#map").on("click", ".addButton", function(event) {
		// alert("clicked");
		event.preventDefault();
		var button = $(this);
		$.post("/list", {
			brewery_name: button.data("name"),
			brewery_id: button.data("id")
		});
	});

	$(".scroll_down").on("click", function(){
		$("html, body").animate({scrollTop: $(document).height()}, 2000);
		return false;
	});
});