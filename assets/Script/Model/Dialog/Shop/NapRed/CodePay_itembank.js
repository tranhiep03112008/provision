
cc.Class({
    extends: cc.Component,

    properties: {
    	background: {
            default: null,
            type: cc.Node,
        },
        text: {
            default: null,
            type: cc.Label,
        },
        value: '',
    },

    init:function(obj, i_arg, i_text,i_value, fclick = null) {
    	this.controll   = obj;
    	this.local_arg  = i_arg;
    	this.local_text = i_text;
        this.local_value = i_value;
        fclick !== null && (this.local_click = fclick)
    },
    onClickChanger: function(){
    	cc.RedT.audio.playClick();
    	this.controll[this.local_text].string = this.text.string;
        this.controll[this.local_value] = this.value;
    	this.controll[this.local_arg].forEach(function(obj){
    		if (obj === this) {
    			obj.onSelect()
    		}else{
    			obj.unSelect()
    		}
    	}.bind(this));
        if (!!this.controll.backT) {
            this.controll.backT(this.data);
        }
        if (this.local_click !== void 0) {
            this.controll[this.local_click](this);
        }
    },
    onSelect: function(){
        this.background.active = true;
    	this.node.pauseSystemEvents();
    },
    unSelect: function(){
        this.background.active = false;
    	this.node.resumeSystemEvents();
    },
});
