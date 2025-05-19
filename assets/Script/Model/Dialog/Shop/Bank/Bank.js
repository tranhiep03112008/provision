
cc.Class({
	extends: cc.Component,

	properties: {
		header: cc.Node,
		CodePay:    cc.Node,
		MoMoPay:    cc.Node,
	},
	init(){
		this.CodePay = this.CodePay.getComponent('CodePay');
		this.MoMoPay = this.MoMoPay.getComponent('MoMoPay');

		this.body   = [this.CodePay, this.MoMoPay];
		this.header = this.header.children.map(function(obj) {
			return obj.getComponent('itemContentMenu');
		});
	},
	onSelectHead: function(event, name){
		this.header.map(function(header) {
			if (header.node.name == name) {
				header.select();
			}else{
				header.unselect();
			}
		});
		this.body.map(function(body) {
			if (body.node.name == name) {
				body.node.active = true;
			}else{
				body.node.active = false;
			}
		});
	},
	onData: function(data){
		if (!!data.list) {
			this.CodePay.onData(data.list);
		}
		if (void 0 !== data.atm) {
			this.atm.onData(data.atm);
		}
	},
});
