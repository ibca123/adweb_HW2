//3D场景配置文件

//地面模型的相关信息
var floorRes ={
		
		//地面的四个顶点坐标，形状是一个正方形矩形，在xz平面内，y为0
		vertex:[
			-1.0, 0.0,  1.0,  
			-1.0, 0.0, -1.0,  
			 1.0, 0.0,  1.0,  
			 1.0, 0.0, -1.0,  
		],
		normals:[
			0.0, 1.0, 0.0,
			0.0, 1.0, 0.0,
			0.0, 1.0, 0.0,
			0.0, 1.0, 0.0,
		],
		//地面每个顶点对应的纹理坐标，纹理坐标是二维的，因此两个一组
		texCoord:[
			0.0, 1.0,
			0.0, 0.0,
			1.0, 1.0,
			1.0, 0.0
		],
		//地面的面片索引，每三个一组，数字代表了vertex的序号
		//这么做的原因是，webgl只能绘制三角形，因此矩形的地面由两个三角形组成
		//这两个三角形分别由第0、1、2号顶点和第1、2、3号顶点组成
		index:[
			0, 1, 2,
			1, 2, 3
		],
		//地面不做任何平移
		translate: [0.0, 0.0, 0.0],
		//实际地面大小为200*200，因此需要进行放缩
		scale: [100.0,1.0,100.0],
		//地面所对应的纹理图片文件的路径
		texImagePath : "./image/floor.jpg"
	}

//箱子模型的相关信息，具体含义和地面相同
var boxRes = {
	//箱子理论上由六个面8个顶点组成
	//    v6----- v5
	//   /|      /|
	//  v1------v0|
	//  | |     | |
	//  | |v7---|-|v4
	//  |/      |/
	//  v2------v3
	
	//顶点坐标，箱子由6个面组成，每个面有四个顶点（公共顶点实际上为每个面分别所有）
	//所以共有24个顶点，每个顶点3个分量xyz
	vertex:[// Vertex coordinates
		 1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
		 1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
		 1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
		-1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
		-1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
		 1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
	],
	normals:[
		0.0, 0.0, 1.0,    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
		1.0, 0.0, 0.0,    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,    
		0.0, 1.0, 0.0,    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0, 
	   -1.0, 0.0, 0.0,   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
	    0.0,-1.0, 0.0,    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
	    0.0, 0.0,-1.0,    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0
	],
	//箱子每个顶点的纹理坐标
	texCoord:[
		1.0, 0.0,  0.0, 0.0,  0.0, 1.0,  1.0, 1.0,
		1.0, 0.0,  0.0, 0.0,  0.0, 1.0,  1.0, 1.0,
		1.0, 0.0,  0.0, 0.0,  0.0, 1.0,  1.0, 1.0,
		1.0, 0.0,  0.0, 0.0,  0.0, 1.0,  1.0, 1.0,
		1.0, 0.0,  0.0, 0.0,  0.0, 1.0,  1.0, 1.0,
		1.0, 0.0,  0.0, 0.0,  0.0, 1.0,  1.0, 1.0 
	],
	//顶点索引，每个面都由两个三角形组成，比如第0,1,2号顶点，和第0,2,3号顶点构成了箱子的顶面
	index:[       // Indices of the vertices
		0, 1, 2,   0, 2, 3,    // front
		4, 5, 6,   4, 6, 7,    // right
		8, 9,10,   8,10,11,    // up
		12,13,14,  12,14,15,    // left
		16,17,18,  16,18,19,    // down
		20,21,22,  20,22,23     // back
	],
	//箱子先放大8倍
	scale: [8.0,8.0,8.0],
	//然后移动如下距离
	translate: [0.0,8.0,-30.0],
	//箱子纹理图片的路径，所有6个面都贴这一张纹理
	texImagePath : "./image/boxface.bmp"
}

//相机的初始参数信息，相机宽高比和canvas宽高比相同
CameraPara = {
	fov:30.0,
	near:0.1,
	far:300,
	eye:[0.0,8.0,48.0],
	at:[0.0,8.0,43.0],
	up:[0.0,1.0,0.0],
}

//漫游过程中，相机的移动速度
var MOVE_VELOCITY = 30;//0.01;

//漫游过程中，相机的旋转速度
var ROT_VELOCITY = 60.0;

//复杂模型的列表
ObjectList = [

]
//环境光的颜色
var sceneAmbientLight = [0.2, 0.2, 0.2];

//平行光的方向
var sceneDirectionLight = [-0.35, 0.35, 0.87];
//var sceneDirectionLight = [0, 1, 0];

//点光源的颜色，点光源的位置应当实时与相机位置（eye）相同
var scenePointLightColor = [0.5, 0.5, 0.6];
//var scenePointLightColor = [1.0, 1.0, 1.0];
