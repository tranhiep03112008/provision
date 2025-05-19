
cc.Class({
	extends: cc.Component,

	properties: {
		header: cc.Node,
		CaNhan: cc.Node,
		//VipPoint: cc.Node,
		KetSat: cc.Node,	
		BaoMat: cc.Node,
		LichSu: cc.Node,
		ThongKe: cc.Node,
	},
	init(){
		this.CaNhan = this.CaNhan.getComponent('CaNhan');
		//this.VipPoint = this.VipPoint.getComponent('VipPoint');
		this.KetSat = this.KetSat.getComponent('KetSat');
		this.BaoMat = this.BaoMat.getComponent('BaoMat');
		this.LichSu = this.LichSu.getComponent('LichSu');
		this.ThongKe = this.ThongKe.getComponent('ThongKe');

		this.CaNhan.init();
		this.KetSat.init();
		this.BaoMat.init();

		this.body = [this.CaNhan, this.KetSat, this.BaoMat, this.LichSu,this.ThongKe];
		this.header = this.header.children.map(function(obj) {
			return obj.getComponent('itemHeadMenu');
		});
	},
	onSelectHead: function(event, name){
		this.header.forEach(function(header) {
			if (header.node.name == name) {
				header.select();
			}else{
				header.unselect();
			}
		});
		this.body.forEach(function(body) {
			if (body.node.name == name) {
				body.node.active = true;
			}else{
				body.node.active = false;
			}
		});
	},
	superView:function(name){
		if(name == "CaNhan"){
			this.onSelectHead(null, "CaNhan");
		}else if(name == "KetSat"){
			this.onSelectHead(null, "KetSat");
		}else if(name == "BaoMat"){
			this.onSelectHead(null, "BaoMat");
		}else if(name == "LichSu"){
			this.onSelectHead(null, "LichSu");
		}
	},
	onData: function(data){
		if (void 0 !== data.history){
			this.LichSu.onData(data.history);
		}
		if (void 0 !== data.the_cao){
			cc.RedT.inGame.dialog.the_cao.onData(data.the_cao);
		}
		if (void 0 !== data.level){
			//this.VipPoint.level(data.level);
		}
	},
});
