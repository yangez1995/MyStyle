(function($) {
	'use strict';

	$.fn.extend({
		'MyForm': function(options) {
			//校验配置信息
			let arr = [1, 2, 3, 4];
			if(arr.indexOf(options.minWidthSize) == -1)
				console.error('minWidthSize 值应为[1, 2, 3, 4]中的一个');
			if(arr.indexOf(options.maxWidthSize) == -1)
				console.error('maxWidthSize 值应为[1, 2, 3, 4]中的一个');
			if(options.minWidthSize > options.maxWidthSize)
				console.error('maxWidthSize应大于minWidthSize');

			//覆盖默认配置
			let opts = $.extend({}, defaluts, options);

			//生成form
			let form = new MyForm(this.attr('id'));
			form.init();

			//组件宽度型号自适应
			if(opts.widthAutoAdapt) {
				form.autoAdapt(opts.minWidthSize, opts.maxWidthSize);
				$(window).resize(function() {
					form.autoAdapt(opts.minWidthSize, opts.maxWidthSize);
				});
			}

			return form;
		}
	});

	var defaluts = {
		widthAutoAdapt: true, //是否根据页面大小调整组件宽度占比
		minWidthSize: 1, //自动调整时宽度最小限制, widthAutoAdapt为true时有效(1 - short, 2 - normal, 3 - long, 4 - full)
		maxWidthSize: 4, //自动调整时宽度最大限制, 同上
	} 

	function MyForm(formId) {
		this.container = $('#' + formId); //容器
		this.elements = {};

		//初始化
		this.init = function() {
			let inputs = this.container.find('.my-input');
			for(let i = 0; i < inputs.length; i++) {
				let id = $(inputs[i]).attr('id');
				let element = new MyInput(id);
				element.init();
				this.elements[id] = element;
			}
		};

		//获取表单数据
		this.val = function() {
			let value = {};
			for (key in this.elements) {
				let elmt = this.elements[key];
				value[elmt.id] = elmt.val();
			}
			return value;
		}

		//清空表单
		this.clear = function() {
			for (key in this.elements) {
				let elmt = this.elements[key];
				elmt.clear();
			}
		}

		//根据宽度调整组件大小
		this.autoAdapt = function(minSize, maxSize) {
			let width = this.container.width();
			for (key in this.elements) {
				let elmt = this.elements[key];
				elmt.autoAdapt(width, minSize, maxSize);
			}
		}
	}

	function MyFormCell(cellId) {
		this.id = cellId; //id
		this.container = $('#' + cellId); //容器

		//错误提示
		this.error = function(tips) {
			this.normal();
			this.container.addClass('error');
			this.elements.tips.text(tips == undefined ? '' : tips);
		};

		//警告提示
		this.warning = function(tips) {
			this.normal();
			this.container.addClass('warning');
			this.elements.tips.text(tips == undefined ? '' : tips);
		};

		//清除提示
		this.normal = function(tips) {
			this.container.removeClass('error');
			this.container.removeClass('warning');
			this.elements.tips.text(tips == undefined ? '' : tips);
		}

		//根据宽度自适应大小
		this.autoAdapt = function(cntrWidth, minSize, maxSize) {
			let arr = [1, 2, 3, 4]
			for(let i = 0; i < 4; i++) {
				if(arr[i] < minSize)
					arr[i] = minSize;
				if(arr[i] > maxSize)
					arr[i] = maxSize;
			}

			if(cntrWidth <= 600){
				this.sizeChange(arr[3]);
			} else if(cntrWidth > 600 && cntrWidth <= 900) {
				this.sizeChange(arr[2]);
			} else if (cntrWidth > 900 && cntrWidth <= 1200) {
				this.sizeChange(arr[1]);
			} else if(cntrWidth > 1200) {
				this.sizeChange(arr[0]);
			}
		};

		//调整组件宽度型号
		this.sizeChange = function(size) {
			switch(size){
				case 1:
					this.sizeShort();
					break;
				case 2:
					this.sizeNormal();
					break;
				case 3:
					this.sizeLong();
					break;
				case 4:
					this.sizeFull();
					break;
				default:
					console.error('参数应为[1, 2, 3, 4]中的一个')
					break;
			}
		}
		this.sizeShort = function() {
			this.container.addClass('my-input-short');
			this.container.removeClass('my-input-long');
			this.container.removeClass('my-input-full');
		}
		this.sizeNormal = function() {
			this.container.removeClass('my-input-short');
			this.container.removeClass('my-input-long');
			this.container.removeClass('my-input-full');
		}
		this.sizeLong = function() {
			this.container.removeClass('my-input-short');
			this.container.removeClass('my-input-full');
			this.container.addClass('my-input-long');
		}
		this.sizeFull = function() {
			this.container.removeClass('my-input-short');
			this.container.removeClass('my-input-long');
			this.container.addClass('my-input-full');
		}

		//Getter and Setter
		this.tips = function(text) {
			if(text == undefined){
				return this.elements.tips.text();
			} else {
				this.elements.tips.text(text);
			}
		};
		this.label = function(text) {
			if(text == undefined) {
				return this.elements.label.text();
			} else {
				this.elements.label.text(text);
				this.elements.label.attr('title', text);
			}
		};
		this.val = function(value) {
			if(value == undefined) {
				return this.elements.input.val();
			} else {
				this.elements.input.val(value);
			}
		};
	}

	MyInput.prototype = new MyFormCell();
	function MyInput(inputId) {
		MyFormCell.call(this, inputId);

		//初始化
		this.init = function() {
			let labelText = this.container.attr('label');
			let tipsText = this.container.attr('tips');
			labelText = labelText == undefined ? '' : labelText;
			tipsText = tipsText == undefined ? '' : tipsText;

			this.container.append(`<span id="` + inputId + `-tips">` + tipsText + `</span>`);
			this.container.append(`<label id="` + inputId + `-label" title="` + labelText + `">` + labelText + `</label>`);
			this.container.append(`<input id="` + inputId + `-input" type="text"/>`);

			let tips = $('#' + inputId + '-tips');
			let label = $('#' + inputId + '-label');
			let input = $('#' + inputId + '-input');
			this.elements = { //主要组件
				tips: tips,
				label: label,
				input: input
			};

			//输入时Label过长会自动缩短
			input.focus(function() {
				label.css('max-width', '120px');
			});
			input.blur(function() {
				label.css('max-width', '160px');
			});
		};

		//清空 value & tips
		this.clear = function() {
			this.tips('');
			this.val('');
		};
	}
})(window.jQuery);