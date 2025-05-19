
var NapThe      = require('NapThe');

cc.Class({
	extends: cc.Component,

	properties: {
		NapThe: NapThe,
		//nodeHinhThuc: cc.Node,
		nodeNapThe: cc.Node,
		isLoaded: false,
	},
	init(){
		this.NapThe.init();
		this.nodeNapThe.active = true;
	},
	onEnable: function () {
		this.onBackHinhThuc();
		if (!this.isLoaded) {
			cc.RedT.send({shop:{info_nap:true}});
		}
	},
	onDisable: function () {
        //this.onBackHinhThuc();
    },
	onData: function(data){
		if (void 0 !== data.info && !this.isLoaded){
			this.isLoaded = true;
			if (void 0 !== data.info.nhamang){
				this.NapThe.infoSet(data.info.nhamang, 'nhamangList', 'NhanhMang', true);
			}
			if (void 0 !== data.info.menhgia){
				this.NapThe.infoSet(data.info.menhgia, 'menhgiaList', 'MenhGia');
			}
		}
	},
	onSelecHinhThuc: function(e){
		//this.nodeHinhThuc.active = false;
		let hinhthuc = e.target.name.toLowerCase();
		if (hinhthuc == 'momo') {
			this.nodeNapThe.active = false;
		}else{
			this.nodeNapThe.active = true;
			//this.nodeMoMo.active   = false;
			let list = this.NapThe.scrollviewNhaMang.content.children.filter(function(obj){
				let a = obj.getComponent('NapRed_itemOne');
				let text = a.text.string.toLowerCase();
				return hinhthuc == text;
			});
			if (list.length) {
				let objTele = list[0].getComponent('NapRed_itemOne');
				hinhthuc = objTele.text.string;
				this.NapThe.nhamangList.forEach(function(obj){
		    		if (obj === objTele) {
		    			obj.onSelect();
		    		}else{
		    			obj.unSelect();
		    		}
		    	});
			}
		    this.NapThe.NhanhMang.string = hinhthuc;
		}
	},
	onBackHinhThuc: function(e){
		//this.nodeHinhThuc.active = true;
		//this.nodeNapThe.active   = false;
		//this.nodeMoMo.active     = false;
	},
	onCopyNumber: function(){
		cc.RedT.CopyToClipboard(this.momoSTK.string);
		cc.RedT.inGame.noticeCopy();
	},
	onCopyName: function(){
		cc.RedT.CopyToClipboard(cc.RedT.user.name);
		cc.RedT.inGame.noticeCopy();
	},
});
