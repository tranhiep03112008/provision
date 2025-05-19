
cc.Class({
	extends: cc.Component,

	properties: {
        bg: cc.Node,
        STT: cc.Label,
		DaiLy: cc.Label,
		NICKNAME: cc.Label,
		Phone: cc.Label,
        Location: cc.Label,
		vip1: cc.Node,
		vip2: cc.Node,
		vip3: cc.Node,
		FB: "",
		Zalo: "",
		Telegram: "",
	},
	init: function(obj, data, index) {
        this.controll = obj;
		this.STT.string      = index+1;
		this.DaiLy.string = data.name;
		this.NICKNAME.string = data.nickname;
        this.Phone.string = data.phone;
        this.Location.string = data.location;
		this.FB = "https://m.me/" + data.fb;
		this.Zalo = "https://zalo.me/" + data.zalo;
		this.Telegram = "https://t.me/" + data.tele;
		if(index == 0 && data.vip > 0){
			this.vip1.active = true;
			var color = new cc.Color(247,237,16);
			this.DaiLy.node.color = color;
		}
		if(index == 1 && data.vip > 0){
			this.vip2.active = true;
			var color = new cc.Color(228,228,228);
			this.DaiLy.node.color = color;
		}
		if(index == 2 && data.vip > 0){
			this.vip3.active = true;
			var color = new cc.Color(247,192,16);
			this.DaiLy.node.color = color;
		}
	},
	onChuyenClick: function(){
		cc.RedT.audio.playClick();
		this.controll.selectDaiLy(this);
	},
	onFBClick: function(){
		cc.sys.openURL(this.FB, '_blank');
	},
	onZaloClick: function(){
		cc.sys.openURL(this.Zalo, '_blank');
	},
	onTeleClick: function(){
		cc.sys.openURL(this.Telegram, '_blank');
	},
});
