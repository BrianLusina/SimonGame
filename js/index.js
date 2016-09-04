$(document).bind("selectstart",function(){return false;});
$(document).ready(function() {
  var maxStep = 20;
  var sequence = [];
  var playerPresses = [];
  var count = 0;
  var strict = false;
  var powerOn = false;
  var gameStarted = false;
  var uid = 0;
  var panels = {
    "panel1": ["green", "light-green", "audio1"],
    "panel2": ["red", "light-red", "audio2"],
    "panel3": ["yellow", "light-yellow", "audio3"],
    "panel4": ["blue", "light-blue", "audio4"]
  };
  var timeoutArr = [];

  function setCount(num) {
    count = num;
    setCountDisplay();
  }

  function clearAll() {
    gameStarted = false;
    setCount(0);
    strict = false;
    sequence = [];
    playerPresses = [];
    clearTimeouts();
  }

  function setCountDisplay() {
  	var str, cls;
    if (!powerOn) {
      str = (count === 0 ? "--" : (count < 10 ? "0"+count : count));
      cls = "font-dark-red";
    } else {    
      cls = "font-red";
      if (count === 0) {
        str = "--";
      } else if (count < 10) {
        str = "0" + count;
      } else {
        str = count.toString();
      }
    }
    $(".count-display").html(str);
    $(".count-display").removeClass("font-red font-dark-red").addClass(cls);
  }

  function increaseCount() {
    count += 1;
    setCountDisplay();
  }

  function clearTimeouts() {
    timeoutArr.forEach(clearTimeout);
  }

  function GameStart() {
    $(".count-display").removeClass("font-red font-dark-red").addClass("font-dark-red");
    timeoutArr.push(setTimeout(function() {
      $(".count-display").removeClass("font-red font-dark-red").addClass("font-red");
    }, 500));
    gameStarted = true;
    $(".panel").unbind('.playerPlay');
    timeoutArr.push(setTimeout(function() {
      increaseCount();
      computerPlay();
    }, 1500));
  }

  function initGame() {
    clearTimeouts();
    $(".panel").unbind('.playerPlay');
    setCount(0);
    gameStarted = false;
    sequence = [];
    playerPresses = [];
    for (var i = 0; i < maxStep; i++) {
      sequence.push(Math.floor(Math.random() * 4));
    }
    //console.log(sequence);
    GameStart();
  }

  function playerFail() {
    //console.log("playerFail!strict:", strict);
    $(".count-display").html("!!");
    $(".count-display").removeClass("font-red font-dark-red").addClass("font-red");
    timeoutArr.push(setTimeout(function(){
      $(".count-display").html("--");
      $(".count-display").removeClass("font-red font-dark-red").addClass("font-dark-red");
      timeoutArr.push(setTimeout(function() {
        $(".count-display").html("!!");
        $(".count-display").removeClass("font-red font-dark-red").addClass("font-red");
        timeoutArr.push(setTimeout(function() {
          setCountDisplay();
        }, 500));
      }, 300));
    }, 300));
    $("#audio5")[0].play();
    if (!strict) {
      $(".panel").unbind('.playerPlay');
      timeoutArr.push(setTimeout(computerPlay, 1500));
      // timeoutArr.push(setTimeout(setCountDisplay, 1500));
    } else {
      alert("You lose!");
      initGame();
    }
  }

  function setPanelColor(key) {
    $("#" + key).removeClass(panels[key][0]).addClass(panels[key][1]);
  }

  function PlaySound(key) {
    $("#" + panels[key][2])[0].play();
  }

  function setPanelColorBack(key) {
    $("#" + key).removeClass(panels[key][1]).addClass(panels[key][0]);
  }

  function computerPlay() {
    clearTimeouts();
    for (var i = 0; i < count; i++) {
      var key = "panel" + (sequence[i] + 1);
      timeoutArr.push(setTimeout(setPanelColor, i * 1000, key));
      timeoutArr.push(setTimeout(PlaySound, i * 1000, key));
      //timeoutArr.push(setTimeout(setPanelColorBack, i * 1000 + 500, key));
      setTimeout(setPanelColorBack, i * 1000 + 500, key);
    }
    timeoutArr.push(setTimeout(playerPlay, count * 1000 + 10));
    $(".panel").removeClass("cursor-pointer").addClass("cursor-auto");
  }

  function checkPresses() {
    //console.log("count:", count);
    //console.log("sequence:", sequence);
    //console.log("playerPr:", playerPresses);
    for (var i = 0; i < playerPresses.length; i++) {
      if (sequence[i] != playerPresses[i]) {
        playerFail();
        return;
      }
    }
    if (playerPresses.length === count) {
      $(".panel").unbind('.playerPlay');
      if (count === maxStep) {
        alert("you wins!");
        initGame();
      } else {
        timeoutArr.push(setTimeout(function() {
          increaseCount();
          computerPlay();
        }, 1500));
      }
    }
  }

  function checkTimeout(id) {
    // console.log("id,uid", id, uid);
    if (id === uid) {
      playerFail();
      return;
    }
  }

  function playerPlay() {
    playerPresses = [];
    timeoutArr.push(setTimeout(checkTimeout, 2000, uid));
    $(".panel").bind('mousedown.playerPlay', function() {
      $(this).removeClass(panels[$(this).attr('id')][0]).addClass(panels[$(this).attr('id')][1]);
      $("#" + panels[$(this).attr('id')][2])[0].play();
      playerPresses.push(parseInt($(this).attr('id')[5]) - 1);
      checkPresses();
      uid += 1;
      console.log("uid:",uid);
      if (playerPresses.length !== count) {
        timeoutArr.push(setTimeout(checkTimeout, 2000, uid));
      }
      $(".panel").bind('mouseup.playerPlay mouseleave.playerPlay', function() {
        $(".panel").unbind('mouseup.playerPlay mouseleave.playerPlay');
        $(this).removeClass(panels[$(this).attr('id')][1]).addClass(panels[$(this).attr('id')][0]);
      });
    });
    $(".panel").removeClass("cursor-auto").addClass("cursor-pointer");
  }

  $(".on-off-button").on('click', function() {
    powerOn = !powerOn;
    if (powerOn) {
      $(".button-off").removeClass("button-off").addClass("button-on");
      setCountDisplay();
      $(".button").bind('mousedown.buttonStart', function() {
        $(this).removeClass("button-up").addClass("button-down");
        $(this).bind('mouseup.buttonStart mouseleave.buttonStart', function() {
          $(".button").unbind('mouseup.buttonStart mouseleave.buttonStart');
          $(".button").removeClass("button-down").addClass("button-up");
          if($(this).hasClass("start-button")) {
            initGame();
          }
        });
      });
    } else {
      $(".button-on").removeClass("button-on").addClass("button-off");
      if ($(".strict-display").hasClass("red")) {
        $(".strict-display").removeClass("red").addClass("dark-red");
      }
      clearAll();
      $(".button").unbind('.buttonStart');
    }
  });

  $(".strict-button").on('click', function() {
    if (!powerOn) return;
    if (gameStarted) return;
    strict = !strict;
    if (strict) {
      $(".strict-display").removeClass("dark-red").addClass("red");
    } else {
      $(".strict-display").removeClass("red").addClass("dark-red");
    }
  });
});