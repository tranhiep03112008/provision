
cc.Class({
	extends: cc.Component,
	play() {
		this.node.runAction(
			cc.sequence(
				cc.scaleTo(0.15, 0.95),
				cc.scaleTo(0.15, 1.1),
			)
		);
	},
	stop(){
		this.node.stopAllActions();
		this.node.scale = 1;
	},
});
