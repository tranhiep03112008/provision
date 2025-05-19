
var helper = require('Helper');

cc.Class({
	extends: cc.Component,

	properties: {
		nodeRank: cc.Node,
		nodeNhan: cc.Node,
		vipLevel: cc.Label,
		vipTong:  cc.Label,
		vipHien:  cc.Label,
		vipTiep:  cc.Label,
	},
	init(){
	},
	onEnable: function () {
		this.node.runAction(cc.RedT.inGame.dialog.actionShow);
		this.getLevel();
	},
	getLevel: function(){
		cc.RedT.send({user:{getLevel: true}});
	},
	level: function(data){
		cc.RedT.userData(data);
		cc.RedT.user.vipHT   = data.vipHT-data.vipPre;
		cc.RedT.user.vipNext = data.vipNext-data.vipPre;
		cc.RedT.inGame.header.level(data.level);
		cc.RedT.inGame.header.updateEXP(cc.RedT.user.vipHT, cc.RedT.user.vipNext);
		this.vipLevel.string = 'VIP'+data.level;
		this.vipTong.string  = helper.numberWithCommas(data.vipTL);
		this.vipHien.string  = helper.numberWithCommas(data.vipHT);
		this.vipTiep.string  = helper.numberWithCommas(data.vipNext);
		this.nodeRank.children.forEach(function(rank, index){
			if (rank.name <= data.level) {
				rank.opacity = 255;
				if(rank.name == data.level){
					this.nodeNhan.children[index].children[3].active = true;
				}else{
					this.nodeNhan.children[index].children[3].active = false;
				}
			}else{
				rank.opacity = 99;
				this.nodeNhan.children[index].children[3].active = false;
			}
		}.bind(this));
	},
	onNhanThuong: function(){
		cc.RedT.send({user:{nhanthuong:true}});
	},
});
