var grobjects = grobjects || [];
var River = undefined;
var RiverVPos = RiverVPos || [];


(function() {
    "use strict";

    var shaderProgram = undefined;
    var buffers = undefined;
    
    // constructor for Rivers
    River = function River(name, bankLocations, color, drawingState) {
        this.name = name;
        this.banks = bankLocations;
        this.color = color || [.7,.8,.9];
        this.skew = [1.0,1.0,1.0];
        this.position = [0,0,0];
        this.init(drawingState);
    }
    River.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all Rivers
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["ground-vs", "ground-fs"]);
        }
        if (!buffers) {
            var gen = new Generate();
            var vPos = this.generateVPos();
            var vNormal = gen.generateVNormalData(vPos);
            
            RiverVPos = {
                vpos : { numComponents: 3, data: vPos},
                vnormal : { numComponents: 3, data: vNormal},
            }
            var arrays = {
                vpos:vPos,
                vnormal:vNormal
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }
    };

    River.prototype.generateVPos = function() {
        var a = [];
        var t = undefined;
        for(var i = 4; i < this.banks.length; i+=2) {
            a.addPoints([
                this.banks[i-0],this.banks[i-1],this.banks[i-2],
                this.banks[i-3],this.banks[i-1],this.banks[i-2],
            ])        
        }
        var i = this.banks.length - 1;
        a.addPoints([
            this.banks[i],this.banks[i-1],this.banks[i-2],
            this.banks[i],this.banks[i-3],this.banks[i-2]
        ])
        return a;
    };


    River.prototype.draw = function(drawingState) {
        // THIS DRAW IS DONE IN RIVERREFLECTION.JS. this will just create a "normal" river
        
        // // we make a model matrix to place the River in the world
        // var modelM = twgl.m4.scaling([this.skew[0],this.skew[1],this.skew[2]]);
        // twgl.m4.setTranslation(modelM,this.position,modelM);
        // // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        // var gl = drawingState.gl;
        // gl.useProgram(shaderProgram.program);
        // twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        // twgl.setUniforms(shaderProgram,{
        //     view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
        //     cubecolor:this.color, model: modelM });
        // twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    River.prototype.center = function(drawingState) {
        return this.position;
    };
})();