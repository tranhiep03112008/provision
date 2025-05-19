
var Helper = require('Helper');

cc.Class({
	extends: cc.Component,

	properties: {
		content: cc.Node,
	},
	onLoad () {
		this.content = this.content.children.map(function(obj){
			return obj.getComponent('LichSuAll_item');
		});
	},
	onEnable: function () {
		this.get_data();
	},
	get_data: function(page = 1){
		cc.RedT.send({user:{history:{user_history:{page:page}}}});
	},
	onData: function(data){
		this.content.forEach(function(obj, index){
			var dataT = data[index];
			if (void 0 !== dataT) {
				obj.node.active = true;
				obj.MaGD.string = dataT.id;
				obj.Time.string    = Helper.getStringDateByTime(dataT.time);
				obj.DichVu.string = dataT.content;
				obj.PhatSinh.string = Helper.numberWithCommas(dataT.amount);
				if(parseInt(dataT.amount) < 0){
					obj.PhatSinh.node.color = cc.color(195, 9, 9, 255);
				}else{
					obj.PhatSinh.node.color = cc.Color.WHITE;
				}
				obj.SoDu.string    = Helper.numberWithCommas(dataT.balance);
				//obj.Status.string     = dataT.status == 0 ? "Chờ duyệt" : (dataT.status == 1 ? "Thành công" : (dataT.status == 2 ? "Thẻ sai" : ""));
				//obj.Status.node.color = dataT.status == 0 ? cc.color(9, 121, 195, 255) : (dataT.status == 1 ? cc.color(14, 151, 2, 255) : (dataT.status == 2 ? cc.color(195, 9, 9, 255) : cc.color(9, 121, 195, 255)));
			}else{
				obj.node.active = false;
			}
		});
	},
});
