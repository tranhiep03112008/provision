
cc.Class({
    extends: cc.Component,

    properties: {
        header: {
            default: null,
            type: cc.Node,
        },
        MuaTheCao: {
            default: null,
            type: cc.Node,
        },
    },
    init(){
        this.MuaTheCao = this.MuaTheCao.getComponent('shopMuaTheCao');
        this.MuaTheCao.init();
        this.body = [this.MuaTheCao];
    },
    onSelectHead: function(event, name){
        Promise.all(this.header.map(function(header) {
            if (header.node.name == name) {
                header.select();
            }else{
                header.unselect();
            }
        }));
        Promise.all(this.body.map(function(body) {
            if (body.node.name == name) {
                body.node.active = true;
            }else{
                body.node.active = false;
            }
        }));
    },
});
