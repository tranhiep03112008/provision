
import Http from "../../../../Util/Http";
var BrowserUtil = require('BrowserUtil');
var helper      = require('Helper');

cc.Class({
	extends: cc.Component,

	properties: {
		labelBank:   cc.Label,
		labelNumber: cc.Label,
		labelName:   cc.Label,
		labelBranch: cc.Label,
		labelNickname:   cc.Label,
		moreBank: cc.Node,
		scrollviewBank: {
			default: null,
			type: cc.ScrollView,
		},
		prefab: cc.Prefab,
		isLoad: false,
		inputTien:     cc.EditBox,
		codeNode : cc.Node,
		lableCode:cc.Label,
		remainTime : cc.Label,
		btnCreateCode: cc.Node,
		btnCancelCode: cc.Node,
		hinhThuc:      '',
		valueBank : '',
		chargeId : '',
	},
	onLoad () {
		if(!this.isLoad) {
			this.getBankList();
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
	getBankList(){
		cc.RedT.inGame.loading.active = true;
		Http.get('https://api.zon.vin/autocode/getAllBank/', {}, (err, res) => {
			cc.RedT.inGame.loading.active = false;
			if (err == null) {
				if(res.stt==1){
					this.onData(res.data);
				}else{
					cc.RedT.inGame.notice.show({title:"CODE PAY", text: "Không kết nối được đến hệ thống code pay"});
				}
			}
		});
	},
	callCreateCode(){
		cc.RedT.inGame.loading.active = true;
		let chargeType = "bank";
		let amount = helper.getOnlyNumberInString(this.inputTien.string);
		let subType = this.valueBank;
		let UID = cc.RedT.user.id;
		Http.get('https://api.zon.vin/autocode/createCode/', {"UID":UID,"chargeType":chargeType,"amount":amount,"subType":subType}, (err, res) => {
			cc.RedT.inGame.loading.active = false;
			if (err == null) {
				if(res.stt==1){
					this.showCodeData(res.data);
				}else if(res.stt==-1){
					cc.RedT.inGame.notice.show({title:"CODE PAY", text: "Không tìm thấy thông tin tài khoản của bạn \n Vui lòng cập nhập version mới"});
				}else{
					cc.RedT.inGame.notice.show({title:"CODE PAY", text: "Code pay lỗi hoặc vui lòng chọn ngân hàng khác"});
				}
			}
		});
	},
	callCancelCode(){
		cc.RedT.inGame.loading.active = true;
		Http.get('https://api.zon.vin/autocode/cancelCode/', {id:this.chargeId}, (err, res) => {
			cc.RedT.inGame.loading.active = false;
			if (err == null) {
				if(res.stt==1){
					this.expireCodeData();
					cc.RedT.inGame.notice.show({title:"NẠP ZON", text: "Bạn đã huỷ lệnh nạp thành công"});
				}else{
					cc.RedT.inGame.notice.show({title:"CODE PAY", text: "Code pay lỗi hoặc vui lòng chọn ngân hàng khác"});
				}
			}
		});
	},
    onEnable: function () {
		if(this.chargeId !=''){
			this.getBankList();
			this.expireCodeData();
		}
        //this.labelNickname.string = cc.RedT.user.name;
		cc.sys.isBrowser && this.addEvent();
	},
	onDisable: function () {
		this.moreBank.active = false;
		cc.sys.isBrowser && this.removeEvent();
		this.clean();
	},
	showCodeData:function(data){
		this.codeNode.active = true;
		this.lableCode.string = data.code;
		this.labelNickname.string = data.code;
		this.labelName.string = data.phoneName;
		this.labelNumber.string = data.phoneNum;
		this.btnCreateCode.active = false;
		this.btnCancelCode.active = true;
		this.chargeId = data.id;
		this.progressCountdown(data.timeToExpired);
	},
	expireCodeData:function(){
		this.codeNode.active = false;
		this.lableCode.string = '-';
		this.labelNickname.string = '-';
		this.labelName.string = 'Hãy tạo code';
		this.labelNumber.string = 'Hãy tạo code';
		this.btnCreateCode.active = true;
		this.btnCancelCode.active = false;
		this.remainTime.string = 'Đã hết hạn';
		this.chargeId = '';
		this.valueBank = '';
		this.labelBank.string = 'Chọn ngân hàng';
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
		this.isLoad = false;
		//this.inputTien.string = this.inputName.string = this.inputSTK.string = this.inputKhop.string = this.inputNameGo.string = '';
	},
	toggleMoreBank: function(){
		if(this.chargeId !=''){
			cc.RedT.inGame.notice.show({title:"NẠP ZON", text: "Hãy hoàn thành mã lệnh bạn đã tạo \n hoặc huỷ mã để thay đổi ngân hàng"});
		}else{
			this.moreBank.active = !this.moreBank.active;
		}
	},
	onData: function(data){
		this.isLoad = true;
		if (data.length > 0) {
			this['i_arg'] = data.map(function(obj, index){
				let item = cc.instantiate(this.prefab);
				let componentLeft = item.getComponent('CodePay_itembank');
				componentLeft.init(this, 'i_arg', 'labelBank','valueBank');
				componentLeft.text.string = obj.name;
				componentLeft.value = obj.code;
				this.scrollviewBank.content.addChild(item);
				componentLeft.data = obj;
				return componentLeft;
			}.bind(this));
		}
	},
	backT: function(data){
		this.labelBank.string = data.name;
		this.valueBank = data.code;
		this.toggleMoreBank();
	},
	onChangerRed: function(value = 0){
		value = helper.numberWithCommas(helper.getOnlyNumberInString(value));
		this.inputTien.string = value == 0 ? "" : value;
	},
	onClickNap: function(){
		if (!this.valueBank.length) {
			cc.RedT.inGame.notice.show({title:"NẠP ZON", text: "Vui lòng chọn ngân hàng muốn nạp."});
		}else if (helper.getOnlyNumberInString(this.inputTien.string)>>0 < 50000) {
			cc.RedT.inGame.notice.show({title:"NẠP ZON", text: "Nạp tối thiểu 50.000, tối đa 1.000.000.000"});
		}else{
			// let data = {
			// 	'hinhthuc': this.hinhThuc,
			// 	'bank':     this.labelBranch.string,
			// 	'money':    helper.getOnlyNumberInString(this.inputTien.string),
			// 	'name':     this.labelName.string,
			// 	'number':     this.labelNumber.string,
			// };
			// data = {'shop':{'bank':{'nap':data}}};
			//console.log(data);
			 this.callCreateCode();
			//cc.RedT.send(data);
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
	fancyTimeFormat: function(duration)
	{   
		// Hours, minutes and seconds
		var hrs = ~~(duration / 3600);
		var mins = ~~((duration % 3600) / 60);
		var secs = ~~duration % 60;

		// Output like "1:01" or "4:03:59" or "123:03:59"
		var ret = "";

		if (hrs > 0) {
			ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
		}

		ret += "" + mins + ":" + (secs < 10 ? "0" : "");
		ret += "" + secs;
		return ret;
	},
	progressCountdown: function(timeleft) {
		return new Promise((resolve, reject) => {
		  var countdownTimer = setInterval(() => {
			timeleft--;
	  
			//document.getElementById(bar).value = timeleft;
			//document.getElementById(text).textContent = timeleft;
			this.remainTime.string = this.fancyTimeFormat(timeleft);
			if (timeleft <= 0) {
			  this.expireCodeData();
			  clearInterval(countdownTimer);
			  resolve(true);
			}
		  }, 1000);
		});
	}
});
