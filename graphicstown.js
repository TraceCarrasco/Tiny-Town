var viewReverse = false;
var firstReverse = false;
var removeTitle = true;
var isValidGraphicsObject = function (object) {
    if (object.name === undefined) {
        console.log("warning: GraphicsObject missing name field");
        return false;
    }

    if (typeof object.draw !== "function" && typeof object.drawAfter !== "function") {
        console.log("warning: GraphicsObject of type " + object.name + " does not contain either a draw or drawAfter method");
        return false;
    }

    if (typeof object.center !== "function") {
        console.log("warning: GraphicsObject of type " + object.name + " does not contain a center method. ");
        return false;
    }

    if (typeof object.init !== "function") {
        console.log("warning: GraphicsObject of type " + object.name + " does not contain an init method. ");
        return false;
    }

    return true;
}
window.onload = function () {
    "use strict";

    // set up the canvas and context
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", 512);
    canvas.setAttribute("height", 512);
    document.body.appendChild(canvas);

    // make a place to put the drawing controls - a div
    var controls = document.createElement("DIV");
    controls.id = "controls";
    document.body.appendChild(controls);

    // a switch between camera modes
    var uiMode = document.createElement("select");
    uiMode.innerHTML += "<option>Fly</option>";
    uiMode.innerHTML += "<option>ArcBall</option>";
    uiMode.innerHTML += "<option>Drive</option>";
    uiMode.innerHTML += "</select>";
    controls.appendChild(uiMode);

    var resetButton = document.createElement("button");
    resetButton.innerHTML = "Reset View";
    resetButton.onclick = function () {
        // note - this knows about arcball (defined later) since arcball is lifted
        arcball.reset();

        drivePos = [0, 20, -25];
        driveTheta = 0;
        driveXTheta = 0;

    }
    controls.appendChild(resetButton);

    // make some checkboxes - using my cheesy panels code
    var checkboxes = makeCheckBoxes([["Run", 1], ["Examine", 0]]); //

    // a selector for which object should be examined
    var toExamine = document.createElement("select");
    grobjects.forEach(function (obj) {
        toExamine.innerHTML += "<option>" + obj.name + "</option>";
    });
    controls.appendChild(toExamine);

    // make some sliders - using my cheesy panels code
    var sliders = makeSliders([["TimeOfDay", 0, 24, 3]]);
    // this could be gl = canvas.getContext("webgl");
    // but twgl is more robust
    var gl = twgl.getWebGLContext(canvas);

    var cubemapSides = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,      // Right
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,      // Left
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,      // Bottom
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,      // Top
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,      // Back
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z       // Front
    ];

    gl.enable(gl.DEPTH_TEST);
    var cubemap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap);

    for (var i = 0; i < 6; i++)
        gl.texImage2D(cubemapSides[i], 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Frame buffer for reflection
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    // Depth buffer for the dynamic reflection 
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 256, 256);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    var drawingState = {
        gl: gl,
        proj: twgl.m4.identity(),
        view: twgl.m4.identity(),
        camera: twgl.m4.identity(),
        sunDirection: [0, 1, 0]
    }

    var lookAt = [0, 0, 0];
    var lookFrom = [0, 10, 10];
    var fov = Math.PI / 2;

    var projM;
    var cameraM;
    var viewM;

    var arcball = new ArcBall(canvas);

    var realtime = 0
    var lastTime = Date.now();

    var drivePos = [0, 15, 55];
    var driveTheta = 0;
    var driveXTheta = 0;

    var keysdown = {};

    document.body.onkeydown = function (e) {
        if(removeTitle) {
            removeTitle = false;
            var index = 0;
            var j;
            for(j = 0; j < grobjects.length;j++) {
                if(grobjects[j].name === "Title1") {
                    index = j;
                }
            }
            grobjects.splice(index,1);
        }
        var event = window.event ? window.event : e;
        if(event.keyCode === 70)
            viewReverse = true;
        keysdown[event.keyCode] = true;
        e.stopPropagation();
    };
    document.body.onkeyup = function (e) {
        var event = window.event ? window.event : e;
        if(event.keyCode === 70)
            viewReverse = false;
        delete keysdown[event.keyCode];
        e.stopPropagation();
    };

    // the actual draw function - which is the main "loop"
    function draw() {
        // advance the clock appropriately (unless its stopped)
        var curTime = Date.now();
        if (checkboxes.Run.checked) {
            realtime += (curTime - lastTime);
        }
        lastTime = curTime;

        projM = twgl.m4.perspective(fov, 1, 0.1, 1000);
        cameraM = twgl.m4.lookAt(lookFrom, lookAt, [0, 1, 0]);
        viewM = twgl.m4.inverse(cameraM);

        // first, let's clear the screen
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        // implement the camera UI
        if (uiMode.value == "ArcBall") {
            viewM = arcball.getMatrix();
            twgl.m4.setTranslation(viewM, [0, -1, -6], viewM);
        } else if (uiMode.value == "Drive") {
            if (keysdown[65]) { driveTheta += .02; }
            if (keysdown[68]) { driveTheta -= .02; }
            if (keysdown[87]) {
                var dz = Math.cos(driveTheta);
                var dx = Math.sin(driveTheta);
                drivePos[0] -= .05 * dx;
                drivePos[2] -= .05 * dz;
            }
            if (keysdown[83]) {
                var dz = Math.cos(driveTheta);
                var dx = Math.sin(driveTheta);
                drivePos[0] += .05 * dx;
                drivePos[2] += .05 * dz;
            }

            cameraM = twgl.m4.rotationY(driveTheta);
            twgl.m4.setTranslation(cameraM, drivePos, cameraM);
            viewM = twgl.m4.inverse(cameraM);
        } else if (uiMode.value == "Fly") {
            if (keysdown[65] || keysdown[37]) {
                driveTheta += .03;
            } else if (keysdown[68] || keysdown[39]) {
                driveTheta -= .03;
            }

            if (keysdown[38] ) { driveXTheta += .03; }
            if (keysdown[40] ) { driveXTheta -= .03; }

            var dz = Math.cos(driveTheta);
            var dx = Math.sin(driveTheta);
            var dy = Math.sin(driveXTheta);
            
            if (keysdown[87]) {
                drivePos[0] -= .35 * dx;
                drivePos[2] -= .35 * dz;
                drivePos[1] += .35 * dy;
            }

            if (keysdown[83]) {
                drivePos[0] += .35 * dx;
                drivePos[2] += .35 * dz;
                drivePos[1] -= .35 * dy;
            }
            if(firstReverse) {
                firstReverse = false;
                cameraM = twgl.m4.rotationX(driveXTheta - Math.PI / 8 + Math.PI);
            }
            else {
                cameraM = twgl.m4.rotationX(driveXTheta - Math.PI / 8);
            }
            if (viewReverse) {
                cameraM = twgl.m4.multiply(cameraM,twgl.m4.rotationY(Math.PI));
            }

            twgl.m4.multiply(cameraM, twgl.m4.rotationY(driveTheta), cameraM);
            twgl.m4.setTranslation(cameraM, drivePos, cameraM);
            viewM = twgl.m4.inverse(cameraM);
        }

        // get lighting information
        var tod = Number(sliders.TimeOfDay.value);
        var sunAngle = Math.PI * (tod - 6) / 12;
        var sunDirection = [Math.cos(sunAngle), Math.sin(sunAngle), 0];
        var lightView = twgl.m4.inverse(twgl.m4.lookAt(twgl.v3.mulScalar(sunDirection, 20), [0, 0, 0], [0, 0, 1]));
        var lightProj = twgl.m4.perspective(0.7, 1, 15, 40);

        // make a real drawing state for drawing
        var drawingState = {
            gl: gl,
            proj: projM,
            view: viewM,
            timeOfDay: tod,
            sunDirection: sunDirection,
            lightView: lightView,
            lightProj: lightProj,
            realtime: realtime,
            toFramebuffer: false,
            drawShadow: false,
            locationInWorld: drivePos
        }

        // initialize all of the objects that haven't yet been initialized (that way objects can be added at any point)
        grobjects.forEach(function (obj) {
            if (!obj.__initialized) {
                if (isValidGraphicsObject(obj)) {
                    // Have to have a special initialization for the river reflection
                    if (obj.name === "RiverReflection") {
                        drawingState.gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap);
                        RiverReflection.init(drawingState, RiverVPos);
                    }
                    else {
                        obj.init(drawingState);
                    }
                    obj.__initialized = true;
                }
            }
        });

        grobjects.forEach(function (obj) {
            if (!obj.doubleRender) {
                obj.draw(drawingState);
            }
        });

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        drawingState.toFramebuffer = false;

        // now draw all of the objects - unless we're in examine mode
        if (checkboxes.Examine.checked) {
            // get the examined object - too bad this is an array not an object
            var examined = undefined;
            grobjects.forEach(function (obj) { if (obj.name == toExamine.value) { examined = obj; } });
            var ctr = examined.center(drawingState);
            var shift = twgl.m4.translation([-ctr[0], -ctr[1], -ctr[2]]);
            twgl.m4.multiply(shift, drawingState.view, drawingState.view);

            if (examined.draw) examined.draw(drawingState);
            if (examined.drawAfter) examined.drawAfter(drawingState);
        } else {

            grobjects.forEach(function (obj) {
                if (obj.draw) obj.draw(drawingState);
            });

            grobjects.forEach(function (obj) {
                if (obj.drawAfter) obj.drawAfter();
            });
        }
        // Second pass of rendering!
        secondRender(drawingState);
    };
    // Modeled off of example: http://jsbin.com/kecagasesa/edit?html,js,output
    function secondRender(drawingState) {        
        // Since I'm doing the second pass of my rendering, I have to set up the buffer and viewport again!
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.viewport(0, 0, 300, 300);
        projM = twgl.m4.perspective(Math.PI / 2, 1, 0.6, 600);

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        cameraM = twgl.m4.identity();
        var viewM = twgl.m4.scaling([-1, -1, 1]);
        // Back
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, cubemap, 0);
        secondDraw(drawingState, viewM);
        // Front
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, cubemap, 0);
        secondDraw(drawingState, twgl.m4.rotateY(viewM, Math.PI));
        // Right
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X, cubemap, 0);
        secondDraw(drawingState, twgl.m4.rotateY(viewM, Math.PI / 2));
        // Left
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, cubemap, 0);
        secondDraw(drawingState, twgl.m4.rotateY(viewM, -Math.PI / 2));
        // Bottom        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, cubemap, 0);
        secondDraw(drawingState, twgl.m4.rotateX(viewM, Math.PI / 2));
        // Top
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, cubemap, 0);
        secondDraw(drawingState, twgl.m4.rotateX(viewM, -Math.PI / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
    };

    // This method essentially draws the river reflections, since at this point in the program, the
    function secondDraw(drawingState, newViewM) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Just have to update the new view for the drawing state!
        drawingState.view = newViewM;
        //drawingState.gl = twgl.getWebGLContext(canvas);
        
        // Drawing this portion of the sky 
        grobjects.forEach(function (obj) {
            obj.draw(drawingState);
        });
    };

    function animate() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        // First pass of rendering
        draw();        
        window.requestAnimationFrame(animate);
    };
    animate();
};