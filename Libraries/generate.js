function Generate() {}

Generate.prototype.generateIndices4 = function(arrayLength) {
        var A = [];
        for(var i = 4; i <= arrayLength / 3; i += 4) {
          A.push(i-4);
          A.push(i-3);
          A.push(i-2);
          A.push(i-4);
          A.push(i-2);
          A.push(i-1);
        }
        return new Uint8Array(A);
}

Generate.prototype.buildColors = function(vertexPos) {
    var A = [];
    // Puts everything to white
    vertexPos.forEach(function() {
      A.push(1);
    })
    return new Float32Array(A);
}

Generate.prototype.generateSkyCube = function () {
  var a = {
    vpos : { numComponents: 3, data: [
       1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1,    //front
       1, 1, 1,   1,-1, 1,  1,-1,-1,   1, 1,-1,     //right
       1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,    //top
      -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    //left
      -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,    //bottom
       1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1     //back
    ] },
    vnormal : {numComponents:3, data: [
        0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
        0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
        0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
        0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,       // All of these are the same so the whole
        0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,       // Enviornment gets dark at the same time
        0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0
      
    ]},
    vTexCoord : {numComponents:2, data: [
        0.5, 0.6684,   0.25, 0.6684,   0.25, 0.3342,   0.5, 0.3342, //front
        0.75, 0.3342,   0.75, 0.6684,   0.5, 0.6684,   0.5, 0.3342, //right
        0.499, 0,   0.499, 0.3342,   0.2505, 0.3542,   0.2505, 0,   //top          This is the classic structure for a sky sprite
        0, 0.3342,   0.25, 0.3342,   0.25, 0.67,   0, 0.67,     //left         so I'm able to make new sky pictures easily!
        0.26, 1,   0.49, 1,   0.49, 0.67,   0.25, 0.67,     //bottom       I can't get it perfect though.
        0.75, 0.3342,   1, 0.3342,   1, 0.6684,   0.75, 0.6684      //back
    ]},
    indices : [0, 1, 2,   0, 2, 3,    
               4, 5, 6,   4, 6, 7,   
               8, 9,10,   8,10,11,    
              12,13,14,  12,14,15,    
              16,17,18,  16,18,19,   
              20,21,22,  20,22,23 ]
    };
    return a;
}

Generate.prototype.generatePlane = function (a) {
    var a = {
        vpos : { numComponents: 3, data: [
           1+a[0],-1+a[1],-1+a[2],  
           -1+a[0],-1+a[1],-1+a[2],  
           -1+a[0], 1+a[1],-1+a[2],   
           1+a[0], 1+a[1],-1+a[2],    
        ] },
        vnormal : {numComponents:3, data: [
            0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,     
        ]},
        indices : [0, 1, 2,   0, 2, 3 ]
        };
        return a;
}

Generate.prototype.generateVNormalData = function (vposData) {
  var normals = [];
  // When Linear Algebra pulls though
  for(var i = 0; i < vposData.length; i+=9) {
      // Getting the 3 points a,b,c for calculation
      var a = [vposData[i],vposData[i+1],vposData[i+2]];
      var b = [vposData[i+3],vposData[i+4],vposData[i+5]];
      var c = [vposData[i+6],vposData[i+7],vposData[i+8]];
      // Calcuating the cross product
      var cross = twgl.v3.cross(twgl.v3.subtract(b,a),twgl.v3.subtract(c,a));
      // Normalizing
      var normal = twgl.v3.normalize(cross);
      // Adding normals
      for(var k = 0; k < 3; k++)
          for(var j = 0; j < 3; j++)
              normals.push(normal[j]);
  }
  return normals;
}

Generate.prototype.generateBuffers = function (gl, vertex, normals, indices, color, textures) {
  var posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertex, gl.STATIC_DRAW);
  posBuffer.itemSize = 3;
  posBuffer.numItems = 24;

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  normalBuffer.itemSize = 3;
  normalBuffer.numItems = 24;

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
  
  var textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, textures, gl.STATIC_DRAW);
  textureBuffer.itemSize = 2;
  textureBuffer.numItems = 24;

  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW);
  colorBuffer.itemSize = 3;
  colorBuffer.numItems = 24;

  return {
      posBuffer: posBuffer, 
      colorBuffer: colorBuffer, 
      indices: indices, 
      normalBuffer:normalBuffer, 
      textureBuffer:textureBuffer,
      indexBuffer: indexBuffer
  };
}

