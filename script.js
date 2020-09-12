var canvas;
var data = new Array();

//フレーム用オブジェクト
var frame = new Object();
frame.P = new Array();//フレームの角オブジェクト
for (var i = 0; i < 4; i++)
    frame.P[i] = new Array();
frame.SelectP = -1;//ドラッグされている角
frame.X_axis = 1;//x軸データ
frame.Y_axis = 2;//y軸データ
frame.line = new Array();//フレーム枠線オブジェクト
frame.label = new Array();//フレーム値範囲オブジェクト
var range = 15;//canvas範囲
var dataMesh = new Array();//データ点オブジェクト

//ズーム用オブジェクト
var zoom = new Object();
zoom.line = new Array();
zoom.On = false;

var d = new Object();
d.xmin = 0;
d.xmax = 0;
d.ymin = 0;
d.ymax = 0;

/* 設定値 */
frame.X = -10;//フレーム座標
frame.Y = -10;
frame.Width = 20;//フレームサイズ
frame.Height = 20;
frame.xmin = 0;//フレーム値範囲
frame.ymin = 0;
frame.xmax = 100;
frame.ymax = 100;
var pointSize = 0.25;//プロット点の半径
var maxCol = 0;//列の最大数
//背景色
var backcol = 0xffffff;
//プロット点色
var pointcol = 0xff0000;
//文字列プロパティ
var param = {
    size: 1, height: 0, curveSegments: 3,
    font: "helvetiker", weight: "normal", style: "normal",
    bevelThickness: 1, bevelSize: 2, bevelEnabled: false
};

var resize = function () {
    //container.clientWidth = parseInt(window.innerWidth * 0.9);
    //container.clientHeight = parseInt(window.innerHeight * 0.9);
    //width = canvas.container.clientWidth;
    //height = canvas.container.clientHeight;
    canvas.Width = window.innerWidth;
    canvas.Height = window.innerHeight;
    //alert(container.clientWidth);
    //スクリーンサイズ変更
    canvas.renderer.setSize(canvas.Width, canvas.Height);
    //カメラ設定
    canvas.camera.left = -range * canvas.Width / canvas.Height0;
    canvas.camera.right = range * canvas.Width / canvas.Height0;
    canvas.camera.top = range * canvas.Height / canvas.Height0;
    canvas.camera.bottom = -range * canvas.Height / canvas.Height0;
    canvas.camera.updateProjectionMatrix();

};

var plotData = function (length, color) {
    for (var i = dataMesh.length - 1; i >= length; i--) {
        canvas.scene.remove(dataMesh[i]);
        delete dataMesh[i];
        dataMesh.splice(i, 1);
    }
    //初期化
    if (length === 0) {
        maxCol = 0;
        d.xmin = data[0][frame.X_axis];
        d.xmax = data[0][frame.X_axis];
        d.ymin = data[0][frame.Y_axis];
        d.ymax = data[0][frame.Y_axis];
    }
    //設定
    for (var i = length; i < data.length; i++) {
        if (maxCol < data[i].length)
            maxCol = data[i].length;
        if (data[i][frame.X_axis] < d.xmin)
            d.xmin = data[i][frame.X_axis];
        if (data[i][frame.X_axis] > d.xmax)
            d.xmax = data[i][frame.X_axis];
        if (data[i][frame.Y_axis] < d.ymin)
            d.ymin = data[i][frame.Y_axis];
        if (data[i][frame.Y_axis] > d.ymax)
            d.ymax = data[i][frame.Y_axis];
    }
    if (length === 0) {
        frame.xmin = d.xmin - (d.xmax - d.xmin) / 20;
        frame.xmax = d.xmax + (d.xmax - d.xmin) / 20;
        frame.ymin = d.ymin - (d.ymax - d.ymin) / 20;
        frame.ymax = d.ymax + (d.ymax - d.ymin) / 20;
    }

    for (var i = length; i < data.length; i++) {
        var material = new THREE.MeshBasicMaterial({color: color});
        var geometry = new THREE.CircleGeometry(pointSize, 4);//ひし形
        dataMesh[i] = new THREE.Mesh(geometry, material);
        dataMesh[i].X = data[i][frame.X_axis];
        dataMesh[i].Y = data[i][frame.Y_axis];
        dataMesh[i].Color = color;
        var pos = DataToFrame(dataMesh[i].X, dataMesh[i].Y);
        dataMesh[i].position.x = pos.X;
        dataMesh[i].position.y = pos.Y;
        if (frame.X <= pos.X && pos.X <= frame.X + frame.Width) {
            if (frame.Y <= pos.Y && pos.Y <= frame.Y + frame.Height) {
                canvas.scene.add(dataMesh[i]);
            }
        }
    }

};

var replotData = function () {
    for (var i = 0; i < dataMesh.length; i++) {
        var pos = DataToFrame(dataMesh[i].X, dataMesh[i].Y);
        dataMesh[i].position.x = pos.X;
        dataMesh[i].position.y = pos.Y;
        canvas.scene.remove(dataMesh[i]);
        if (frame.X <= pos.X && pos.X <= frame.X + frame.Width) {
            if (frame.Y <= pos.Y && pos.Y <= frame.Y + frame.Height) {
                canvas.scene.add(dataMesh[i]);
            }
        }
    }
};

var ElementToCanvas = function (x, y) {
    var X = x / canvas.Width * (canvas.camera.right - canvas.camera.left) + canvas.camera.left;
    var Y = -y / canvas.Height * (canvas.camera.top - canvas.camera.bottom) + canvas.camera.top;
    return {X: X, Y: Y};
};

var CanvasToFrame = function (x, y) {
    var X = (x - frame.X) / frame.Width * (frame.xmax - frame.xmin) + frame.xmin;
    var Y = (y - frame.Y) / frame.Height * (frame.ymax - frame.ymin) + frame.ymin;
    return {X: X, Y: Y};
};

var DataToFrame = function (x, y) {
    var X = (x - frame.xmin) / (frame.xmax - frame.xmin) * frame.Width + frame.X;
    var Y = (y - frame.ymin) / (frame.ymax - frame.ymin) * frame.Height + frame.Y;
    return {X: X, Y: Y};
};

var CanvasToElement = function (x, y) {
    var X = (x - canvas.camera.left) / (canvas.camera.right - canvas.camera.left) * canvas.Width;
    var Y = -(y - canvas.camera.top) / (canvas.camera.top - canvas.camera.bottom) * canvas.Height;
    return {X: X, Y: Y};
};


var drawFrame = function (wmin, wmax, hmin, hmax) {
    frame.X = wmin;
    frame.Y = hmin;
    frame.Width = wmax - wmin;
    frame.Height = hmax - hmin;
    frame.P[0][0] = wmin;
    frame.P[0][1] = hmin;
    frame.P[1][0] = wmax;
    frame.P[1][1] = hmin;
    frame.P[2][0] = wmax;
    frame.P[2][1] = hmax;
    frame.P[3][0] = wmin;
    frame.P[3][1] = hmax;
    for (var i = 0; i < 4; i++) {
        canvas.scene.remove(frame.line[i]);
        delete frame.line[i];
        frame.line[i] = new THREE.Line();
    }
    frame.line[0].geometry.vertices[0] = new THREE.Vector3(wmin, hmin, 0);
    frame.line[0].geometry.vertices[1] = new THREE.Vector3(wmax, hmin, 0);
    frame.line[0].material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 2});
    frame.line[1].geometry.vertices[0] = new THREE.Vector3(wmax, hmin, 0);
    frame.line[1].geometry.vertices[1] = new THREE.Vector3(wmax, hmax, 0);
    frame.line[1].material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 2});
    frame.line[2].geometry.vertices[0] = new THREE.Vector3(wmax, hmax, 0);
    frame.line[2].geometry.vertices[1] = new THREE.Vector3(wmin, hmax, 0);
    frame.line[2].material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 2});
    frame.line[3].geometry.vertices[0] = new THREE.Vector3(wmin, hmax, 0);
    frame.line[3].geometry.vertices[1] = new THREE.Vector3(wmin, hmin, 0);
    frame.line[3].material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 2});
    for (var i = 0; i < 4; i++)
        canvas.scene.add(frame.line[i]);

    var minXY = CanvasToElement(frame.X, frame.Y);
    var maxXY = CanvasToElement(frame.X + frame.Width, frame.Y + frame.Height);
    $("#xmin").offset({left: minXY.X + $("#canvas").offset().left, top: minXY.Y + $("#canvas").offset().top});
    $("#xmin").text(frame.xmin.toPrecision(3));
    $("#xmax").offset({left: maxXY.X + $("#canvas").offset().left, top: minXY.Y + $("#canvas").offset().top});
    $("#xmax").text(frame.xmax.toPrecision(3));
    $("#ymin").offset({left: minXY.X + $("#canvas").offset().left - 30, top: minXY.Y + $("#canvas").offset().top - 15});
    $("#ymin").text(frame.ymin.toPrecision(3));
    $("#ymax").offset({left: minXY.X + $("#canvas").offset().left - 30, top: maxXY.Y + $("#canvas").offset().top - 15});
    $("#ymax").text(frame.ymax.toPrecision(3));

    /*for (var i = 0; i < 4; i++) {
     canvas.scene.remove(frame.label[i]);
     delete frame.label[i];
     }
     frame.label[0] = new THREE.Mesh(new THREE.TextGeometry(frame.xmin.toPrecision(3), param), new THREE.MeshLambertMaterial({color: 0x000000}));
     frame.label[0].position.set(wmin, hmin, 0);
     frame.label[1] = new THREE.Mesh(new THREE.TextGeometry(frame.xmax.toPrecision(3), param), new THREE.MeshLambertMaterial({color: 0x000000}));
     frame.label[1].position.set(wmax, hmin, 0);
     frame.label[2] = new THREE.Mesh(new THREE.TextGeometry(frame.ymin.toPrecision(3), param), new THREE.MeshLambertMaterial({color: 0x000000}));
     frame.label[2].position.set(wmin, hmin, 0);
     frame.label[3] = new THREE.Mesh(new THREE.TextGeometry(frame.ymax.toPrecision(3), param), new THREE.MeshLambertMaterial({color: 0x000000}));
     frame.label[3].position.set(wmin, hmax, 0);
     for (var i = 0; i < 4; i++)
     canvas.scene.add(frame.label[i]);*/
};


var drawZoom = function (wmin, wmax, hmin, hmax) {
    for (var i = 0; i < 4; i++) {
        canvas.scene.remove(zoom.line[i]);
        delete zoom.line[i];
        zoom.line[i] = new THREE.Line();
    }
    zoom.line[0].geometry.vertices[0] = new THREE.Vector3(wmin, hmin, 0);
    zoom.line[0].geometry.vertices[1] = new THREE.Vector3(wmax, hmin, 0);
    zoom.line[0].material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 2});
    zoom.line[1].geometry.vertices[0] = new THREE.Vector3(wmax, hmin, 0);
    zoom.line[1].geometry.vertices[1] = new THREE.Vector3(wmax, hmax, 0);
    zoom.line[1].material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 2});
    zoom.line[2].geometry.vertices[0] = new THREE.Vector3(wmax, hmax, 0);
    zoom.line[2].geometry.vertices[1] = new THREE.Vector3(wmin, hmax, 0);
    zoom.line[2].material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 2});
    zoom.line[3].geometry.vertices[0] = new THREE.Vector3(wmin, hmax, 0);
    zoom.line[3].geometry.vertices[1] = new THREE.Vector3(wmin, hmin, 0);
    zoom.line[3].material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 2});
    for (var i = 0; i < 4; i++)
        canvas.scene.add(zoom.line[i]);
};

var init = function () {

    var canvasInit = function (id) {

        /* キャンバス生成 */
        var container = document.getElementById(id);

        /* レンダラー生成 */
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(backcol);
        container.appendChild(renderer.domElement);
        /* カメラ生成(両キャンバスで共通) */
        //カメラが写す範囲(OrthographicCamera)
        var camera = new THREE.OrthographicCamera(-range * window.innerWidth / window.innerHeight, range * window.innerWidth / window.innerHeight, range, -range); //正投影
        camera.position.set(0, 0, 50);
        /* シーン生成 */
        var scene = new THREE.Scene();
        /* 平行光源設定 */
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z).normalize();
        scene.add(directionalLight);

        return {container: container, renderer: renderer, scene: scene, camera: camera, directionalLight: directionalLight};
    };
    /* キャンバス初期化 */
    canvas = canvasInit("canvas");
    canvas.Width0 = window.innerWidth;
    canvas.Height0 = window.innerHeight;
    canvas.Width = window.innerWidth;
    canvas.Height = window.innerHeight;
    //canvas.camera = camera;//※オブジェクトは参照渡し

    drawFrame(frame.X, frame.X + frame.Width, frame.Y, frame.Y + frame.Height);
    /* イベントハンドラ登録 */
    window.addEventListener('resize', resize, false);
    //window.addEventListener('resize', resize, false);
    var mousedown = false;
    var click_i = -1;
    var premouse;
    canvas.container.addEventListener('mousedown', function (e) {
        if (e.button === 0) {//中ボタンが押されている場合
            mousedown = true;
            var mouse = ElementToCanvas(e.offsetX, e.offsetY);
            var r = 1;
            var d2;
            for (var i = 0; i < 4; i++) {
                d2 = (mouse.X - frame.P[i][0]) * (mouse.X - frame.P[i][0]) + (mouse.Y - frame.P[i][1]) * (mouse.Y - frame.P[i][1]);
                if (d2 < r * r) {
                    frame.SelectP = i;
                    return;
                }
            }
            premouse = ElementToCanvas(e.offsetX, e.offsetY);
            for (var i = 0; i < data.length; i++) {
                if (frame.X <= dataMesh[i].position.x && dataMesh[i].position.x <= frame.X + frame.Width) {
                    if (frame.Y <= dataMesh[i].position.y && dataMesh[i].position.y <= frame.Y + frame.Height) {
                        if (Math.abs(premouse.X - dataMesh[i].position.x) < pointSize) {
                            if (Math.abs(premouse.Y - dataMesh[i].position.y) < pointSize) {
                                click_i = i;
                                return;
                            }
                        }
                    }
                }
            }

        }
    }, false);
    canvas.container.addEventListener('mousemove', function (e) {
        var mouse = ElementToCanvas(e.offsetX, e.offsetY);
        //マウス位置の座標 (フレーム)を出力
        var temp = CanvasToFrame(mouse.X, mouse.Y);
        $("#mouse_xy").text("(" + temp.X.toPrecision(5) + ", " + temp.Y.toPrecision(5) + ")");

        if (!mousedown)
            return;
        var wmin, wmax, hmin, hmax;
        if (frame.SelectP >= 0) {
            wmin = frame.X;
            hmin = frame.Y;
            wmax = frame.Width + wmin;
            hmax = frame.Height + hmin;
            switch (frame.SelectP)
            {
                case 0:
                    wmin = mouse.X;
                    hmin = mouse.Y;
                    break;
                case 1:
                    wmax = mouse.X;
                    hmin = mouse.Y;
                    break;
                case 2:
                    wmax = mouse.X;
                    hmax = mouse.Y;
                    break;
                case 3:
                    wmin = mouse.X;
                    hmax = mouse.Y;
                    break;
                default:
                    break;
            }
            drawFrame(wmin, wmax, hmin, hmax);
            replotData();
        }
        else {
            if ((Math.abs(mouse.X - premouse.X) > pointSize) || (Math.abs(mouse.Y - premouse.Y) > pointSize)) {
                zoom.On = true;
                zoom.wmin = premouse.X;
                zoom.hmin = premouse.Y;
                zoom.wmax = mouse.X;
                zoom.hmax = mouse.Y;
                drawZoom(zoom.wmin, zoom.wmax, zoom.hmin, zoom.hmax);
            }
        }
    }, false);
    canvas.container.addEventListener('mouseup', function (e) {
        if (!mousedown)
            return;
        if (frame.SelectP >= 0) {
            frame.SelectP = -1;
        }
        else {
            if (zoom.On) {
                for (var i = 0; i < 4; i++) {
                    canvas.scene.remove(zoom.line[i]);
                    delete zoom.line[i];
                    zoom.line[i] = new THREE.Line();
                }
                var temp0, temp1, xmin, ymin, xmax, ymax;
                temp0 = CanvasToFrame(zoom.wmin, zoom.hmin);
                temp1 = CanvasToFrame(zoom.wmax, zoom.hmax);
                if (temp0.X <= temp1.X) {
                    xmin = temp0.X;
                    xmax = temp1.X;
                }
                else {
                    xmin = temp1.X;
                    xmax = temp0.X;
                }
                if (temp0.Y <= temp1.Y) {
                    ymin = temp0.Y;
                    ymax = temp1.Y;
                }
                else {
                    ymin = temp1.Y;
                    ymax = temp0.Y;
                }
                frame.xmin = xmin;
                frame.ymin = ymin;
                frame.xmax = xmax;
                frame.ymax = ymax;
                drawFrame(frame.X, frame.X + frame.Width, frame.Y, frame.Y + frame.Height);
                replotData(pointcol);
            }
            else {
                if (click_i >= 0) {
                    alert(data[click_i]);
                    click_i = -1;
                }
                /*for (var i = 0; i < data.length; i++) {
                 
                 //d2 = (premouse.X - dataMesh[i].position.x) * (premouse.X - dataMesh[i].position.x) + (premouse.Y - dataMesh[i].position.y) * (premouse.Y - dataMesh[i].position.y);
                 if (Math.abs(premouse.X - dataMesh[i].position.x) < pointSize) {
                 if (Math.abs(premouse.Y - dataMesh[i].position.y) < pointSize) {
                 
                 alert(dataMesh[i].position.x + ":" + dataMesh[i].position.y + ":" + pointSize);
                 alert(data[i]);
                 //alert(d2);
                 break;
                 }
                 }
                 }*/
            }
        }
        mousedown = false;
        zoom.On = false;
    }, false);
};
var renderLoop = function () {
    requestAnimationFrame(renderLoop);
    canvas.renderer.render(canvas.scene, canvas.camera);
};
var main = function () {

    init();
    renderLoop();
};
window.addEventListener('DOMContentLoaded', main, false);