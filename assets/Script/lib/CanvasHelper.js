var CanvasHelper = cc.Class({
    extends: cc.Component,

    properties: {
        currentCanvas: cc.Canvas
    },

    start () {
        this.onResized();
    },

    onResized() {

        if(this.currentCanvas == null) {
            return;
        }

        if(cc.sys.isNative && cc.sys.isMobile) {
            var enabled = cc.view.isAutoFullScreenEnabled();
            if(enabled) {
                cc.view.enableAutoFullScreen(true);
            }
        }

        const deviceSize = cc.view.getFrameSize();
        const ratio = (deviceSize.width/deviceSize.height).toFixed(2);
        const ipadRatio = (16/9).toFixed(2);

        if(ratio < ipadRatio) {
            this.currentCanvas._fitHeight = false;
            this.currentCanvas._fitWidth = true;
        }
        else {
            this.currentCanvas._fitHeight = true;
            this.currentCanvas._fitWidth = false;
        }

        this.currentCanvas.applySettings();
    }
});
