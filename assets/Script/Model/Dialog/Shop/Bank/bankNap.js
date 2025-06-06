
var BrowserUtil = require('BrowserUtil');
var helper      = require('Helper');

cc.Class({
	extends: cc.Component,

	properties: {
		labelBankName: cc.Label,
		labelBank:   cc.Label,
		labelNumber: cc.Label,
		labelName:   cc.Label,
		labelBranch: cc.Label,
		labelNoiDung:   cc.Label,
		moreBank: cc.Node,
		scrollviewBank: {
			default: null,
			type: cc.ScrollView,
		},
		prefab: cc.Prefab,
		isLoad: false,
		inputTien:     cc.EditBox,
		hinhThuc:      '',
	},
	onLoad () {
		if(!this.isLoad) {
			cc.RedT.send({shop:{bank:{list:true}}});
		}
		let self = this;
		this.editboxs = [this.inputTien];
		this.keyHandle = function(t) {
			return t.keyCode === cc.macro.KEY.tab ? (self.isTop() && self.changeNextFocusEditBox(),
				t.preventDefault && t.preventDefault(),
				!1) : t.keyCode === cc.macro.KEY.enter ? (BrowserUtil.focusGame(), self.onNapClick(),
				t.preventDefault && t.preventDefault(),
				!1) : void 0
		}
	},
    onEnable: function () {
        //this.labelNickname.string = cc.RedT.user.name;
		cc.sys.isBrowser && this.addEvent();
	},
	onDisable: function () {
		this.moreBank.active = false;
		cc.sys.isBrowser && this.removeEvent();
		this.clean();
	},
	addEvent: function() {
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
		for (var t in this.editboxs) {
			BrowserUtil.getHTMLElementByEditBox(this.editboxs[t]).addEventListener("keydown", this.keyHandle, !1)
		}
	},
	removeEvent: function() {
		for (var t in this.editboxs) {
			BrowserUtil.getHTMLElementByEditBox(this.editboxs[t]).removeEventListener("keydown", this.keyHandle, !1)
		}
		cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
	},
	onKeyDown: function (event) {
		switch(event.keyCode) {
			case cc.macro.KEY.tab:
				this.isTop() && this.changeNextFocusEditBox();
				break;
			case cc.macro.KEY.enter:
				this.isTop() && this.onNapClick();
		}
	},
	changeNextFocusEditBox: function() {
		for (var t = !1, e = 0, i = this.editboxs.length; e < i; e++){
			if (BrowserUtil.checkEditBoxFocus(this.editboxs[e])) {
				BrowserUtil.focusEditBox(this.editboxs[e]);
				t = !0;
				break
			}
		}
		!t && 0 < this.editboxs.length && BrowserUtil.focusEditBox(this.editboxs[0]);
	},
	isTop: function() {
		return !cc.RedT.inGame.notice.node.active && !cc.RedT.inGame.loading.active;
	},
	clean: function(){
		//this.inputTien.string = this.inputName.string = this.inputSTK.string = this.inputKhop.string = this.inputNameGo.string = '';
	},
	toggleMoreBank: function(){
		this.moreBank.active = !this.moreBank.active;
	},
	onData: function(data){
		this.isLoad = true;
		if (data.length > 0) {
			this['i_arg'] = data.map(function(obj, index){
				let item = cc.instantiate(this.prefab);
				let componentLeft = item.getComponent('NapRed_itemOne');
				componentLeft.init(this, 'i_arg', 'labelBank')
				componentLeft.text.string = obj.bank;
				this.scrollviewBank.content.addChild(item);
				componentLeft.data = obj;
				return componentLeft;
			}.bind(this));
		}
	},
	backT: function(data){
		this.labelBankName.string = data.bank;
		this.labelNumber.string = data.number;
		this.labelName.string   = data.name;
		//this.labelBranch.string = data.bank;
		this.labelNoiDung.string = cc.RedT.user.name;
		this.toggleMoreBank();
	},

	setInfo(data){ // code by ares
		this.labelBankName.string = data.bankname;
		this.labelNumber.string = data.number;
		this.labelName.string   = data.name;
		//this.labelBranch.string = data.bank;
		this.labelNoiDung.string = data.noidung;
	},

	onChangerRed: function(value = 0){
		value = helper.numberWithCommas(helper.getOnlyNumberInString(value));
		this.inputTien.string = value == 0 ? "" : value;
	},
	onClickNap: function(){
		if (!this.labelNumber.string.length) {
			cc.RedT.inGame.notice.show({title:"NẠP GO", text: "Vui lòng chọn ngân hàng muốn nạp."});
		}else if (helper.getOnlyNumberInString(this.inputTien.string)>>0 < 50000) {
			cc.RedT.inGame.notice.show({title:"NẠP GO", text: "Nạp tối thiểu 50.000"});
		}else{
			let bankName  = this.labelBranch.string.toLowerCase();
			let data = {
				'hinhthuc': bankName === 'bank' ? 1 : 0,
				'bank':     this.labelBankName.string,
				'money':    helper.getOnlyNumberInString(this.inputTien.string),
				'name':     this.labelName.string,
				'number':     this.labelNumber.string,
			};
			data = {'shop':{'bank':{'nap':data}}};
			cc.RedT.send(data);
			
		}
	},
	onCopyNumber: function(){
		cc.RedT.CopyToClipboard(this.labelNumber.string);
		cc.RedT.inGame.noticeCopy();
	},
	onCopyName: function(){
		cc.RedT.CopyToClipboard(this.labelName.string);
		cc.RedT.inGame.noticeCopy();
	},
	onCopyBranch: function(){
		cc.RedT.CopyToClipboard(this.labelBranch.string);
		cc.RedT.inGame.noticeCopy();
	},
	onCopyNoiDung: function(){
		cc.RedT.CopyToClipboard(this.labelNickname.string);
		cc.RedT.inGame.noticeCopy();
	},
});
