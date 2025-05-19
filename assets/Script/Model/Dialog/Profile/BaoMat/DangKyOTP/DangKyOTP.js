
var BrowserUtil = require('BrowserUtil');
var helper      = require('Helper');

cc.Class({
	extends: cc.Component,

	properties: {
		phone: cc.EditBox,
		nodeReg:  cc.Node,
		nodeInfo: cc.Node,
		btnOTPApp:cc.Node,
		labelPhone:  cc.Label,
		labelStatus: cc.Label,
		captcha: cc.EditBox,
		capchaSprite: cc.Sprite,
		url: 'https://t.me/go6688bot',
	},
	onEnable: function () {
		this.reCaptcha();
	},
	onDisable: function () {
		this.clear();
	},
	onRegClick: function() {
		if (this.phone.string.length < 10){
			cc.RedT.inGame.notice.show({title:'LỖI!', text:'Số điện thoại không hợp lệ.'});
		}else if (this.captcha.string.length != 4) {
			cc.RedT.inGame.notice.show({title:'LỖI!', text:'Captcha không hợp lệ.'});
		}else{
			cc.RedT.send({user:{security:{regPhone:{phone:this.phone.string, captcha:this.captcha.string}}}});
		}
	},
	clear: function(){
		this.phone.string   = '';
		this.captcha.string = '';
	},
	statusOTP: function(status){
		this.nodeReg.active  = !status;
		this.nodeInfo.active = status;
		if (cc.RedT.user.veryphone) {
			this.labelStatus.string = 'Đã Xác Thực';
			this.labelStatus.node.color  = this.labelStatus.node.color.fromHEX('06B30D');
			this.btnOTPApp.active = false;
		}else{
			this.labelStatus.string = 'Chưa Xác Thực';
			this.labelStatus.node.color  = this.labelStatus.node.color.fromHEX('FF0000');
		}
	},
	initCaptcha: function(t) {
		var i = this
		  , o = new Image;
		o.src = t,
		o.width = 150,
		o.height = 50,
		setTimeout(function() {
			var t = new cc.Texture2D;
			t.initWithElement(o),
			t.handleLoadedTexture();
			var e = new cc.SpriteFrame(t);
			i.capchaSprite.spriteFrame = e
		}, 10);
	},
	reCaptcha: function(){
		cc.RedT.send({captcha:'regOTP'});
	},

	openOTPApp: function(){
		//cc.sys.openURL(this.url + '/telegram');
		cc.sys.openURL('https://t.me/go6688bot');
	},
});
