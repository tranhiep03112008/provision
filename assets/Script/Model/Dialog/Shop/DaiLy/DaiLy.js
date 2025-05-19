
cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        prefabDaiLy: cc.Prefab
    },
    init(obj){
        this.RedT = obj;
        this.daily_list = [];
    },
    onLoad: function(){
        console.log("onLoad");
    },
    onEnable: function () {
        this.RedT.DaiLy.loadDaiLy();
        console.log("onLoad");
    },
    loadDaiLy: function() {
        if(!this.isLoaded) {
            cc.RedT.send({shop:{get_daily:true}});
        }
    },
    onData: function(data) {
        this.onDaiLy(data);
    },
    onDaiLy: function(data){
        let self  = this;
        self.content.destroyAllChildren();
        let regex = new RegExp("^" + cc.RedT.user.name + "$", 'i');
        this.daily_list = data.map(function(daily, index){
            !self.RedT.ChuyenRed.meDaily && (self.RedT.ChuyenRed.meDaily = regex.test(daily.nickname));
            let item = cc.instantiate(self.prefabDaiLy);
            item = item.getComponent('ChuyenRed_daily');
            item.init(self.RedT.ChuyenRed, daily, index);
            item.bg.active = index%2;
            self.content.addChild(item.node);
            return item;
        });
    },
});
