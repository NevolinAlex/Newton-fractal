	var canvas;
	var context;
	var height;
	var width;
	var imageData;
	var numberOfRoot = 0;	
	var n;
	var g;
	var globals = {};
	var ZOOM_BOX_FACTOR = 0.25;
function run(){ // стартовая функция, запускается 1 раз
	canvas = document.getElementById("canvas");
	context = canvas.getContext('2d');
	height = parseInt(canvas.getAttribute("height"));
	width = parseInt(canvas.getAttribute("width"));
	globals.staticZoomBoxWidth = ZOOM_BOX_FACTOR * width; //переменные для хранения квадрата приближения
    globals.staticZoomBoxHeight = ZOOM_BOX_FACTOR * height;
	canvas.addEventListener('mousedown', mouseOnClick, false); //добавляем функцию на клик мышки
	FractalType(); // определяем раскраску по галочке
	StartAxis(); // получаем начальные оси координат в комплексной плоскости
	init(); // запускаем функцию на построение фрактала
}
function FractalType(){ //определние раскраски
	if(document.forms[0].ChoseFill[0].checked==true)
		globals.Fractal = "Classic";
	if(document.forms[0].ChoseFill[1].checked==true)
		globals.Fractal = "Level";
	if(document.forms[0].ChoseFill[2].checked==true)
		globals.Fractal = "Zebra";
}
function init(){// функция построения фрактала
	
	imageData = context.createImageData(width, height);
	//комплексные корни уравнения
	var complexRoot1 = {
		x: 1,
		y: 0
	};
	var complexRoot2 = {
		x: Math.cos(2/3 * Math.PI),
		y: Math.sin(2/3 * Math.PI)
	};
	var complexRoot3 = {
		x: Math.cos(-2/3 * Math.PI),
		y: Math.sin(-2/3 * Math.PI),
	};
	var comparison = 0.00001; //эпсилон
	var complex = {// пеменная для хранения точек плоскости в комплексной форме
		x: 0,
		y: 0
	};
	n = parseInt(document.getElementById("Iterations").value);

	for (var i = 0; i < width; i++) {

		for (var j = 0; j < height; j++) {
			numberOfRoot = 0; // пеменная для хранения номера аттрактора
			complex.x = (i * (globals.right - globals.left) / width + globals.left);//переводим i j в комплексную плоскость
            complex.y = (j * (globals.bottom - globals.top) / height + globals.top);
			for (g = 0; g < n; g++){ // цикл по итерациям
				if (distance(complex.x, complex.y, complexRoot1.x, complexRoot1.y)< comparison){ // спрашиваем расстояние от точки до аттрактора, к кому ближе, тому принадлежит
					numberOfRoot = 1;
					break;
				}
				if (distance(complex.x, complex.y, complexRoot2.x, complexRoot2.y)< comparison){
					numberOfRoot = 2;
					break;
				}
				if (distance(complex.x, complex.y, complexRoot3.x, complexRoot3.y)< comparison){
					numberOfRoot = 3;
					break;
				}
				var a = complex.x;// временные переменные для хранения точек
				var b = complex.y;
				complex.x = 2/3*a+1/3*(a*a - b*b)/Math.pow(a*a + b*b,2);//по формуле из перезентации выполняем 1 итерацию
				complex.y = 2/3*b*(1-a/Math.pow(a*a + b*b,2));
			}
			colorType(i, j);//функция раскрашивания в зависимости от типа раскраски
			
		}
	}
	context.putImageData(imageData, 0, 0);
}

function distance(x1,y1,x2,y2){
	return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
}
function colorType(i, j){
	if(globals.Fractal == "Classic"){
		imageData.data[4*(i + width*j) + 0] = 0;
		imageData.data[4*(i + width*j) + 1] = 0;
		imageData.data[4*(i + width*j) + 2] = 0;
		if (numberOfRoot != 0)
			imageData.data[4*(i + width*j) + numberOfRoot - 1] = 255;
		imageData.data[4*(i + width*j) + 3] = 255;	
	}
	if(globals.Fractal == "Level"){
		imageData.data[4*(i + width*j) + 0] = 0;
		imageData.data[4*(i + width*j) + 1] = 0;
		imageData.data[4*(i + width*j) + 2] = 0;
		if (n > 50) {
			opacity = n != 0 ? 255 * g / (n - 1) : 0;
		} else {
			opacity = n > 1 ? 255 * Math.log(1 + g) / Math.log(n) : 0;
		}
		opacity = 255 - g*5;
		imageData.data[4*(i + width*j) + 3] = opacity;	
	}
	if(globals.Fractal == "Zebra"){
		if (g%2 == 0){
			imageData.data[4*(i + width*j) + 0] = 0;
			imageData.data[4*(i + width*j) + 1] = 0;
			imageData.data[4*(i + width*j) + 2] = 0;
			imageData.data[4*(i + width*j) + 3] = 255;	
		}
		else{
			imageData.data[4*(i + width*j) + 0] = 255;
			imageData.data[4*(i + width*j) + 1] = 255;
			imageData.data[4*(i + width*j) + 2] = 255;
			imageData.data[4*(i + width*j) + 3] = 255;	
		}
	}
}
function StartAxis(){
	globals.left = -width/2;
	globals.top = height/2;
	globals.bottom = -height/2;
	globals.right = width/2;
}
function GloobalAXis(left, top, right, bottom){ // после приближения передаем новые координаты осей сюда, они становятся глобальными и используются для следующей раскраски
	globals.left = left;
	globals.top = top;
	globals.bottom = bottom;
	globals.right = right;
}
function xToRe(x){// фукция для перевода координаты X в комплексную плоскость RE
	return (x * (globals.right - globals.left) / width) + globals.left; 
}
function yToIm(y){// фукция для перевода координаты Y в комплексную плоскость IM
	return (y * (globals.bottom - globals.top) / height) + globals.top;
}
function mouseOnClick(evt){//функция по клику
	var canvasX;
	var canvasY;
	// перекладываем глобальные оси во временные потом преобразуем их
	var left = globals.left;
	var top = globals.top;
	var bottom = globals.bottom;
	var right = globals.right;
	
	if (evt.offsetX && evt.offsetY) {//хз че такое 
        canvasX = evt.offsetX; 
        canvasY = evt.offsetY; 
    } else {
        canvasX = evt.clientX - evt.target.offsetLeft; 
        canvasY = evt.clientY - evt.target.o
	coffsetTop; 
    } //nsole.log(canvasX,canvasY);
	var halfStaticZoomBoxWidth = globals.staticZoomBoxWidth / 2; //квадрат приближения
	var halfStaticZoomBoxHeight = globals.staticZoomBoxHeight / 2; // квадрат приближения
	
	left = xToRe(canvasX - halfStaticZoomBoxWidth); // это масштабирование разбирайся сам на листочке
	top = yToIm(canvasY - halfStaticZoomBoxHeight);
	bottom = yToIm(canvasY + halfStaticZoomBoxWidth);
	right = xToRe(canvasX + halfStaticZoomBoxHeight);
	
	GloobalAXis(left, top, right, bottom);//перекладываем измененные оси во внешние 
	init();//заного вызываем функцию уже с новыми осями
}	