// ==UserScript==
// @name           Reddit keyboard shortcuts
// @namespace      http://simulacra.in
// @description    Add some keyboard shortcuts to reddit
// @include        http://reddit.com/*
// @include        http://*.reddit.com/*
// @exclude        http://reddit.com/*/comments
// @exclude        http://*.reddit.com/*/comments
// ==/UserScript==

// Version 0.1 — <2007-08-29 Wed>
// Version 0.2 — <2007-09-16 Sun>
// Version 0.3 — <2007-10-18 Thu>
// Version 0.4 — <2007-10-20 Sat>

(function () {
  var helpText =
    ['Keyboard shortcuts include: ', '\n',
     'j — Go to the next article', '\n',
     'k — Go to the previous article', '\n',
     'v — Open current article in a new tab or window (You may need to configure the popup blocker to allow popups from reddit)', '\n',
     "c — Open current article's comments page (TODO)", '\n',
     'u — Up-vote current article', '\n',
     'd — Down-vote current article', '\n',
     '? — Display help'];

  var table = document.getElementById('siteTable');
  if (!table) {
    return;
  }

  // get the next and previous page links
  var links = document.getElementsByTagName('a');
  var nextLink = Array.filter(links, function (element) {
      return element.textContent && 'next' === element.textContent;
    })[0];
  var previousLink = Array.filter(links, function (element) {
      return element.textContent && 'prev' === element.textContent;
    })[0];

  // Get all rows that have a id that starts with ‘titlerow’
  var trs = table.getElementsByTagName('tr');
  trs = Array.filter(trs, function (element) {
      var tds = element.getElementsByTagName('td');
      if (/^titlerow.*/.test(tds[tds.length - 1].id)) {
        // For convenience’s sake, some custom properties
        element.titleCell = tds[tds.length - 1];
        var articleId = element.titleCell.id.replace(/[a-z]/g, '');
        element.upDiv = document.getElementById('up' + articleId);
        element.downDiv = document.getElementById('down' + articleId);
        return true;
      }
    });

  if (!trs || !trs.length) {
    return;
  }

  var current = 0;

  var toggleHighlight = function (cell) {
    if (cell.highlighted) {
      cell.style.backgroundColor = cell.originalBackgroundColor;
      cell.highlighted = false;
    } else {
      cell.originalBackgroundColor = cell.style.backgroundColor;
      cell.highlighted = true;
      cell.style.backgroundColor = '#FFC';
    }
  };

  toggleHighlight(trs[current].titleCell);

  var getClickEvent = function () {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    return evt;
  };

  var getMouseDownEvent = function () {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    return evt;
  };

  var scroller = (function () {
      function getElementY(element) {
        var offsetY = 0;
        var parent;

        for (parent = element; parent; parent = parent.offsetParent) {
          if (parent.offsetTop) {
            offsetY += parent.offsetTop;
          }
        }
        return offsetY;
      }

      return {
      showElement: function (element) {
          var position = getElementY(element);
          var height = document.body.offsetHeight;
          var scrollPosition = window.pageYOffset;

          if ((height + scrollPosition - position) < 10 || (position - scrollPosition) < 10) {
            window.scrollTo(0, position);
          }
        }
      };
    })();

  var openLink = function (cell) {
    if (!cell) {
      return;
    }
    var a = cell.getElementsByTagName('a')[0];
    a.dispatchEvent(getMouseDownEvent());
    window.open(a.href);
  };

  var actions = {
  106: function () { // j -- move to next item
      if (current < (trs.length - 1)) {
          toggleHighlight(trs[current].titleCell);
          current = current + 1;
          toggleHighlight(trs[current].titleCell);
          scroller.showElement(trs[current]);
      } else {
        if (nextLink) {
          window.location.href = nextLink.href;
        }
      }
    },
  107: function () { // k  -- move to previous item
      if (current) {
        toggleHighlight(trs[current].titleCell);
        current--;
        toggleHighlight(trs[current].titleCell);
        scroller.showElement(trs[current]);
      } else {
        if (previousLink) {
          window.location.href = previousLink.href;
        }
      }
    },
  118: function () { // v -- open item in a new tab/window
      openLink(trs[current].titleCell);
    },
  117: function () { // up arrow - upvote article
      trs[current].upDiv.dispatchEvent(getClickEvent());
    },
  100: function () { // down arrow - downvote article
      trs[current].downDiv.dispatchEvent(getClickEvent());
    },
  63: function () { // ? - show help
      window.alert(helpText.join(''));
    },
  99: function () { // c - display current article's comments page
      //TODO
    }
  };

  // disregard key presses on the following elements
  var ignoreTheseTags = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'];

  var handleKeyPress = function (event) {
    var tagName = event.target.tagName;
    if (ignoreTheseTags.filter(function (i) {
          return i === tagName;
        }).length) {
      return;
    }

    var code = event.charCode || event.keyCode;
    if (actions[code]) {
      actions[code]();
      event.preventDefault();
    }
  };

  document.addEventListener('keypress', handleKeyPress, true);
 })();
