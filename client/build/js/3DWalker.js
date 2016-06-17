/* 全局变量定义 */
// 设置camera
var eye=new Vector3(CameraPara.eye);
var at=new Vector3(CameraPara.at);
var up=new Vector3(CameraPara.up);
// objdoc数组
var g_objArr=new Array(0);
// objbuffer数组
var g_oArr = new Array(0);
// 设置雾化
var g_FogColor = new Float32Array([0.0, 0.0, 0.0]);
var g_FogDist = new Float32Array([100, 150]);
// 是否开启点光源
var g_pointLight = false;

/* 纹理图形Shader */
var TEXTURE_VSHADER_SOURCE =
	'attribute vec4 a_Position;\n'+
	'attribute vec2 a_TexCoord;\n'+
	'attribute vec4 a_Normal;\n'+
	'uniform mat4 u_modelMatrix;\n'+    //模型矩阵
	'uniform mat4 u_normalMatrix;\n'+   //法向量矩阵
	'uniform vec3 u_LightPosition;\n'+  //点光源位置
	'uniform vec3 u_LightDirection;\n'+ //平行光光线方向
	'uniform vec3 u_AmbientLight;\n'+   //环境光颜色
	'uniform mat4 u_mvpMatrix;\n'+
	'varying vec2 v_TexCoord;\n'+
	'varying vec4 v_Color;\n'+
	'varying float v_nDotL;\n'+
	'varying float v_nDotLDir;\n'+
	'varying vec3 v_diffuse;\n'+
	'varying vec3 v_ambient;\n'+
	'varying float v_Dist;\n'+
	'void main(){\n'+
	'	gl_Position = u_mvpMatrix * a_Position;\n'+
	'	vec3 normal = normalize(vec3(u_normalMatrix * a_Normal));\n'+
	'	vec4 vertexPosition = u_modelMatrix * a_Position;\n'+       
	//计算质点位置
	'	vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n'+ 
	//计算点光源光线向量
	'	v_nDotL = max(dot(normal,lightDirection), 0.0);\n'+
	'	v_nDotLDir = max(dot(normal,u_LightDirection), 0.0);\n'+
  	'   v_ambient = u_AmbientLight ;\n' +			
  	//计算环境光反射
	'	v_TexCoord = a_TexCoord;\n'+
	'	v_Dist = distance(u_modelMatrix * a_Position, vec4(u_LightPosition, 1));\n'+
	'}\n';
var TEXTURE_FSHADER_SOURCE=
	'#ifdef GL_ES\n'+
	'precision mediump float;\n'+
	'#endif\n'+
	'uniform sampler2D u_Sampler;\n'+
	'varying vec2 v_TexCoord;\n'+
	'varying vec4 v_Color;\n'+
	'varying float v_nDotLDir;\n'+
	'varying vec3 v_ambient;\n'+
	'varying float v_nDotL;\n'+
	'uniform vec3 u_LightColor;\n'+     //点光源颜色
	'varying float v_Dist;\n'+
	'uniform vec2 u_FogDist;\n'+
	'uniform vec3 u_FogColor;\n'+
	'void main(){\n'+
	'	vec4 colorLight = texture2D(u_Sampler,v_TexCoord) ;\n'+
	'	vec3 ambient = v_ambient * colorLight.rgb;\n'+
	'	vec3 diffuse = u_LightColor * colorLight.rgb * v_nDotL;\n'+
	'	vec3 diffuseDir = colorLight.rgb * v_nDotLDir;\n'+
	'	colorLight = vec4(diffuseDir + diffuse + ambient, 1.0);\n'+
	'	float fogFactor = clamp((u_FogDist.y - v_Dist) / (u_FogDist.y, u_FogDist.x), 0.0, 1.0);\n'+
	'	vec3 color = mix(u_FogColor, vec3(colorLight), fogFactor);\n'+
	'	gl_FragColor = vec4(color, colorLight.a);\n'+
	'}\n';
/* 纯色图形Shader */
var SOLID_VSHADER_SOURCE =
	'attribute vec4 a_Position;\n'+
	'attribute vec4 a_Normal;\n'+
	'uniform mat4 u_modelMatrix;\n'+    //模型矩阵
	'uniform mat4 u_normalMatrix;\n'+   //法向量矩阵
	'uniform vec3 u_LightPosition;\n'+  //点光源位置
	'uniform vec3 u_LightDirection;\n'+ //平行光光线方向
	'uniform vec3 u_AmbientLight;\n'+   //环境光颜色
	'uniform vec3 u_LightColor;\n'+     //点光源颜色
	'uniform mat4 u_mvpMatrix;\n'+
	'uniform vec4 u_Color;\n'+
	'varying vec4 v_Color;\n'+
	'varying float v_Dist;\n'+
	'void main(){\n'+
	'	gl_Position = u_mvpMatrix * a_Position;\n'+
	'	vec3 normal = normalize(vec3(u_normalMatrix * a_Normal));\n'+
	'	vec3 normalDir = normalize(vec3(a_Normal.xyz));\n'+
	'	vec4 vertexPosition = u_modelMatrix * a_Position;\n'+       
	//计算质点位置
	'	vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n'+ 
	//计算点光源光线向量
	'	float nDotL = max(dot(normal,lightDirection), 0.0);\n'+
	'	float nDotLDir = max(dot(normal,u_LightDirection), 0.0);\n'+
	'	vec3 diffuse = u_LightColor * u_Color.rgb * nDotL;\n'+
	'	vec3 diffuseDir = u_Color.rgb * nDotLDir;\n'+
  	'   vec3 ambient = u_AmbientLight * u_Color.rgb;\n' +			
  	//计算环境光反射
	'	v_Color = vec4(diffuseDir + diffuse + ambient, u_Color.a);\n'+
	'	v_Dist = distance(u_modelMatrix * a_Position, vec4(u_LightPosition, 1));\n'+
	'}\n';
var SOLID_FSHADER_SOURCE=
	'#ifdef GL_ES\n'+
	'precision mediump float;\n'+
	'#endif\n'+
	'varying vec4 v_Color;\n'+
	'varying float v_Dist;\n'+
	'uniform vec2 u_FogDist;\n'+
	'uniform vec3 u_FogColor;\n'+
	'void main(){\n'+
	//设置线性雾化
	'	float fogFactor = clamp((u_FogDist.y - v_Dist) / (u_FogDist.y, u_FogDist.x), 0.0, 1.0);\n'+
	'	vec3 color = mix(u_FogColor, vec3(v_Color), fogFactor);\n'+
	'	gl_FragColor = vec4(color, v_Color.a);\n'+
	'}\n';

/* 键盘控制函数 */
function keydown(ev)
{
	if(ev.keyCode == 39){  //LEFT--GO LEFT
		GoLR(MOVE_VELOCITY / 30);
	}
	else if(ev.keyCode == 37){  //RIGHT--GO RIGHT
		GoLR(-MOVE_VELOCITY/30);
	}
	else if(ev.keyCode == 38){   //UP--GO FORWARD
		GoFB(MOVE_VELOCITY / 30);
	}
	else if(ev.keyCode == 40){   //DOWN--GO BACK
		GoFB(-MOVE_VELOCITY / 30);
	}
	else if(ev.keyCode == 65){   //A--TURN LEFT
		turnLR(-1);   
	}
	else if(ev.keyCode == 68){   //D--TURN RIGHT
		turnLR(1);   
	}
	else if(ev.keyCode == 87){   //W--TURN UP
		turnUD(1);   
	}
	else if(ev.keyCode == 83){   //S--TURN DOWN
		turnUD(-1);   
	}
	else if(ev.keyCode == 70){
		g_pointLight = !g_pointLight;
	}
	else return;
}
// 前后移动camera
function GoFB(distance)
{
	var v = VectorMinus(at,eye);
	var dv = VectorMultNum(v, distance/VectorLength(v));
	eye = VectorAdd(eye,dv);
	at = VectorAdd(at,dv);
}
// 左右移动camera
function GoLR(distance)
{
	var v = VectorCross(VectorMinus(at,eye),up);
	var dv = VectorMultNum(v, distance/VectorLength(v));
	eye = VectorAdd(eye,dv);
	at = VectorAdd(at,dv);
}
// 左右转动camera
function turnLR(angle)
{
	var sin = Math.sin(angle / 180 * Math.PI);
	var cos = Math.cos(angle / 180 * Math.PI);
	var v = VectorMinus(at, eye);
	var v1 = VectorMultNum(v, cos);
	var v2 = VectorCross(v, up);
	v2 = VectorMultNum(v2, VectorLength(v) * sin / VectorLength(v2));
	v = VectorAdd(v1, v2);
	at = VectorAdd(eye, v);
}
// 上下转动camera
function turnUD(angle)
{
	var v = VectorMinus(at,eye);
	var sin = Math.sin(angle/180*Math.PI);
	var cos = Math.cos(angle/180*Math.PI);

	var v1 = VectorMultNum(v, cos);
	var v2 = VectorMultNum(up, VectorLength(v) * sin / VectorLength(up));
	v = VectorAdd(v1, v2);
	at = VectorAdd(eye, v);

	var upv1 = VectorMultNum(up, cos);
	var upv2 = VectorMultNum(v1, VectorLength(up) * sin / VectorLength(v1));
	up = VectorMinus(upv1, upv2);
}

/* 主程序 */
function main()
{
	document.onkeydown=function(ev){ keydown(ev)};

	var canvas = document.getElementById('webgl');

	var gl=getWebGLContext(canvas);
	if(!gl){
		console.log('Failed to get context for webgl');
		return;
	}
	// 将场景的背景色设置为雾化颜色
	gl.clearColor(g_FogColor[0], g_FogColor[1], g_FogColor[2], 1.0);
	// 启动depth test
	gl.enable(gl.DEPTH_TEST);

	var texprogram = initTexProgram(gl, TEXTURE_VSHADER_SOURCE, TEXTURE_FSHADER_SOURCE);

	// 初始化箱子
	var box = initVertexBuffers(gl, texprogram, boxRes);
	var boxtexture = initTexture(gl, texprogram, boxRes);
	// 初始化地板
	var floor = initVertexBuffers(gl, texprogram, floorRes);
	var floortexture = initTexture(gl, texprogram, floorRes);

	var objprogram = initObjProgram(gl, SOLID_VSHADER_SOURCE, SOLID_FSHADER_SOURCE);

	var currentAngle = animate(0);

	var tick = function(){
		currentAngle = animate(currentAngle);
		/*
		// 调整显示坐标 
		var pPosition = document.getElementById("position");
		var pLookat = document.getElementById("lookat");
		
		var position = {'x' : eye.elements[0], 'y' : eye.elements[1], 'z' : eye.elements[2]};
		var lookat = {'x' : at.elements[0], 'y' : at.elements[1], 'z' : at.elements[2]};
		pPosition.value = JSON.stringify(position);
		pLookat.value = JSON.stringify(lookat);
		*/

		// 确认obj是否读取完毕
		for(var i = 0 ; i < g_objArr.length; i++){
			checkComplete(gl, i);
		}

		// 设置模型矩阵
		ViewProjMatrix = new Matrix4();
		ViewProjMatrix.setPerspective(CameraPara.fov, 1.0, CameraPara.near, CameraPara.far);
		ViewProjMatrix.lookAt(eye.elements[0], eye.elements[1], eye.elements[2], at.elements[0], at.elements[1], at.elements[2], up.elements[0], up.elements[1], up.elements[2]);

		// 绘图
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		drawTexCoordObj(gl, texprogram, box, boxtexture, ViewProjMatrix, boxRes);
		drawTexCoordObj(gl, texprogram, floor, floortexture, ViewProjMatrix, floorRes);

		for(var i =0 ; i < g_oArr.length; i++)
		{
			setFlash(g_oArr[i], currentAngle);
			drawColorObj(gl, objprogram, g_oArr[i], ViewProjMatrix);
		}

		window.requestAnimationFrame(tick, canvas);
	}

	tick();
}

/* 设置动画 */
var g_last = Date.now();
// 计算旋转角
function animate(angle)
{
	var now = Date.now();
	var elapsed = now - g_last; 
	g_last = now;
	var newAngle = angle + (60 * elapsed)/1000;
	return newAngle %= 360;
}
// 设置动画矩阵
function setFlash(o, currentAngle){
	var sin = Math.sin(currentAngle / 180 * Math.PI);
	var cos = Math.cos(currentAngle / 180 * Math.PI);
	if(o.name == 'bird'){
		var center = new Vector3([-8, 2, 2]);
		var p = new Vector3([-8.5, 2.5, 0]);
		var v = VectorMinus(center, p);
		var fv = VectorCross(v, new Vector3([0,1,0]));
		var newv = VectorAdd(VectorMultNum(v, 1 - cos), VectorMultNum(fv, VectorLength(v) * sin / VectorLength(fv)));

		o.transMatrix.setTranslate(newv.elements[0] + 1, 0, newv.elements[2] - 1.5);
		o.transMatrix.translate(0, Math.sin(currentAngle / 90 * Math.PI)/ 3 , 0);
		o.transMatrix.rotate(currentAngle, 0, 1, 0);
	}
	if(o.name == 'newstar')
	{
		o.transMatrix.setRotate(currentAngle, 0, 0, 1);
		o.transMatrix.rotate(currentAngle, 1, 0, 0);
		o.transMatrix.rotate(currentAngle, 0, 1, 0);
	}
	if(o.name == 'heart')
	{
		o.transMatrix.setRotate(currentAngle*1.5, 0, 0, 1);
	}
}

/* 绘制Texture对象 */
// 初始化程序
function initTexProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE){
var program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);


	if(!program){
		console.log('Failed to intialize shaders.');
		return;
	}

	program.a_Position = gl.getAttribLocation(program, 'a_Position');
	program.a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
	program.u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
	program.u_mvpMatrix = gl.getUniformLocation(program, 'u_mvpMatrix');
	program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
	program.u_LightDirection = gl.getUniformLocation(program, 'u_LightDirection');
	program.u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
	program.u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
	program.u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
	program.u_modelMatrix = gl.getUniformLocation(program, 'u_modelMatrix');
	program.u_normalMatrix = gl.getUniformLocation(program, 'u_normalMatrix');
	program.u_FogDist = gl.getUniformLocation(program, 'u_FogDist');
	program.u_FogColor = gl.getUniformLocation(program, 'u_FogColor');
	
	if(program.a_Position<0 || program.a_TexCoord<0 || !program.u_Sampler || !program.u_mvpMatrix){
		console.log('Failed to get the attribute or uniform variable');
		return;
	}
    return program;
}
// 初始化buffer
function initVertexBuffers(gl,program,obj)
{
	var vertices = new Float32Array(obj.vertex);
	var normals = new Float32Array(obj.normals);
	var texCoords = new Float32Array(obj.texCoord);
	var indices = new Uint8Array(obj.index);
	var o = new Object();
	o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
	o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
	o.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
	o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
	if (!o.vertexBuffer || !o.texCoordBuffer || !o.indexBuffer) return null; 
	o.numIndices = obj.index.length;

	// 解绑buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return o;
}
// 初始化纹理
function initTexture(gl,program,obj){
	var texture = gl.createTexture();
	if (!texture) {
    	console.log('Failed to create the texture object');
    	return null;
  	}
	var image = new Image();  // Create a image object
  	if (!image) {
    	console.log('Failed to create the image object');
    	return null;
  	}
	image.onload = function(){
        // Write the image data to texture object
    	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, texture);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    	// Pass the texure unit 0 to u_Sampler
    	gl.useProgram(program);
    	gl.uniform1i(program.u_Sampler, 0);

    	gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
	}
	image.src=obj.texImagePath;

	return texture;
}
// 绘制图形
function drawTexCoordObj(gl, program, o, texture, ViewProjMatrix, obj)
{
	gl.useProgram(program);

	initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
	initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);
	initAttributeVariable(gl, program.a_Normal, o.normalBuffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
 	// 激活纹理
  	gl.activeTexture(gl.TEXTURE0);
  	gl.bindTexture(gl.TEXTURE_2D, texture);

	var modelMatrix = new Matrix4();
	var mvpMatrix = new Matrix4();

	modelMatrix.setIdentity();
 	modelMatrix.translate(obj.translate[0],obj.translate[1],obj.translate[2]);
 	modelMatrix.scale(obj.scale[0],obj.scale[1],obj.scale[2]);
 	mvpMatrix.set(ViewProjMatrix).multiply(modelMatrix);

 	gl.uniform3f(program.u_LightDirection, sceneDirectionLight[0], sceneDirectionLight[1], sceneDirectionLight[2]);
	gl.uniform3f(program.u_AmbientLight, sceneAmbientLight[0], sceneAmbientLight[1], sceneAmbientLight[2]);
	gl.uniform3f(program.u_LightPosition, eye.elements[0], eye.elements[1], eye.elements[2]);
	// 如果开启了点光源，则设置；否则设置为黑
	if(g_pointLight)
		gl.uniform3f(program.u_LightColor, scenePointLightColor[0], scenePointLightColor[1], scenePointLightColor[2]);
	else
		gl.uniform3f(program.u_LightColor, 0, 0, 0);
	gl.uniformMatrix4fv(program.u_modelMatrix, false, modelMatrix.elements);

	var normalMatrix = new Matrix4();
	normalMatrix.setInverseOf(modelMatrix);
  	normalMatrix.transpose();
  	gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);

  	//设置雾化因子
  	gl.uniform3f(program.u_FogColor, g_FogColor[0], g_FogColor[1], g_FogColor[2]);
  	gl.uniform2f(program.u_FogDist, g_FogDist[0], g_FogDist[1]);


  	gl.uniformMatrix4fv(program.u_mvpMatrix, false, mvpMatrix.elements);

	gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);
}

/* 绘制obj对象 */
// 初始化程序
function initObjProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE){
	var program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);

	if(!program){
		console.log('Failed to intialize shaders.');
		return;
	}

	program.a_Position = gl.getAttribLocation(program, 'a_Position');
	program.u_Color = gl.getUniformLocation(program, 'u_Color');
	program.u_mvpMatrix = gl.getUniformLocation(program, 'u_mvpMatrix');
	program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
	program.u_LightDirection = gl.getUniformLocation(program, 'u_LightDirection');
	program.u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
	program.u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
	program.u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
	program.u_modelMatrix = gl.getUniformLocation(program, 'u_modelMatrix');
	program.u_normalMatrix = gl.getUniformLocation(program, 'u_normalMatrix');
	program.u_FogDist = gl.getUniformLocation(program, 'u_FogDist');
	program.u_FogColor = gl.getUniformLocation(program, 'u_FogColor');

	if(program.a_Position<0 || !program.u_Color || !program.u_mvpMatrix){
		console.log('Failed to get the attribute or uniform variables.');
		return;
	}

	return program;
}
// 读取Obj
function readOBJFile(gl, obj, scale, reverse, id)
{
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status !== 404) {
			onReadOBJFile(request.responseText, obj, gl, scale, reverse, id); // 调用onReadOBJFile()
		}
	}
	request.open('GET', obj.objFilePath, true); // Create a request to acquire the file
	request.send();      
}
// 当请求成功并开始读取
function onReadOBJFile(fileString, obj, gl, scale, reverse, id){
	var objdoc = new OBJDoc(obj.objFilePath);
	if(!objdoc.parse(fileString, scale, reverse)){
		console.log('obj error');
		return;
	}
	objdoc.resource = obj;
	objdoc.id = id;
	// 将收到的回应加入数组
	g_objArr.push(objdoc);
}
// 检测Obj文件是否已经全部读入
function checkComplete(gl, i)
{
	var objdoc = g_objArr[i];
  	if (objdoc != null && objdoc.isMTLComplete()){ // OBJ and all MTLs are available
  		// 如果读入完全
  		var obj = objdoc.resource;
   		var o = onReadComplete(gl, obj, objdoc);
   		o.id = objdoc.id;
   		g_oArr.push(o);
   		g_objArr[i] = null;
 	}
}
// 如果读入完全，则写入buffer
function onReadComplete(gl, obj, objdoc) {
	var drawingInfo = objdoc.getDrawingInfo();

	if(!drawingInfo)
	{
		console.log('drawinginfo error');
		return;
	}

	var o = new Object();

	o.vertexBuffer = initArrayBufferForLaterUse(gl,drawingInfo.vertices, 3, gl.FLOAT); 
	o.normalBuffer = initArrayBufferForLaterUse(gl,drawingInfo.normals, 3, gl.FLOAT);
	o.indexBuffer = initElementArrayBufferForLaterUse(gl,drawingInfo.indices, gl.UNSIGNED_SHORT);
	o.numIndices = drawingInfo.indices.length;

	o.color = new Float32Array(obj.color);

	if(!o.vertexBuffer || !o.normalBuffer || !o.indexBuffer){
		console.log('Failed to intialize buffers of obj');
		return;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


	var modelMatrix = new Matrix4();
	modelMatrix.setIdentity();
	for(var i = 0; i<obj.transform.length ; i++){
		var p = obj.transform[i];
		if(p.type == "translate"){
			modelMatrix.translate(p.content[0], p.content[1], p.content[2]);
		}
		else if (p.type == "rotate"){
			modelMatrix.rotate(p.content[0], p.content[1], p.content[2], p.content[3]);
		}
		else if (p.type == "scale"){
			modelMatrix.scale(p.content[0], p.content[1], p.content[2]);
		}
	}
	o.name = objdoc.objects[0].name;
	o.modelMatrix = modelMatrix;
	var transMatrix = new Matrix4();
	transMatrix.setIdentity();
	o.transMatrix = transMatrix;

	return o;
}
// 绘制函数
function drawColorObj(gl, program, o, ViewProjMatrix)
{
	gl.useProgram(program);

	initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
	initAttributeVariable(gl, program.a_Normal, o.normalBuffer);
	gl.uniform4f(program.u_Color, o.color[0], o.color[1], o.color[2], 1.0);

	var modelMatrix = new Matrix4();
	modelMatrix.set(o.modelMatrix).multiply(o.transMatrix);
	//设置光线
	gl.uniform3f(program.u_LightDirection, sceneDirectionLight[0], sceneDirectionLight[1], sceneDirectionLight[2]);
	gl.uniform3f(program.u_AmbientLight, sceneAmbientLight[0], sceneAmbientLight[1], sceneAmbientLight[2]);
	gl.uniform3f(program.u_LightPosition, eye.elements[0], eye.elements[1], eye.elements[2]);
	// 如果开启点光源，则设置；否则设置为黑色
	if(g_pointLight)
		gl.uniform3f(program.u_LightColor, scenePointLightColor[0], scenePointLightColor[1], scenePointLightColor[2]);
	else
		gl.uniform3f(program.u_LightColor, 0, 0, 0);
	//设置模型矩阵
	gl.uniformMatrix4fv(program.u_modelMatrix, false, modelMatrix.elements);
	//设置法向矩阵
	var normalMatrix = new Matrix4();
	normalMatrix.setInverseOf(modelMatrix);
  	normalMatrix.transpose();
  	gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);
  	//设置雾化因子
  	gl.uniform3f(program.u_FogColor, g_FogColor[0], g_FogColor[1], g_FogColor[2]);
  	gl.uniform2f(program.u_FogDist, g_FogDist[0], g_FogDist[1]);


	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

	var mvpMatrix = new Matrix4();
	mvpMatrix.set(ViewProjMatrix).multiply(modelMatrix);

  	gl.uniformMatrix4fv(program.u_mvpMatrix, false, mvpMatrix.elements);


	gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);
}

/* 工具函数 */
// 初始化空的ArrayBuffer
function initArrayBufferForLaterUse(gl, data, num, type){
	var buffer = gl.createBuffer();
 	if (!buffer) {
		console.log('Failed to create the buffer object');
		return null;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	buffer.num = num;
	buffer.type = type;

	return buffer;
}
// 初始化空的ElementArrayBuffer
function initElementArrayBufferForLaterUse(gl, data, type){
	var buffer = gl.createBuffer();
 	if (!buffer) {
 	   console.log('Failed to create the buffer object');
 	   return null;
 	}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

	buffer.type = type;

	return buffer;
}
// 初始化attribute变量
function initAttributeVariable(gl, a_attribute, buffer)
{
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
	gl.enableVertexAttribArray(a_attribute);
}
// 加入新的玩家
function AddNewPlayer(id){
	var canvas = document.getElementById('webgl');
	var gl=getWebGLContext(canvas);
	
	var model = 
	{
		objFilePath : "./model/gumby.obj", 
		color : [0.1, 0.4, 0.1],
		kads : [0.0, 0.1, 0.0],
		transform : [
					{type:"translate",content:[0.0, 8.0, 48.0]},
					{type:"rotate",content:[20, 1, 0, 0]},
					{type:"rotate",content:[180, 0, 1, 0]},
					{type:"scale",content:[0.2, 0.2, 0.2]},
				 ]
	};
	readOBJFile(gl, model, 1.0, true, id);
}
// 删除玩家
function DeletePlayer(id){
	for(var i =0 ; i < g_oArr.length; i++){
		if(g_oArr[i].id == id){
			g_oArr.splice(i, 1);
		}
	}
}
// 玩家位置改变
function OnPlayerPositionChange(id, position, lookat){
	for(var i =0 ; i < g_oArr.length; i++){
		if(g_oArr[i].id == id){
			o = g_oArr[i];
			var modelMatrix = new Matrix4();

			// 加上视角旋转
			var v1 = new Vector3([0, 0, -5]);
			var v2 = new Vector3([lookat.x - position.x, lookat.y - position.y, lookat.z - position.z]);
			var cos = VectorDot(v1, v2) / (VectorLength(v1) * VectorLength(v2));
			var angle = Math.acos(cos) / Math.PI * 180;
			var cross = VectorCross(v1, v2);
			if(cross.elements[1] < 0) angle = 360 - angle;

			modelMatrix.setIdentity();
			modelMatrix.translate(position.x, position.y, position.z);
			modelMatrix.rotate(180 + angle, 0, 1, 0);
			modelMatrix.rotate(20, 1, 0, 0);
			modelMatrix.scale(0.2, 0.2, 0.2);

			o.modelMatrix = modelMatrix;
		}
	}
}