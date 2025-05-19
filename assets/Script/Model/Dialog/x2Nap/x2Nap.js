cc.Class({
    extends: cc.Component,

    properties: {
        header:    cc.Node,
		TienTrinh:    cc.Node,
		TheLe:   cc.Node,
        isLoad : false,
    },
    // LIFE-CYCLE CALLBACKS:

    init(){
        if(!this.isLoad){
            this.body = [this.TienTrinh, this.TheLe];
            this.header = this.header.children.map(function(obj) {
                return obj.getComponent('itemHeadMenu');
            });     
            this.isLoad = true;   
        }
    },

	onSelectHead: function(event, name){
		this.header.forEach(function(header) {
			if (header.node.name === name) {
				header.select();
			}else{
				header.unselect();
			}
		});
		this.body.forEach(function(body) {
			if (body.name === name) {
				body.active = true;
			}else{
				body.active = false;
			}
		});
	},

	onData: function(data){

	},
});
