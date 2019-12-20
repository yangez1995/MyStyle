/*$(document).ready(function() {
	//输入时扩大输入框
	var input = $('.my-input > input');

	input.focus(function() {
		var span = $(this).parent().find('span');
		span.css('max-width', '120px');
	});
	input.blur(function() {
		var span = $(this).parent().find('span');
		span.css('max-width', '160px');
	});

	AutoAdapt($(window).width());
	$(window).resize(function() {
		var width = $(this).width();
		AutoAdapt(width)
	});
});

function AutoAdapt(width) {
	$('.my-input').removeClass('my-input-short');
		$('.my-input').removeClass('my-input-long');
		$('.my-input').removeClass('my-input-full');

		if(width <= 550){
			$('.my-input').addClass('my-input-full');
		} else if(width > 550 && width <= 900) {
			$('.my-input').addClass('my-input-long');
		} else if(width > 1100) {
			$('.my-input').addClass('my-input-short');
		}
}*/