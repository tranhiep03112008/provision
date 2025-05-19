
cc.Class({
	extends: cc.Sprite,

	properties: {
		BgOn: {
			default: null,
			type: cc.SpriteFrame,
		},
		BgOff: {
			default: null,
			type: cc.SpriteFrame,
		},
		isChecked: false,
	},
	onLoad() {
		this.OnUpdate();
	},

	OnChangerClick: function() {
		this.isChecked = !this.isChecked;
		this.OnUpdate();
	},
	OnUpdate: function() {
		if(!this.isChecked){
			this.spriteFrame = this.BgOff;
		}else{
			this.spriteFrame = this.BgOn;
		}
	},
});
