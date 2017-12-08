var Title = undefined;

(function () {
    "use strict";

    var shaderProgram = undefined;
    var buffers = undefined;

    Title = function Title(name, position, size, color) {
        this.name = name;
        this.position = position || [0, 0, 0];
        this.size = size || 1.0;
        this.color = color || [0, 0, 0];
    }
    Title.prototype.init = function (drawingState) {
        var gl = drawingState.gl;

        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["title-vs", "title-fs"]);
        }

        if (!buffers) {
            var arrays = {
                vpos: { numComponents: 3, data: [0.5, 0.5, 0.0, -0.5, 0.5, 0.0, -0.5, -0.5, 0.35, 0.5, 0.5, 0.0, -0.5, -0.5, 0.35, 0.5, -0.5, 0.35] },
                vnormal: { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1] },
                vTex: { numComponents: 2, data: [1.0, -1.0, 0.0, -1.0, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0, 1.0, 0.0] }
            };

            buffers = twgl.createBufferInfoFromArrays(drawingState.gl, arrays);
            var texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            var title = new Image();
            title.crossOrigin = "anonymous";

            title.src = "https://pages.cs.wisc.edu/~carrasco/graphics/texture.php?file=Title.jpg";
            title.onload = function () {
                gl.activeTexture(gl.TEXTURE5);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, title);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            }
        }

    };
    Title.prototype.draw = function (drawingState) {
        var modelM = twgl.m4.scaling([this.size, this.size, this.size]);
        twgl.m4.setTranslation(modelM, this.position, modelM);
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl, shaderProgram, buffers);
        twgl.setUniforms(shaderProgram, {
            view: drawingState.view, proj: drawingState.proj, model: modelM
        });
        shaderProgram.program.texSampler2 = gl.getUniformLocation(shaderProgram.program, "texSampler2");
        gl.uniform1i(shaderProgram.program.texSampler2, 5);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Title.prototype.center = function (drawingState) {
        return this.position;
    }
})();
grobjects.push(new Title("Title1", [0, 13, 49], 10, [0, 0, 0]));