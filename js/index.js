document.addEventListener("touchmove", function(e){ e.preventDefault(); }, false);
var UA = navigator.userAgent.toLowerCase();
var isApple = ~UA.indexOf("iph") || ~UA.indexOf("ipad")

initIndex();

function initIndex(){
	~document.cookie.indexOf("bwcgame_detail_readed") && $("section.finish .finish2").hide();
	window.obj_a = 0;
	$("section").hide();
	$("section.index").show();
	$("section.index .mouth .begin").bind("touchend", function(){
		$("section.tooth").show();
		setTimeout(function(){ $("section.tooth .tooth_up, section.tooth .tooth_down").addClass("close"); }, 0);
	});
	$("section.finish .detail").bind("touchend", function(){
		document.cookie = "bwcgame_detail_readed=1";
		$("section").hide();
		$("section.detail").show();
		$("section.finish .finish2").hide();
	});
	$("section.finish .invate").bind("touchend", function(){
		$("section.invate").show();
	});
	$("section.finish .replay").bind("touchend", function(){
		window.location.href = "index.html";
	});
	$("section.detail .back").bind("touchend", function(){
		$("section").hide();
		$("section.finish").show();
	});
	initTooth();
}

function initTooth(){
	var toothIsOpened = true;

	$("section.tooth .tooth_up").bind("webkitTransitionEnd", function(){
		if (toothIsOpened) {
			toothIsOpened = false;
			$("section").hide();
			$("section.tooth").show();
			$("section.game").show();
			$("section.tooth .tooth_up, section.tooth .tooth_down").removeClass("close");
		}
		else {
			initGame();
			document.getElementById("audio_game").play();
		}
	});
}

function initGame(){
	$("section").hide();
	$("section.game").show();
	$("section.time").show();

	var minuteInterval;
	var time = 30;
	var minuteDom = $("section.game .minute");
	window.gameTime = time;

	setTimeout(function(){ $("section.time").removeClass("text n1 n2 n3 go").addClass("n3"); }, 1000);
	setTimeout(function(){ $("section.time").removeClass("text n1 n2 n3 go").addClass("n2"); }, 2000);
	setTimeout(function(){ $("section.time").removeClass("text n1 n2 n3 go").addClass("n1"); }, 3000);
	setTimeout(function(){ $("section.time").removeClass("text n1 n2 n3 go").addClass("go"); }, 4000);
	
	setTimeout(function(){
		$("section.time").hide();
		minuteInterval = setInterval(minute, 1000);
		initMotion();
	}, 5000);
	
	function minute(){
		--time;
		window.gameTime = time;

		if (time < 0) {
			clearInterval(minuteInterval);
			$("section").hide();
			$("section.finish").show();
			window.finish = true;
			var finishMark = $("section.finish .mark");
			var markStr = "" + window.mark;
			var markArr = markStr.split("");

			for (var i=0;i<markArr.length;++i) {
				finishMark.append('<span class="number n' + markArr[i] + '"></span>');
			}

			finishMark.append('<span class="fen"></span>');

			window.beat = window.mark < 0 ? 0 : Math.round(window.mark / 35);
			window.beat > 99 && (window.beat = 99);
			var finishBeat = $("section.finish .beat");
			var beatStr = "" + window.beat;
			var beatArr = beatStr.split("");

			for (var i=0;i<beatArr.length;++i) {
				finishBeat.append('<span class="number n' + beatArr[i] + '"></span>');
			}

			finishBeat.append('<span class="bai"></span>');
		}
		else {
			var timeStr = time < 10 ? "0" + time : "" + time;
			var timeArr = timeStr.split("");
			minuteDom.empty();
			minuteDom.append('<span class="number n' + timeArr[0] + '"></span>');
			minuteDom.append('<span class="number n' + timeArr[1] + '"></span>');
		}
	}
}

function initMotion(){
	window.addEventListener('deviceorientation', deviceMotionHandler, false);
	window.addEventListener('devicemotion', deviceMotionHandler, false);
	setInterval(objAddInterval, 500);
	setInterval(objDownInterval, 30);
	var markTimeout;
	var sectionGame = $("section.game");
	var markRed = $("section.game .mark .red");
	var bombRed = $("section.bombRed");
	var mouth = $("section.game .mouth");
	var mouthMark = $("section.game .mouth .mark");
	var mouthLine = mouth.offset().top + 96;
	var objList = [], delta = 0, mark = 0, prevX = 0;

	function deviceMotionHandler(e){
		var X = typeof e.gamma == "number" ? 9.8 * Math.sin(e.gamma * Math.PI / 180) : -e.accelerationIncludingGravity.x;
		delta = X * 260 / 9.8;
		delta >  130 && (delta =  130);
		delta < -130 && (delta = -130);

		if (!isApple && Math.abs(delta - prevX) > 50) {
			prevX = delta;
			return false;
		}

		prevX = delta;
		mouth.css({ "-webkit-transform": "translate3d(" + delta + "px, 0px, 0px)" });
	}

	function objAddInterval(){
		if (typeof window.finish != "undefined") {
			return false;
		}

		var random = Math.random() / (1 - (30 - window.gameTime) / 100);

		if (random < 0.1) {
			objList.push(new obj("noodle1"));
		}
		else if (random < 0.2) {
			objList.push(new obj("noodle2"));
		}
		else if (random < 0.35) {
			objList.push(new obj("beaf"));
		}
		else if (random < 0.5) {
			objList.push(new obj("cake"));
		}
		else if (random < 0.8) {
			objList.push(new obj("egg"));
		}
		else {
			objList.push(new obj("bomb"));
		}
	}

	function objDownInterval(){
		window.obj_a += 0.02;

		if (typeof window.finish != "undefined") {
			return false;
		}

		for (var i in objList) {
			objList[i].down();

			if (objList[i].y >= mouthLine) {
				if (Math.abs(objList[i].x + objList[i].width / 2 - 260 - delta) < 80) {
					mark += objList[i].mark;
					window.mark = mark;
					markRed.height(mark / 20);
					clearTimeout(markTimeout);
					mouthMark.removeClass().addClass("mark n" + objList[i].mark);
					markTimeout = setTimeout(function(){
						mouthMark.removeClass().addClass("mark");
					}, 1000);

					mouth.addClass("close");

					setTimeout(function(){
						mouth.removeClass("close");
					}, 200);

					if (objList[i].mark < 0) {
						bombRed.show();
						sectionGame.addClass("shake");
						document.getElementById("audio_bomb").play();

						setTimeout(function(){
							bombRed.hide();
							sectionGame.removeClass("shake");
						}, 500);
					}
				}

				objList[i].remove();
				delete objList[i];
			}
		}
	}
}

function obj(name){
	switch (name) {
		case "egg"    : this.name = "egg"    ; this.mark =    5; this.a = 4; this.marginTop = 43; this.width =  41; break;
		case "cake"   : this.name = "cake"   ; this.mark =   50; this.a = 8; this.marginTop = 86; this.width = 103; break;
		case "beaf"   : this.name = "beaf"   ; this.mark =  100; this.a = 12; this.marginTop = 50; this.width =  87; break;
		case "noodle1": this.name = "noodle1"; this.mark =  200; this.a = 16; this.marginTop = 99; this.width =  98; break;
		case "noodle2": this.name = "noodle2"; this.mark =  200; this.a = 16; this.marginTop = 71; this.width =  95; break;
		default       : this.name = "bomb"   ; this.mark = -100; this.a = 16; this.marginTop = 98; this.width =  57; break;
	}

	this.status = true;
	this.left  = Math.ceil (this.width);
	this.right = Math.floor(480 - this.width);
	this.x = Math.round(this.left + (this.right - this.left) * Math.random());
	this.y = 0;
	this.obj = $('<div class="obj ' + this.name + '"></div>').css({ left: this.x, top: this.y });
	this.obj.appendTo("section.game");
}

obj.prototype.down = function(){
	this.y += this.a + window.obj_a;
	this.obj.css({ "-webkit-transform": "translate3d(0px, " + this.y + "px, 0px)" });
};

obj.prototype.remove = function(){
	this.obj.remove();
	this.status = false;
};
document.getElementById("audio_bomb").addEventListener("ended", function(){
	document.getElementById("audio_game").play();
}, false)