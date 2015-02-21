var GRAP = GRAP || {};

GRAP.roundRect = function(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
}

GRAP.makeTextSprite = function makeTextSprite(message, parameters, x, y, z) {
    if (parameters === undefined) parameters = {};

    var fontface =
        parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";

    var fontsize =
        parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;

    var borderThickness =
        parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : {
            r: 0,
            g: 0,
            b: 0,
            a: 1.0
        };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : {
            r: 255,
            g: 255,
            b: 255,
            a: 1.0
        };

    //var spriteAlignment = THREE.SpriteAlignment.topLeft;
    canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText(message);
    var textWidth = metrics.width;

    // background color
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    GRAP.roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText(message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false
    });

    var sprite = new THREE.Sprite(spriteMaterial);
    //sprite.scale.set(100, 50, 1.0);
    //sprite.scale.set(100, 50, 1.0);
    sprite.position.set(x, y, z);

    return {canvas: canvas , texture: texture, sprite: sprite};
}

GRAP.createLabelBox = function(text, x, y, z) {
    var parameters ={
        fontsize: 120,
        borderColor: {
            r: 255,
            g: 0,
            b: 0,
            a: 1.0
        },
        backgroundColor: {
            r: 255,
            g: 100,
            b: 100,
            a: 0.8
        }
    }

    return GRAP.makeTextSprite(text, parameters, x, y, z);
}

GRAP.changeTextSprit = function(text_sprite, base_text, text) {
    var context = text_sprite.canvas.getContext('2d');

    context.clearRect(0, 0, text_sprite.canvas.width, text_sprite.canvas.height);
    context.fillText(base_text + text, 15, 28);
    text_sprite.texture.needsUpdate = true;
}

GRAP.createTextCanvas = function (text, color, font, size) {
        size = size || 16;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var fontStr = (size + 'px ') + (font || 'Arial');
        ctx.font = fontStr;
        var w = ctx.measureText(text).width;
        var h = Math.ceil(size);
        canvas.width = w;
        canvas.height = h;
        ctx.font = fontStr;
        ctx.fillStyle = color || 'black';
        ctx.fillText(text, 0, Math.ceil(size * 0.8));
        return canvas;
    }

GRAP.createText2D = function(text, color, font, size, segW, segH) {
        var canvas = GRAP.createTextCanvas(text, color, font, 12);
        var plane = new THREE.PlaneGeometry(canvas.width, canvas.height, segW, segH);
        var tex = new THREE.Texture(canvas);
        tex.needsUpdate = true;
        var planeMat = new THREE.MeshBasicMaterial({
            map: tex,
            color: 0xffffff,
            transparent: true
        });
        var mesh = new THREE.Mesh(plane, planeMat);
        mesh.scale.set(0.5, 0.5, 0.5);
        mesh.doubleSided = true;
        return mesh;
    }
