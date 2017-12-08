var grobjects = grobjects || [];
var RiverVPos = RiverVPos || [];
var Cube = undefined;

(function () {
    "use strict";
    var shaderProgram = undefined;
    var buffers = undefined;

    Cube = function (pos) {
        this.name = "Cube"
        this.position = pos;
        this.scale = [1, 1, 1];
        this.image = undefined;
        this.texture = undefined;
    }

    Cube.prototype.init = function (drawingState) {
        var gl = drawingState.gl;
        if (!shaderProgram) {
            var vertexSource = document.getElementById("cube-vs").text;
            var fragmentSource = document.getElementById("cube-fs").text;


            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertexSource);
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(vertexShader));
                return null;
            }
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragmentSource);
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(fragmentShader));
                return null;
            }

            shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert("Could not initialize shaders");
            }

            shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vpos");
            shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vnormal");
            shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
            shaderProgram.TexCoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");

            shaderProgram.Viewmatrix = gl.getUniformLocation(shaderProgram, "view");
            shaderProgram.Projmatrix = gl.getUniformLocation(shaderProgram, "proj");
            shaderProgram.Modelmatrix = gl.getUniformLocation(shaderProgram, "model");
            shaderProgram.LightDirvector = gl.getUniformLocation(shaderProgram, "lightdir");
        }
        if (this.texture == undefined) {
            gl.useProgram(shaderProgram);
            this.texture = gl.createTexture();
            var image = new Image();
            image.crossOrigin = "anonymous";
            image.src = "https://pages.cs.wisc.edu/~carrasco/graphics/texture.php?file=Tiny.jpg";
            image.onload = function () {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            }.bind(this);


        }
        if (buffers == undefined) {
            var s = this.scale[0];
            var vertexPos = new Float32Array(
                [1 + s, 1 + s, 1 + s, -1 + s, 1 + s, 1 + s, -1 + s, -1 + s, 1 + s, 1 + s, -1 + s, 1 + s,
                1 + s, 1 + s, 1 + s, 1 + s, -1 + s, 1 + s, 1 + s, -1 + s, -1 + s, 1 + s, 1 + s, -1 + s,
                1 + s, 1 + s, 1 + s, 1 + s, 1 + s, -1 + s, -1 + s, 1 + s, -1 + s, -1 + s, 1 + s, 1 + s,
                -1 + s, 1 + s, 1 + s, -1 + s, 1 + s, -1 + s, -1 + s, -1 + s, -1 + s, -1 + s, -1 + s, 1 + s,
                -1 + s, -1 + s, -1 + s, 1 + s, -1 + s, -1 + s, 1 + s, -1 + s, 1 + s, -1 + s, -1 + s, 1 + s,
                1 + s, -1 + s, -1 + s, -1 + s, -1 + s, -1 + s, -1 + s, 1 + s, -1 + s, 1 + s, 1 + s, -1 + s]);
            var vertexNormals = new Float32Array(
                [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);

            var vertexColors = new Float32Array(
                [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
                    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
                    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1]);

            var vertexTextureCoords = new Float32Array(
                [
                    -.75, 0, -1, 0, -1, -.25, -.75, -.25,
                    -.75, 0, -.75, -.25, -.5, -.25, -.5, 0,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, -.25, 0, -.25, -.25, 0, -.25,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    -.25, 0, -.5, 0, -.5, -.25, -.25, -.25,
                ]);

            // T - -.75,0,-1,0, -1,-.25,-.75,-.25,
            // I - -.75,0,-.75,-.25,-.5,-.25,-.5,0,
            // N - -.25, 0,   -.5, 0,   -.5, -.25,   -.25, -.25,
            // Y - 0, 0,   -.25, 0,   -.25, -.25,   0, -.25,

            var triangleIndices = new Uint8Array(
                [0, 1, 2, 0, 2, 3,
                    4, 5, 6, 4, 6, 7,
                    8, 9, 10, 8, 10, 11,
                    12, 13, 14, 12, 14, 15,
                    16, 17, 18, 16, 18, 19,
                    20, 21, 22, 20, 22, 23]);

            var gen = new Generate();
            buffers = gen.generateBuffers(gl, vertexPos, vertexNormals, triangleIndices, vertexColors, vertexTextureCoords);
        }
    }

    Cube.prototype.center = function () {
        return this.position;
    }

    Cube.prototype.draw = function (drawingState) {
        var gl = drawingState.gl;
        var tModel = twgl.m4.translation([0, 0, 0]);

        gl.useProgram(shaderProgram);

        gl.enableVertexAttribArray(shaderProgram.PositionAttribute);
        gl.enableVertexAttribArray(shaderProgram.NormalAttribute);
        gl.enableVertexAttribArray(shaderProgram.ColorAttribute);
        gl.enableVertexAttribArray(shaderProgram.TexCoordAttribute);


        gl.uniformMatrix4fv(shaderProgram.Viewmatrix, false, drawingState.view);
        gl.uniformMatrix4fv(shaderProgram.Projmatrix, false, drawingState.proj);
        gl.uniformMatrix4fv(shaderProgram.Modelmatrix, false, tModel);
        gl.uniform3fv(shaderProgram.LightDirvector, drawingState.sunDirection);


        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.posBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, buffers.posBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, buffers.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute, buffers.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureBuffer);
        gl.vertexAttribPointer(shaderProgram.TexCoordAttribute, buffers.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
        gl.drawElements(gl.TRIANGLES, buffers.indices.length, gl.UNSIGNED_BYTE, 0);
    }
})();

grobjects.push(new Cube([0,0,0]));