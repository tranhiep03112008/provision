
var BrowserUtil = require('BrowserUtil');

cc.Class({
	extends: cc.Component,

	properties: {
		username: cc.EditBox,
		password: cc.EditBox,
		captcha:  cc.EditBox,
		capchaSprite: cc.Sprite,
		btnSavePass : cc.Toggle,
	},
	onLoad () {
		var self = this;
		this.yName = this.username.node.y;
		this.yPass = this.password.node.y;
		this.editboxs = [this.username, this.password];
		this.editboxs_i = 0;
		this.keyHandle = function(t) {
			return t.keyCode === cc.macro.KEY.tab ? (self.changeNextFocusEditBox(),
				t.preventDefault && t.preventDefault(),
				!1) : t.keyCode === cc.macro.KEY.enter ? (BrowserUtil.focusGame(), self.onLoginClick(),
				t.preventDefault && t.preventDefault(),
				!1) : t.keyCode === cc.macro.KEY.escape ? (cc.RedT.inGame.dialog.onClickBack(),
				t.preventDefault && t.preventDefault(),
				!1) : void 0
		}
	},
	onEnable: function () {
		let username = cc.sys.localStorage.getItem('username');
        let password = cc.sys.localStorage.getItem('password');
    	let IsSavePass = cc.sys.localStorage.getItem('Save_User');
    	if (IsSavePass == null){
    		cc.sys.localStorage.setItem('Save_User', false);
    		this.btnSavePass.isChecked == false;
    	}else if (IsSavePass === "true" && username && password){
    		this.username.string = username;
            this.password.string = password;
            this.btnSavePass.isChecked = true;
    	}
		cc.sys.isBrowser && this.addEvent();
		this.node.runAction(cc.RedT.inGame.dialog.actionShow);
	},
	onDisable: function () {
		cc.sys.isBrowser && this.removeEvent();
		this.clean();
		cc.RedT.inGame.dialog.resetSizeDialog(this.node);
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
			case cc.macro.KEY.escape:
				this.isTop() && cc.RedT.inGame.dialog.onClickBack();
				break;
			case cc.macro.KEY.tab:
				this.isTop() && this.changeNextFocusEditBox();
				break;
			case cc.macro.KEY.enter:
				this.isTop() && this.onLoginClick();
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
		this.username.node.y = this.yName;
		this.password.node.y = this.yPass;
		this.username.string = this.password.string = '';
		this.captcha.node.active = false;
	},
	Luumatkhau: function(){
    	let IsSavePass = cc.sys.localStorage.getItem('Save_User');
    	var error = null;
    	if (IsSavePass === "false"){
    		if (this.username.string == '' || this.password.string == ''){
    			error = 'Bạn chưa nhập tài khoản, mật khẩu';
    		}else{
    			cc.sys.localStorage.setItem('Save_User', true);
	    		this.btnSavePass.isChecked = true;
	    		cc.sys.localStorage.setItem('username', this.username.string)
	        	cc.sys.localStorage.setItem('password', this.password.string)
	        	//cc.log("luu mat khau thanh cong")
    		}
    	}else if (IsSavePass === "true"){
    		cc.sys.localStorage.setItem('Save_User', false);
    		cc.sys.localStorage.removeItem('username')
        	cc.sys.localStorage.removeItem('password')
    		this.btnSavePass.isChecked = false;
        	//cc.log("huy luu mat khau thanh cong")
    	}
    	if (error) {
            cc.RedT.inGame.notice.show({title:"ĐĂNG NHẬP", text:error});
            return;
        };
    },
	onLoginClick: function() {
		if (this.username.string.length > 32 || this.username.string.length < 3 || this.username.string.match(new RegExp("^[a-zA-Z0-9]+$")) === null){
			cc.RedT.inGame.notice.show({title:"ĐĂNG NHẬP", text:'Tên tài khoản không đúng!!'});
		} else if (this.password.string.length > 32 || this.password.string.length < 6){
			cc.RedT.inGame.notice.show({title:"ĐĂNG NHẬP", text:'Mật khẩu không đúng!!'});
		}else{
			if (this.captcha.node.active === true) {
				if (this.captcha.string.length > 6 || this.captcha.string.length < 4){
					cc.RedT.inGame.notice.show({title:"ĐĂNG NHẬP", text:'Captcha không đúng!!'});
				}else{
					cc.RedT.inGame.auth({authentication:{username:this.username.string, password:this.password.string, captcha:this.captcha.string}});
				}
			}else{
				cc.RedT.inGame.auth({authentication:{username:this.username.string, password:this.password.string}});
			}
		}
	},
	initCaptcha: function(t) {
		this.username.node.y = this.yName+45;
		this.password.node.y = this.yPass+52;
		this.captcha.node.active = true;
		let o = new Image;
		o.src = t;
		o.width = 150;
		o.height = 50;
		setTimeout(function() {
			let t = new cc.Texture2D;
			t.initWithElement(o);
			t.handleLoadedTexture();
			let e = new cc.SpriteFrame(t);
			this.capchaSprite.spriteFrame = e;
		}.bind(this), 10)
	},
	reCaptcha: function(){
		cc.RedT.send({captcha: 'signIn'});
	},
});
