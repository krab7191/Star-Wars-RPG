var detached = [];

$(document).ready(function () {
    setHp();
    $(".char-box").on("click", function (event) {              // When the page loads, attach click handlers to the chars
        $("#choosy").remove();
        selectChar(event.target.closest("div").id);
    });
});

function selectChar(id) {                 // Fires on first click, then remove handlers
    var $c = $("#" + id);
    move(id, 'your-character');
    align(id, 'good');
    var $r = $("#options div").detach();
    for (var i = 0; i < $r.length; i++) {
        $("#enemies").append($r[i]);
        align($r[i].id, 'evil');
    }
    $(".char-box").off("click");
    message("choose", id, null, " as your character");
    attachOpponentHandlers();
}
function align(selector, alignment) {       // Changes character alignment, ie. G/R outline and background
    if (alignment === 'evil') {
        $('#' + selector).removeClass('char-box-good');
        $('#' + selector).addClass('char-box-evil');
    }
    else {
        $('#' + selector).removeClass('char-box-evil');
        $('#' + selector).addClass('char-box-good');
    }
}
function move(id, to) {                  // Detach by ID and append to...
    var $c = $("#" + id).detach();
    $("#" + to).append($c);
}
function attachOpponentHandlers() {       // Attach click handlers to chars in #enemies row
    $("#enemies .char-box").on("click", function (event) {
        selectDefender(event.target.closest("div").id);
    });
}
function selectDefender(id) {              // Fires when char in enemies row is clicked
    $("#enemies .char-box").off("click");
    move(id, 'defender');
    message("choose", id, null, " as your opponent");
    $('#fight').on('click', function () {
        combat($('#your-character div')[0].id, $("#defender div")[0].id);
    });
}

function message(type, name, damage, suffix) {       // Log info to the window at bottom of screen
    var n;
    if (name) {
        n = chars[name].charName;
    }
    var mess;
    var s = "<strong>";
    var s2 = "</strong>";
    switch (type) {
        case 'choose': mess = "You choose " + s + n + s2 + suffix + "<br>";
            break;
        case 'attack': mess = "You attacked " + s + n + s2 + " for " + damage + " damage<br>";
            break;
        case 'counter': mess = s + n + s2 + " countered for " + damage + " damage<br>";
            break;
        case 'die': mess = s + n + s2 + " was defeated!<br>";
            break;
        case 'win': mess = s + "YOU WIN!" + s2;
            break;
        case 'lose': mess = s + "YOU LOSE!" + s2;
            break;
    }
    $('#info').append("> " + mess);
    scrollInfoBar();
}

// Fight functions - - - //
function removeHealth(method, damage, char) {
    $('#' + char + "-hp").html($('#' + char + "-hp").html() - damage);
    var def = $("#defender div")[0].id;
    message(method, def, damage);
}
function isAlive(char) {
    if (parseInt($("#" + char + "-hp").html()) < 1) {
        return false;
    }
    else {
        return true;
    }
}
function increaseAttack(char) {
    chars[char].ap += chars[char].bap;
}
function getCharIds(obj) {
    var foo = Object.keys(obj);
    var bar = foo.slice(2, foo.length);
    console.log(bar);
    return bar;
}

// All purpose page functions . . .
function setHp() {
    getCharIds(chars).forEach(function (index) {
        var a = chars[index].screenHealth;
        a.html(chars[index].hp);
    });
}
function empty(contId) {
    $("#" + contId).empty();
}
function scrollInfoBar() {
    $("#info").scrollTop($("#info")[0].scrollHeight);
}
function reset() {
    $("#content").prepend("<p id='choosy' class='text-center'>Pick your character:</p>");
    var op = $("#options");
    var left = $(".char-box").detach();
    var ids = getCharIds(chars);
    for (var q = 0; q < left.length; q++) {
        op.append(left[q]);
    }
    for (q = 0; q < detached.length; q++) {
        op.append(detached[q]);
    }
    for (q = 0; q < ids.length; q++) {
        chars[ids[q]].ap = chars[ids[q]].bap;
    }
    for (q = 0; q < 2; q++) {
        align(ids[q], 'good');
    }
    for (q = 2; q < 4; q++) {
        align(ids[q], 'evil');
    }
    $(".empty").empty();
    setHp();
    $(".char-box").on("click", function (event) {
        $("#choosy").remove();
        selectChar(event.target.closest("div").id);
    });
    var $b = $("#fight");
    $b.off('click');
    $b.removeClass('btn-success');
    $b.addClass("btn-danger");
    $b.html("Fight");
    $("#info").empty();
}

function resetButton() {
    var $b = $("#fight");
    $b.off('click');
    $b.removeClass('btn-danger');
    $b.addClass("btn-success");
    $b.html("Restart");
    $b.on('click', function () {
        reset();
    });
}


// Create the character objects
var chars = {
    isAlive: function (char) {
        if (char.hp < -1) {
            return false;
        }
        else {
            return true;
        }
    },
    die: function (char) {
        var dude = this[char].charContainer;
        detached.push(dude.detach());
        message('die', char);
    },
    mace: {
        screenHealth: $("#mace-hp"),
        charContainer: $("#mace"),
        charName: "Mace Windu",
        hp: 120,
        bap: 8,
        ap: 8,
        cap: 12
    },
    quigon: {
        screenHealth: $("#quigon-hp"),
        charContainer: $("#quigon"),
        charName: "Qui-Gon Jinn",
        hp: 110,
        bap: 9,
        ap: 9,
        cap: 14
    },
    dook: {
        screenHealth: $("#dook-hp"),
        charContainer: $("#dook"),
        charName: "Count Dooku",
        hp: 100,
        bap: 11,
        ap: 11,
        cap: 17
    },
    maul: {
        screenHealth: $("#maul-hp"),
        charContainer: $("#maul"),
        charName: "Darth Maul",
        hp: 90,
        bap: 12,
        ap: 12,
        cap: 18
    }
};

// - - - Actual fighting logic - - - //

function combat(pro, ant) {
    removeHealth("attack", chars[pro].ap, ant);
    if (isAlive(ant)) {                                // Counterattack
        removeHealth('counter', chars[ant].cap, pro);
        if (!isAlive(pro)) {                           // Lose the game
            chars.die(pro);
            message('lose');
            resetButton();
        }
        if (isAlive(pro)) {                           // Increase attack points
            increaseAttack(pro);
        }
    }
    else {
        $("#fight").off("click");
        chars.die(ant);
        if ($("#enemies div").length === 0) {
            message('win');
            resetButton();
        }
        else {
            attachOpponentHandlers();   // Allow user to make another enemy selection
        }
    }
}