(function($) {
	'use strict';

	let MySelect = function(element, configs) {
		let _this = this;
		let _value = null;
		let _text = null;
		let _options = [];

		let init = function() {
			//读取DOM设定的初始下拉选项列表
			let lis = _this.container.find('li');
			for(let i = 0; i < lis.length; i++) {
				let opt = $(lis[i]);
				let value = opt.attr('value');
				let text = opt.text();
				
				value = value == undefined ? text : value;
				_options.push({ value: value, text: text });

				if(opt.hasClass('selected')){
					_value = value;
					_text = text;
				}
			}

			if(_value == null || _text == null) {
				_value = _options[0].value;
				_text = _options[0].text;
			}

			//初始化DOM
			_this.container.html('');
			let switchHTML = `<div class="my-select-switch">` + _text + `</div>`;
			
			let toolBoxHTML = `<div class="my-select-toolbox"><input class="my-select-search" type="text"></div>`;
			let optionsHTML = `<div class="my-select-options">`;
			for(let i = 0; i < _options.length; i++) {
				let opt = _options[i];
				if(opt.value == _value)
					optionsHTML += `<li class="selected" value="` + opt.value + `">` + opt.text + `</li>`;
				else
					optionsHTML += `<li value="` + opt.value + `">` + opt.text + `</li>`;
			}
			optionsHTML += `</div>`;
			let dropdownHTML = `<div class="my-select-dropdown">` 
				+ (configs.search ? toolBoxHTML : '') + optionsHTML + `</div>`;

			_this.container.append(switchHTML);
			_this.container.append(dropdownHTML);

			//绑定组件
			_this.elements.switch = _this.container.find('.my-select-switch');
			_this.elements.dropdown = _this.container.find('.my-select-dropdown');
			_this.elements.toolbox = _this.container.find('.my-select-toolbox');
			if(configs.search)
				_this.elements.search = _this.container.find('.my-select-search');
			_this.elements.options = _this.container.find('.my-select-options');

			//绑定事件
			_this.elements.switch.click(function() {
				if(!_this.container.hasClass('disabled')) {
					if(_this.container.hasClass('open')) 
						_this.container.removeClass('open');
					else
						showDropdown();
				}
			});

			_this.elements.options.find('li').click(function() {
				onOptionClick($(this));
			});

			if(configs.search) {
				_this.elements.search.keyup(function() {
					onSearchChange($(this).val());
					relocationDropdown();
				});
			}
		}

		//显示下拉菜单
		let showDropdown = function() {
			_this.container.addClass('open');
			relocationDropdown();
		}

		//选择选项事件
		let onOptionClick = function($element) {
			_this.elements.options.find('li.selected').removeClass('selected');

			$element.addClass('selected');
			_value = $element.attr('value');
			_text = $element.text();

			_this.elements.switch.text($element.text());
			_this.container.removeClass('open');

			Listener.onChange();
		}

		//搜索框改变事件
		let onSearchChange = function(str) {
			_this.elements.options.find('li.hide').removeClass('hide');
			_this.elements.options.find('li').each(function() {
				let $this = $(this);
				if($this.text().indexOf(str) == -1)
					$this.addClass('hide');
			});
		}

		//重新定位下拉框位置
		let relocationDropdown = function() {
			let winHeight = $(window).height();
			let slctHeight = _this.container.height();
			let boxHeight = _this.elements.toolbox.outerHeight();
			let ddHeight = _this.elements.dropdown.height();

			let slctTop = _this.container.offset().top - $(window).scrollTop();
			let slctBottom = winHeight - slctTop - slctHeight;
			if(slctBottom >= slctTop) {
				_this.elements.dropdown.css('margin-top', 2);
				_this.elements.options.css('max-height', slctBottom - boxHeight - 7);
			} else {
				if(slctTop >= ddHeight)
					_this.elements.dropdown.css('margin-top', -(ddHeight + slctHeight + 5));
				else 
					_this.elements.dropdown.css('margin-top', -(slctTop + slctHeight));
				_this.elements.options.css('max-height', slctTop - boxHeight - 6);
			}

			if(configs.search && configs.searchAutoFocus)
				_this.elements.search.focus();
		}

		//添加选项
		let append = function(value, text) {
			if(text == undefined) text = value;

			_options.push({ value: value, text: text });
			_this.elements.options.append(`<li value="` + value + `">` + text + `</li>`);

			_this.elements.options.find('li:last').click(function() {
				onOptionClick($(this));
			});
		}

		//禁用下拉框
		let disabled = function() {
			_this.container.addClass('disabled');
		}

		//启用下拉框
		let enabled = function() {
			_this.container.removeClass('disabled');
		}

		//获取|设置 Value值
		let val = function(value) {
			if(value == undefined) return _value;
			
			let index = -1;
			for(let i = 0; i < _options.length; i++) {
				if(_options[i].value == value) {
					index = i;
					break;
				}
			}
			if(index != -1)
				_this.elements.options.find('li:eq(' + index + ')').click();
		}

		//获取text值
		let text = function() {
			return _text;
		}

		

		//公开属性
		this.container = element;
		this.elements = {};

		//公开方法
		this.init = init;
		this.append = append;
		this.disabled = disabled;
		this.enabled = enabled;
		this.val = val;
		this.text = text;

		//事件
		let Listener = {
			onChange: function (){},
		}

		this.onChange = function(callback) {
			Listener.onChange = callback;
		}
	}

	//全局事件: 点击文档除组件元素外其他位置时关闭下拉菜单
	$(document).bind('click', function(event) {
		if((event.target).closest('.my-select') == null) {
			$(document).find('.my-select.open').removeClass('open');
		}
	});

	$.fn.MySelect = function(configs) {
		let cfg = $.extend({}, defaults, configs);
		let select = new MySelect($(this), cfg);
		select.init();
		return select;
	}

	let defaults = {
		search: true,
		searchAutoFocus: true,
	}
})(jQuery)