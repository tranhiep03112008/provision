import LZW from "./LZW";

export enum FileType {
    UNKNOWN,
    PNG,
    JPG,
    GIF,
    WEBP
}

export class FileHead {
    static IMAGE_PNG = "89504e47";
    static IMAGE_JPG = "ffd8ff";
    static IMAGE_GIF = "474946";
    /**
     * Webp
     */
    static RIFF = "52494646";
    static WEBP_RIFF = FileHead.RIFF;
    static WEBP_WEBP = "57454250";
}

/**
 * GIF解析
 */
class GIF {

    private _tab: any;
    private _view: Uint8Array;
    private _frame: any;
    private _buffer: ArrayBuffer;
    private _offset: number = 0;
    private _lastData: ImageData;
    private _info: any = {
        header: '',
        frames: [],
        comment: ''
    };

    private _delays: Array<number> = [];
    private _spriteFrames: Array<cc.SpriteFrame> = [];
    private _canvas: HTMLCanvasElement = null;
    private _context: CanvasRenderingContext2D = null;
    public id = "GIF"
    public async = true

    set buffer(buffer: ArrayBuffer) {
        this.clear();
        this._buffer = buffer;
        this._view = new Uint8Array(buffer);
    }

    get buffer() {
        return this._buffer;
    }

    /**
     * 将buffer 解析为gif 核心
     * @param item 
     * @param callback 
     */
    handle(item, callback) {
        this.buffer = item.content
        this.getHeader();
        this.getScrDesc();
        this.getTexture();
        if (this._spriteFrames.length == 0) {
            callback(new Error("gif加载失败,帧长度为0"))
        } else {
            callback(null, { delays: this._delays, spriteFrames: this._spriteFrames, length: this._info.frames.length })
        }
    }

    /**
     * 文件类型识别
     * @param data 
     */
    static detectFormat(data): FileType {
        if (data.indexOf(FileHead.IMAGE_GIF) != -1) {
            return FileType.GIF;
        } else if (data.indexOf(FileHead.IMAGE_PNG) != -1) {
            return FileType.PNG;
        } else if (data.indexOf(FileHead.IMAGE_JPG) != -1) {
            return FileType.JPG;
        } else if (data.indexOf(FileHead.WEBP_RIFF) != -1 && data.indexOf(FileHead.WEBP_WEBP) != -1) {
            return FileType.WEBP;
        } else {
            return FileType.UNKNOWN
        }
    }

    /**
     * 二进制转换为十六进制字符串
     * @param arrBytes 
     */
    static bytes2HexString(arrBytes) {
        var str = "";
        for (var i = 0; i < arrBytes.length; i++) {
            var tmp;
            var num = arrBytes[i];
            if (num < 0) {
                //此处填坑，当byte因为符合位导致数值为负时候，需要对数据进行处理
                tmp = (255 + num + 1).toString(16);
            } else {
                tmp = num.toString(16);
            }
            if (tmp.length == 1) {
                tmp = "0" + tmp;
            }
            str += tmp;
        }
        return str;
    }

    /**
     * 解析GIF得到所有的纹理
     */
    private getTexture() {
        // console.log(this._info)
        let index = 0;
        for (const frame of this._info.frames) {
            this.decodeFrame2Texture(frame, index++);
        }
        // this.getSpriteFrame(0);
    }

    /**
     * 得到对应索引的精灵帧
     * @param index 
     */
    public getSpriteFrame(index) {
        if (this._spriteFrames[index]) return this._spriteFrames[index];
        return this.decodeFrame2Texture(this._info.frames[index], index);
    }

    /**
     * 解析frame数据为ImageData
     * 最耗时的操作(80%耗时归究这里)
     * @param frame frame数据
     */
    private decodeFrame(frame) {
        let imageData = this._context.getImageData(frame.img.x, frame.img.y, frame.img.w, frame.img.h)
        frame.img.m ? this._tab = frame.img.colorTab : this._tab = this._info.colorTab;
        LZW.decode(frame.img.srcBuf, frame.img.codeSize).forEach(function (j, k) {
            imageData.data[k * 4] = this._tab[j * 3];
            imageData.data[k * 4 + 1] = this._tab[j * 3 + 1];
            imageData.data[k * 4 + 2] = this._tab[j * 3 + 2];
            imageData.data[k * 4 + 3] = 255;
            frame.ctrl.t ? (j == frame.ctrl.tranIndex ? imageData.data[k * 4 + 3] = 0 : 0) : 0;
        }.bind(this));

        //测试数据
        // for (var i = 0; i < imageData.data.length; i += 4) {
        //     imageData.data[i + 0] = 255;
        //     imageData.data[i + 1] = 0;
        //     imageData.data[i + 2] = 0;
        //     imageData.data[i + 3] = 255;
        // }
        return imageData;
    }


    /**
     * 合并ImageData数据
     * @param lastImageData 上一帧frame解析出来的ImageData
     * @param curImageData 当前的ImageData
     */
    private mergeFrames(lastImageData, curImageData) {
        let imageData = curImageData;
        if (lastImageData) {
            for (var i = 0; i < imageData.data.length; i += 4) {
                if (imageData.data[i + 3] == 0) {
                    imageData.data[i] = this._lastData.data[i];
                    imageData.data[i + 1] = this._lastData.data[i + 1];
                    imageData.data[i + 2] = this._lastData.data[i + 2];
                    imageData.data[i + 3] = this._lastData.data[i + 3];
                }
            }
        }
        return imageData;
    }


    /**
     * 网页版转换
     * 将DataUrl的数据转换为cc.SpriteFrame
     * @param dataUrl 
     */
    private dataUrl2SpriteFrame(dataUrl) {
        let texture = new cc.Texture2D()
        let spriteFrame = new cc.SpriteFrame();
        let image = new Image();
        image.src = dataUrl;
        texture.initWithElement(image);
        spriteFrame.setTexture(texture);
        return spriteFrame;
    }

    /**
     * native版转换
     * 用renderTexture将二进制数据制作为cc.SpriteFrame
     * @param data 
     * @param w 
     * @param h 
     */
    private date2SpriteFrame(data, w, h) {
        let texture = new cc.RenderTexture();
        let spriteFrame = new cc.SpriteFrame();
        texture.initWithData(data.data, cc.Texture2D.PixelFormat.RGBA8888, w, h);
        spriteFrame.setTexture(texture);
        return spriteFrame;
    }


    /**
     * 图片数据叠加
     * 根据显示模式更新图片数据
     * 模型0 1 叠加图片
     * 模式2 清理画布 显示新的图片
     * 模式3 保持上一个状态
     * 模式4-7 。。。。
     * @param imageData 新数据
     * @param x 左上角横向偏移
     * @param y 左上角纵向偏移
     */
    putImageDataJSB(imageData, x, y, frame) {

        let cheeckNullPixel = () => {
            if (imageData.data[0] == 4
                && imageData.data[1] == 0
                && imageData.data[2] == 0
                && imageData.data[3] == 0) {
                return true
            }
            return false
        }

        let checkAlpha = () => {
            let alphaCount = 0
            for (let i = 0; i < imageData.height; i += 2) {
                let lineCount = 0
                for (let j = 0; j < imageData.width; j++) {
                    let indexData = i * 4 * imageData.width + 4 * j
                    if (imageData.data[indexData + 3] == 0) {
                        lineCount++
                    }
                }
                if (lineCount / imageData.width > 0.1) {
                    alphaCount++
                }
                if (alphaCount / (imageData.height / 2) > 0.6) return true
            }
            return false
        }

        //叠加图形
        let replay = () => {
            for (let i = 0; i < imageData.height; i++) {
                for (let j = 0; j < imageData.width; j++) {
                    let indexData = i * 4 * imageData.width + 4 * j
                    let indexLastData = (i + y) * 4 * this._lastData.width + 4 * (j + x)
                    //新像素点的透明度不是0就替换掉旧像素
                    if (imageData.data[indexData + 3] != 0) {
                        this._lastData.data[indexLastData] = imageData.data[indexData]
                        this._lastData.data[indexLastData + 1] = imageData.data[indexData + 1]
                        this._lastData.data[indexLastData + 2] = imageData.data[indexData + 2]
                        this._lastData.data[indexLastData + 3] = imageData.data[indexData + 3]
                    }
                }
            }
        }

        //清理画布从新绘制
        let clearAndReplay = () => {
            for (let i = 0; i < this._lastData.height; i++) {
                for (let j = 0; j < this._lastData.width; j++) {
                    let indexLastData = i * 4 * this._lastData.width + 4 * j
                    let indexData = (i - y) * 4 * imageData.width + 4 * (j - x)
                    let clear = false
                    if (j < x || j > (x + imageData.width)) {
                        clear = true
                    }
                    if (i < y || i > (y + imageData.height)) {
                        clear = true
                    }
                    if (clear) {
                        this._lastData.data[indexLastData + 0] = 0;
                        this._lastData.data[indexLastData + 1] = 0;
                        this._lastData.data[indexLastData + 2] = 0;
                        this._lastData.data[indexLastData + 3] = 0;
                    } else {
                        this._lastData.data[indexLastData + 0] = imageData.data[indexData + 0]
                        this._lastData.data[indexLastData + 1] = imageData.data[indexData + 1]
                        this._lastData.data[indexLastData + 2] = imageData.data[indexData + 2]
                        this._lastData.data[indexLastData + 3] = imageData.data[indexData + 3]
                    }
                }

            }
        }

        //如果和上一帧一样的不更新画布
        if (cheeckNullPixel()) {
            return
        }

        if (frame.ctrl.disp == 1 || frame.ctrl.disp == 0) {
            //显示模式1 叠加图片
            replay()
        } else if (frame.ctrl.disp == 2) {
            //显示模式2 清理画布显示新的
            clearAndReplay()
        } else {
            if (checkAlpha()) {
                clearAndReplay()
            } else {
                replay()
            }
        }
    }

    /**
     * 模型0 1 叠加图片
     * 模式2 清理画布 显示新的图片
     * 模式3 保持上一个状态
     * 模式4-7 。。。。
     * @param imageData 
     * @param frame 
     */
    putImageDataWeb(imageData, frame) {
        let finalImageData
        if (frame.ctrl.disp == 1 || frame.ctrl.disp == 0) {
            //叠加图形
            // 3、将当前frame的ImageData设置到canvas上（必须,否则会因为ImageData的尺寸大小可能不一样造成拉伸等错乱现象）
            this._context.putImageData(imageData, frame.img.x, frame.img.y, 0, 0, frame.img.w, frame.img.h);
            // 4、把当前imageData和上一帧imageData合并（必须，因为GIF的当前帧可能只提供了像素发生变化位置的信息）
            let curImageData = this._context.getImageData(0, 0, this._canvas.width, this._canvas.height);
            let lastImageData = this._lastData;
            finalImageData = this.mergeFrames(lastImageData, curImageData);
        } else {
            //清理画布从新绘制
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
            // 3、将当前frame的ImageData设置到canvas上（必须,否则会因为ImageData的尺寸大小可能不一样造成拉伸等错乱现象）
            this._context.putImageData(imageData, frame.img.x, frame.img.y, 0, 0, frame.img.w, frame.img.h);
            // 4、把当前imageData和上一帧imageData合并（必须，因为GIF的当前帧可能只提供了像素发生变化位置的信息）
            finalImageData = this._context.getImageData(0, 0, this._canvas.width, this._canvas.height);
        }
        // 5、把最终的ImageData设置到canvas上（形成合成之后的最终图像）
        this._context.putImageData(finalImageData, 0, 0);
        this._lastData = finalImageData;
        return this._canvas.toDataURL();
    }

    /**
     * 将frame数据转化为cc.Texture
     * @param frame 当前frame的数据
     * @param index 当前frame的顺序
     */
    private decodeFrame2Texture(frame, index) {
        // 1、初始化canvas的相关信息
        if (!this._context) {
            this._canvas = document.createElement('canvas');
            this._context = this._canvas.getContext('2d');
            this._canvas.width = frame.img.w;
            this._canvas.height = frame.img.h;
        }

        // 2、解析当前frame的ImageData数据（frame中存在的IamgeData数据）
        let imageData = this.decodeFrame(frame);
        this._delays[index] = frame.ctrl.delay;

        if (CC_JSB) {
            //原生平台
            if (!this._lastData) {
                this._lastData = imageData
            } else {
                this.putImageDataJSB(imageData, frame.img.x, frame.img.y, frame);
            }
            this._spriteFrames[index] = this.date2SpriteFrame(this._lastData, this._canvas.width, this._canvas.height);
        } else {
            //web平台
            let dataUrl = this.putImageDataWeb(imageData, frame)
            this._spriteFrames[index] = this.dataUrl2SpriteFrame(dataUrl);
        }

        return this._spriteFrames[index];
    }


    /**
     * 读文件流
     * @param len 读取的长度
     */
    private read(len) {
        return this._view.slice(this._offset, this._offset += len);
    }

    /**
     * 获取文件头部分(Header)
     * GIF署名(Signature)和版本号(Version)
     */
    private getHeader() {
        this._info.header = '';
        this.read(6).forEach(function (e, i, arr) {
            this._info.header += String.fromCharCode(e);
        }.bind(this));
    }

    /**
     * 获取逻辑屏幕标识符(Logical Screen Descriptor)
     * GIF数据流部分(GIF Data Stream)
     */
    private getScrDesc() {
        // await 0;
        var arr = this.read(7), i;
        this._info.w = arr[0] + (arr[1] << 8);
        this._info.h = arr[2] + (arr[3] << 8);
        this._info.m = 1 & arr[4] >> 7;
        this._info.cr = 7 & arr[4] >> 4;
        this._info.s = 1 & arr[4] >> 3;
        this._info.pixel = arr[4] & 0x07;
        this._info.bgColor = arr[5];
        this._info.radio = arr[6];
        if (this._info.m) {
            this._info.colorTab = this.read((2 << this._info.pixel) * 3);
        }
        this.decode();
    }


    /**
     * 解析GIF数据流
     */
    private decode() {
        let srcBuf = [];
        let arr = this.read(1);

        switch (arr[0]) {
            case 33: //扩展块
                this.extension();
                break;
            case 44: //图象标识符
                arr = this.read(9);
                this._frame.img = {
                    x: arr[0] + (arr[1] << 8),
                    y: arr[2] + (arr[3] << 8),
                    w: arr[4] + (arr[5] << 8),
                    h: arr[6] + (arr[7] << 8),
                    colorTab: 0
                };
                this._frame.img.m = 1 & arr[8] >> 7;
                this._frame.img.i = 1 & arr[8] >> 6;
                this._frame.img.s = 1 & arr[8] >> 5;
                this._frame.img.r = 3 & arr[8] >> 3;
                this._frame.img.pixel = arr[8] & 0x07;
                if (this._frame.img.m) {
                    this._frame.img.colorTab = this.read((2 << this._frame.img.pixel) * 3);
                }
                this._frame.img.codeSize = this.read(1)[0];
                srcBuf = [];
                while (1) {
                    arr = this.read(1);
                    if (arr[0]) {
                        this.read(arr[0]).forEach(function (e, i, arr) {
                            srcBuf.push(e);
                        });
                    } else {
                        this._frame.img.srcBuf = srcBuf;
                        this.decode();
                        break;
                    }
                };
                break;
            case 59:
                console.log('The end.', this._offset, this.buffer.byteLength)
                break;
            default:
                // console.log(arr);
                break;
        }
    }


    /**
     * 扩展块部分
     */
    private extension() {
        var arr = this.read(1), o, s;
        switch (arr[0]) {
            case 255: //应用程序扩展
                if (this.read(1)[0] == 11) {
                    this._info.appVersion = '';
                    this.read(11).forEach(function (e, i, arr) {
                        this._info.appVersion += String.fromCharCode(e);
                    }.bind(this));
                    while (1) {
                        arr = this.read(1);
                        if (arr[0]) {
                            this.read(arr[0]);
                        } else {
                            this.decode();
                            break;
                        }
                    };
                } else {
                    throw new Error('解析出错');
                }
                break;
            case 249: //图形控制扩展
                if (this.read(1)[0] == 4) {
                    arr = this.read(4);
                    this._frame = {};
                    this._frame.ctrl = {
                        disp: 7 & arr[0] >> 2,
                        i: 1 & arr[0] >> 1,
                        t: arr[0] & 0x01,
                        delay: arr[1] + (arr[2] << 8),
                        tranIndex: arr[3]
                    };
                    this._info.frames.push(this._frame);
                    if (this.read(1)[0] == 0) {
                        this.decode();
                    } else {
                        throw new Error('解析出错');
                    }
                } else {
                    throw new Error('解析出错');
                }
                break;
            case 254: //注释块
                arr = this.read(1);
                if (arr[0]) {
                    this.read(arr[0]).forEach(function (e, i, arr) {
                        this._info.comment += String.fromCharCode(e);
                    });
                    if (this.read(1)[0] == 0) {
                        this.decode();
                    };
                }
                break;
            default:
                // console.log(arr);
                break;
        }
    }


    /**
     * 初始化参数
     */
    private clear() {
        this._tab = null;
        this._view = null;
        this._frame = null;
        this._offset = 0;
        this._info = {
            header: '',
            frames: [],
            comment: ''
        };
        this._lastData = null;
        this._delays = [];
        this._spriteFrames = [];
        this._canvas = null;
        this._context = null;
    }

}


/**
 * gif缓存系统
 * 资源再利用
 */
class GIFCache {
    private static instance: GIFCache = null;
    gifFrameMap = {}

    static getInstance() {
        if (!GIFCache.instance) {
            GIFCache.instance = new GIFCache();
            /** 注册gif格式图片为自己的加载器*/
            cc.loader.addDownloadHandlers({ "gif": cc.loader.downloader["extMap"].binary });
            cc.loader.addLoadHandlers({
                "gif": function (item, callback) {
                    let gif = new GIF();
                    gif.handle(item, callback)
                }
            })
        }
        return GIFCache.instance;
    }

    preloadGif(data) {
        try {
            if (data.words) {
                data.words.forEach(item => {
                    if (item.indexOf(".gif") != -1)
                        cc.loader.load(item.img, (error, data) => { })
                });
            }
            if (data.classes) {
                data.classes.forEach(item => {
                    if (item.indexOf(".gif") != -1)
                        cc.loader.load(item.img, (error, data) => { })
                });
            }
        } catch (e) {
            cc.log(e)
        }
    }

    addItemFrame(key: any, frameData: GIFFrameData) {
        if (this.has(key) == true) {
            let item = this.get(key)
            item.referenceCount++
            item.frameData = frameData
        } else {
            let gifCaheItem = { referenceCount: 0, type: FileType.GIF, frame: {} }
            this.gifFrameMap[key] = gifCaheItem
        }
    }


    addItemType(key: any, type: FileType) {
        if (this.has(key)) {
            let item = this.get(key)
            item.type = type
        } else {
            let gifCaheItem = { referenceCount: 0, type: type, frame: null }
            this.gifFrameMap[key] = gifCaheItem
        }
    }

    add(key: any, value: GIFCaheItem) {
        if (!this.has(key)) {
            this.gifFrameMap[key] = value
        }
    }

    get(key: any): GIFCaheItem {
        return this.gifFrameMap[key]
    }


    has(key: any): boolean {
        if (this.gifFrameMap[key] == undefined) {
            return false
        }
        return true
    }

    hasFrame(key: any) {
        let item = this.get(key)
        if (item != undefined) {
            let itemFrame = item.frameData
            if (itemFrame != null) {
                return true
            }
        }
        return false
    }

    /**
     * onDestroy 释放资源
     * 资源引用计数为0的时候释放资源
     * @param key 
     */
    relase(key: any) {
        if (this.has(key)) {
            this.gifFrameMap[key] = undefined
            cc.loader.release(key)
        }
    }

    releaseAll() {
        for (const key in this.gifFrameMap) {
            cc.loader.release(key)
        }
        this.gifFrameMap = {}
    }
}

/**
 * gif资源
 */
interface GIFFrameData {
    /*每一帧延时 */
    delays: Array<number>,

    spriteFrames: Array<cc.SpriteFrame>,
    length: number
}

interface GIFCaheItem {
    /*资源引用计数*/
    referenceCount: number,
    /*文件类型*/
    type: FileType,
    /*gif解析后的数据 */
    frameData: GIFFrameData
}

export { GIF, GIFCache, GIFFrameData, GIFCaheItem }
