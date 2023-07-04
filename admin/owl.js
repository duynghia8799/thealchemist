/*
 -OWL LIBRARY
 -Copyright ( C ) DucMinh 
 -Website: owljs.org
 -MIT Linsence
 -Version: 1.0
 -Last update: 15:56 PM 21/10/2010
 */
 
 /* Extend prototype */
 (function(){
	String.prototype.trim = function(){
		return this.replace(/(^\s+|\s+$)/g,'');
	}
 })();
 
 /* Main Owl library */
 (function (D, U, N) {
	//This is key main
	window.Owl = function (w) {
		if (arguments.length > 1) {
			var a = $.toArray(arguments);
			return arguments.callee.call(w, a);
		}
		w = w || [];
		if (isOWL(w)) return w;
		if (iS(w)) {
			if (w.match(/^</i))
				return $.xhtml(w);
			return DOMREADY ? new $.DOM($.Selector(w, D)) : new smartAct(w);
		} else if (/^1|9|11$/.test(w.nodeType) || w === window) {
			return new $.DOM(w)
		} else if (iF(w)) {
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
	
	var	$ = Owl, ID = -1,
		TIME_INTERVAL = 13;
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
			root = root || D;
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
			if (elem.outerHTML !== U) return elem.outerHTML;
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
			if (iS(att)) text = att + "";
			else for (var x in att) text += ' ' + x + '="' + att[x].replace(/'/gi, '\\"') + '"';
			if (iS(att)) Loop($.matchArray(ATTRIBUTE_HTML_SOURCE, att.trim().replace(/\/$/i, "")), function (at, i) {
				function j(a) {
					return a !== U && a !== ""
				}
				if (at[1].trim() == at[0].trim()) ats[at[1]] = "";
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
				if (name == "src" && elem.tagName == "SCRIPT" && (JS !== U)) {
					JS.push([elem, 'src', value]);
				} else if (name == "style") {
					elem.style.cssText = value;
				} else if (spec[name]) {
					elem[spec[name]] = value;
				} else if (iF(clone[name])) {
					elem[name] = clone[name];
					try{
						elem.setAttribute(name, value, 2);
					}catch(e){}	
				} else {
					try {
						elem.setAttribute(name, value, 2);
					} catch(e) {}
				}
			});
			clone = null;
		},
		isEmpty: function isEmpty(tag) {
			var elem = $.Create(tag);
			if (DOM.kind.full.indexOf("," + elem.tagName + ",") > -1) return false;
			if (DOM.kind.empty.indexOf("," + elem.tagName + ",") > -1) return true;
			var source = DOM.outer(elem);
			//ie addd <?XML:NAMESPACE if tag isn't a basic tag
			source = (source + "").replace(/^\<\?XML:NAMESPACE [^<]+\/>/i, "").trim();
			if (source.match(/^\<([^<]+)>\<\/\1>$/i)) {
				DOM.kind.full += "," + elem.tagName + ",";
				return false;
			} else {
				DOM.kind.empty += "," + elem.tagName + ",";
				return true;
			}
		},
		insert: function (where, html, elem, home, index, dis_js, o_where, o_elem, order, JS) {
			//deny empty text ,N,U
			//note: A=="" always return true -> fix
			if ((html === N) || (html === U)) return elem;
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
			if (iF(html)) html = html.call(home, index);
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
				if (a.styleSheet && (a.styleSheet.cssText !== U) && !d) {
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
					var div = D.createElement("div");
					if (mat) {
						div.innerHTML = m[0] + html.slice(0, mat.index) + "</object>";
						html = RegExp.rightContext;
					} else {
						div.innerHTML = m[0] + html + "<object>";
						html = "";
					}
					var _el = div.firstChild;
					//fix object empty , ie auto add a U-textNode if object doesn't contains any param
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
			html = html.replace(/^\<\/?(tbody|tfoot|thead)((\s|:)[^<>]*)?>?/i, ""); // start a text	
			if (m = html.match(/^([^<]+)/i)) {
				html = RegExp.rightContext;
				var text = cText(m[1], root);
				try { //ie throw error if can't acess
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
					if (m[2] !== U) {
						try {
							var el = root.createElement("<" + m[1] + " " + m[2] + ">");
						} catch(e) {
							var el = root.createElement(m[1].trim());
						}
					} else {
						var el = root.createElement(m[1].trim());
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
					if (node) {
						if (!isSpecTag(node.tagName || "")) order--;
					} else {
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
			if (RegExp.prototype.lastMatch === U && match) RegExp.lastMatch = match[0];
			//opera not support lastMatch
			return match && (match.index == 0) ? match : N;
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
			if (root === U) root = D;
			if (!root) return [];
			
			//check support querySelectorAll
			if (root.querySelectorAll && root.nodeType == 9) try {
				return root.querySelectorAll(selector);
			} catch(e) {}

			if (root.getElementsByClassName && selector.match(/^\.([\w\u00c0-\uFFFF_\-]+)$/i)) try {
				return root.getElementsByClassName(RegExp.$1);
			} catch(e) {}

			if (max === U) max = -1;
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
			if (selector.match(/^body\s+(?![+>~])(.*)$/i) && root.body)
				return Hawk(RegExp.$1, root.body);
			if (selector.match(/^#((?:[\w\u00c0-\uFFFF_\-]|\\.)+)\s+(?![+>~])(.*)$/i) && root.getElementById)
				return Hawk(RegExp.$2, root.getElementById(RegExp.$1)); //eval string selector to a array
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
			} else if (last.TAG && last.TAG[0]) {
				//fragdocument doesn't has 'getElementsByTagName' but	selectorAll or childNodes 
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
				if (node.owl_qr[ui] !== U) return node.owl_qr[ui];
				if (!node || (!Hawk.contains(node, root) && (node !== root)) || !Hawk.satisfy(node, detail)) return node.owl_qr[ui] = false;
				if (!app.length) return node.owl_qr[ui] = true;
				return node.owl_qr[ui] = fn(node, app.pop(), app.pop(), app, root);
			case "+":
				var node = Hawk.pre(element);
				if (node && !node.owl_qr) node.owl_qr = [];
				if (node && (node.owl_qr[ui] !== U)) return node.owl_qr[ui];
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
					if (node.owl_qr[ui] !== U) return node.owl_qr[ui];
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
					if (node.owl_qr[ui] !== U) return node.owl_qr[ui];
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
				for (var j = 0; j < details[x].length; j++)
					if (!Hawk.check[x].apply(elem, details[x][j])) return false;
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
				if (value == N) return opera == "!=";
				if (!opera) return true;
				switch( opera ){
					case "!=":
						return value !== test;
					case "=":
						return value === test;
					case "*=":
						return value.indexOf(test) > -1;
					case "^=":
						return value.indexOf(test) == 0;
					case "$=":
						return value.lastIndexOf(test) + test.length == value.length;
					case "|=":
						return (value === test) || (value.substr(0, value.length + 1) === (test + "-"));
					case "~=":
						return (value.match(/\s/i) == N) && ((" " + value + " ").indexOf(" " + test + " ") > -1);
					default:
						return false;
				}		
			},
			PSEUDO: function (pseudo, argums) {
				if (argums == "" || argums === U) {
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
		};
		
		// test is nodeA among nodeB , nodeA must is a element
		Hawk.contains = function (nodeA, nodeB) {
			if (!nodeB || !nodeA || nodeA.nodeType != 1) return false;
			//fix if nodeB is document
			if (nodeB.nodeType == 9) return arguments.callee(nodeA, nodeB.documentElement);
			return nodeB.contains ? (nodeA !== nodeB) && nodeB.contains(nodeA) : nodeB.compareDocumentPosition ? !!(nodeB.compareDocumentPosition(nodeA) & 16) : false;
		};
		
		(function () {
			//choose the best way for some method of array
			var div = D.createElement("div");
			div.className = "f";
			Hawk.attr = div.getAttribute("class") === "f" ?
			function (elem, attr) {
				return elem.getAttribute(attr,2);
			} : function (elem, attr) {
				switch( attr ){
					case 'class':
						return elem.className;
					case 'style':
						return elem.style.cssText;
					case 'for':
						return elem.htmlFor;
					case 'name':
						return elem.name;
					default:
						return elem.getAttribute(attr, 2);
				}
			};
			div = N;
			//free memory
		})();
		
		Hawk.next = function (elem) {
			var node = elem;
			while (node = (node.nextElementSibling || node.nextSibling))
				if (node.nodeType == 1) return node;
			return N
		};
		
		Hawk.pre = function (elem) {
			var node = elem;
			while (node = (node.previousElementSibling || node.previousSibling))
				if (node.nodeType == 1) return node;
			return N
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
				return iF(f) ? !!f.call(e) : false
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
		Hawk.indexOf = function (elem) {
			var length = this.length;
			for (var i = 0; i < length; i++) {
				var current = this[i];
				if (! (typeof(current) === 'U') || i in this) {
					if (current === elem) return i;
				}
			}
			return -1;
		};
		if (Array.prototype.indexOf) {
			try {
				Array.prototype.indexOf.call(D.documentElement.childNodes, D.documentElement.firstChild);
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
	$.test = function (simple, elem) {
		return $.Selector.satisfy(elem, $.Selector.evalDetail(simple));
	};
	$.DOM = function (nodes) {
		this.nodes = isDOM(nodes) ? [1, nodes].slice(1) : $.toArray(nodes);
		var a = $.toArray(arguments);
		if (a.length > 1) {
			a.shift();
			while (a.length) this.add(a.shift())
		}
	};
	
	//Basic extend
	$.extendDOM = function( a, fn, no_over ){
		var f = arguments.callee;
		if( arguments.length > 1 ){
			if( !$([])[a] ||  !no_over )
			$.DOM.prototype[a] = fn
		}else{
			for( var x in a ) f( x, a[x] )
		}	
	};
	
	
	//basic method
	$.extendDOM({
		each: function (fn) {
			var elem = this.nodes,
				size = elem.length;
			for (var i = 0; i < elem.length; i++) {
				if (elem[i] == window || (elem[i] && (elem[i].nodeType == 1 || elem[i].nodeType == 9 || elem[i].nodeType == 11))) {
					if (fn.call(elem[i], i, size, this) === false) break
				}
			}
			return this
		},
		eachElement: function (fn) {
			return this.each(function (i, z, a) {
				if (this.nodeType == 1) return fn.call(this, i, z, a)
			})
		},
		val: function (fn) {
			if( arguments.length == 0 )
				fn = function(){ return this.value };
			var value = N;
			this.each(function (i, z) {
				if (this) value = fn.call(this, i, z);
				return false
			});
			return value
		},
		k: function (i) {
			return this.nodes[i < 0 ? this.nodes.length + i : i] || N;
		},
		size: function () {
			return this.nodes.length
		},
		slice: function () {
			return $($.toArray(this.nodes).slice.apply(this.nodes, $.toArray(arguments)));
		},
		add: function (str) {
			if (!str) return this;
			if (iS(str)) str = $.Selector(str);
			else if (isDOM(str)) str = [1, str].slice(1);
			else if (isOWL(str)) str = str.nodes;
			this.nodes = $.Selector.concat(this.nodes, str);
			return this
		},
		reset: function (arr) {
			return $(arr);
		},
		clone: function (bool) {
			return this.eachElement(function (elem, i) {
				this.nodes[i] = elem.cloneNode(bool);
			})
		},
		setAttr: function (name, value) {
			var a = name;
			if (arguments.length > 1){
				a ={};
				a[name] = value;
			}	
			return this.eachElement(function () {
				for (var x in a){
					switch (x) {
					case "class":
						this.className = a[x];
						break;
					case "for":
						this.htmlFor = a[x];
						break;
					default:
						this.setAttribute(x,a[x],2)
					}					
				}				
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
		set: function (name, value) {
			if (arguments.length >= 2) {
				var obj = {};
				obj[name] = value;
			} else {
				var obj = name;
			}
			return this.eachElement(function () {
				for (var x in obj) {
					this[x] = obj[x];
				}
				return true;
			})
		},
		get: function (p) {
			return this.k(0) ? this.k(0)[p] : U;
		}
	});
	
	//cache & data
	var DATA_DOM = {},	DATA_ID = 0;
	$.extendDOM({
		setData: function (data, value) {
			return this.each(function () {
				if (iF(this.setUserData)) {
					this.setUserData(data, value, N);
				} else {
					if (!DATA_DOM[data]) DATA_DOM[data] = [];
					for (var i = 0; i < DATA_DOM[data].length; i++)
					if (DATA_DOM[data][i][0] === this) return DATA_DOM[data][i][1] = value;
					DATA_DOM[data].push([this, value]);
				}
			});
		},
		getData: function (data) {
			return this.val(function () {
				if (this.getUserData) return this.getUserData(data);
				if (!DATA_DOM[data]) return N;
				for (var i = 0; i < DATA_DOM[data].length; i++)
				if (DATA_DOM[data][i][0] === this) return DATA_DOM[data][i][1];
				return N
			});
		}
	});
	
	//search selector
	$.extendDOM({
		find: function (expr) {
			var r = [];
			this.each(function () {
				r = r.concat($.toArray($.Selector(expr, this)));
			});
			return $(r);
		},
		parent: function (expr) {
			var r = [];
			return this.eachElement(function () {
				var node = this,
					i = 0;
				if (expr === U) expr = "*";
				while (node = Parent(node)) {
					if (!isE(node)) return;
					if (i++===expr) {
						r.push(node);
						return false;
					}
					if ($.test(expr, node)) r.push(node);
				}
			}).reset(r);
		},
		child: function (expr) {
			var r = [];
			if (expr === U) expr = "*";
			return this.each(function () {
				var i = 0;
				var elems = this.tagName == "TABLE" ? this.rows : (this.children || this.childNodes);
				Loop(elems, function (node) {
					if (!isE(node)) return;
					if (i++===expr) {
						r.push(node);
						return false
					}
					if ($.test(expr, node)) r.push(node);
				})
			}).reset(r)
		},
		next: function (expr) {
			var r = [];
			if (expr === U) expr = "*";
			return this.eachElement(function () {
				var node = this,
					i = 0;
				while (node = $.Selector.next(node)) {
					if (i++===expr) {
						r.push(node);
						return false
					}
					if ($.test(expr, node)) r.push(node)
				}
			}).reset(r)
		},
		pre: function (expr) {
			var r = [];
			if ( expr === U ) expr = "*";
			return this.eachElement(function () {
				var node = this,
					i = 0;
				while (node = $.Selector.pre(node)) {
					if ( i++ === expr ) {
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
			return $(r)
		},
		//update action
		remove: function () {
			return this.eachElement(function (i) {
				Parent(this).removeChild(this)
			})
		},
		empty: function (str) {
			return str === U ? this.eachElement(function () {
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
	
	Each(["after", "append", "first", "before", "replace"], function (act) {
		$.DOM.prototype[act] = function (html, js) {
			return this.eachElement(function (i) {
				DOM.insert(act, html, this, this, i, js)
			})
		};
		$.DOM.prototype[act + "To"] = function (html, js) {
			var container = $(html);
			return this.eachElement(function () {
				container[act](this, js);
			})
		};
	});
	
	//css	& style
	//I make a object contains some special properties 
	$.crossCSS = {
		'float': {
			get: function (elem) {
				var style = Create(elem.tagName).style,
					value = "";
				Each(["float", "cssFloat", "styleFloat"], function (p) {
					if (p in style) {
						value = getCss(elem, p);
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
			get: function (elem) {
				var text = basicGetCss(elem, 'filter');
				return /opacity=(\d+)/i.test(text) ? (parseInt(RegExp.$1) || 0) / 100 : basicGetCss(elem, "opacity") == "" ? 1 : basicGetCss(elem, "opacity");
			},
			set: function (elem, value) {
				value = Math.max(Math.min(value, 1), 0);
				if ('opacity' in elem.style) elem.style.opacity = value;
				else elem.style.filter = "alpha(opacity=" + parseFloat(value) * 100 + ")";
			}
		},
		margin: {
			get: function (elem) {
				return (basicGetCss(elem, "margin-top") || "0px") + " " + (basicGetCss(elem, "margin-right") || "0px") + " " + (basicGetCss(elem, "margin-bottom") || "0px") + " " + (basicGetCss(elem, "margin-left") || "0px")
			}
		},
		padding: {
			get: function (elem) {
				return (basicGetCss(elem, "padding-top") || "0px") + " " + (basicGetCss(elem, "padding-right") || "0px") + " " + (basicGetCss(elem, "padding-bottom") || "0px") + " " + (basicGetCss(elem, "padding-left") || "0px")
			}
		},
		'border-radius': {
			set: function (elem, value) {
				var effigy = Create(elem.tagName).style;
				Loop(["borderRadius", "OBorderRadius", "MozBorderRadius", "WebkitBorderRadius"], function (p) {
					if (p in effigy) {
						elem.style[name] = value;
						return false;
					}
				});
			}
		}
	};
	
	//fix position-x/y on firefox
	function getBgPosition(elem) {
		return (basicGetCss(elem, 'background-position').match(/([^\s]+)\s*?([^\s]+)/i)) 
			? { x: RegExp.$1, y: RegExp.$2	} : {x: 0,y: 0};
	}

	function setBgPosition(elem, pos, value) {
		if (pos in elem.style) return elem.style['backgroundPosition' + upper(pos)] = value;
		var org = getBgPosition(elem);
		org[pos] = value;
		elem.style.backgroundPosition = org['x'] + ' ' + org['y'];
	}
	Each(['x', 'y'], function (pos) {
		$.crossCSS['background-position-' + pos] = {
			set: function (elem, value) {
				setBgPosition(elem, pos, value);
			},
			get: function (elem) {
				return getBgPosition(elem)[pos];
			}
		}
	});

	function basicGetCss(elem, pro) {
		var cap = pro.replace(/-([a-z])/g, function (m, n) {
			return Up(n)
		});
		var lower = Low(pro.replace(/([A-Z])/g, "-$1"));
		var value = iS(elem.style[cap]) ? elem.style[cap] : '';
		if (value == "") {
			try {
				value = elem.currentStyle[cap];
			} catch(e) {
				try {
					value = window.getComputedStyle(elem, N).getPropertyValue(lower);
				} catch(e) {
					try {
						value = D.defaultView.getComputedStyle(elem, N)[lower];
					} catch(e) {}
				}
			}
		}
		//fix default some style properties
		value = iS(value) && value != "auto" && value != "inherit" ? value : "";
		if (/^(margin|padding|border)-(top|right|bottom|left)(-width)?$/i.test(lower) && value === "") value = "0px";
		return value;
	}

	//this function is may read all style-property
	//if property-need-read is multiple then result return always a query-object
	//example: getCss("color,border,font-size")
	function getCss(elem, pro) {
		var result = {},
			first;
		Loop(iS(pro) ? pro.split(/\s*,\s*/i) : pro, function (name) {
			if ((name in $.crossCSS) && $.crossCSS[name].get) {
				result[name] = (first = $.crossCSS[name].get(elem))
			} else {
				result[Low(name.replace(/[A-Z]/g, "-$1"))] = (first = basicGetCss(elem, name));
			}
		});
		if (iS(pro) && !/,/i.test(pro)) return first;
		return new Query(":", ";").Import(result)
	}


	function setCss(elem, css, value) {
		//ex: setCss(elem,'width','100px');
		if( value !== U ){
			var _css = {};
			_css[css] = value;
			css = _css;
		}	
		
		var Q = new Query(':', ';').Import(css);
		for (var x in Q.Data) {
			var name = x.trim().replace(/-(\w)/gi, function (a, b) {
				return Up(b)
			}),
				value = (Q.Data[x] + '').trim().replace(/\!important$/i, '');

			//if value == '' equal remove style property;
			if (value == '') {
				try {
					elem.style.removeProperty(name);
				} catch(e) {
					elem.style[name] = '';
				}
				continue;
			}

			if (x in $.crossCSS && iF($.crossCSS[x].set))
				$.crossCSS[x.trim()].set(elem, value);
			else
				elem.style[name] = value;
							
			//special style-peroperties
			if( name.match(/\w+UserTextSelect/i)){
				elem.setAttribute('unselectable',value=='none'?'on':'off');
			}			
		}
	}

	//extend for $.DOM
	$.extendDOM({
		style: function(){
			return this.css.apply(this,toA(arguments));
		},
		css: function (obj) {
			return (iS(obj) && !/:/.test(obj)) ? this.val(function () {
				return getCss(this, obj);
			}) : this.eachElement(function () {
				return setCss(this, obj);
			});
		},
		hasClass: function ( s ) {
			return this.val(function () {
				var st = this.className.trim(), a = s.split(/\s+/);
				for( var x in a ) {
					if( st.indexOf( a[x] ) == -1 )	return false;
				}
				return true;
			});
		},
		addClass: function ( s ) {
			return this.eachElement(function () {
				var st = this.className.trim(), a = s.split(/\s+/);
				for( var x in a ) {
					if( st.indexOf( a[x] ) == -1 ) st += " " + a[x];
				}
				this.className = st.trim();
			})
		},
		removeClass: function ( s ) {
			return this.eachElement(function () {
				var a = this.className.trim().split(/\s+/i), st =[];
				for( var x in a ) {
					if( (" "+s+" ").indexOf(" "+a[x]+" ") == -1 ){
						st.push(a[x]);
					}
				}
				this.className = st.join(" ");
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

	//Animate is a object 
	var Animate = $.makeClass(function (elem, css_begin, css, css_end, maxCount, options) {
		/*
			css={[start,end,unit,easing],..}
			note: for a nonabled animate css properties easing 
			must be return end			
		*/
		this.elem = elem;
		
		//cs store
		this.css_begin = Extend({},css_begin||{});
		this.css = Extend({},css);
		this.css_end = Extend({},css_end||{});
		
		this.options = options || {};
		this.id = IA++;

		ANIMATE[this.id] = this;

		//remove this of window.setInterval
		var obj = this,
			fc = this.fx;
		this.fx = function () {
			fc.call(obj);
		};
		
		//total step animation
		this.maxCount = maxCount;
		
		//duration should keep
		this.duration = maxCount*TIME_INTERVAL;
		
		//current step
		this.count = 0;	
		this.start();
	},
	{
		start: function () {
			this.fi = window.setInterval(this.fx, TIME_INTERVAL);
		},
		clear: function () {
			clearInterval(this.fi);
			delete ANIMATE[this.id];
		},
		fx: function () {
			var e = this, elem = e.elem;
			if ( !elem ) return e.clear();

			//if start css
			if (e.count == 0){
				$(elem).css(e.css_begin);
				e.options.start.call(elem, e.count, e.maxCount );
			}
			
			if ( e.count < e.maxCount ) {
				this.count++;
				
				//run step callback
				e.options.step.call( elem, e.count, e.maxCount );
				
				//intergate update css
				for( var x in e.css ){
					var start  = e.css[x][0],
						end    = e.css[x][1],
						easing = e.css[x][2],
						duration = e.css[x][3];
	
					if( x in Animate.css ){
						
						setCss( elem, x, Animate.css[x]( start, end, easing, duration, e.count ) );
						
					}else if (end.match(/^(-?\d+(?:\.\d+)?)(\D*)?$/i)) {
						
						end = parseFloat(RegExp.$1);
						unit = RegExp.$2 || '';

						if (start.match(new RegExp('(-?\\d+(?:\\.\\d+)?)' + unit, 'i')))
							start = parseFloat(RegExp.$1);
						else
							start = 1;
						
						//value should convert
						var value = easing( e.count * TIME_INTERVAL, start, end - start, duration );

						value = x == 'opacity' ? Math.round(value * 100) / 100 
							: ( unit.match(/^px$/i) || ( x == 'z-index')) ? Math.round(value) : value.toFixed(2);
							
						setCss( elem, x, value + unit );
						
					}else{
						setCss( elem, x, end );
					}				
				}
			} else {
				e.clear();
				$(elem).css(e.css_end);
				e.options.callback.call(elem);
			}
		}
	});

	//support for style animation
	Animate.css = {};
	Each(["background-color","border-color","border-left-color","border-right-color"
		,"border-top-color","border-bottom-color","outline-color"],function( name ){
		Animate.css[name] = function ( start, end, easing, duration, i ){
			var a = getRGB( start ),
				b = getRGB( end );

			//value should convert
			var r = easing( i * TIME_INTERVAL, a.R, b.R - a.R, duration ),
				g = easing( i * TIME_INTERVAL, a.B, b.B - a.B, duration );
				b = easing( i * TIME_INTERVAL, a.G, b.G - a.G, duration );

			return "rgb("
				+ Math.min(255,Math.max(0,Math.floor(r))) 
				+ "," + Math.min(255,Math.max(0,Math.floor(g)))
				+ "," + Math.min(255,Math.max(0,Math.floor(b)))				
				+ ")";
		};		
	});	
	
	//Apply animate
	$.extendDOM({
		animate: function (css_to, settings) {
			if( arguments.length == 0 ) return this;
			if( arguments.length == 1 ){
				var settings = 	arguments[0];
				var css_to = arguments[0]||{};
			}
			/*
				Convert standar options
			*/
			var options = Extend({
				start: function(){},
				step: function () {},
				callback: function () {},
				duration: 0,
				easing: 'swing'
			}, settings || {});

			//Store to speed up js
			var ware = new Query(":", ";").Import(css_to).Data,
				duration = options.duration;
			
			/*
				A new animate allways append
			*/
			return this.callback(function () {
				var w = Extend({}, ware),
					elem = this,
					k = Math.round( duration / TIME_INTERVAL ),
					css = {},
					css_begin = {},
					css_end = {};

				for (var p in w) {
					var x = p.trim(),
						start, end, easing = $.Easing[options[x + '-easing']] || $.Easing[options.easing],
						set_start = false,
						set_end = false;

					//css properties set for start value
					if (x.match(/^_(.*)$/i)) {
						x = RegExp.$1;
						set_start = true;
					}

					//css properties set for end value
					if (x.match(/^\$(.*)$/i)) {
						x = RegExp.$1;
						set_end = true;
					}

					start = $(elem).css(x) + '';
					
					//fix box-model and default-value of css
					if (x == "width" && start == "") start = $.fixModel(this).W + "px";
					if (x == "height" && start == "") start = $.fixModel(this).H + "px";
					if (x == "opacity" && x == "") start = 1;
					//assign end value
					end = w[p].toString().trim();

					if (end.match(/^([+\-*\/%])=(\d+(?:\.\d+)?)$/i)) {
						var j = RegExp.$1,
							t = parseFloat(RegExp.$2);
						end = start.replace(/-?\d+(\.\d+)?/gi, function (n) {
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
					}

					if (set_start) {
						css_begin[x] = end;
						continue;
					}

					if (set_end) {
						css_end[x] = end;
						continue;
					}

					css[x] = [ start, end, easing, duration ];

				}
				new Animate(this, css_begin, css, css_end, k, options);
			})
		}
	});

	$.Easing = {
		linear: function (t, b, c, d) {
			return b + (t / d) * c;
		},
		swing: function (t, b, c, d) {
			return b + (0.5 - Math.cos((t / d) * Math.PI) / 2) * c;
		},
		outBack: function (t, b, c, d, s) {
			if (s === U) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		}
	};

	$.extendDOM({
		//return boolean value whether has or has not animated
		animated: function (id) {
			return this.val(function () {
				for (var x in ANIMATE) {
					var ef = ANIMATE[x];
					if (ef.elem === this && (id === U || ef.options.id === id)) return true;
				}
				return false;
			})
		},
		//finish and delete behavior
		finish: function (end, fn, id) {
			return this.eachElement(function () {
				for (var x in ANIMATE) {
					var ef = ANIMATE[x];
					if (ef.elem === this && (id === U || id === ef.options.id)) {
						ef.clear();
						if (fn) ef.callback.call(this, x, ANIMATE);
						delete ANIMATE[x];
					}
				}
			})
		},
		//return the last css
		effect: function (id) {
			var elem = this.nodes[0];

			if (!elem) return N;

			for (var x in ANIMATE) {
				var ef = ANIMATE[x];
				if (elem === ef.elem && (id === U || id === ef.options.id)) return ef;
			}
			return N;
		},
		//deepfree behavior
		stop: function (id) {
			return this.eachElement(function () {
				var elem = this;
				NON_ANIMATE[IB++] = [this, id];
				for (var x in ANIMATE) {
					var ef = ANIMATE[x];
					if (elem === ef.elem && (id === U || id == ef.options.id)) {
						ef.clear();
					}
				}
			})
		},
		//return and continue behavior
		back: function ( id ) {
			return this.eachElement(function () {
				var elem = this;
				//remove from disable
				Each(NON_ANIMATE, function (data, i) {
					if (!isA(data)) return;
					if (elem !== data[0]) return;
					if (id === U || id == '*' ) delete NON_ANIMATE[i];
				});
				//start from available
				Each(ANIMATE, function (effect, i) {
					if (!isA(effect)) return;
					if (elem !== effect[0]) return;
					if (id_flag === U || id == effect[5]) if (effect[7] == false) {
						effect[4] = window.setInterval(effect[8], TIME_INTERVAL);
						effect[7] = true;
					}
				})
			})
		},
		//append a affect into last element's behavior
		callback: function (fn, id) {
			return this.eachElement(function () {
				var check = false;
				for (var x in ANIMATE) {
					var ef = ANIMATE[x];
					if (ef.elem === this && (id === U || id === ef.options.id)) {
						var g = toF(ef.options.callback);
						ef.options.callback = function () {
							g.call(this);
							$(this).callback(fn);
						};
						check = true;
					}
				}
				if (!check) fn.call(this);
			})
		},
		merger: function(){
			var a = arguments;
			return this.callback(function(){
				$.DOM.prototype.animate.apply($(this),a);
			});
		},
		visible: function () {
			return getCss(this.nodes[0], 'display') !== 'none';
		},
		show: function (speed, options) {
			options = options || {};
			if (iF(options)) {
				var fn = options;
				options = {
					callback: fn
				}
			}

			options.id = '_show';
			options.duration = speed || 0;
			options.easing = options.easing || 'swing';

			return this.eachElement(function () {

				var oldCss = {},
					css = {},
					initCss = {},
					effect = $(this).effect("_hide");

				//cross a display element					
				if ($(this).visible() && !effect) return true;

				if (effect) {
					//stop animate _show and get last css from callback
					oldCss = effect.options.oldCss;
					var width = oldCss.$width,
						height = oldCss.$height,
						opacity = oldCss.$opacity;

					$(this).finish(false, false, "_hide");

					var offset;

					if (!width.match(/^\d+(?:.\d+)?px$/i)) {
						offset = $.fixModel(this);
						css.width = offset.W + 'px';
					}

					if (!height.match(/^\d+(?:.\d+)?px$/i)) {
						css.height = (offset || $.fixModel(this)).H + 'px';
					}

					css = {
						height: height,
						width: width,
						opacity: opacity || 1
					};
				} else {
					var width = getCss(this, 'width'),
						height = getCss(this, 'height'),
						opacity = getCss(this, 'opacity'),
						overflow = getCss(this, 'overflow'),
						display = normalView(this, 'display', 'none', 'block');
					
					oldCss = {
						$width: width,
						$height: height,
						$opacity: opacity,
						$overflow: overflow,
						$display: display
					};
					
					//end css
					css = Extend(css, {
						height: height,
						width: width,
						opacity: opacity || 1
					});
					
					var offset;
					
					if (!width.match(/^\d+(?:.\d+)?px$/i)) {
						offset = $.fixModel(this);
						css.width = offset.W + 'px';
					}

					if (!height.match(/^\d+(?:.\d+)?px$/i)) {
						css.height = (offset || $.fixModel(this)).H + 'px';
					}					
					
					initCss = {
						width: '1px',
						height: '1px',
						opacity: 0,
						overflow: 'hidden'
					};
				}
				

				//return some fixed value of style
				css = Extend(css, oldCss);

				//direction
				Loop(['width', 'height'], function (p) {
					if (options[p] === false) {
						delete css[p];
						delete initCss[p];
					}
				});

			
				//need start small if none
				$(this).css(initCss);

				css._display = oldCss.$display;

				//stograte oldCss
				options.oldCss = oldCss;
				
				$(this).animate(css, options);

			});
		},
		hide: function (speed, options) {
			options = options || {};
			if (iF(options)) {
				var fn = options;
				options = {
					callback: fn
				}
			}

			options.id = '_hide';
			options.duration = speed || 0;
			options.easing = options.easing || 'swing';

			return this.eachElement(function () {

				var oldCss = {},
					effect = $(this).effect("_show"),
					css = {
					height: '1px',
					width: '1px',
					opacity: '0',
					_overflow: 'hidden'
				};

				//cross a display element					
				if (!$(this).visible() && !effect) return true;

				if (effect) {
					//stop animate _show and get last css from callback
					oldCss = effect.options.oldCss;
					$(this).finish(false, false, "_show");
				} else {
					var width = getCss(this, 'width'),
						height = getCss(this, 'height'),
						opacity = getCss(this, 'opacity'),
						overflow = getCss(this, 'overflow'),
						display = getCss(this, 'display');

					oldCss = {
						$width: width,
						$height: height,
						$opacity: opacity,
						$overflow: overflow,
						$display: display
					};

					var offset;

					if (!width.match(/^\d+(?:.\d+)?px$/i)) {
						offset = $.fixModel(this);
						css._width = offset.W + 'px';
					}

					if (!height.match(/^\d+(?:.\d+)?px$/i)) {
						css._height = (offset || $.fixModel(this)).H + 'px'
					}

				}

				css = Extend(css, oldCss);

				//direction
				Loop(['width', 'height'], function (p) {
					if (options[p] === false) {
						delete css[p];
						delete css['$' + p];
					}
				});

				css.$display = 'none';

				//stograte oldCss
				options.oldCss = oldCss;

				$(this).animate(css, options);

			});
		},
		toggle: function (show, hide) {
			if (isN(show)) show = [show];
			if (isN(hide)) hide = [hide];

			return this.eachElement(function () {
				var ef = $(this).animated("_hide"),
					none = getCss(this, "display") == "none";
				if (ef || none) {
					$(this).show.apply($(this), show);
				} else {
					$(this).hide.apply($(this), hide);
				}
			});
		}
	});

	/*
		Color
	*/
	var COLOR = {
		black: [0,0,0],
		silver: [192,192,192],
		gray: [128,128,128],
		white: [255,255,255],
		maroon: [128,0,0],
		red: [255,0,0],
		purple: [128,0,128],
		fuchsia: [255,0,255],
		green: [0,128,0],
		lime: [0,255,0],
		olive: [128,128,0],
		yellow: [255,255,0],
		navy: [0,0,128],
		blue: [0,0,255],
		teal: [0,128,128],
		aqua: [0,255,255],
		transparent: [255,255,255]
	};
	//almost browser automaticly convert color-value to rgb
	var autoColor = function (name) {
		var div = D.createElement("div");
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
			if (m = name.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i))
				return {
					R: parseInt("0x" + m[1] + m[1]) ,
					G: parseInt("0x" + m[2] + m[2]) , 
					B: parseInt("0x" + m[3] + m[3]) 					
				};
			if (m = name.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i))
				return {
					R: parseInt("0x" + m[1]),
					G: parseInt("0x" + m[3]),
					B: parseInt("0x" + m[2])					
				};
			return name
		};
	}

	function getRGB( color ) {
		color = autoColor(color);
		var  m;
		if ( m = color.replace(/\s/gi, '').match(/^rgb\((\d+)(%)?,(\d+)(%)?,(\d+)(%)?\)$/i)){

			return {
				R: parseInt(m[1])*( m[2] == '%' ? 2.55 : 1),
				G: parseInt(m[3])*( m[4] == '%' ? 2.55 : 1),
				B: parseInt(m[5])*( m[6] == '%' ? 2.55 : 1)
			};
		}
		color = Low(color);
		
		//if color is basic name
		if (COLOR[color]){
			var n = COLOR[color];
			return {R: n[0], B: n[1], G: n[2] }
		}
		
		return color
	};

	$.fixModel = function (elem) {
		var r = Real(elem), dim = diff(elem);
		return {
			W: Math.max(r.width - dim.h, 0),
			H: Math.max(r.height - dim.v, 0)
		}
	};
	
	
	//get minus dim from boxmodel not support
	function diff(elem, p) {
		var div = Create("div"),
			djv = Create("div");
		$("body").append(div);
		div.style.cssText = $(elem).css((!p ? "border-top-width,border-left-width," + "border-right-width,border-bottom-width," + "border-right-style,border-left-style,border-top-style,border-bottom-style," + "border-right-color,border-left-color,border-top-color,border-bottom-color," : "") + "padding-left,padding-right,padding-top,padding-bottom").Compact().Export();
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
		D.body.appendChild(div);
		var value = basicGetCss(div, css);
		D.body.removeChild(div);
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
	$.offset = function (elem) {
		var a = [],
			div = Create("div"),
			node = elem;
		// smart test cross body's standar
		$(div).appendTo("body").css("display:block;position:absolute;top:0;left:0;border:none;margin:0");
		var left = -div.offsetLeft,
			top = -div.offsetTop;
		$(div).remove();
		while (node) {
			var r = Real(node);
			if (!r || node === D.documentElement || node === D.body) break;
			left += r.left;
			top += r.top;
			node = node.offsetParent;
		}
		//fix firefox
		Loop([D.body, D.documentElement], function (w) {
			if (w.offsetTop < 0) top += (w === D.documentElement ? 1 : -2) * w.offsetTop;
			if (w.offsetLeft < 0) left += (w === D.documentElement ? 1 : -2) * w.offsetLeft;
		});
		//ok now 100% exactly	
		return {
			left: left,
			top: top
		}
	};
	$.extendDOM({
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
				if (this === window ) return this.innerHeight || screen.height;
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
			var callback = function (e,is_fire) {
				var event = e || window.event;
				var event_fix = event ? $.Event.fix(event, object) : N;
				var result = fn.call(object, event_fix, is_fire);
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
					if ((event_name === event[1] || event_name == "*") && (fn === event[3] || (id !== U && (id === event[4] || id == "*")))) {
						var list_f = event[2];
						for (var x in list_f) $.Event.remove(event[0], x, event[2][x], id, true);
						delete EVENT_SPECIAL_LIST[i];
						if (object != "*" && id != "*" && event_name != "*") return false
					}
				});
				return object;
			}
			//find from cache basic event
			Each(EVENT_BASIC_LIST, function (event, i) {
				if (event[0] !== object && object != "*") return;
				if ((event_name === event[1] || event_name == "*") && (fn === event[3] || (id !== U && (id === event[4] || id == "*"))) && (event[5] == is_special)) {
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
	$.Event.fix = function ( event, elem) {
		if ( !event ) return U;

		//extend event with much properties also may make code slower  
		var E = {};
		//store for original event
		E.originalEvent = event;
		//type of event , continue edit in some special event
		E.type = event.type;
		if ( elem === window ) return E;

		//on ie return U for keypress
		E.which = event.keyCode || event.which || event.charCode;

		function k(v) {
			return E.which == v;
		}
		if (E.which) {
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
		}
		
		//target
		E.target = event.target || event.srcElement;
		if ( E.target && E.target.nodeType == 3) E.target = Parent(E);
		//only for mouse event
		E.relatedTarget = event.relatedTarget !== U ? event.relatedTarget : (event.fromElement != event.target ? event.toElement : event.fromElement); //always is element
		E.currentTarget = elem;
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
		
		//require elem is element , != W
		if (!isE(elem) && (elem.nodeType != 9)) return E;

		//fix firefox
		if( !elem.ownerDocument && elem.nodeType != 9 ) return E;
		
		var doc = elem.ownerDocument||elem, html = doc.documentElement,	body = doc.body;

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
		if (elem.nodeType != 1) return E;
		var off = $.offset(elem);

		//contain border and padding
		E.offsetX = E.pageX - off.left;
		E.offsetY = E.pageY - off.top;
		E.offsetBottom = elem.offsetHeight - E.offsetY;
		E.offsetRight = elem.offsetWidth - E.offsetX;
		return E
	};
	var EVENT_BASIC = ("scroll,resize,click,dbclick,focus,blur,select,submit,reset,change,load,unload,mouseover,mouseout,mousemove,drag,dragend,dragstart,mousedown,mouseup,keyup,keydown,keypress,error,abort").split(",");

	function eL(fn) {
		return function (e) {
			e.currentType = "mouseout";
			e.type = "mouseleave";
			//fix out W
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
		var r = D.documentElement;
		if (r && ((r.onmouseenter === N) || iF(r.onmouseenter))) {
			delete EVENT_SPECIAL.mouseenter;
			delete EVENT_SPECIAL.mouseleave;
			EVENT_BASIC.push("mouseenter");
			EVENT_BASIC.push("mouseleave");
		}
	})();
	
	
	//fix mousewheel   
	if ((window.onmousewheel !== U) || (D.onmousewheel !== U)) {
		delete EVENT_SPECIAL.mousewheel;
		EVENT_BASIC.push("mousewheel");
	}

	(function () {
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
	
	$.extendDOM({
		addEvent: function (name, fn, id) {
			if (!iS(name)) {
				for (var x in name) this.addEvent(x, name[x], fn, id);
				return this
			}
			return this.each(function () {
				var arr = name.split(/\W+/i);
				for (var i = 0; i < arr.length; i++) $.Event.add(this, arr[i], fn, id)
			})
		},
		removeEvent: function (name, fn, id) {
			if (!iS(name)) {
				for (var x in name) this.removeEvent(x, name[x], fn, id);
				return this
			}
			return this.each(function () {
				var arr = name.split(/\W+/i);
				for (var i = 0; i < arr.length; i++) $.Event.remove(this, arr[i], fn, id)
			})
		},
		fire: function (name) {
			return this.each(function () {
				var obj = this;
				Each(EVENT_BASIC_LIST, function (event) {
					if (event[0] == obj && Low(name) == event[1])
						event[2].call( obj, window.event||event, true);
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
		},
		clickOut: function( fc ){
			return this.eachElement(function(){
				var elem = this, blur = true, focus = false;
				$(document).onClick(function( event ){
					if( blur && focus ){
						fc.call( elem,event );
						blur = true;
						focus = false;
					}
				});
				
				$(this).onClick(function(){
					focus = true;
					blur = false;
				});
			});	
		}	
	});
	//test complete of img
	//ie return U for img just create and return true or false fo img error 
	//opera also, other browser return true for img completely load and false for img error
	var is_loaded = function (e) {
		return e.tagName == "IMG" && e.complete === true;
	};
	
	(function () {
		if (!D.body || !D.body.appendChild) {
			var fc = arguments.callee;
			return setTimeout(function () {
				fc();
			},5);
		}
		var img = D.createElement('IMG');
		D.body.appendChild(img);
		img.src='http://';
		//IE treat with a error img is complete === false
		if (img.complete === false && 'readyState' in img) is_loaded = function (e) {
			return e.tagName == "IMG" && (e.complete === true || e.complete === false);
		};
		
		D.body.removeChild(img);
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
	} //replace global
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
	}
	
	$.extendDOM({
		text: function (text) {
			if (iS(text)) return this.empty().append(D.createTextNode(text));
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
		},
		/* Selection */
		getPointer: function(){
			return this.val(function(){
				var doc = this.ownerDocument || this, elem = this;
				if ( this.selectionStart ){
					return {
						start: elem.selectionStart,
						end: elem.selectionEnd
					}
				}
				
				if ( !doc.selection )
					return {start: 0, end: 0};
	
				var r = doc.selection.createRange();
				var c = r.duplicate();
				c.moveToElementText(elem);
				c.setEndPoint("EndToEnd", r);
				return {
					start: c.text.length - r.text.length,
					end : c.text.length
				}	
			});
		},
		//slect text in element
		select: function( win ){
			return this.eachElement(function(){
			   win = win || window;
			   var d = this.ownerDocument||this;
			   if ( d.body.createTextRange ) {
					var r = d.body.createTextRange();
					r.moveToElementText(this);
					r.select();
				} else if(win.getSelection) {
					var s = win.getSelection();
					
					try{
						s.setBaseAndExtent(this, 0, this, 1);
					}catch(e){	
						var r = d.createRange();
						r.selectNodeContents(this);
						s.removeAllRanges();
						s.addRange(r)
					}
				}				
				return false
			})		
		},
		//slect in textarea
		selectText: function( start, end ){
			return arguments.length > 0 ? this.eachElement(function(){
				if (end < start) start = end;
				if (end == -1) end = (this.value || $(this).text()).length;
				if (this.setSelectionRange) {
					this.focus();
					this.setSelectionRange(start, end);
				} else if (this.createTextRange) {
					var range = elem.createTextRange();
					range.collapse(true);
					range.moveEnd('character', end);
					range.moveStart('character', start);
					range.select();
				}
				return false
			}) : this.val(function(){		
				var d = this.ownerDocument || this;
				if (d.selection && d.selection.createRange) {
					return d.selection.createRange().text;
				} else if ('getSelection' in this) {
					return this.getSelection() + "";
				}
				return '';
			});
		},
		/*
			Return a object of request in form
		*/
		query: function ( ) {
			return this.val(function(){
				var data = {};
				if( this.tagName == 'FORM' ){
					for (var i = 0; i < this.elements.length; i++) {
						var a = this.elements[i];
						if (((a.type == "checkbox" || a.type == "radio") && a.checked) || (a.type != "checkbox" && a.type != "radio")) {
							if (a.name.match(/^(.*)\[\]$/i)) {
								//element get value in array
								var j = 0, name = RegExp.$1;
								while (j > -1) {
									if (! ((name + "[" + j + "]") in data)) {
										data[name + "[" + j + "]"] = a.value;
										break;
									}
									j++;
								}
							} else {
								data[a.name] = a.value;
							}
						}
					}
				}
				//keep here for the future
				return data
			})	
		},
		submitAjax: function ( options ){
			return this.eachElement(function(){
				if( this.tagName != 'FORM' )
					return true;

				//get info
				var url = $(this).getAttr('action'),
					method = $(this).getAttr('method')||'get',
					data = $(this).query();
				
				options = Extend({
					init: function(){},
					filter: function(v){ return v },
					type: method
				},options||{});

				for( var x in data ){
					data[x] = options.filter.call(this,data[x],x);				
				}
				options.data = data;
				
				options.init.call(this);
				
				$.Ajax(url,options);
			})	
		}
	});

	/*---------------------------------------------------------------------------*/
	// Core Function
	/*---------------------------------------------------------------------------*/
	//basic
	function iS(s) {
		return typeof s === "string"
	}



	function iF(f) {
		try{
			return (typeof f === "function") && ('call' in f);
		}catch(e){
			return false
		}	
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
		return iF(f) ? f : new Function
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
		return tag ? (doc || D).createElement(tag) : (doc || D).createDocumentFragment()
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
		for (var i = 0; i < arr.length; i++){
			if (fn.call(arr, arr[i], i) === false) break;
		}	
	}

	function Each(obj, fn) {
		for (var x in obj) if (fn.call(obj, obj[x], x) === false) break;
	}

	function Extend(obj, pros, filter) {
		filter = filter ||
		function (a) {
			return pros[a]
		};
		if (pros === U) {
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
			if (iS(str)) {
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
			if (this.Data[x] === U || this.Data[x] === N || this.Data[x] === "") delete this.Data[x];
			return this;
		},
		Export: function (fn) {
			var str = [];
			fn = fn || (function (s) {
				return s
			});
			for (var x in this.Data) str.push(x + this.S + fn(this.Data[x], x));
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
		if (iF(opts)) opts = {
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
		if (xhr === false) return;
		//readychange
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
		var user = opts.user || N;
		var password = opts.passowrd || N;
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
				xhr.send(N);
			}
		} catch(e) { //toF(opts.error).call(xhr, '');
		}
		return xhr
	};

	//add to DOM
	$.DOM.prototype.update = function (url, option) {
		option = option || {};
		var options = {},
			obj = this,
			succ = toF(option.success);
		if (!iF(option)) {
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
		W['json_callback_' + i] = function () {
			if (Active(script)) success.apply($, $.toArray(arguments));
			W['json_callback_' + i] = F;
			$(script).remove();
			//empty errror for ie
			error = F;
		};
		this.abort = function () {
			//fix on firefox
			W['json_callback_' + i] = F;
			try {
				script.abort()
			} catch(e) {}
			if (Active(script)) $(script).remove();
		};
		try {
			script = Create("script");
			(function () {
				this.src = url;
				this.type = "text/javascript";
				//halder error event
				var script = this;
				if (this.readyState) {
					//opera fixed
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
		if (iF(opts)) opts = {
			success: opts
		};
		return new JSON(url, opts.success, toF(opts.error), opts.cache);
	};
	/*-------------------------- COOKIE ------------------------------*/
	$.Cookie = {
		set: function (name, value, time) {
			time = (time || 0) * 1000 * 60 * 60 * 24;
			var expires = new Date((new Date()).getTime() + time).toGMTString();
			D.cookie = name + "=" + escapse(value) + ";expires=" + expires
		},
		remove: function (name) {
			D.cookie = name + "=;expires=Thus,01-Jan-1970 00:00:00 GMT"
		},
		//read cookie
		get: function (name) {
			var data = new Query("=", ";").Import((D.cookie || "").replace(/;$/i, "").replace(/;\s+/gi, ";"));
			if (name in data.Data) return unescape(data.Data[name]);
			return N
		}
	};
	/*---------------------------------------------------------------------------*/
	// onComplete , onCreate & onReady 
	/*---------------------------------------------------------------------------*/
	var DOMREADY = false,
		FN_READY = [];
	//register a function for domload
	function __complete(fn) {
		if (iF(fn)) FN_READY.push(fn);
		while (DOMREADY && FN_READY.length) FN_READY.shift().call(window,$)
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
			$(D).addEvent("DOMContentLoaded", ready, false);
		} catch(e) {
			$(window).onLoad(ready);
		}

		//enought to work for chrome ,ie ,safari 
		if (/loaded|complete/i.test(D.readyState) || (D.body && /loaded|complete/i.test(D.body.readyState))) {
			return ready();
		}
		if (D.readyState !== U) {
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

	//copy some ui functions
	$.Extend = Extend;
	$.isArray = isA;
	$.Create = Create;
	$.Loop = Loop;
	$.Each = Each;
	$.Query = Query;
	$.Contains = $.Selector.contains;
	XHTML_MODEL={};
	$.xhtml = function (str) {
		if( !XHTML_MODEL[str] ){
			XHTML_MODEL[str] = $(D.createElement('html')).append(str).k(0);
		}
		return $(XHTML_MODEL[str].cloneNode(true)).child('*');
	};

	var _$ = window.$;
	$.setPeace = function(){
		return _$;
	};
	window.$ = Owl;

	/*---------------------------------------------------------------------------*/
	// smart action 
	/*---------------------------------------------------------------------------*/
	var STORE_ACTION = [];
	var smartAct = function (_str) {
		var str = _str;
		this.id = STORE_ACTION.push(function () {
			return $(str);
		}) - 1;
		return this;
	};

	Extend(smartAct.prototype, new $.DOM([]), function (act) {
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

	//just a query
	$.GET = location.search ? new Query("=", "&").Import(location.search.slice(1)).Data : {};
	//stop animate	when unload
	$(window).onUnload(function () {
		ANIMATE = [];
	});
	$.jDOM = DOM;
	
})(document, undefined, null);