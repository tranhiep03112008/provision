
var helper = require('Helper');

cc.Class({
	extends: cc.Component,

	properties: {
		itemPrefab: {
			default: null,
			type: cc.Prefab
		},
		dice: {
			default: [],
			type: cc.Sprite
		},
		leftCuoc: {
			default: null,
			type: cc.Label
		},
		leftTraLai: {
			default: null,
			type: cc.Label
		},
		rightCuoc: {
			default: null,
			type: cc.Label
		},
		rightTraLai: {
			default: null,
			type: cc.Label
		},
		phien: {
			default: null,
			type: cc.Label
		},
		nodeTai: {
			default: null,
			type: cc.Node
		},
		nodeXiu: {
			default: null,
			type: cc.Node
		},
		scrollViewLeft: {
			default: null,
			type: cc.ScrollView
		},
		scrollViewRight: {
			default: null,
			type: cc.ScrollView
		},
		nodeNext: {
			default: null,
			type: cc.Node
		},
		nodePrevious: {
			default: null,
			type: cc.Node
		},
		spacingY:0,
	},
	init(obj){
		this.RedT = obj;
		this.data = null;
		this.isLeftUpdating = false;
		this.lastLeft = 0;
		this.isRightUpdating = false;
		this.lastRight = 0;
	},
	onLoad: function () {
		this.scrollViewLeft.node.on('scroll-to-bottom', this.bootomLeft, this);
		this.scrollViewRight.node.on('scroll-to-bottom', this.bootomRight, this);
	},
	onGetPhienClick: function(event){
		this.getPhien(event.target.phien);
	},
	getPhien: function(phien = null){
		if (!!phien){
			cc.RedT.inGame.loading.active = true;
			cc.RedT.send({taixiu:{get_phien:{phien:phien}}});
			this.lastLeft = this.lastRight = 0;
		}
	},
	onNextClick: function(event){
		this.getPhien(this.isPhien+1);
	},
	onPreviousClick: function(event){
		this.getPhien(this.isPhien-1);
	},
	onData: function(data){
		var self = this;
		this.setNew();
		this.data = data;
		cc.RedT.inGame.loading.active  = false;
		cc.RedT.MiniPanel.Dialog.showTaiXiuLichSuPhien();
		this.leftCuoc.string    = helper.numberWithCommas(data.tong_L);
		this.rightCuoc.string   = helper.numberWithCommas(data.tong_R);
		this.leftTraLai.string  = helper.numberWithCommas(data.tong_tralai_L);
		this.rightTraLai.string = helper.numberWithCommas(data.tong_tralai_R);
		this.phien.string       = data.phien + '  -  ' + helper.getStringDateByTime(data.time);
		this.isPhien            = data.phien;
		var total               = data.dice[0] + data.dice[1] + data.dice[2];
		var phienT = cc.RedT.setting.taixiu.logs[0].phien - data.phien;
		if (phienT > 17) {
			this.nodePrevious.active = false;
		}else{
			this.nodePrevious.active = true;
		}
		if (phienT < 1) {
			this.nodeNext.active = false;
		}else{
			this.nodeNext.active = true;
		}

		this.dice.forEach(function(dice, index){
			var point = data.dice[index];
			dice.spriteFrame = self.RedT.TX_Main.diceSF[point-1];
		});

		this.nodeTai.active = total > 10 ? true : false;
		this.nodeXiu.active = total > 10 ? false : true;
		this.loadLeftData();
		this.loadRightData();
		// data.dataL.forEach(function(obj){
		// 	var item = cc.instantiate(self.itemPrefab)
		// 	var itemComponent = item.getComponent('TaiXiuLichSuPhien_item')
		// 	itemComponent.time.string = helper.getStringHourByTime(obj.time)
		// 	itemComponent.user.string   = obj.name
		// 	itemComponent.cuoc.string   = helper.numberWithCommas(obj.bet)
		// 	itemComponent.tralai.string = helper.numberWithCommas(obj.tralai)
		// 	self.scrollViewLeft.content.addChild(item)
		// });
		// data.dataR.forEach(function(obj){
		// 	var item = cc.instantiate(self.itemPrefab)
		// 	var itemComponent = item.getComponent('TaiXiuLichSuPhien_item')
		// 	itemComponent.time.string = helper.getStringHourByTime(obj.time)
		// 	itemComponent.user.string   = obj.name
		// 	itemComponent.cuoc.string   = helper.numberWithCommas(obj.bet)
		// 	itemComponent.tralai.string = helper.numberWithCommas(obj.tralai)
		// 	self.scrollViewRight.content.addChild(item)
		// });
	},
    bootomLeft: function (scrollView) {
		if(!this.isLeftUpdating){
			this.loadLeftData();
		}
	},
    bootomRight: function (scrollView) {
		if(!this.isRightUpdating){
			this.loadRightData();
		}
	},
	loadLeftData: function(){
		let start = this.lastLeft;
		this.isLeftUpdating = true;
		let max = start + 50;
		if(start >= this.data.dataL.length-50){
			max = this.data.dataL.length;
		}
		for(let i =start ; i < max ; ++ i){
			if(typeof this.data.dataL[i] == 'undefined'){
				break;
			}else{
				let obj = this.data.dataL[i];
				var item = cc.instantiate(this.itemPrefab)
				var itemComponent = item.getComponent('TaiXiuLichSuPhien_item')
				itemComponent.time.string = helper.getStringHourByTime(obj.time)
				itemComponent.user.string   = obj.name
				itemComponent.cuoc.string   = helper.numberWithCommas(obj.bet)
				itemComponent.tralai.string = helper.numberWithCommas(obj.tralai)
				this.scrollViewLeft.content.addChild(item)				
			}						
		}
		this.isLeftUpdating = false;
		this.lastLeft = max;
	},
	loadRightData: function(){
		let start = this.lastRight;
		this.isRightUpdating = true;
		let max = start + 50;
		if(start >= this.data.dataR.length-50){
			max = this.data.dataR.length;
		}
		for(let i =start ; i < max ; ++ i){
			if(typeof this.data.dataR[i] == 'undefined'){
				break;
			}else{
				let obj = this.data.dataR[i];
				var item = cc.instantiate(this.itemPrefab)
				var itemComponent = item.getComponent('TaiXiuLichSuPhien_item')
				itemComponent.time.string = helper.getStringHourByTime(obj.time)
				itemComponent.user.string   = obj.name
				itemComponent.cuoc.string   = helper.numberWithCommas(obj.bet)
				itemComponent.tralai.string = helper.numberWithCommas(obj.tralai)
				this.scrollViewRight.content.addChild(item)				
			}
						
		}
		this.isRightUpdating = false;
		this.lastRight = max;
	},
	setNew: function(){
		this.scrollViewLeft.content.destroyAllChildren();
		this.scrollViewRight.content.destroyAllChildren();
	},
});
