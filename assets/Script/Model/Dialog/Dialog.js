
var signIn     = require('SignIn'),
	signUp     = require('SignUp'),
	forGotPass = require('ForGotPass'),
	signName   = require('SignName'),
	shop       = require('Shop'),
	profile    = require('Profile'),
	//lichSuGiaoDich   = require('LichSu'),
	Settings   = require('Settings'),
	the_cao    = require('TheCao'),
	GiftCode   = require('GiftCode'),
	DEvent     = require('DEvent'),
	PokerNap   = require('PokerNap'),
	iMessage  = require('iMessage'),
	x2Nap  = require('x2Nap');
	//VipPoint  = require('VipPoint');

cc.Class({
	extends: cc.Component,
	properties: {
		signIn:     signIn,
		signUp:     signUp,
		ForGotPass: forGotPass,
		signName:   signName,
		shop:       shop,
		profile:    profile,
		//lichSuGiaoDich : lichSuGiaoDich,
		the_cao:    the_cao,
		settings:   Settings,
		GiftCode:   GiftCode,
		DEvent:     DEvent,
		PokerNap:   PokerNap,
		iMessage:  iMessage,
		Eventx2Nap:  cc.Node,
		x2Nap : x2Nap,
		VipPoint : cc.Node,
	},
	init: function() {
		this.VipPoint = this.VipPoint.getComponent('VipPoint');
		this.actionShow = cc.spawn(cc.scaleTo(0.5, 1).easing(cc.easeBackOut(2.5)), cc.fadeTo(0.5, 255));
		this.objShow    = null;
		this.objTmp     = null;
		this.shop.init();
		this.profile.init();
		this.the_cao.init();
	},

	onClickBack: function(){
		cc.RedT.audio.playUnClick();
		this.onBack();
	},
	onBack: function(){
		if(this.objShow != null){
			if(void 0 == this.objShow.previous || null == this.objShow.previous){
				this.objShow.active = false;
				this.node.active    = false;
				this.objShow        = null;
			}else{
				this.objTmp              = this.objShow;
				this.objShow             = this.objShow.previous;
				this.objTmp.previous     = null;
				this.objTmp.active       = false;
				this.objShow.active      = true;
				this.objTmp              = null;
			}
		}else{
			this.node.active = false;
		}
	},
	onClosePrevious: function(obj){
		if(void 0 !== obj.previous && null !== obj.previous){
			this.onClosePrevious(obj.previous);
			delete obj.previous;
			//obj.previous = null;
		}
		obj.active = false;
	},
	onCloseDialog: function(){
		if(this.objShow != null){
			if(void 0 == this.objShow.previous || null == this.objShow.previous){
				this.objShow.active = this.node.active = false;
				this.objShow        = null;
			}else{
				this.onClosePrevious(this.objShow.previous);
				this.objShow.active          = this.node.active = false;
				delete this.objShow.previous;
				//this.objShow.previous        = null;
				this.objShow                 = null;
			}
		}else{
			this.node.active = false
		}
	},

	resetSizeDialog: function(node){
		node.stopAllActions();
		node.scale   = 0.5;
		node.opacity = 0;
	},

	/**
	 * Function Show Dialog
	*/
	showSignIn: function(){
		this.node.active = this.signIn.node.active = true;
		this.objShow     = this.signIn.node;
	},
	showSignInToUp: function(){
		this.objShow.active = false;
		this.signUp.node.previous = this.objShow;
		this.showSignUp();
	},
	showSignUp: function(){
		this.node.active = this.signUp.node.active = true;
		this.objShow     = this.signUp.node;
	},
	showForGotPass: function(){
		if(this.objShow){
			this.objShow.active = false;
			this.ForGotPass.node.previous = this.objShow;
		}
		this.node.active = this.ForGotPass.node.active = true;
		this.objShow     = this.ForGotPass.node;
	},
	showSignName: function(){
		this.node.active        = this.signName.node.active = true;
		this.signUp.node.active = this.signIn.node.active   = false;
		this.objShow            = this.signName.node;
	},
    showShop: function (event, name) {
        if (cc.RedT.IS_LOGIN) {
		this.node.active = this.shop.node.active = true;
		this.objShow     = this.shop.node;
            this.shop.superView(name);
        } else {
            this.showSignIn();
        }
	},
	showProfile: function(event, name){
		this.node.active = this.profile.node.active = true;
		this.objShow     = this.profile.node;
		this.profile.superView(name);
	},
	showSetting: function(event){
		this.node.active = this.settings.node.active = true;
		this.objShow     = this.settings.node;
	},
	showGiftCode: function(event){
		if (cc.RedT.IS_LOGIN) {
			this.node.active = this.GiftCode.node.active = true;
			this.objShow     = this.GiftCode.node;
		}else{
			this.showSignIn();
		}
	},
	showDEvent: function(event){
		if (cc.RedT.IS_LOGIN) {
			this.node.active = this.DEvent.node.active = true;
			this.objShow     = this.DEvent.node;
		}else{
			this.showSignIn();
		}
	},
	showPokerNap: function(obj){
		this.node.active = this.PokerNap.node.active = true;
		this.objShow     = this.PokerNap.node;
		this.PokerNap.init(obj);
	},
	showiMessage: function(obj){
		this.node.active = this.iMessage.node.active = true;
		this.objShow     = this.iMessage.node;
	},
	showLichSuGiaoDich: function(obj,name){
		// if (cc.RedT.IS_LOGIN) {
		// this.node.active = this.lichSuGiaoDich.node.active = true;
		// this.objShow     = this.lichSuGiaoDich.node;
		// this.lichSuGiaoDich.superView(name);
		// }else{
		// 	this.showSignIn();
		// }
	},
	showEventx2Nap: function(obj,name){
		if (cc.RedT.IS_LOGIN) {
		this.node.active = this.Eventx2Nap.active = true;
		this.objShow     = this.Eventx2Nap;
		//this.lichSuGiaoDich.superView(name);
		}else{
			this.showSignIn();
		}
	},
	showx2Nap: function(obj){
		this.node.active = this.x2Nap.node.active = true;
		this.objShow     = this.x2Nap.node;
		this.x2Nap.init(obj);
	},
	showVipPoint: function(obj){
		if(this.objShow){
			this.objShow.active = false;
			this.VipPoint.node.previous = this.objShow;
		}
		this.node.active = this.VipPoint.node.active = true;
		this.objShow     = this.VipPoint.node;
		//this.VipPoint.init(obj);
	},
});
