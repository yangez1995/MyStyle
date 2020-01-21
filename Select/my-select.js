//Ver 0.0.1
(function($) {
	'use strict';
	let Selecters = [];

	let MySelect = function(element, configs) {
		let _this = this;
		let _value = null;
		let _text = null;
		let _values = {};
		let _options = [];
		let _isOpen = false;

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
					if(configs.multiple) {
						_values[i] = {
							index: i,
							value: value,
							text: text
						};
					} else {
						_value = value;
						_text = text;
					}
				}
			}

			if(!configs.multiple && (_value == null || _text == null)) {
				_value = _options[0].value;
				_text = _options[0].text;
			}

			//初始化DOM
			_this.container.html('');
			let switchHTML;
			if(configs.multiple) {
				switchHTML = '<div class="my-select-switch">' + generateText() + '</div>';
			} else {
				switchHTML = '<div class="my-select-switch">' + _text + '</div>';
			}
			
			//工具栏
			let toolBoxHTML = '<div class="my-select-toolbox">';
			if(configs.search)
				toolBoxHTML += '<input class="my-select-search" type="text" />';
			if(configs.showSelectAll && configs.multiple)
				toolBoxHTML += '<div><button class="select-all">Select All</button>' +
							   '<button class="clear-all">Clear All</button></div>';
			toolBoxHTML += '</div>';

			//下拉选项
			let optionsHTML = '<div class="my-select-options">';
			for(let i = 0; i < _options.length; i++) {
				let opt = _options[i];
				if(opt.value == _value || i in _values)
					optionsHTML += '<li class="selected" index="' + i + '" value="' + opt.value + '">' + opt.text + '</li>';
				else
					optionsHTML += '<li index="' + i + '" value="' + opt.value + '">' + opt.text + '</li>';
			}
			optionsHTML += '</div>';

			let dropdownHTML = '<div class="my-select-dropdown">' + toolBoxHTML + optionsHTML + '</div>';

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
						hideDropdown();
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

			if(configs.multiple && configs.showSelectAll) {
				_this.elements.toolbox.find('.select-all').click(function() {
					selectAll();
				});
				_this.elements.toolbox.find('.clear-all').click(function() {
					clearAll();
				});
			}
		}

		//显示下拉菜单
		let showDropdown = function() {
			_this.container.addClass('open');
			relocationDropdown();

			_isOpen = true;
			Listener.onFocus();
		}
		//隐藏下拉菜单
		let hideDropdown = function() {
			_this.container.removeClass('open');

			_isOpen = false;
			Listener.onBlur();
		}
		//获取下拉框显隐状态
		let isOpen = function() {
			return _isOpen;
		}

		//选择选项事件
		let onOptionClick = function($element) {
			if(configs.multiple) {
				let index = $element.attr('index');
				if(index in _values) {
					delete _values[index];
					$element.removeClass('selected');
				} else {
					_values[index] = {
						index: index,
						value: $element.attr('value'),
						text: $element.text()
					};
					$element.addClass('selected');
				}
				refreshText();
			} else {
				_this.elements.options.find('li.selected').removeClass('selected');
			
				_value = $element.attr('value');
				_text = $element.text();
				$element.addClass('selected');

				_this.elements.switch.text($element.text());
				hideDropdown();
			}		

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

		//生成value(多选)
		let generateValue = function() {
			let first = true;
			let value = '';
			for(let key in _values) {
				if(first){
					value = _values[key].value;
					first = false;
				} else {
					value += configs.separator + _values[key].value;
				}
			}
			return value == null ? '' : value;
		}
		//生成text(多选)
		let generateText = function() {
			let first = true;
			let text = '';
			for(let key in _values) {
				if(first){
					text = _values[key].text;
					first = false;
				} else {
					text += configs.separator + _values[key].text;
				}
			}
			return text == null ? '' : text;
		}
		//刷新text(多选)
		let refreshText = function() {
			_this.elements.switch.text(generateText());
		}

		//添加选项
		let append = function(value, text) {
			if(text == undefined) text = value;

			_options.push({ value: value, text: text });
			_this.elements.options.append('<li value="' + value + '">' + text + '</li>');

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
			if(value == undefined) {
				if(configs.multiple) {
					return generateValue();
				} else {
					return _value;
				}
			}
			
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
			if(configs.multiple) {
				return generateText();
			} else {
				return _text;
			}
		}

		//全选
		let selectAll = function() {
			_values = [];
			for(let i = 0; i < _options.length; i++) {
				_values[i] = {
					index: i,
					value: _options[i].value,
					text: _options[i].text
				}
			}

			_this.elements.options.find('li').addClass('selected');
			refreshText();
		}
		//清空
		let clearAll = function() {
			_values = [];
			_this.elements.options.find('li').removeClass('selected');
			refreshText();
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
		this.isOpen = isOpen;
		this.showDropdown = showDropdown;
		this.hideDropdown = hideDropdown;

		//事件
		let Listener = {
			onChange: function(){},
			onFocus: function(){},
			onBlur: function(){},
		}

		this.onChange = function(callback) {
			Listener.onChange = callback;
		}
		this.onFocus = function(callback) {
			Listener.onFocus = callback;
		}
		this.onBlur = function(callback) {
			Listener.onBlur = callback;
		}
	}


	//全局事件: 点击文档除组件元素外其他位置时关闭下拉菜单
	$(document).bind('click', function(event) {
		if((event.target).closest('.my-select') == null) {
			for(let i = 0; i < Selecters.length; i++) {
				if(Selecters[i].isOpen())
					Selecters[i].hideDropdown();
			}
		}
	});

	$.fn.MySelect = function(configs) {
		let cfg = $.extend({}, defaults, configs);
		let select = new MySelect($(this), cfg);
		select.init();
		Selecters.push(select);
		return select;
	}

	let defaults = {
		search: true,
		searchAutoFocus: true,
		multiple: false,
		separator: ',',
		showSelectAll: true
	}
})(jQuery)