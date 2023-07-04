/*
 -OWL LIBRARY
 -Copyright ( C ) DucMinh 
 -Website: owljs.org
 -MIT Linsence
 -Version: 1.0
 -Last update: 3:53 PM 4/18/2010
 */

(function () {
  window.Owl = function (w) {
    if (arguments.length > 1) {
      var a = $.toArray(arguments);
      return arguments.callee.call(window, a);
    }

    w = w || [];
    if (isOWL(w)) return w;
    if (isS(w)) {
      if (w.match(/^</i)) return $.xhtml(w);
      return DOMREADY ? new $.DOM($.Selector(w, document)) : new smartAction(w);
    } else if ((/^1|9|11$/).test(w.nodeType) || w === window) {
      return new $.DOM(w)
    } else if (isF(w)) {
      return __complete(w)
    } else {
      for (var i = 0, collect = [], ui = ID++; i < w.length; i++)
      if ((w[i] && (w[i].nodeType == 1 || w[i].nodeType == 11 || w[i].nodeType == 9)) || (w[i] == window)) {
        if (!w[i].owl_flag) w[i].owl_flag = [];
        if (w[i].owl_flag[ui]) continue;
        w[i].owl_flag[ui] = true;
        collect.push(w[i]);
      }
      return new $.DOM(collect);
    }
  };

  var $ = Owl,
    ID = -1,
    TIME_INTERVAL = 25; //25 is best for all browser
  $.version = "1.0";
  $.filter = {};
  $.makeClass = function (Class, obj) {
    Extend(Class.prototype, obj || {});
    return Class;
  };

  /* ----------------------------------- BEGIN FIXDOM ---------------------------------------- */
  //SOME CONSTANT VARIABLE
  var TAG_HTML_SOURCE = /(?:[\w\u00c0-\uFFFF_\-]|\\.|\*)+/i;
  var ATTRIBUTE_HTML_SOURCE = /\s*([^= '"\/]+)(=(?:(?:("|')([^\3]*?)\3)|([^ '"]*)))?\s*/i;
  var DOM = {
    kind: {
      empty: "",
      full: ""
    },
    text: function (text, root) {
      //this function fix misstake auto convert <,> to &gt;&lt
      root = root || document;
      var div = root.createElement("div");
      div.innerHTML = text;
      //if text is a space ie not create textnode;
      return div.firstChild || root.createTextNode(text);
    },
    inner: function (elem) {
      if (elem.tagName == "TEXTAREA") return elem.value;
      return elem.innerHTML;
    },
    outer: function (elem) {
      if (elem.outerHTML !== undefined) return elem.outerHTML;
      var e = elem.ownerDocument.createElement('body');
      e.appendChild(elem.cloneNode(true));
      return DOM.inner(e);
    },
    set: function (att, elem, JS) {
      //cross adding attributes for element
      //this is not resever method of get
      if (att == "") return;
      var ats = {},
        text = "";
      if (isS(att)) text = att + "";
      else for (var x in att) text += ' ' + x + '="' + att[x].replace(/'/gi, '\\"') + '"';

      if (isS(att)) Loop($.matchArray(ATTRIBUTE_HTML_SOURCE, trim(att).replace(/\/$/i, "")), function (at, i) {
        function j(a) {
          return a !== undefined && a !== ""
        }
        if (trim(at[1]) == trim(at[0])) ats[at[1]] = "";
        else ats[at[1]] = j(at[5]) ? at[5] : j(at[4]) ? at[4] : "";
      });
      else ats = att;
      //clone a element to check event-attribute	
      var clone = elem.ownerDocument.createElement("div");
      clone.innerHTML = "-<div " + text + ">-</div>";
      clone = clone.getElementsByTagName("div")[0];
      if (!clone) return false;
      //finish convert att to object
      Each(ats, function (value, name) {
        var spec = {
          "class": "className",
          "for": "htmlFor",
          name: "name"
        };
        if (name == "src" && elem.tagName == "SCRIPT" && (JS !== undefined)) {
          JS.push([elem, 'src', value]);
        } else if (name == "style") {
          elem.style.cssText = value;
        } else if (spec[name]) {
          elem[spec[name]] = value;
        } else if (isF(clone[name])) {
          elem[name] = clone[name];
        } else {
          try {
            elem.setAttribute(name, value, 2);
          } catch(e) {}
        }
      });
    },
    isEmpty: function isEmpty(tag) {
      var elem = $.Create(tag);
      if (DOM.kind.full.indexOf("," + elem.tagName + ",") > -1) return false;
      if (DOM.kind.empty.indexOf("," + elem.tagName + ",") > -1) return true;
      var source = DOM.outer(elem);
      //ie addd <?XML:NAMESPACE if tag isn't a basic tag
      source = trim((source + "").replace(/^\<\?XML:NAMESPACE [^<]+\/>/i, ""));
      if (source.match(/^\<([^<]+)>\<\/\1>$/i)) {
        DOM.kind.full += "," + elem.tagName + ",";
        return false;
      } else {
        DOM.kind.empty += "," + elem.tagName + ",";
        return true;
      }
    },
    insert: function (where, html, elem, home, index, dis_js, o_where, o_elem, order, JS) {
      //deny empty text ,null,undefined
      //note: A=="" always return true -> fix
      if ((html === null) || (html === undefined)) return elem;

      var fn = where == "append" ? fn_append : where == "after" ? fn_after : where == "first" ? fn_first : where == "replace" ? fn_replace : fn_before;
      var cText = DOM.text;
      o_where = o_where || fn;
      o_elem = o_elem || elem;
      order = order || 0;

      //need a array JS
      if (!JS) JS = [];
      if (html === "") {
        fn(elem, DOM.text('', elem.ownerDocument), {},
        true);
        initJS(dis_js, JS);
        return elem
      }

      //convert with function
      if (isF(html)) html = html.call(home, index);

      //insert with element
      if (html.nodeType == 1 || html.nodeType == 3) return fn(elem, html, {},
      true);
      html = html + "";



      function isCol(e) {
        return e.tagName == "TD"
      }



      function isRow(e) {
        return e.tagName == "TR"
      }

      //insert text or element into anywhere
      function fn_append(a, b, c, d) {
        //tr-table
        if (a.tagName == "TABLE" && isRow(b) && !d) {
          var r = a.insertRow(a.rows.length);
          DOM.set(c, r);
          return r
        }
        //col-tr
        if (isRow(a) && isCol(b) && !d) {
          var r = a.insertCell(a.cells.length);
          DOM.set(c, r);
          return r
        }

        if (a.styleSheet && (a.styleSheet.cssText !== undefined) && !d) {
          a.styleSheet.cssText += b.nodeValue;
        } else if (a.tagName == "TEXTAREA") {
          a.value += b;
        } else {
          a.appendChild(b);
        }
        return b
      }



      function fn_before(a, b, c, d) {
        if (isRow(b) && isRow(a) && !d) {
          var r = a.parentNode.insertRow(a.rowIndex);
          DOM.set(c, r);
          return r
        }

        if (isCol(a) && isCol(b) && !d) {
          var r = a.parentNode.insertCell(a.cellIndex);
          DOM.set(c, r);
          return r
        }
        a.parentNode.insertBefore(b, a);
        return b
      }



      function fn_first(a, b, c, d) {
        if (a.firstChild) return fn_before(a.firstChild, b, c, d);
        else return fn_append(a, b, c, d)
      }



      function fn_after(a, b, c, d) {
        if (a.nextSibling) return fn_before(a.nextSibling, b, c, d);
        else return fn_append(a.parentNode, b, c, d)
      }



      function fn_replace(a, b, c, d) {
        if (b.tagName == "TR" && a.tagName == "TR" && !d) {
          var r = a.parentNode.insertRow(a.rowIndex);
          a.parentNode.deleteRow(a.rowIndex + 1);
          DOM.set(c, r);
          return r
        }
        if (isCol(a) && isCol(b) && !d) {
          var r = a.parentNode.insertCell(a.cellIndex);
          a.parentNode.deleteCell(a.cellIndex + 1);
          DOM.set(c, r);
          return r
        }
        a.parentNode.replaceChild(b, a);
        return b
      }



      function isSpecTag(tag) {
        return tag == "TBODY" || tag == "THEAD" || tag == "TFOOT";
      }



      function initJS(dis_js, JS) {
        //append script lastest insert
        if (dis_js !== true) {
          for (var x = 0; x < JS.length; x++) {
            try {
              JS[x][0].type = "text/javascript";
              JS[x][0][JS[x][1]] = JS[x][2];
            } catch(e) {}
          }
        }
      }

      //remember
      var m, root = o_elem.ownerDocument,
        f = arguments.callee;

      var SPEC_TAG = {
        OBJECT: function (m, el, html, elem, home, index, dis_js, o_where, o_elem, order, JS) {
          var mat = html.match(/\<\/object>/i);
          //so carazy about ie, object intake params but not set childNodes
          var div = document.createElement("div");
          if (mat) {
            div.innerHTML = m[0] + html.slice(0, mat.index) + "</object>";
            html = RegExp.rightContext;
          } else {
            div.innerHTML = m[0] + html + "<object>";
            html = "";
          }
          var _el = div.firstChild;
          //fix object empty , ie auto add a undefined-textNode if object doesn't contains any param
          el.parentNode.replaceChild(_el, el);

          if (html != "") f("after", html, _el, home, index, true, o_where, o_elem, order, JS);
        },
        SCRIPT: function (m, el, html, elem, home, index, dis_js, o_where, o_elem, order, JS) {
          var mat = html.match(/\<\/script>/i),
            js = "";
          if (mat) {
            js = html.slice(0, mat.index);
            html = RegExp.rightContext;
          } else {
            js = html;
            html = "";
          }
          if (js != "") JS.push([el, 'text', js]);
          if (html != "") f("after", html, el, home, index, true, o_where, o_elem, order, JS);
        },
        SELECT: function (m, el, html, elem, home, index, dis_js, o_where, o_elem, order, JS) {
          var mat = html.match(/\<\/select>/i),
            opt = "";
          if (mat) {
            opt = html.slice(0, mat.index);
            html = RegExp.rightContext;
          } else {
            opt = html;
            html = "";
          }
          //convert options
          opt = opt.replace(/\n+/gi, "</option>");
          f("append", opt, el, home, index, true, o_where, o_elem, order, JS);
          if (html != "") f("after", html, el, home, index, true, o_where, o_elem, order, JS);
        }
      };

      //textarea auto fill up
      if (elem.tagName == "TEXTAREA" && where == "append") {
        var closet = html.match(/\<\/textarea>/i);
        if (!closet) {
          elem.value += html;
          initJS(dis_js, JS);
          return elem;
        } else {
          elem.value += html.slice(0, closet.index);
          html = RegExp.rightContext;
          if (html != "") f("after", html, elem, home, index, true, o_where, o_elem, order, JS);
          initJS(dis_js, JS);
          return elem;
        }
      }

      //remove some bad tag
      html = html.replace(/^\<\/?(tbody|tfoot|thead)((\s|:)[^<>]*)?>?/i, "");

      // start a text	
      if (m = html.match(/^([^<]+)/i)) {
        html = RegExp.rightContext;
        var text = cText(m[1], root);
        try {
          //ie throw error if can't acess
          fn(elem, text);
        } catch(e) {
          //hidden text
          f(where, html, elem, home, index, true, o_where, o_elem, order, JS);
          initJS(dis_js, JS);
          return elem;
        }
        if (html != "") f("after", html, text, home, index, true, o_where, o_elem, order, JS);
        initJS(dis_js, JS);
      } else if (m = html.match(/^\<!--?([\s\S]*?)-->/i)) {
        var html = RegExp.rightContext,
          com = root.createComment(m[1]);
        fn(elem, com);
        if (html != "") f("after", html, com, home, index, true, o_where, o_elem, order, JS);
        initJS(dis_js, JS);
      } else if (m = html.match(/^\<([^\/\s<>]+)([^<>]*)?(?:\/?>)?/i)) {
        //contain tag not close : <a <b>example</b></a> => <a href=''><b></b></a> 
        var html = RegExp.rightContext || "";
        try {
          if (m[2] !== undefined) {
            try {
              var el = root.createElement("<" + m[1] + " " + m[2] + ">");
            } catch(e) {
              var el = root.createElement(trim(m[1]));
            }
          } else {
            var el = root.createElement(trim(m[1]));
          }
        } catch(e) {
          if (html != "") f(where, html, elem, home, index, true, o_where, o_elem, order, JS);
          initJS(dis_js, JS);
          return elem;
        }

        DOM.set(m[2] || "", el, JS);

        //element must set attributes before appending - fix input (type) on ie
        //ie throw an error if can't access
        try {
          el = fn(elem, el, m[2] || "");
        } catch(e) {
          f(where, html, elem, home, index, true, o_where, o_elem, order, JS);
          initJS(dis_js, JS);
          return elem;
        }

        //some tag must manual-convert
        if (SPEC_TAG[el.tagName + ""]) {
          SPEC_TAG[el.tagName].call(elem, m, el, html, elem, home, index, true, o_where, o_elem, order, JS);
          initJS(dis_js, JS);
          return elem;
        }

        if (DOM.isEmpty(el.tagName)) {
          f("after", html, el, home, index, true, o_where, o_elem, order, JS);
          initJS(dis_js, JS);
          return elem;
        } else {
          f("append", html, el, home, index, true, o_where, o_elem, order + 1, JS);
          initJS(dis_js, JS);
          return elem;
        }

      } else if (m = html.match(/^\<\/(\w+)>?/i)) {
        var html = RegExp.rightContext,
          node = elem,
          tag = Up(m[1]),
          k = order + 0;
        if (html == "") {
          initJS(dis_js, JS);
          return elem;
        }
        //escape if not have open tag
        if (order == 0) {
          f(where, html, elem, home, index, true, o_where, o_elem, order, JS);
          initJS(dis_js, JS);
          return elem;
        }

        while (order >= 0) {
          //find open tag and quit
          if (node.tagName == tag) {
            f("after", html, node, home, index, true, o_where, o_elem, order, JS);
            initJS(dis_js, JS);
            return elem;
          }
          node = node.parentNode;
					if( node ){
						if (!isSpecTag(node.tagName || "")) order--;
					}else{
						break;
					}	
        }
        //not found open tag from position insert
        f(where, html, elem, home, index, true, o_where, o_elem, k, JS);
        initJS(dis_js, JS);
        return elem;
      } else {
        html = html.replace(/^\<[^<>]*>?/i, "");
        f(where, html, elem, home, index, true, o_where, o_elem, order, JS);
        initJS(dis_js, JS);
        return elem;
      }
    }
  };

  /* ----------------------------------- BEGIN SELECTOR ---------------------------------------- */
  (function () {
    RegExp.prototype.init = function (str) {
      var match = this.exec(str);
      if (RegExp.prototype.lastMatch === undefined && match) RegExp.lastMatch = match[0]; //opera not support lastMatch
      return match && (match.index == 0) ? match : null;
    };
    //Only simple return a msg when selector error
    var ERROR = "DOM Selector systax error",
      UID = 0;
    var TAG = /(?:[\w\u00c0-\uFFFF_\-]|\\.|\*)+/,
      HASH = /#((?:[\w\u00c0-\uFFFF_\-]|\\.)+)/,
      CLASS = /\.([\w\u00c0-\uFFFF_\-]+)/,
      ATTR = /\[\s*((?:[\w\u00c0-\uFFFF_\-]|\\.)+)(?:\s*((?:\^|\$|\*|~|\||\!)?=)\s*((?:[\w\u00c0-\uFFFF_\-]+)|(?:(?:('|")[^\4]+(\4)))))?\s*\]/,
      PSEUDO = /:((?:[\w\u00c0-\uFFFF_\-]|\\.)+)(?:\(((?:\(.*\)|[^()]|\\\(|\\\))+)\))?/,
      SIMPLE = /(?:(?:\((?:\(.*?\)|[^()]|\\(|\\))+\))|(?:\[[^\]]+\])|[^\s\+>~])*/,
      PART = /(\s*[\s\+\>~]\s*)((?:(?:\([^()]+\))|(?:\[[^\]]+\])|[^\s\+>~])+)/,
      SYSTAX = /(?:\((?:\(.*?\)|[^()]|\\(|\\))+\)|\[[^\]]+\]|[^,\(\)\[\]])+(?=\s*,\s*)/;

    var Hawk = function (selector, root, max) {
      if (root === undefined) root = document;
      if (!root) return [];
      if (window.Owl) {
        if (root.querySelectorAll && root.nodeType == 9) try {
          return root.querySelectorAll(selector);
        } catch(e) {}
        if (root.getElementsByClassName && selector.match(/^\.([\w\u00c0-\uFFFF_\-]+)$/i)) try {
          return root.getElementsByClassName(RegExp.$1);
        } catch(e) {}
      }
      if (max === undefined) max = -1;
      //test for multiple selector
      if (SYSTAX.init(selector)) {
        var __selector = RegExp.lastMatch;
        if ((RegExp.rightContext != "") && RegExp.rightContext.match(/^\s*,\s*(?!\s)/)) {
          var find = Hawk(RegExp.rightContext, root, -1),
            found = Hawk(__selector, root, max);
          return Hawk.concat(find, found, max);
        } else {
          throw ERROR;
        }
      }
      if (selector.match(/^body\s+(?![+>~])(.*)$/i) && root.body) return Hawk(RegExp.$1, root.body);
      if (selector.match(/^#((?:[\w\u00c0-\uFFFF_\-]|\\.)+)\s+(?![+>~])(.*)$/i) && root.getElementById) return Hawk(RegExp.$2, root.getElementById(RegExp.$1));
      //eval string selector to a array
      var splitSelector = [],
        match;
      //start must is a simple
      if (SIMPLE.init(selector)) {
        selector = RegExp.rightContext;
        splitSelector.push(Hawk.evalDetail(RegExp.lastMatch));
      } else {
        throw ERROR;
      }
      while (selector.length) if (match = PART.init(selector)) {
        selector = RegExp.rightContext;
        splitSelector.push(match[1].replace(/\s+/g, ""));
        splitSelector.push(Hawk.evalDetail(match[2]));
      } else {
        throw ERROR;
      }
      return Hawk.searchEnd(splitSelector, root, max);
    };
    Hawk.searchEnd = function (splitSelector, root, max) {
      var last = splitSelector.pop(),
        html = root,
        elems = [];
      if (!last.TAG) last.TAG = [
        ["*"]];
      if ((splitSelector[1] == "" || splitSelector[1] == ">") && splitSelector[0].HASH && root.getElementById) html = root.getElementById(splitSelector[0].HASH[0][0]);
      if (last.HASH && root.getElementById) {
        var obj = html.getElementById(last.HASH[0][0]);
        if (!obj) return [];
        elems.push(obj);
        if (!last.TAG && !last.ATTR && !last.CLASS && !last.PSEUDO && (last.HASH.length == 1 && (max === -1)) && !splitSelector.length) return elems;
      } else if (last.CLASS && root.getElementsByClassName) {
        elems = html.getElementsByClassName(last.CLASS[0][0]);
        if (!last.HASH && !last.ATTR && !last.PSEUDO && !last.TAG && !splitSelector.length && (max === -1)) return elems;
      } else if (last.TAG && last.TAG[0]) { // fragdocument doesn't has 'getElementsByTagName' but	selectorAll or childNodes 
        if (html.getElementsByTagName) elems = html.getElementsByTagName(last.TAG[0][0]);
        else if (html.querySelectorAll) elems = html.html.querySelectorAll(last.TAG[0][0]);
        else elems = elems.childNodes || [];
        if (!last.HASH && !last.ATTR && !last.CLASS && !last.PSEUDO && !splitSelector.length && (max === -1)) return elems;
      }
      var result = [];
      if (splitSelector.length == 0) {
        for (var i = 0; i < elems.length; i++) {
          if (max == result.length) break;
          if (Hawk.satisfy(elems[i], last)) result.push(elems[i]);
        }
      } else {
        for (var i = 0; i < elems.length; i++) {
          if (max == result.length) break;
          if (Hawk.satisfy(elems[i], last)) {
            var app = splitSelector.slice(0);
            if (Hawk.COMBINEEND(elems[i], app.pop(), app.pop(), app, root)) result.push(elems[i])
          }
        }
      }
      return result;
    };
    Hawk.COMBINEEND = function (element, combine, detail, app, root) {
      var fn = arguments.callee,
        ui = UID++;
      switch (combine) {
      case ">":
        var node = Parent(element);
        if (!node.owl_qr) node.owl_qr = [];
        if (node.owl_qr[ui] !== undefined) return node.owl_qr[ui];
        if (!node || (!Hawk.contains(node, root) && (node !== root)) || !Hawk.satisfy(node, detail)) return node.owl_qr[ui] = false;
        if (!app.length) return node.owl_qr[ui] = true;
        return node.owl_qr[ui] = fn(node, app.pop(), app.pop(), app, root);
      case "+":
        var node = Hawk.pre(element);
        if (node && !node.owl_qr) node.owl_qr = [];
        if (node && (node.owl_qr[ui] !== undefined)) return node.owl_qr[ui];
        if (!node || !Hawk.contains(node, root) || !Hawk.satisfy(node, detail)) {
          if (node) node.owl_qr[ui] = false;
          return false;
        }
        if (!app.length) return node.owl_qr[ui] = true;
        return node.owl_qr[ui] = fn(node, app.pop(), app.pop(), app, root);
      case "~":
        var node = element;
        while (node = Hawk.pre(node)) {
          if (!node.owl_qr) node.owl_qr = [];
          if (node.owl_qr[ui] !== undefined) return node.owl_qr[ui];
          if (Hawk.satisfy(node, detail) && Hawk.contains(node, root)) if (!app.length) {
            node.owl_qr[ui] = true;
            return true;
          } else {
            var appz = app.slice(0);
            if (fn(node, app.pop(), app.pop(), app, root)) {
              node.owl_qr[ui] = true;
              return true;
            }
          }
          node.owl_qr[ui] = false;
        }
        return false;
      case "":
        var node = element;
        while (node = Parent(node)) {
          if (!node.owl_qr) node.owl_qr = [];
          if (node.owl_qr[ui] !== undefined) return node.owl_qr[ui];
          if (Hawk.satisfy(node, detail) && (Hawk.contains(node, root) || node == root)) if (!app.length) {
            return node.owl_qr[ui] = true;
          } else {
            var appz = app.slice(0);
            if (fn(node, appz.pop(), appz.pop(), appz, root)) return node.owl_qr[ui] = true;
          }
          node.owl_qr[ui] = false;
        }
        return false;
      default:
        throw ERROR;
      }
    };
    Hawk.satisfy = function (elem, details) {
      if (!elem || elem.nodeType != 1) return false;
      if (details == {}) return true;
      if (details.nodeType == 1) return details === elem;
      for (var x in details) {
        for (var j = 0; j < details[x].length; j++) if (!Hawk.check[x].apply(elem, details[x][j])) return false;
      }
      return true;
    };
    Hawk.evalDetail = function (simple) {
      var details = {},
        match;
      if (TAG.init(simple)) {
        simple = RegExp.rightContext;
        if (!details.TAG) details.TAG = [];
        details.TAG.push([RegExp.lastMatch.replace(/\\/g, "").toUpperCase()]);
      }
      while (simple != "") {
        if (HASH.init(simple)) {
          simple = RegExp.rightContext;
          if (!details.HASH) details.HASH = [];
          details.HASH.push([RegExp.$1.replace(/\\/g, "")]);
        } else if (CLASS.init(simple)) {
          simple = RegExp.rightContext;
          if (!details.CLASS) details.CLASS = [];
          details.CLASS.push([RegExp.$1.replace(/\\/g, "")]);
        } else if (match = ATTR.init(simple)) {
          simple = RegExp.rightContext;
          if (match[1]) match[1] = match[1].replace(/\\/g, "");
          if (match[2]) match[2] = match[2].replace(/\s+/g, "");
          if (match[3]) match[3] = match[3].replace(/^(['|"])(.*)(\1)$/, "$2");
          if (!details.ATTR) details.ATTR = [];
          details.ATTR.push([match[1], match[2], match[3]]);
        } else if (match = PSEUDO.init(simple)) {
          if (!details.PSEUDO) details.PSEUDO = [];
          simple = RegExp.rightContext;
          if (match[1]) match[1] = match[1].replace(/\\/g, "");
          if (match[2]) match[2] = match[2].replace(/^(['|"])(.*)(\1)$/, "$2");
          if (match[1] == "not") {
            var text = match[2] + ",",
              detail = [];
            while (SYSTAX.init(text)) {
              text = RegExp.rightContext;
              if (match[1] == "has") detail.push(RegExp.lastMatch);
              else detail.push(Hawk.evalDetail(RegExp.lastMatch));

              if (text.match(/^\s*,\s*(?!\s)/)) text = RegExp.rightContext;
              else throw ERROR;
            }
            if (text) throw ERROR;
            details.PSEUDO.push([match[1], detail]);
            continue;
          }
          if (match[1] == "nth-last-child" || match[1] == "nth-child" || match[1] == "nth-of-type" || match[1] == "nth-last-of-type") match[2] = Hawk.nth(match[2] || "");
          details.PSEUDO.push([match[1], match[2]]);
        } else {
          throw ERROR;
        }
      }
      return details;
    };
    Hawk.check = {
      TAG: function (tag) {
        if (tag == "" || tag == "*") return true;
        return this.tagName == tag;
      },
      HASH: function (id) {
        return this.id == id;
      },
      CLASS: function (name) {
        return (" " + this.className + " ").indexOf(" " + name + " ") > -1;
      },
      ATTR: function (attr, opera, test) {
        var value = Hawk.attr(this, attr);
        if (value == null) return opera == "!=";
        if (!opera) return true;
        if (opera == "!=") return value !== test;
        if (opera == "=") return value === test;
        if (opera == "*=") return value.indexOf(test) > -1;
        if (opera == "^=") return value.indexOf(test) == 0;
        if (opera == "$=") return value.lastIndexOf(test) + test.length == value.length;
        if (opera == "|=") return (value === test) || (value.substr(0, value.length + 1) === (test + "-"));
        if (opera == "~=") return (value.match(/\s/i) == null) && ((" " + value + " ").indexOf(" " + test + " ") > -1);
        return false;
      },
      PSEUDO: function (pseudo, argums) {
        if (argums == "" || argums === undefined) {
          if (Hawk.SIMPLEPSEUDO[pseudo]) {
            return Hawk.SIMPLEPSEUDO[pseudo](this)
          } else {
            throw ERROR;
          }
        } else {
          if (Hawk.FUNCPSEUDO[pseudo]) {
            return Hawk.FUNCPSEUDO[pseudo](this, argums)
          } else {
            throw ERROR
          }
        }
        return true;
      }
    }; // test is nodeA among nodeB , nodeA must is a element
    Hawk.contains = function (nodeA, nodeB) {
      if (!nodeB || !nodeA || nodeA.nodeType != 1) return false;
      //fix if nodeB is document
      if (nodeB.nodeType == 9) return arguments.callee(nodeA, nodeB.documentElement);
      return nodeB.contains ? (nodeA !== nodeB) && nodeB.contains(nodeA) : nodeB.compareDocumentPosition ? !!(nodeB.compareDocumentPosition(nodeA) & 16) : false;
    };
    (function () {
      //choose the best way for some method of array
      var div = document.createElement("div");
      div.className = "f";
      Hawk.attr = div.getAttribute("class") === "f" ?
      function (elem, attr) {
        return elem.getAttribute(attr);
      } : function (elem, attr) {
        if (attr == "class") return elem.className;
        if (attr == "style") return elem.style.cssText;
        if (attr == "for") return elem.htmlFor;
        if (attr == "name") return elem.name; //fix ie7-
        return elem.getAttribute(attr, 2);
      };
      div = null //free memory
    })();
    Hawk.next = function (elem) {
      var node = elem;
      while (node = (node.nextElementSibling || node.nextSibling)) if (node.nodeType == 1) return node;
      return null
    };
    Hawk.pre = function (elem) {
      var node = elem;
      while (node = (node.previousElementSibling || node.previousSibling)) if (node.nodeType == 1) return node;
      return null
    };
    /*---------------------------------------------------------------------------------*/
    //SUPPORT SIMPLE PSEUDO & PSEUDO FUNCTION
    /*---------------------------------------------------------------------------------*/
    Hawk.SIMPLEPSEUDO = {
      "first-child": function (e) {
        return Parent(e) && !Hawk.pre(e);
      },
      "last-child": function (e) {
        return Parent(e) && !Hawk.next(e);
      },
      "only-child": function (e) {
        return Parent(e) && !Hawk.pre(e) && !Hawk.next(e);
      },
      "first-of-type": function (e) {
        return Parent(e) && !Hawk.preType(e);
      },
      "last-of-type": function (e) {
        return Parent(e) && !Hawk.nextType(e);
      },
      "only-of-type": function (e) {
        return Parent(e) && !Hawk.preType(e) && !Hawk.nextType(e);
      },
      enabled: function (e) {
        return !e.disabled;
      },
      disabled: function (e) {
        return e.disabled;
      },
      checked: function (e) {
        return x.checked;
      },
      indeterminate: function (e) {
        return e.indeterminate;
      },
      target: function (e) {
        return location.hash && (e.id == location.hash.slice(1))
      }
    };
    Hawk.FUNCPSEUDO = {
      contains: function (e, text) {
        return (e.innerText || e.textContent || "").indexOf(text) > -1
      },
      has: function (e, str) {
        return Hawk(str, e, 1) > 0
      },
      not: function (e, details) {
        for (var i = 0; i < details.length; i++) if (Hawk.satisfy(e, details[i])) return false;
        return true
      },
      filter: function (e, fc) {
        var f = $.filter[fc];
        return isF(f) ? !!f.call(e) : false
      },
      'nth-child': function (e, pos) {
        var parent = Parent(e),
          index = Hawk.checkOrder(e, "begin");
        if (!parent) return false;
        return pos[0] == 1 ? (pos[1] == index) : (((index - pos[1]) % pos[0] == 0) && (index - pos[1] > 0));
      },
      'nth-last-child': function (e, express) {
        var parent = Parent(e),
          index = Hawk.checkOrder(e, "last");
        if (!parent) return false;
        return pos[0] == 1 ? (pos[1] == index) : (((index - pos[1]) % pos[0] == 0) && (index - pos[1] > 0));
      },
      'nth-of-type': function (e, pos) {
        var parent = Parent(e),
          index = Hawk.checkType(e, "begin");
        if (!parent) return false;
        return pos[0] == 1 ? (pos[1] == index) : (((index - pos[1]) % pos[0] == 0) && (index - pos[1] > 0));
      },
      'nth-last-of-type': function (e, pos) {
        var parent = Parent(e),
          index = Hawk.checkType(e, "end");
        if (!parent) return false;
        return pos[0] == 1 ? (pos[1] == index) : (((index - pos[1]) % pos[0] == 0) && (index - pos[1] > 0));
      }
    };
    Hawk.nth = function (express) {
      express = express.replace(/even/, "2n").replace(/odd/, "2n+1").replace(/\s+/g, "");
      if (express == "") throw ERROR;
      if (express.match(/^(?:([\-\+]?\d+)?n)?([\-\+]?\d+)?$/)) return [parseInt(RegExp.$1) || 1, parseInt(RegExp.$2) || 0];
      throw ERROR;
    };
    Hawk.checkOrder = function (e, type) {
      try {
        var all = Parent(e).children;
        var index = Hawk.indexOf.call(all, e) + 1;
        return type == "begin" ? index : (all.length - index)
      } catch(e) {
        var i = 0,
          node = e;
        if (type == "begin") while (node = Hawk.pre(node)) {
          i++;
          if (node === e) break;
        }
        if (type == "last") while (node = Hawk.next(node)) {
          i++;
          if (node === e) break;
        }
        return i;
      }
    };
    Hawk.checkType = function (e, type) {
      var i = 0,
        node = e;
      if (type == "begin") while (node = Hawk.pre(node)) {
        if (node.tagName == e.tagName) i++;
        if (node === e) break;
      }
      if (type == "last") while (node = Hawk.next(node)) {
        if (node.tagName == e.tagName) i++;
        if (node === e) break;
      }
      return i;
    };
    Hawk.toArray = function (list) {
      try {
        return Array.prototype.slice.call(list, 0);
      } catch(e) {
        var result = [];
        for (var i = 0; i < list.length; i++) result.push(list[i]);
        return result;
      }
    };
    Hawk.indexOf = function (element) {
      var length = this.length;
      for (var i = 0; i < length; i++) {
        var current = this[i];
        if (! (typeof(current) === 'undefined') || i in this) {
          if (current === element) return i;
        }
      }
      return -1;
    };
    if (Array.prototype.indexOf) {
      try {
        Array.prototype.indexOf.call(document.documentElement.childNodes, document.documentElement.firstChild);
        Hawk.indexOf = Array.prototype.indexOf;
      } catch(e) {}
    }
    Hawk.concat = function () {
      var result = [],
        ui = UID++;
      for (var i = 0; i < arguments.length; i++) for (var j = 0; j < arguments[i].length; j++) {
        if (!arguments[i][j].owl_qr) arguments[i][j].owl_qr = [];
        if (!arguments[i][j].owl_qr[ui]) {
          result.push(arguments[i][j]);
          arguments[i][j].owl_qr[ui] = true;
        }
      }
      return result;
    };
    $.Selector = Hawk;
  })();

  /* ----------------------------------- BEGIN DOM MANAGER ----------------------------------- */

  $.toArray = $.Selector.toArray;
  $.test = function (simple, element) {
    return $.Selector.satisfy(element, $.Selector.evalDetail(simple));
  };
  $.DOM = function (nodes) {
    this.nodes = isDOM(nodes) ? [1, nodes].slice(1) : $.toArray(nodes);
    var a = $.toArray(arguments);
    if (a.length > 1) {
      a.shift();
      while (a.length) this.add(a.shift())
    }
  }; //basic method
  Extend($.DOM.prototype, {
    each: function (fn) {
      var elem = this.nodes;
      for (var i = 0; i < elem.length; i++) {
        if (elem[i] == window || (elem[i] && (elem[i].nodeType == 1 || elem[i].nodeType == 9 || elem[i].nodeType == 11))) {
          if (fn.call(elem[i], i) === false) break
        }
      }
      return this
    },
    eachElement: function (fn) {
      return this.each(function (i) {
        if (this.nodeType == 1) return fn.call(this, i)
      })
    },
    val: function (fn) {
      var value = null;
      this.each(function (i) {
        if (this) value = fn.call(this, i);
        return false
      });
      return value
    },
    k: function (i) {
      if (i < 0) i = this.nodes.length + i;
      return this.nodes[i] || null
    },
    size: function () {
      return this.nodes.length
    },
    slice: function () {
      this.nodes = $.toArray(this.nodes);
      this.nodes = this.nodes.slice.apply(this.nodes, $.toArray(arguments));
      return this
    },
    add: function (str) {
      if (!str) return this;
      if (isS(str)) str = $.Selector(str);
      else if (isDOM(str)) str = [1, str].slice(1);
      else if (isOWL(str)) str = str.nodes;
      this.nodes = $.Selector.concat(this.nodes, str);
      return this
    },
    cache: function (n, fc) {
      window[n] = fc.call(this);
      return this;
    },
    copy: function () {
      return $($.toArray(this.node))
    },
    reset: function (arr) {
      this.nodes = arr;
      return this
    },
    clone: function (bool) {
      return this.eachElement(function (element, i) {
        this.nodes[i] = element.cloneNode(bool);
      })
    },
    setAttr: function (name, value) {
      if (arguments.length >= 2) {
        var objA = {};
        objA[name] = value;
      } else {
        var objA = name
      }
      var text = " ";
      for (var x in objA) text += x + '="' + objA[x].replace(/\"/gi, '\"') + '\" ';
      return this.eachElement(function () {
        DOM.set(text, this);
        return true;
      })
    },
    removeAttr: function (name) {
      return this.eachElement(function () {
        var element = this;
        Loop(name.split(/\s+/), function (at) {
          switch (at) {
          case "class":
            element.className = "";
            break;
          case "for":
            element.htmlFor = "";
            break;
          default:
            element.removeAttribute(at)
          }
        })
      })
    },
    getAttr: function (name) {
      return this.val(function () {
        return $.Selector.attr(this, name)
      })
    },
		set: function( name, value ){
      if (arguments.length >= 2) {
        var obj = {};
        obj[name] = value;
      } else {
        var obj = name;
      }
      return this.eachElement(function () {
				for( var x in obj ){
					this[x] = obj[x];
				}
        return true;
      })		
		},
		get: function( name ){
			return this.k(0) ? this.k(0)[name] : undefined;
		}
  });

  //cache & data
  var DATA_DOM = {},
    DATA_ID = 0;
  Extend($.DOM.prototype, {
    setData: function (data, value) {
      return this.each(function () {
        if (isF(this.setUserData)) {
          this.setUserData(data, value, null);
        } else {
          if (!DATA_DOM[data]) DATA_DOM[data] = [];
          for (var i = 0; i < DATA_DOM[data].length; i++) if (DATA_DOM[data][i][0] === this) {
            DATA_DOM[data][i][1] = value;
            return
          }
          DATA_DOM[data].push([this, value]);
        }
      });
    },
    getData: function (data) {
      return this.val(function () {
        if (this.getUserData) return this.getUserData(data);
        if (!DATA_DOM[data]) return null;
        for (var i = 0; i < DATA_DOM[data].length; i++) if (DATA_DOM[data][i][0] === this) return DATA_DOM[data][i][1];
        return null
      });
    }
  }); //search selector
  Extend($.DOM.prototype, {
    find: function (selector) {
      var r = [];
      return this.each(function () {
        r = r.concat($.toArray($.Selector(selector, this)));
      }).reset($.Selector.concat(r, []))
    },
    parent: function (expr) {
      var r = [];
      return this.eachElement(function () {
        var node = this,
          i = 0;
        if (expr === undefined) expr = "*";
        while (node = Parent(node)) {
          if (!isE(node)) return;
          i++;
          if (i === expr) {
            r.push(node);
            return false
          }
          if ($.test(expr, node)) r.push(node);
        }
      }).reset(r)
    },
    child: function (expr) {
      var r = [];
      if (expr === undefined) expr = "*";
      return this.each(function () {
        var i = 0;
        var elems = this.tagName == "TABLE" ? this.rows : (this.children || this.childNodes);
        Loop(elems, function (node) {
          if (!isE(node)) return;
          i++;
          if (i === expr) {
            r.push(node);
            return false
          }
          if ($.test(expr, node)) r.push(node);
        })
      }).reset(r)
    },
    next: function (expr) {
      var r = [];
      if (expr === undefined) expr = "*";
      return this.eachElement(function () {
        var node = this,
          i = 0;
        while (node = $.Selector.next(node)) {
          i++;
          if (i === expr) {
            r.push(node);
            return false
          }
          if ($.test(expr, node)) r.push(node)
        }
      }).reset(r)
    },
    pre: function (expr) {
      var r = [];
      if (expr === undefined) expr = "*";
      return this.eachElement(function () {
        var node = this,
          i = 0;
        while (node = $.Selector.pre(node)) {
          i++;
          if (i === expr) {
            r.push(node);
            return false
          }
          if ($.test(expr, node)) r.push(node);
        }
      }).reset(r)
    },
    filter: function (expr) {
      var r = [];
      return this.eachElement(function () {
        if ($.test(expr, this)) r.push(this)
      });
      return this.reset(r)
    },
    sliceFilter: function (expr1, expr2) {
      var r = [],
        push = false;
      if (expr2 === undefined) expr2 = "*";
      return this.eachElement(function () {
        if ($.test(expr2, this)) return false;
        if ($.test(expr1, this)) push = true;
        if (push) r.push(this);
      });
      return this.reset(r);
    }
  }); //inset & remove
  Extend($.DOM.prototype, {
    remove: function () {
      return this.eachElement(function (i) {
        Parent(this).removeChild(this)
      })
    },
    empty: function (str) {
      return str === undefined ? this.eachElement(function () {
        while (this.firstChild) this.removeChild(this.firstChild);
      }) : this.eachElement(function () {
        $(this).find(str).remove()
      })
    },
    wrap: function () {
      return this.val(function () {
        return DOM.outer(this);
      });
    },
    htm: function (txt, js) {
      return arguments.length == 0 ? this.val(function () {
        return DOM.inner(this);
      }) : this.eachElement(function (i) {
        if (isInput(this)) this.value = txt;
        else $(this).empty().append(txt, js);
      })
    }
  });
  Each(["after", "append", "first", "before", "replace"], function (action) {
    $.DOM.prototype[action] = function (html, js) {
      return this.eachElement(function (i) {
        DOM.insert(action, html, this, this, i, js)
      })
    };
    $.DOM.prototype[action + "To"] = function (html, js) {
      var container = $(html);
      return this.eachElement(function () {
        container[action](this, js);
      })
    };
  });

  //css	& style
  // I make a object contains some special properties 
  $.crossCSS = {
    'float': {
      get: function (elem) {
        var style = Create(elem.tagName).style,
          value = "";
        Each(["float", "cssFloat", "styleFloat"], function (pro) {
          if (pro in style) {
            value = getCss(elem, pro);
            return false
          }
        });
        return value
      },
      set: function (elem, value) {
        var style = Create(elem.tagName).style;
        Each(["float", "cssFloat", "styleFloat"], function (pro) {
          if (pro in style) elem.style[pro] = value
        })
      }
    },
    opacity: {
      get: function (element) {
        var text = basicGetCss(element, 'filter') || basicGetCss(element, '-ms-filter');
        return /opacity=(\d+)/i.test(text) ? (parseInt(RegExp.$1) || 0) / 100 : basicGetCss(element, "opacity") == "" ? 1 : basicGetCss(element, "opacity");
      },
      set: function (element, value) {
        value = value > 1 ? 1 : (value < 0 ? 0 : value);
        var effigy = Create(element.tagName).style;
        Loop(["opacity", "filter", "MsFilter", "MozOpacity", "KhtmlOpacity"], function (name) {
          if (name in effigy) element.style[name] = name === "filter" ? "alpha(opacity=" + parseFloat(value) * 100 + ")" : value === "MsFilter" ? ("progid:DXImageTransform.Microsoft.Alpha(opacity=" + parseFloat(value) * 100 + ")") : value;
        });
        if ('zoom' in effigy) element.style.zoom = 1;
      }
    },
    margin: {
      get: function (element) {
        return (basicGetCss(element, "margin-top") || "0px") + " " + (basicGetCss(element, "margin-right") || "0px") + " " + (basicGetCss(element, "margin-bottom") || "0px") + " " + (basicGetCss(element, "margin-left") || "0px")
      }
    },
    padding: {
      get: function (element) {
        return (basicGetCss(element, "padding-top") || "0px") + " " + (basicGetCss(element, "padding-right") || "0px") + " " + (basicGetCss(element, "padding-bottom") || "0px") + " " + (basicGetCss(element, "padding-left") || "0px")
      }
    },
    'border-radius': {
      set: function (element, value) {
        var effigy = Create(element.tagName).style;
        Loop(["borderRadius", "OBorderRadius", "MsBorderRadius", "MozBorderRadius", "WebkitBorderRadius"], function (name) {
          if (name in effigy) element.style[name] = value;
        });
      }
    }
  };

  $.crossCSS.cssFloat = $.crossCSS.styleFloat = $.crossCSS['float'];



  function basicGetCss(elem, pro) {
    var capitalize = pro.replace(/-([a-z])/g, function (m, n) {
      return Up(n)
    });
    var lower = Low(pro.replace(/([A-Z])/g, "-$1"));
    var value = isS(elem.style[capitalize]) ? elem.style[capitalize] : '';
    if (value == "") {
      try {
        value = elem.currentStyle[capitalize];
      } catch(e) {
        try {
          value = window.getComputedStyle(elem, null).getPropertyValue(lower);
        } catch(e) {
          try {
            value = document.defaultView.getComputedStyle(elem, null)[lower];
          } catch(e) {}
        }
      }
    }
    //fix default some style properties
    value = isS(value) && value != "auto" && value != "inherit" ? value : "";
    if (/^(margin|padding|border)-(top|right|bottom|left)(-width)?$/i.test(lower) && value === "") value = "0px";
    return value;
  }
  //this function is may read all style-property
  //if property-need-read is multiple then result return always a query-object
  //example: getCss("color,border,font-size")
  function getCss(elem, pro) {
    var result = {},
      first;
    Loop(isS(pro) ? pro.split(/\s*,\s*/i) : pro, function (name) {
      if ((name in $.crossCSS) && $.crossCSS[name].get) {
        result[name] = (first = $.crossCSS[name].get(elem))
      } else {
        result[Low(name.replace(/[A-Z]/g, "-$1"))] = (first = basicGetCss(elem, name));
      }
    });
    if (isS(pro) && !/,/i.test(pro)) return first;
    return new Query(":", ";").Import(result)
  }



  function setCss(elem, value) {
    var Q = new Query(':', ';').Import(value).Compact();
    for (var x in Q.Data) {
      if (x in $.crossCSS && isF($.crossCSS[x].set)) $.crossCSS[trim(x)].set(elem, Q.Data[x]);
      else elem.style[
      trim(x).replace(/-(\w)/gi, function (a, b) {
        return Up(b)
      })] = trim(Q.Data[x].replace(/\!important$/i, ''));
    }
  }
  //extend for $.DOM
  Extend($.DOM.prototype, {
    css: function (obj) {
      return (isS(obj) && !/:/.test(obj)) ? this.val(function () {
        return getCss(this, obj);
      }) : this.eachElement(function () {
        return setCss(this, obj);
      });
    },
    hasClass: function (mulclass) {
      return this.val(function () {
        var oClass = trim(this.className);
        Loop(mulclass.split(/\s+/), function (klass) {
          if ((" " + oClass + " ").indexOf(klass) == -1) oClass += " " + klass;
        });
        return trim(this.className) == trim(oClass);
      });
    },
    addClass: function (mulclass) {
      return this.eachElement(function () {
        var oClass = trim(this.className);
        Loop(mulclass.split(/\s+/), function (klass) {
          if ((" " + oClass + " ").indexOf(klass) == -1) oClass += " " + klass;
        });
        this.className = trim(oClass);
      })
    },
    removeClass: function (mulclass) {
      return this.eachElement(function () {
        var oClass = trim(this.className);
        Loop(mulclass.split(/\s+/), function (klass) {
          oClass = trim((" " + oClass + " ").replace(new RegExp(" " + $.safe(klass) + " ", "gi"), ""));
        });
        this.className = trim(oClass);
      })
    }
  });

  //animate manager
  //note: owl's animate is different with other classic library
  //Owl create a css array for every effect like ( ["width:1px","width:2px",...] )
  //Then run setInterval set style for element from header until footer of array
  //So "speed" represent for time and transformation
  var ANIMATE = {},
    NON_ANIMATE = {},
    IA = 0,
    IB = 0;



  function animate_fc(css, fn_callback, fn_process, id_flag, timeout) {
    fn_callback = toF(fn_callback);
    fn_process = toF(fn_process);
    return this.appendAnimate(function () {
      var css_array = css.slice(0);
      var last_css = css_array[css_array.length - 1] || "",
        j = IA++,
        elem = this;
      ANIMATE[j] = [this, css_array, fn_callback, fn_process, null, id_flag, last_css, true
      /* active or stop */
      , function () {},
      function () {}];
      var length = css_array.length;
      ANIMATE[j][8] = function () {
        var effect = ANIMATE[j];
        if (!effect || !effect[0]) {
          if (effect && effect[4]) clearInterval(effect[4]);
          delete ANIMATE[j];
          return F
        }
        if (effect[1].length) {
          fn_process.call(effect[0], effect[1].length);
          $(effect[0]).css(effect[1].shift()).each(effect[3]);
        }
        if (effect[1].length == 0) {
          var f_callback = effect[2],
            element = effect[0];
          clearInterval(effect[4]);
          delete ANIMATE[j];
          f_callback.call(element, j, ANIMATE);
          return F
        }
        return arguments.callee;
      };
      //check disable
      var disable = false;
      Each(NON_ANIMATE, function (data, i) {
        if (!isA(data)) return;
        if (elem !== data[0]) return;
        if (id_flag === undefined || id_flag == id_flag) {
          disable = true;
          return false
        }
      });
      if (timeout) {
        //init if timeout set
        ANIMATE[j][9] = setTimeout(function () {
          ANIMATE[j][4] = window.setInterval(ANIMATE[j][8], TIME_INTERVAL);
        },
        timeout);
      } else {
        ANIMATE[j][4] = window.setInterval(ANIMATE[j][8], TIME_INTERVAL);
      }

      if (disable) {
        window.clearInterval(ANIMATE[j][4]);
        window.clearTimeout(ANIMATE[j][9]);
      }
    })
  }
  Extend($.DOM.prototype, {
    //return boolean value whether has or has not animated
    isAnimate: function (id) {
      return this.val(function () {
        var elem = this,
          has = false;
        Each(ANIMATE, function (effect) {
          if (elem === effect[0]) {
            if ((id === undefined) || (id == effect[5])) has = true;
            return false
          }
        });
        return has
      })
    },
    //finish and delete behavior
    stopAnimate: function (set_last, set_callback, id_flag) {
      return this.eachElement(function () {
        var elem = this;
        //delete containly non_animate
        Each(NON_ANIMATE, function (data, i) {
          if (!isA(data)) return;
          if (elem !== data[0]) return;
          if (id_flag === undefined || id_flag == id_flag) delete NON_ANIMATE[i];
        });
        //delete from animate array		
        Each(ANIMATE, function (effect, i) {
          if (!isA(effect)) return;
          if (elem !== effect[0]) return;
          if (id_flag === undefined || id_flag === effect[5]) {
            window.clearInterval(effect[4]);
            window.clearTimeout(effect[9]);
          }
          if (set_last) $(elem).css(effect[6]);
          if (set_callback) effect[2].call(this, i, ANIMATE);
          delete ANIMATE[i];
        })
      })
    },
    lastCss: function (id_flag) {
      return this.nodes[0] ? (function (elem) {
        var css = [];
        Each(ANIMATE, function (effect, i) {
          if (!isA(effect)) return;
          if (elem !== effect[0]) return;
          if (id_flag === undefined || id_flag === effect[5]) css = effect[1];
        });
        return css;
      })(this.nodes[0]) : [];
    },
    //deepfree behavior
    hangAnimate: function (id_flag) {
      return this.eachElement(function () {
        var element = this;
        NON_ANIMATE[IB++] = [this, id_flag];
        Each(ANIMATE, function (effect, i) {
          if (!isA(effect)) return;
          if (element !== effect[0]) return;
          if (id_flag === undefined || id_flag == effect[5]) if (effect[7] == true) {
            window.clearInterval(effect[4]);
            effect[7] = false;
          }
        })
      })
    },
    //return and continue behavior
    backAnimate: function (id_flag) {
      return this.eachElement(function () {
        var element = this;
        //remove from disable
        Each(NON_ANIMATE, function (data, i) {
          if (!isA(data)) return;
          if (element !== data[0]) return;
          if (id_flag === undefined || id_flag == id_flag) delete NON_ANIMATE[i];
        });
        //start from available
        Each(ANIMATE, function (effect, i) {
          if (!isA(effect)) return;
          if (element !== effect[0]) return;
          if (id_flag === undefined || id_flag == effect[5]) if (effect[7] == false) {
            effect[4] = window.setInterval(effect[8], TIME_INTERVAL);
            effect[7] = true;
          }
        })
      })
    },
    //append a affect into last element's behavior
    appendAnimate: function (fn, id_flag) {
      return this.eachElement(function () {
        var element = this,
          check = false;
        Each(ANIMATE, function (effect, i) {
          if (!isA(effect)) return true;
          if (effect[0] !== element) return true;
          if (id_flag === undefined || id_flag === effect[5]) {
            var g = toF(ANIMATE[i][2]);
            ANIMATE[i][2] = function () {
              g.call(this);
              $(this).appendAnimate(fn);
            };
            check = true;
          }
        });
        if (!check) fn.call(this);
      })
    }
  });

  //apply animate
  Extend($.DOM.prototype, {
    animate: function (css_to, fn_callback, fn_process) {
      return this.appendAnimate(function () {
        var w = new Query(":", ";").Import(css_to).Data;
        var element = this,
          a = {},
          b = {},
          k = Graph(w.speed),
          speed_up = w['speed-up'] === 'yes' ? true : false,
        id_flag = w.id === undefined ? '*' : trim(w.id),
        css = [],
        init = [],
        last = [],
        always = [],
        timeout = w.timeout || 0;
        delete w.speed;
        delete w.id;
        delete w.timeout;
        delete w['speed-up'];
        for (var css_pro in w) {
          var x = trim(css_pro),
            set_last = false,
            set_always = false,
            set_init = false,
            aV, bV;
          if (/^\$/i.test(x)) {
            x = x.slice(1);
            set_last = true
          } else if (/^@/i.test(x)) {
            x = x.slice(1);
            set_always = true
          } else if (/^\^/i.test(x)) {
            x = x.slice(1);
            set_init = true
          }

          aV = $(element).css(x) + "";
          //fix box-model and default-value of css
          if (x == "width" && aV == "") aV = $.fixModel(this).W + "px";
          if (x == "height" && aV == "") aV = $.fixModel(this).H + "px";
          if (x == "top" && aV == "") aV = $(this).top() + "px";
          if (x == "left" && aV == "") aV = $(this).left() + "px";
          if (x == "opacity" && aV == "") aV = 1;
          if (x == "border-width" && $.unit.border[aV]) aV = $.unit.border[aV] + "px";
          if (x == "border-width" && aV == "") aV = "0px";
          if (trim(w[css_pro] + "").match(/^([+\-*\/%])=(\d+(?:\.\d+)?)$/i)) {
            var j = RegExp.$1,
              t = parseFloat(RegExp.$2);
            bV = aV.replace(/-?\d+(\.\d+)?/gi, function (n) {
              switch (j) {
              case "+":
                return Math.round(t + parseFloat(n));
              case "-":
                return Math.round(-t + parseFloat(n));
              case "*":
                return Math.round(t * parseFloat(n));
              case "/":
                return Math.round(parseFloat(n) / t);
              case "%":
                return Math.round(t * parseFloat(n) / 100);
              default:
                return n;
              }
            })
          } else {
            bV = trim(w[css_pro].toString());
          }
          if (set_init) {
            init.push(x + ":" + bV)
          } else if (set_last) {
            last.push(x + ":" + bV)
          } else if (set_always) {
            always.push(x + ":" + bV)
          } else {
            b[x] = bV;
            a[x] = aV
          }
        }
        //p: name-property, y: value, z: value next, k: key-index
        function rc(p, y, z, k) {
          var m, n;



          function rq(p, i, j, t) {
            return (p == "opacity" ?
            function (n) {
              return Math.round(n * 100) / 100
            } : (parseFloat(i) > parseFloat(j)) ? Math.round : Math.floor)(parseFloat(j) + (parseFloat(i) - parseFloat(j)) * t)
          }
          if (p.match(/^\s*(background|color|background-color|border-color)\s*$/i)) {
            y = $.toRGB(y);
            z = $.toRGB(z);
            if ((m = y.match(/^\s*rgb\(\s?(\d+)\s?,\s?(\d+)\s?,\s?(\d+)\s?\)\s*$/i)) && (n = z.match(/^\s*rgb\(\s?(\d+)\s?,\s?(\d+)\s?,\s?(\d+)\s?\)\s*$/i))) {
              return "rgb(" + rq(p, m[1], n[1], k) + "," + rq(p, m[2], n[2], k) + "," + rq(p, m[3], n[3], k) + ")"
            } else {
              return y
            }
          } else if (trim(p) == "clip" && (m = y.match(/^\s*rect\(\s?(\d+)px\s?,?\s?(\d+)px\s?,?\s?(\d+)px\s?,?\s?(\d+)px\s?\)$/i)) && (n = z.match(/^\s*rect\(\s?(\d+)px\s?,?\s?(\d+)px\s?,?\s?(\d+)px\s?,?\s?(\d+)px\s?\)$/i))) {
            return "rect(" + rq(p, m[1], n[1], k) + "px," + rq(p, m[2], n[2], k) + "px," + rq(p, m[3], n[3], k) + "px," + rq(p, m[4], n[4], k) + "px)\n"
          } else if (parseFloat(y).toString() != 'NaN') {
            return (z + "").replace(/-?\d+(\.\d+)?/gi, function (m) {
              return rq(p, y, m, k)
            })
          } else {
            return y
          }
        }

        if (init.length) css.push(init.join(";"));
        for (var i = 0; i < k.length; i++) {
          var _value = new Query(":", ";").Import(a).Export(function (value, name) {
            return rc(name, b[name], value, k[i])
          });
          if ((_value != css[css.length - 1]) || (speed_up === false)) {
            css.push(_value + (always.length ? ";" + always.join(";") : ""));
          }
        }
        if (last.length) css.push(last.join(";"));
        animate_fc.call($(element), css, fn_callback, fn_process, id_flag, timeout);
      })
    }
  });

  $.repeat = function (obj, n) {
    if (isA(obj)) {
      var r = [];
      while (n-->-1) r.concat(obj);
      return r;
    } else if (isS(obj)) {
      return $.repeat([obj].slice(1), n).join("")
    } else {
      return obj
    }
  };
  var COLOR = {
    black: '0,0,0',
    silver: '192,192,192',
    gray: '128,128,128',
    white: '255,255,255',
    maroon: '128,0,0',
    red: '255,0,0',
    purple: '128,0,128',
    fuchsia: '255,0,255',
    green: '0,128,0',
    lime: '0,255,0',
    olive: '128,128,0',
    yellow: '255,255,0',
    navy: '0,0,128',
    blue: '0,0,255',
    teal: '0,128,128',
    aqua: '0,255,255'
  };

  //almost browser automaticly convert color-value to rgb
  var autoColor = function (name) {
    var div = document.createElement("div");
    try {
      div.style.color = name;
    } catch(e) {
      return name
    }
    return div.style.color
  };

  if (!autoColor("#fffccc").match(/^rgb\(.+\)$/i)) {
    autoColor = function (name) {
      var m;
      if (m = name.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)) return "rgb(" + parseInt("0x" + m[1] + m[1]) + ", " + parseInt("0x" + m[2] + m[2]) + ", " + parseInt("0x" + m[3] + m[3]) + ")"; // full hexa  
      if (m = name.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)) return "rgb(" + parseInt("0x" + m[1]) + "," + parseInt("0x" + m[2]) + "," + parseInt("0x" + m[3]) + ")"; //percent rgb
      return name
    };
  }

  $.toRGB = function (color) {
    color = autoColor(color);
    if (color.replace(/\s/gi, '').match(/^rgb\(\d+,\d+,\d+\)$/i)) return color;
    var m;
    color = Low(color); //if color is basic name
    if (COLOR[color]) return "rgb(" + COLOR[color] + ")"; //if short hexa
    if (m = color.match(/^rgb\(.*\)/i)) return color.replace(/(\d+)%/gi, function (n1, n2) {
      return Math.floor(2.55 * parseInt(n2))
    });
    return color
  }; //graph
  $.speed = {
    circle: (function () {
      var i = 0,
        a = [],
        b = [];
      while (i < 26) {
        a.push(++i / 25);
        b.push(++i / 25);
      }
      return a.concat(b.reverse())
    })()
  };



  function Graph(t) {
    t = t + '';
    //if path exists
    if (isA($.speed[t])) return $.speed[t];
    //linear	
    if (t.match(/^\d+$/i) && t != 0) {
      for (var a = [], i = 0, m = Math.round(t / TIME_INTERVAL); i <= m; i++)
      a.push(Math.sin((i / (2 * m)) * Math.PI));
      return a
    }
    //some custom curve
    var m;
    if (m = t.match(/(\w+)(?:-(\d+))?/i)) {
      var f = $.speedFn[RegExp.$1],
        p = parseInt(RegExp.$2) || 200;
      if (f) {
        for (var a = [], i = 0, n = Math.round(p / TIME_INTERVAL); i <= n; i++) {
          a.push(f(i, n));
        }
        return $.speed[t] = a;
      }
    }
    return $.speed[t] || ([0, 1].slice(1));
  }
  $.speed.slow = Graph(600);
  $.speed.fast = Graph(300);

  $.speedFn = {
    outback: function (p, q) {
      var t = 1 / 3;
      return (-1 / t) * p * p / (q * q) + ((t + 1) / t) * p / q;
    }
  };

  $.fixModel = function (element) {
    var r = Real(element);
    if (!$.boxModel) {
      return {
        W: r.width,
        H: r.height
      }
    }
    var dim = diff(element);
    return {
      W: Math.max(r.width - dim.h, 0),
      H: Math.max(r.height - dim.v, 0)
    }
  };

  //get minus dim from boxmodel not support
  function diff(element, p) {
    var div = Create("div"),
      djv = Create("div");
    $("body").append(div);
    div.style.cssText = $(element).css((!p ? "border-top-width,border-left-width," + "border-right-width,border-bottom-width," + "border-right-style,border-left-style,border-top-style,border-bottom-style," + "border-right-color,border-left-color,border-top-color,border-bottom-color," : "") + "padding-left,padding-right,padding-top,padding-bottom").Compact().Export();
    div.appendChild(djv);
    //div on IE must has content for offsetHeight !=0  
    djv.innerHTML = "<a>.</a>";
    var r = {
      h: div.offsetWidth - djv.offsetWidth,
      v: div.offsetHeight - djv.offsetHeight
    };
    $(div).remove();
    return r;
  }



  function normalView(elem, css, banned, fix) {
    var div = $.Create(elem.tagName);
    document.body.appendChild(div);
    var value = basicGetCss(div, css);
    document.body.removeChild(div);
    return value == banned ? fix : value
  }
  //get dimension & position even if element don't 
  function Real(elem) {
    var noneElems = [],
      node = elem;
    if (elem.offsetHeight == 0 && elem.offsetWidth == 0) while (node && node.tagName != "BODY") {
      if (basicGetCss(node, "display") == "none") {
        node.style.display = normalView(node, 'display', 'none', 'block');
        noneElems.push(node);
      }
      node = Parent(node);
    }
    var result = {
      top: elem.offsetTop,
      left: elem.offsetLeft,
      width: elem.offsetWidth,
      height: elem.offsetHeight,
      Width: elem.scrollWidth,
      Height: elem.scrollHeight
    };
    $(noneElems).css("display:none");
    return result
  }
  //offset cross standar web page
  $.offset = function (element) {
    var a = [],
      div = Create("div"),
      node = element; // smart test cross body's standar
    $(div).appendTo("body").css("display:block;position:absolute;top:0;left:0;border:none;margin:0");
    var left = -div.offsetLeft,
      top = -div.offsetTop;
    $(div).remove();
    while (node) {
      var r = Real(node);
      if (!r || node === document.documentElement || node === document.body) break;
      left += r.left;
      top += r.top;
      node = node.offsetParent;
    } //fix firefox
    Loop([document.body, document.documentElement], function (w) {
      if (w.offsetTop < 0) top += (w === document.documentElement ? 1 : -2) * w.offsetTop;
      if (w.offsetLeft < 0) left += (w === document.documentElement ? 1 : -2) * w.offsetLeft;
    }); //ok now 100% exactly	
    return {
      left: left,
      top: top
    }
  };
  Extend($.DOM.prototype, {
    left: function () {
      return this.val(function () {
        return $.offset(this).left
      })
    },
    top: function () {
      return this.val(function () {
        return $.offset(this).top
      })
    },
    width: function (bool) {
      return this.val(function () {
        if (this === window) return this.innerWidth || screen.width;
        return !!bool ? (this.scrollWidth || Real(this).scrollWidth) : (this.offsetWidth || Real(this).width)
      })
    },
    height: function (bool) {
      return this.val(function () {
        if (this === window) return this.innerHeight || screen.height;
        return !!bool ? (this.scrollHeight || Real(this).scrollHeight) : (this.offsetHeight || Real(this).height)
      })
    }
  });

  /*---------------------------------------------------------------------------*/
  // event 
  /*---------------------------------------------------------------------------*/
  // manager event on DOM
  var EVENT_BASIC_LIST = [],
    EVENT_SPECIAL_LIST = [],
    EVENT_COUNT = 0;
  $.Event = {
    add: function (object, event_name, fn, id, is_special) {
      var callback = function (e) {
        var event_fix = $.Event.fix(e || window.event, object);
        var result = fn.call(object, event_fix);
        if (result === false) event_fix.preventDefault();
      },
        i = EVENT_COUNT++;
      if (event_name in EVENT_SPECIAL) {
        EVENT_SPECIAL_LIST[i] = [object, event_name, callback, fn, id];
        Each(EVENT_SPECIAL[event_name], function (_f, name) {
          var back = (EVENT_SPECIAL_LIST[i][2][name] = _f(fn));
          $.Event.add(object, name, back, id, true);
        });
        return object;
      }
      EVENT_BASIC_LIST[i] = [object, event_name, callback, fn, id, is_special || false];
      if (object.addEventListener) {
        object.addEventListener(event_name, EVENT_BASIC_LIST[i][2], false);
      } else if (object.attachEvent) {
        object.attachEvent("on" + event_name, EVENT_BASIC_LIST[i][2]);
      }
    },
    remove: function (object, event_name, fn, id, is_special) {
      is_special = is_special || false;
      if (event_name in EVENT_SPECIAL) {
        Each(EVENT_SPECIAL_LIST, function (event, i) {
          if (event[0] !== object && object != "*") return;
          if ((event_name === event[1] || event_name == "*") && (fn === event[3] || (id !== undefined && (id === event[4] || id == "*")))) {
            var list_f = event[2];
            for (var x in list_f) $.Event.remove(event[0], x, event[2][x], id, true);
            delete EVENT_SPECIAL_LIST[i];
            if (object != "*" && id != "*" && event_name != "*") return false
          }
        });
        return object;
      } //find from cache basic event
      Each(EVENT_BASIC_LIST, function (event, i) {
        if (event[0] !== object && object != "*") return;
        if ((event_name === event[1] || event_name == "*") && (fn === event[3] || (id !== undefined && (id === event[4] || id == "*"))) && (event[5] == is_special)) {
          if (event[0].removeEventListener) {
            event[0].removeEventListener(event_name, event[2], false);
          } else if (object.detachEvent) {
            event[0].detachEvent("on" + event_name, event[2]);
          }
          delete EVENT_BASIC_LIST[i];
          if (object != "*" && id != "*" && event_name != "*") return false
        }
      })
    }
  };
  /*
   event fix,standar from : http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
   */
  $.Event.fix = function (event, element) {
    if (!event) return undefined;
    //extend event with much properties also may make code slower  
    var E = {};
    //store for original event
    E.originalEvent = event;
    //type of event , continue edit in some special event
    E.type = event.type;
    if (element === window) return E;
    //on ie return undefined for keypress
    E.which = event.keyCode || event.which || event.charCode;



    function k(v) {
      return E.which == v;
    }

    //add some special key	
    E.KEY_BACKSPACE = k(8);
    E.KEY_TAB = k(9);
    E.KEY_RETURN = k(13);
    E.KEY_ESC = k(27);
    E.KEY_LEFT = k(37);
    E.KEY_UP = k(38);
    E.KEY_RIGHT = k(39);
    E.KEY_DOWN = k(40);
    E.KEY_DELETE = k(46);
    E.KEY_HOME = k(36);
    E.KEY_END = k(35);
    E.KEY_PAGEUP = k(33);
    E.KEY_PAGEDOWN = k(34);
    E.KEY_INSERT = k(45);

    //target
    E.target = event.target || event.srcElement;
    if (E.target.nodeType == 3) E.target = Parent(E);

    //only for mouse event
    E.relatedTarget = event.relatedTarget !== undefined ? event.relatedTarget : (event.fromElement != event.target ? event.toElement : event.fromElement);

    //always is element
    E.currentTarget = element;
    E.stopPropagation = function () {
      if (event.stopPropagation) return event.stopPropagation();
      event.cancelBubble = true;
    };

    //extend for mousewheel 
    //opera always is bad
    if (E.type === "mousewheel") {
      E.delta = event.detail || event.wheelDelta || 0;
      E.detail = E.delta;
      var d = /^Opera/.test(navigator.userAgent) ? -1 : 1;
      if (E.delta != 0) E.delta = d * E.delta / Math.abs(E.delta);
    }
    E.preventDefault = function () {
      if (event.preventDefault) return event.preventDefault();
      event.returnValue = false;
    };

    //require elem is element , != window
    if (!isE(element) && (element.nodeType != 9)) return E;
    var html = document.documentElement,
      body = document.body;
    if ('pageX' in event) {
      E.pageX = event.pageX;
      E.pageY = event.pageY
    } else if ('clientX' in event) {
      function get(dim) {
        var value = basicGetCss(body, dim);
        return $.unit.border[value] || parseInt(value) || 0
      }
      E.pageX = event.clientX + (body.scrollLeft || html.scrollLeft) - get("border-left-width");
      E.pageY = event.clientY + (body.scrollTop || html.scrollTop) - get("border-top-width")
    }
    //client mouse deppend on body margin ->fix 
    E.clientX = E.pageX - (body.scrollLeft || html.scrollLeft || 0);
    E.clientY = E.pageY - (body.scrollTop || html.scrollTop || 0);
    if (element.nodeType != 1) return E;
    var off = $.offset(element);
    //contain border and padding
    E.offsetX = E.pageX - off.left;
    E.offsetY = E.pageY - off.top;
    E.offsetBottom = element.offsetHeight - E.offsetY;
    E.offsetRight = element.offsetWidth - E.offsetX;
    return E
  };

  var EVENT_BASIC = ("scroll,resize,click,dbclick,focus,blur,select,submit,reset,change,load,unload,mouseover,mouseout,mousemove,drag,dragend,dragstart,mousedown,mouseup,keyup,keydown,keypress,error,abort").split(",");



  function eL(fn) {
    return function (e) {
      e.currentType = "mouseout";
      e.type = "mouseleave";
      //fix out window
      if (!$.Contains(e.relatedTarget, this) && (this != e.relatedTarget)) {
        fn.call(this, e);
      }
    }
  }



  function eE(fn) {
    return function (e) {
      e.currentType = "mouseover";
      e.type = "mouseenter";
      //in event mouseover e.relatedTarget===body on webkit
      if (!$.Contains(e.relatedTarget, this) && this !== e.relatedTarget) fn.call(this, e);
    }
  }



  function eH(fn) {
    return function (e) {
      e.currentType = e.type;
      e.type = "hover";
      fn.call(this, e);
    }
  }

  var EVENT_SPECIAL = {
    mouseenter: {
      mouseover: eE
    },
    mouseleave: {
      mouseout: eL
    },
    mousewheel: {
      DOMMouseScroll: function (fn) {
        return function (e) {
          e.type = "mousewheel";
          return fn.call(this, e)
        }
      }
    },
    hover: {
      mouseover: eH,
      mouseout: eH
    }
  };

  //fix mouseenter mouseleave
  (function () {
    var r = document.documentElement;
    if (r && ((r.onmouseenter === null) || isF(r.onmouseenter))) {
      delete EVENT_SPECIAL.mouseenter;
      delete EVENT_SPECIAL.mouseleave;
      EVENT_BASIC.push("mouseenter");
      EVENT_BASIC.push("mouseleave");
    }
  })();
  //fix mousewheel   
  if ((window.onmousewheel !== undefined) || (document.onmousewheel !== undefined)) {
    delete EVENT_SPECIAL.mousewheel;
    EVENT_BASIC.push("mousewheel");
  } (function () {
    var develop = EVENT_BASIC.slice(0);
    for (var x in EVENT_SPECIAL) develop.push(x);
    Loop(develop, function (event) {
      $.DOM.prototype['on' + event.replace(/^./, function (m) {
        return Up(m)
      })] = function (fn, id) {
        return this.each(function () {
          $.Event.add(this, event, fn, id);
        })
      };
      $.DOM.prototype['remove' + event.replace(/^./, function (m) {
        return Up(m)
      })] = function (fn, id) {
        return this.each(function () {
          $.Event.remove(this, event, fn, id);
        })
      }
    });
  })();
  Extend($.DOM.prototype, {
    addEvent: function (name, fn, id) {
      if (!isS(name)) {
        for (var x in name) this.addEvent(x, name[x], fn, id);
        return this
      }
      return this.each(function () {
        var arr = name.split(/\W+/i);
        for (var i = 0; i < arr.length; i++) $.Event.add(this, arr[i], fn, id)
      })
    },
    removeEvent: function (name, fn, id) {
      if (!isS(name)) {
        for (var x in name) this.removeEvent(x, name[x], fn, id);
        return this
      }
      return this.each(function () {
        var arr = name.split(/\W+/i);
        for (var i = 0; i < arr.length; i++) $.Event.remove(this, arr[i], fn, id)
      })
    },
    fire: function (event_name) {
      return this.each(function () {
        var obj = this;
        Each(EVENT_BASIC_LIST, function (event) {
          if (event[0] == obj && Low(event_name) == event[1]) event[2].call(obj);
        });
      })
    },
    //fix for cache with image 
    ready: function (fn) {
      return this.eachElement(function () {
        if (this.tagName == "IMG") {
          if (is_loaded(this)) {
            fn.call(this, true);
            return true;
          } else {
            $(this).addEvent({
              load: function () {
                fn.call(this, true)
              },
              error: function () {
                fn.call(this, false)
              }
            });
          }
        } else {
          var iImg = this.getElementsByTagName('img'),
            self = this;
          if (iImg.length === 0) fn.call(this);
          for (var i = 0, l = iImg.length; i < l; i++) {
            if (iImg[i] && !is_loaded(iImg[i])) {
              $(iImg[i]).ready(function () {
                $(this).ready(function () {
                  fn.call(self)
                })
              });
              return true;
            }
          }
          fn.call(self);
        }
      })
    }
  });

  //test complete of img
  //ie return undefined for img just create and return true or false fo img error 
  //opera also
  //other browser return true for img completely load and false for img error	var iefix_complete = false;
  var is_loaded = function (e) {
    return e.tagName == "IMG" && e.complete == true;
  };
  (function () {
    if (!document.body || !document.body.appendChild) {
      var fc = arguments.callee;
      return setTimeout(function () {
        fc();
      },
      0);
    }
    var img = document.createElement('IMG');
    document.body.appendChild(img);
    img.src = "";
    if (img.complete === false && 'readyState' in img)
		is_loaded = function (e) {
      return e.tagName == "IMG" && (e.complete === true || e.complete === false);
    };
    document.body.removeChild(img);
  })();

  // text translate
  //get all textnode of elem
  function allText(element) {
    var text = [];
    Loop(element.childNodes, function (node) {
      if (node.nodeType == 3) text.push(node);
      if (node.nodeType == 1) text = text.concat(allText(node));
    });
    return text
  }
  //replace global
  function Replace(pat, join, text, count) {
    if (!isN(count)) {
      return text.replace(pat, join)
    } else if (count > 0) {
      try {
        pat.global = false
      } catch(e) {}
      var c = 0,
        m, s = text,
        cc = "";
      while (m = s.match(pat)) {
        cc += m[0].replace(pat, join);
        s = s.substr(m.index + m[0].length);
        if (c++==count) {
          cc += s;
          break
        }
      }
    }
  } // get position best way
  function Range(t) {
    var doc = this.ownerDocument || this;
    if (this.selectionStart) return t == 'start' ? this.selectionStart : this.selectionEnd;
    if (!doc.selection) return 0;
    var r = doc.selection.createRange();
    var c = r.duplicate();
    c.moveToElementText(this);
    c.setEndPoint("EndToEnd", r);
    return t == 'start' ? c.text.length - r.text.length : c.text.length
  }
  Extend($.DOM.prototype, {
    text: function (text) {
      if (isS(text)) return this.empty().append(document.createTextNode(text));
      return this.val(function () {
        return this.textContent || this.innerText || this.text || ""
      })
    },
    translate: function (patten, fn) {
      return this.replaceText(patten, fn, false, count)
    },
    replaceText: function (patten, fn, html, count) {
      var trans = [];
      if (isA(patten)) trans = patten;
      else trans[0] = [patten, fn, count];
      return this.eachElement(function () {
        Loop(allText(this), function (node) {
          if (html) {
            var text = node.nodeValue.replace(/\</gi, "&lt;").replace(/>/gi, "&gt;"),
              span = Create("span");
            Parent(node).replaceChild(span, node);
            for (var j = 0; j < trans.length; j++) text = Replace(trans[j][0], trans[j][1], text, trans[j][2]);
            $(span).replace(text);
          } else {
            for (var j = 0; j < trans.length; j++) node.nodeValue = Replace(trans[j][0], trans[j][1], node.nodeValue, trans[j][2]);
          }
        })
      })
    }
  });

  /*---------------------------------------------------------------------------*/
  // Selection
  /*---------------------------------------------------------------------------*/
  var SELECTION = $.makeClass(function (element) {
    this.element = element
  },
  {
    text: function () {
      var doc = this.element.ownerDocument || this.element;
      if (doc.selection && doc.selection.createRange) {
        return doc.selection.createRange().text;
      } else if ('getSelection' in this.element) {
        return this.element.getSelection() + "";
      } else {
        return ""
      }
    },
    select: function (start, end) {
      if (end < start) start = end;
      var elem = this.element;
      if (end == -1) end = (elem.value || $(elem).text()).length;
      if (elem.setSelectionRange) {
        elem.focus();
        elem.setSelectionRange(start, end);
      } else if (elem.createTextRange) {
        var range = elem.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
      }
    },
    start: function () {
      return Range.call(this.element, 'start')
    },
    end: function () {
      return Range.call(this.element, 'end')
    }
  });

  $.Selection = function (elem) {
    return new SELECTION(elem);
  };
  //form query
  $.queryForm = function (elem) {
    if (isS(elem)) elem = $(elem).k(0);
    if (elem.tagName != "FORM") return "";
    var result = {};
    for (var i = 0; i < elem.elements.length; i++) {
      var a = elem.elements[i];
      if ( ( (a.type == "checkbox" || a.type == "radio" ) && a.checked ) 
				|| ( a.type != "checkbox" && a.type != "radio" ) ){
				if( a.name.match(/^(.*)\[\]$/i) ){
					//element get value in array
					var j = 0, name = RegExp.$1;	
					while( j > -1 ){
						if( !( (name+"["+j+"]") in result ) ){
							result[name+"["+j+"]"] = a.value;
							break;
						}
						j++;
					}
				}else{
					result[a.name] = a.value;
				}	
			}	
    }
    return result
  };

  /*---------------------------------------------------------------------------*/
  // Core Function
  /*---------------------------------------------------------------------------*/
  //basic
  function isS(s) {
    return typeof s === "string"
  }



  function isF(f) {
    return (typeof f === "function") && ('call' in f)
  }



  function isA(a) {
    return a && (a.constructor == Array)
  }



  function isE(e) {
    return e && (e.nodeType == 1)
  }



  function isDOM(e) {
    return e && (e === window || (e.nodeType && !!(/^(?:1|9|11)$/).test(e.nodeType.toString())))
  }



  function isInput(e) {
    return e && (/^TEXTAREA|INPUT$/).test(e.tagName + "")
  }



  function isOWL(a) {
    return a && (a.constructor == $.DOM)
  }



  function isN(n) {
    return (n != NaN) && typeof n === "number"
  }



  function indexOf(e, arr) {
    try {
      return arr.indexOf(e)
    } catch(e) {
      for (var i = 0; i < arr.length; i++) if (arr[i] === e) return i;
      return -1
    }
  }



  function Up(s) {
    return s.toString().toUpperCase()
  }



  function Low(s) {
    return s.toString().toLowerCase()
  }



  function F() {}



  function toF(f) {
    return isF(f) ? f : new Function
  }



  function trim(s) {
    return s.replace(/(^\s+|\s+$)/g, "")
  }



  function nocache(url) {
    return url += (url.indexOf("?") > -1 ? "&" : "?") + new Date().getTime()
  }



  function fixUTF8(s) {
    return s.toString().replace(/./g, function (m) {
      return (m.charCodeAt(0) > 127) ? ("&#" + m.charCodeAt(0) + ";") : m;
    });
  }



  function Create(tag, doc) {
    return tag ? (doc || document).createElement(tag) : (doc || document).createDocumentFragment()
  }



  function Parent(e) {
    return e.parentNode
  }
  $.safe = function (s) {
    return s.replace(/(\[|\]|\(|\)|\<|\?|\{|\}|\*|\.|\||\+|\$|\^)/gi, "\\$1")
  };
  $.matchArray = function (expr, str) {
    try {
      expr.global = false
    } catch(e) {}
    var arr = [],
      mat;
    while (mat = str.match(expr)) {
      str = RegExp.rightContext;
      arr.push(mat);
    }
    return arr;
  };
  //loop & each
  function Loop(arr, fn) {
    for (var i = 0; i < arr.length; i++) if (fn.call(arr, arr[i], i) === false) break;
  }



  function Each(obj, fn) {
    for (var x in obj) if (fn.call(obj, obj[x], x) === false) break;
  }



  function Extend(obj, pros, filter) {
    filter = filter ||
    function (a) {
      return pros[a]
    };
    if (pros === undefined) {
      obj = $;
      pros = obj
    }
    for (var x in pros) obj[x] = filter(x);
    return obj;
  }
  /*---------------------------------------------------------------------------*/
  // query string 
  /*---------------------------------------------------------------------------*/
  var Query = $.makeClass(function (start, end) {
    this.S = start;
    this.F = end;
    this.Data = {}
  },
  {
    Import: function (str) {
      if (isS(str)) {
        var p = $.safe(this.S),
          q = $.safe(this.F),
          g1 = "(?:[^" + p + "]" + ")",
          g2 = "(?:[^" + q + "]" + ")",
          r = new RegExp("(" + g1 + "+)" + p + "(" + g2 + "*)(?:" + q + "|$)", "i"),
          fo = $.matchArray(r, str);
        for (var i = 0; i < fo.length; i++) this.Data["" + fo[i][1]] = fo[i][2];
      } else {
        for (var x in str) this.Data[x] = str[x];
      }
      return this;
    },
    Compact: function () {
      for (var x in this.Data)
      if (this.Data[x] == undefined || this.Data[x] == null || this.Data[x] == "") delete this.Data[x];
      return this;
    },
    Export: function (fn) {
      var str = [];
      fn = fn ||
      function (s) {
        return s
      };
      for (var x in this.Data)
      str.push(x + this.S + fn(this.Data[x], x));
      return str.join(this.F);
    }
  });

  /*---------------------------------------------------------------------------*/
  // Ajax 
  /*---------------------------------------------------------------------------*/
  //some tip for you
  //if your document contains ISO-8859-1 and UTF-8
  //you'll miss font on firefox when use ajax , to solve this issue change charset of document to UTF-8
  var XHR = $.makeClass(function () {
    try {
      return new XMLHttpRequest();
    } catch(e) {
      try {
        return new ActiveXObject('Msxml2.XMLHTTP');
      } catch(e) {
        return new ActiveXObject('Microsoft.XMLHTTP');
      }
    }
    return false;
  });
  var _AJAX = [];
  $.Ajax = function (url, opts) {
    var option = opts;
    if (isF(opts)) opts = {
      success: opts
    };
    //clean and setup request
    opts.data = opts.data || {};
    //accept element
    opts.url = url;
    //cache for url - ability very small for wrong
    if (opts.cache === false) url = nocache(url);
    //now we create a new request and return it
    var xhr = new XHR();
    _AJAX.push(xhr);
    if (xhr === false) return; //readychange
    xhr.onreadystatechange = function () {
      toF(opts.process).call(xhr);
      switch (parseInt(xhr.readyState)) {
      case 0:
        break;
      case 1:
        toF(opts.create).call(xhr);
        break;
      case 2:
        toF(opts.sended).call(xhr);
        break;
      case 3:
        toF(opts.loaded).call(xhr);
        break;
      case 4:
        toF(opts.complete).call(xhr);
        switch (parseInt(xhr.status)) {
        case 200:
          toF(opts.success).call(xhr, xhr.responseText);
          break;
        default:
          toF(opts.error).call(xhr, xhr.statusText);
        }
        break;
      default:
        return;
      }
    };
    var async = opts.async || true;
    var user = opts.user || null;
    var password = opts.passowrd || null;
    var data = new Query("=", "&").Import(opts.data || {}).Export(function (s) {
      return (encodeURIComponent || fixUTF8)(s);
    });

    //case method
    try {
      if (opts.type && (Low(opts.type) == "post")) {
        if (opts.proxy) url += opts.proxy + (encodeURIComponent || escape)(url);
        xhr.open("POST", url, async);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(data);
      } else {
        if (data) url += (url.match(/\?/i) ? '&' : '?') + data;
        if (opts.proxy) url += opts.proxy + (encodeURIComponent || escape)(url);
        xhr.open("GET", url, true);
        xhr.send(null);
      }
    } catch(e) {
      //toF(opts.error).call(xhr, '');
    }
    return xhr
  };

  //add to DOM
  $.DOM.prototype.update = function (url, option) {
    option = option || {};
    var options = {},
      obj = this,
      succ = toF(option.success);
    if (!isF(option)) {
      options.success = function (data) {
        obj.htm(this.responseText);
        toF(succ).call(this, data);
      };
      delete option.success;
      Extend(options, option);
    } else {
      options.success = function (data) {
        obj.htm(this.responseText);
        option.call(this, data);
      }
    }
    $.Ajax(url, options);
    return this;
  };

  /*---------------------------------------------------------------------------*/
  // jSON 
  /*---------------------------------------------------------------------------*/

  function Active(elem) {
    return !!Parent(elem)
  }
  var JSON_COUNT = 0;
  var JSON = $.makeClass(function (url, success, error, cache) {
    var json = this,
      script, i = JSON_COUNT++;
    if (cache === false) url = nocache(url);
    url = url.replace(/=_\?/gi, "=json_callback_" + i);
    window['json_callback_' + i] = function () {
      if (Active(script)) success.apply($, $.toArray(arguments));
      window['json_callback_' + i] = F;
      $(script).remove(); //empty errror for ie
      error = F;
    };
    this.abort = function () { //fix on firefox
      window['json_callback_' + i] = F;
      try {
        script.abort()
      } catch(e) {}
      if (Active(script)) $(script).remove();
    };
    try {
      script = Create("script");
      (function () {
        this.src = url;
        this.type = "text/javascript"; //halder error event
        var script = this;
        if (this.readyState) { //opera fixed
          (function () {
            if (! (/loaded|complete/i).test(script.readyState)) return setTimeout(arguments.callee, 0);
            if (Active(script)) {
              error();
              $(script).remove();
            }
          })();
        } else {
          $(this).addEvent("onload error", function () {
            if (Active(script)) {
              error();
              $(script).remove();
            }
          })
        }
      }).call(script);
      $(script).appendTo("head");
    } catch(e) {
      error(e);
    }
  });
  $.JSON = function (url, opts) {
    if (isF(opts)) opts = {
      success: opts
    };
    return new JSON(url, opts.success, toF(opts.error), opts.cache);
  };

  /*-------------------------- COOKIE ------------------------------*/
  $.Cookie = {
    set: function (name, value, time) {
      time = (time || 0) * 1000 * 60 * 60 * 24;
      var expires = new Date((new Date()).getTime() + time).toGMTString();
      document.cookie = name + "=" + escapse(value) + ";expires=" + expires
    },
    remove: function (name) {
      document.cookie = name + "=;expires=Thus,01-Jan-1970 00:00:00 GMT"
    },
    //read cookie
    get: function (name) {
      var data = new Query("=", ";").Import((document.cookie || "").replace(/;$/i, "").replace(/;\s+/gi, ";"));
      if (name in data.Data) return unescape(data.Data[name]);
      return null
    }
  };
  /*---------------------------------------------------------------------------*/
  // onComplete , onCreate & onReady 
  /*---------------------------------------------------------------------------*/
  var DOMREADY = false, FN_READY = [];

  //register a function for domload
  function __complete(fn){
    if (isF(fn)) FN_READY.push(fn);
    while ( DOMREADY && FN_READY.length )
			FN_READY.shift().call($)
  }

  (function () {
    var ready = function (e) {
      if (DOMREADY === true) return;
      DOMREADY = true;
			__complete();
    };
    //stop function if loaded
    if (DOMREADY === true) return true;

    //init event safely
    //fix opera ,firefox (since opera 9 support for DOMContentLoaded)
    //on chrome may be return a hidden-error so i use try statement
    try {
      $(document).addEvent("DOMContentLoaded", ready, false);
    } catch(e) {
      $(window).onLoad(ready);
    }

    //enought to work for chrome ,ie ,safari 
    if (/loaded|complete/i.test(document.readyState) 
			|| ( document.body && /loaded|complete/i.test(document.body.readyState) ) ){
			return ready();
		}	
    if (document.readyState !== undefined) {
      return setTimeout(arguments.callee, 0);
    }
  })();

  /*---------------------------------------------------------------------------*/
  //test some features of browser 
  /*---------------------------------------------------------------------------*/
  $.unit = {
    border: {
      thin: 1,
      medium: 3,
      thick: 5
    },
    tag: {}
  };
  $.boxModel = true;
  (function () {
    if (!document.body || !document.body.appendChild) {
      setTimeout(arguments.callee, 0);
      return false;
    }
    var div = Create("div"),
      body = document.body;
    body.appendChild(div);
    div.innerHTML = "&nbsp;";
    with(div.style) {
      width = '20px';
      border = 'none';
      padding = '2px';
    }
    //model support
    $.boxModel = div.offsetWidth == 24;
    body.removeChild(div);
    //test border
    Each($.unit.border, function (value, name) {
      var div = Create("div"),
        djv = Create("div");
      djv.appendChild(document.createTextNode("."));
      document.body.appendChild(div);
      div.appendChild(djv);
      with(div.style) {
        border = 'none';
        padding = 0;
        margin = 0
      }
      with(djv.style) {
        border = 'none';
        padding = 0;
        margin = 0
      }
      div.style.borderLeft = name + " solid #000000";
      $.unit.border[name] = div.offsetWidth - djv.offsetWidth;
      Parent(div).removeChild(div);
    });
    //fix border on IE with non-standar web page
    if (basicGetCss(body, "border-top") == "" && basicGetCss(body, "border-top-width") != "") body.style.borderTopWidth = "0";
    if (basicGetCss(body, "border-left") == "" && basicGetCss(body, "border-left-width") != "") body.style.borderLeftWidth = "0";
  })();

  //copy some ui functions
  $.Extend = Extend;
  $.isArray = isA;
  $.isFunction = isF;
  $.Create = Create;
  $.Loop = Loop;
  $.Each = Each;
  $.Query = Query;
  $.Contains = $.Selector.contains;
  $.xhtml = function (str) {
    return $(document.createElement('html')).append(str).child('*');
  };
  window.$ = Owl;

  /*
   * Some plugin I make	
   * Plugin animation
   */

  function _initAnimate(elem, css) {
    for (var x in css) {
      if (x.match(/^\^(\w+)/i)) {
        $(elem).css(x.slice(1) + ":" + css[x]);
        delete css[x];
      }
    }
    return css
  }



  function Show(speed_css, fn_callback, fn_process) {
    var more = new Query(":", ";").Import(speed_css || ""),
      type = "";
    speed = more.Data.speed || '0';
    delete more.Data.speed;
    if (speed.match(/^(.+?)\W(.+)$/i)) {
      type = RegExp.$2;
      speed = RegExp.$1
    }

    return this.eachElement(function () {
      if ($(this).isAnimate("__show") || (!$(this).isAnimate("__hide") && $(this).css("display") != "none")) return true;
      //there are 2 case
      //if __hide is active => last CSS = get
      //if __hide is inactive => last CSS = real size
      if ($(this).isAnimate("__hide")) {
        //stop animate __hide and get last css from callback
        var arr = $(this).lastCss("__hide");
        var last = new Query(":", ";").Import(arr.slice(-1).join(";")).Import(arr.slice(-2).join(";")).Data;
        $(this).stopAnimate(false, false, "__hide");
        //free if element display
        more = _initAnimate(this, more);
        var css = {
          speed: speed,
          height: last.height || ($.fixModel(this).H + "px"),
          width: last.width || ($.fixModel(this).W + "px"),
          opacity: last.opacity || $(this).css('opacity'),
          overflow: "hidden",
          $overflow: last.overflow || 'visible'
        };
      } else {
        if ($(this).css('display') == 'none') {
          this.style.display = normalView(this, 'display', 'none', 'block');
        }
        more = _initAnimate(this, more);
        var dim = $.fixModel(this),
          h = dim.H + "px",
          w = dim.W + "px",
          p = $(this).css("opacity"),
          css = {
          speed: speed,
          height: h,
          width: w,
          opacity: p || 1,
          overflow: "hidden",
          $overflow: $(this).css("overflow") || 'visible'
        };
        $(this).css({
          height: type.match(/face|width/i) ? h : "1px",
          width: type.match(/face|height/i) ? w : "1px",
          opacity: 0,
          overflow: "hidden"
        })
      }
      css = more.Import(css);
      css.Data['id'] = "__show";
      $(this).animate(css.Data, fn_callback, fn_process);
    });
  }



  function Hide(speed_css, fn_callback, fn_process) {
    var more = new Query(":", ";").Import(speed_css || ""),
      type = "";
    speed = more.Data.speed || '0';
    delete more.Data.speed;
    if (speed.match(/^(.+)\W(.+)$/i)) {
      type = RegExp.$2;
      speed = RegExp.$1
    }

    return this.eachElement(function () {
      if ($(this).isAnimate("__hide")) return true;
      if (this.style.display == "none") return true;
      var css = {};
      if ($(this).isAnimate("__show")) {
        //stop animate __show and get last css from callback
        var arr = $(this).lastCss("__show");
        var last = new Query(":", ";").Import(arr.slice(-1).join(";")).Import(arr.slice(-2).join(";")).Data;
        more = _initAnimate(this, more);
        css = {
          speed: speed,
          $height: last.height || $(this).css('height') || 'auto',
          $width: last.width || $(this).css('width') || 'auto',
          $opacity: last.opacity || $(this).css('opacity') || '1',
          $overflow: last.overflow || $(this).css('overflow') || 'visible',
          height: '1px',
          width: '1px',
          opacity: '0',
          overflow: 'hidden',
          $display: 'none'
        };
        $(this).stopAnimate(false, false, "__show");
      } else {
        more = _initAnimate(this, more);
        var s = $(this),
          dim = $.fixModel(this);
        var width = s.css('width');
        var height = s.css('height');

        if (!width.match(/^\d+(\.\d+)?px$/i)) {
          width = dim.W + "px";
        }

        if (!height.match(/^\d+(\.\d+)?px$/i)) {
          height = dim.H + "px";
        }

        css = {
          speed: speed,
          height: '1px',
          width: '1px',
          opacity: '0',
          overflow: 'hidden',
          $display: 'none',
          $width: width,
          $height: height,
          $overflow: s.css('overflow') || 'visible',
          $opacity: s.css('opacity') ? s.css('opacity') : 1
        };
      }
      if (type.match(/face|height/i)) delete css.width;
      if (type.match(/face|width/i)) delete css.height;
      css = more.Import(css);
      css.Data['id'] = "__hide";
      $(this).animate(css.Data, fn_callback, fn_process)
    });
  }

  Extend($.DOM.prototype, {
    show: function (speed_css, fn, process) {
      Show.apply(this, [speed_css, fn, process]);
      return this;
    },
    hide: function (speed_css, fn, process) {
      Hide.apply(this, [speed_css, fn, process]);
      return this;
    },
    toggle: function (show, hide) {
      return this.eachElement(function () {
        if ($(this).isAnimate("__hide") || $(this).css("display") == "none") {
          $(this).show.apply($(this), show);
        } else {
          $(this).hide.apply($(this), hide);
        }
      });
    }
  });

  /*---------------------------------------------------------------------------*/
  // smart action 
  /*---------------------------------------------------------------------------*/
  var STORE_ACTION = [];
  var smartAction = function (_str) {
    var str = _str;
    this.id = STORE_ACTION.push(function () {
      return $(str);
    }) - 1;
    return this;
  };

  Extend(smartAction.prototype, new $.DOM([]), function (act) {
    return function () {
      var fc = STORE_ACTION[this.id],
        params = $.toArray(arguments);
      STORE_ACTION[this.id] = function () {
        var obj = fc();
        return obj[act].apply(obj, params);
      };
      return this;
    }
  });

  $(function () {
    Loop(STORE_ACTION, function (act) {
      act();
    });
  });

  $.GET = (location.search ? new Query("=", "&").Import(location.search.slice(1)).Data : {});

  $(window).onUnload(function () {
    //free translation if unload
    ANIMATE = [];
  });
  $.jDOM = DOM;
})();