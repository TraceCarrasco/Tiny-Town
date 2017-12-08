var grobjects = grobjects || [];
var RiverVPos = RiverVPos || [];

var Sky = undefined;

(function() {
    "use strict";

    var shaderProgram = undefined;
    var buffers = undefined;

    Sky = function Sky(drawingState) {
        this.name = 'Sky';
        this.position = [0,0,0];
        this.size = 200;
        this.angle = Math.PI;
        this.init(drawingState);
    }
    Sky.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["sky-vs", "sky-fs"]);
        }
        if (!buffers) {
            var gen = new Generate();
            var arrays = gen.generateSkyCube();
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }
        shaderProgram.program.texSampler1 = gl.getUniformLocation(shaderProgram.program, "texSampler1");
        gl.uniform1i(shaderProgram.texSampler1, 0);

        var textureSky = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureSky);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        var imageSky = new Image();
         imageSky.crossOrigin = "anonymous";
         imageSky.src = "https://farm5.staticflickr.com/4572/24966209348_b954ad53c5_k.jpg";
         window.setTimeout(imageSky.onload,200);
        imageSky.onload = function LoadTexture(){
              gl.activeTexture(gl.TEXTURE0);
              gl.bindTexture(gl.TEXTURE_2D, textureSky);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageSky);

              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }    
       
    };
    Sky.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM, drawingState.locationInWorld, modelM);
        
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Sky.prototype.center = function(drawingState) {
        return this.position;
    }
})();