/*
 * cpim v0.0.1
 * JavaScript implementation of CPIM "Common Presence and Instant Messaging" (RFC 3862)
 * Copyright 2015 Iñaki Baz Castillo at eFace2Face, inc. (https://eface2face.com)
 * License MIT
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cpim = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Expose the Message class.
 */
module.exports = Message;


/**
 * Dependencies.
 */
var
	debug = require('debug')('cpim:Message'),
	grammar = require('./grammar');


function Message() {
	debug('new()');

	this._cpimHeaders = {};
	this._mimeHeaders = {};
	this._body = null;
	this._nsUris = {};
}


Message.prototype.from = function (data) {
	// Get.
	if (!data && data !== null) {
		if (this._cpimHeaders.From) {
			return this._cpimHeaders.From[0];
		}
	// Set.
	} else if (data) {
		data.value = grammar.cpimHeaderRules.From.format(data);
		this._cpimHeaders.From = [data];
	// Delete.
	} else {
		delete this._cpimHeaders.From;
	}
};


Message.prototype.to = function (data) {
	// Get.
	if (!data && data !== null) {
		if (this._cpimHeaders.To) {
			return this._cpimHeaders.To[0];
		}
	// Set.
	} else if (data) {
		data.value = grammar.cpimHeaderRules.To.format(data);
		this._cpimHeaders.To = [data];
	// Delete.
	} else {
		delete this._cpimHeaders.To;
	}
};


Message.prototype.tos = function (datas) {
	// Get.
	if (!datas) {
		return this._cpimHeaders.To || [];
	// Set.
	} else {
		this._cpimHeaders.To = [];
		datas.forEach(function (data) {
			data.value = grammar.cpimHeaderRules.To.format(data);
			this._cpimHeaders.To.push(data);
		}, this);
	}
};


Message.prototype.cc = function (data) {
	// Get.
	if (!data && data !== null) {
		if (this._cpimHeaders.CC) {
			return this._cpimHeaders.CC[0];
		}
	// Set.
	} else if (data) {
		data.value = grammar.cpimHeaderRules.CC.format(data);
		this._cpimHeaders.CC = [data];
	// Delete.
	} else {
		delete this._cpimHeaders.CC;
	}
};


Message.prototype.ccs = function (datas) {
	// Get.
	if (!datas) {
		return this._cpimHeaders.CC || [];
	// Set.
	} else {
		this._cpimHeaders.CC = [];
		datas.forEach(function (data) {
			data.value = grammar.cpimHeaderRules.CC.format(data);
			this._cpimHeaders.CC.push(data);
		}, this);
	}
};


Message.prototype.subject = function (value) {
	// Get.
	if (!value && value !== null) {
		if (this._cpimHeaders.Subject) {
			return this._cpimHeaders.Subject[0].value;
		}
	// Set.
	} else if (value) {
		this._cpimHeaders.Subject = [{
			value: value
		}];
	// Delete.
	} else {
		delete this._cpimHeaders.Subject;
	}
};


Message.prototype.subjects = function (values) {
	// Get.
	if (!values) {
		if (this._cpimHeaders.Subject) {
			return this._cpimHeaders.Subject.map(function (data) {
				return data.value;
			});
		} else {
			return [];
		}
	// Set.
	} else {
		this._cpimHeaders.Subject = [];
		values.forEach(function (value) {
			this._cpimHeaders.Subject.push({value: value});
		}, this);
	}
};


Message.prototype.dateTime = function (date) {
	var data;

	// Get.
	if (!date && date !== null) {
		if (this._cpimHeaders.DateTime) {
			return this._cpimHeaders.DateTime[0].date;
		}
	// Set.
	} else if (date) {
		data = {
			date: date
		};
		data.value = grammar.cpimHeaderRules.DateTime.format(data);
		this._cpimHeaders.DateTime = [data];
	// Delete.
	} else {
		delete this._cpimHeaders.DateTime;
	}
};


Message.prototype.header = function (nsUri, name, value) {
	if (nsUri) {
		name = nsUri + '@' + name;
	}

	// Get.
	if (!value && value !== null) {
		if (this._cpimHeaders[name]) {
			return this._cpimHeaders[name][0].value;
		}
	// Set.
	} else if (value) {
		if (nsUri && !this._nsUris[nsUri]) {
			throw new Error('NS uri "' + nsUri + '" not declared, use addNS() method first');
		}

		this._cpimHeaders[name] = [{
			value: value
		}];
	// Delete.
	} else {
		delete this._cpimHeaders[name];
	}
};


Message.prototype.headers = function (nsUri, name, values) {
	if (nsUri) {
		name = nsUri + '@' + name;
	}

	// Get.
	if (!values) {
		if (this._cpimHeaders[name]) {
			return this._cpimHeaders[name].map(function (data) {
				return data.value;
			});
		} else {
			return [];
		}
	// Set.
	} else {
		if (nsUri && !this._nsUris[nsUri]) {
			throw new Error('NS uri "' + nsUri + '" not declared, use addNS() method first');
		}

		this._cpimHeaders[name] = [];
		values.forEach(function (value) {
			this._cpimHeaders[name].push({
				value: value
			});
		}, this);
	}
};


Message.prototype.addNS = function (uri) {
	var prefix;

	if (typeof uri !== 'string' || !uri) {
		throw new Error('argument must be a non empty String');
	}

	if (this._nsUris[uri] || uri === grammar.NS_PREFIX_CORE) {
		return;
	}

	prefix = 'Prefix' + (Object.keys(this._nsUris).length + 1);
	this._nsUris[uri] = prefix;
};


Message.prototype.contentType = function (data) {
	// Get.
	if (!data && data !== null) {
		return this._mimeHeaders['Content-Type'];
	// Set.
	} else if (data) {
		data.value = grammar.mimeHeaderRules['Content-Type'].format(data);
		this._mimeHeaders['Content-Type'] = data;
	// Delete.
	} else {
		delete this._mimeHeaders['Content-Type'];
	}
};


Message.prototype.contentId = function () {
	var args = Array.prototype.slice.call(arguments);

	args.unshift('Content-ID');
	return this.mimeHeader.apply(this, args);
};


Message.prototype.mimeHeader = function (name, value) {
	name = grammar.headerize(name);

	// Get.
	if (!value && value !== null) {
		if (this._mimeHeaders[name]) {
			return this._mimeHeaders[name].value;
		}
	// Set.
	} else if (value) {
		this._mimeHeaders[name] = {
			value: value
		};
	// Delete.
	} else {
		delete this._mimeHeaders[name];
	}
};


Message.prototype.body = function (body) {
	// Get.
	if (!body && body !== null) {
		return this._body;
	// Set.
	} else if (body) {
		this._body = body;
	// Delete.
	} else {
		delete this._body;
	}
};


Message.prototype.toString = function () {
	var
		raw = '',
		i, len,
		uri, name, splitted,
		headers, header;

	// First print CPIM NS headers.

	for (uri in this._nsUris) {
		if (this._nsUris.hasOwnProperty(uri)) {
			raw += 'NS: ' + this._nsUris[uri] + ' <' + uri + '>\r\n';
		}
	}

	// Then all the other CPIM headers.

	for (name in this._cpimHeaders) {
		if (this._cpimHeaders.hasOwnProperty(name)) {
			// Ignore NS headers.
			if (name === 'NS') {
				continue;
			}

			headers = this._cpimHeaders[name];

			// Split prefixed headers.
			if (name.indexOf('@') !== -1) {
				splitted = name.split('@');
				uri = splitted[0];
				name = splitted[1];
			} else {
				uri = undefined;
			}

			for (i = 0, len = headers.length; i < len; i++) {
				header = headers[i];

				if (uri) {
					raw += this._nsUris[uri] + '.' + name + ': ' + header.value + '\r\n';
				} else {
					raw += name + ': ' + header.value + '\r\n';
				}
			}
		}
	}

	// Blank line.

	raw += '\r\n';

	// Then all the MIME headers.

	for (name in this._mimeHeaders) {
		if (this._mimeHeaders.hasOwnProperty(name)) {
			header = this._mimeHeaders[name];

			raw += name + ': ' + header.value + '\r\n';
		}
	}

	// Blank line.

	raw += '\r\n';

	// Body.

	raw += this._body;

	return raw;
};


Message.prototype.isValid = function () {
	if (Object.keys(this._cpimHeaders).length === 0) {
		return false;
	}

	if (Object.keys(this._mimeHeaders).length === 0) {
		return false;
	}

	return true;
};

},{"./grammar":4,"debug":7}],2:[function(require,module,exports){
/**
 * Expose the Session class.
 */
module.exports = Session;


/**
 * Dependencies.
 */
var
	debug = require('debug')('cpim:Session'),
	debugerror = require('debug')('cpim:ERROR:Session'),
	EventEmitter = require('events').EventEmitter,
	Message = require('./Message'),
	parse = require('./parse');


debugerror.log = console.warn.bind(console);


function Session(data) {
	debug('new() | [data:%o]', data);

	// Inherit from EventEmitter.
	EventEmitter.call(this);
}


// Inherit from EventEmitter.
Session.prototype = Object.create(EventEmitter.prototype, {
	constructor: {
		value: Session,
		enumerable: false,
		writable: true,
		configurable: true
	}
});


/**
 * Provide the session with a received raw CPIM message.
 */
Session.prototype.receive = function (raw) {
	debug('receive()');

	var message = parse(raw);

	if (message) {
		emit.call(this, 'received', message);

		return true;
	} else {
		debugerror('receive() | invalid message [raw:%s]', raw);

		return false;
	}
};


/**
 * Provide the session with a message to be sent.
 */
Session.prototype.send = function (message) {
	debug('send()');

	if (!(message instanceof Message)) {
		throw new Error('message must be a Message instance');
	}

	if (!message.isValid()) {
		throw new Error('given Message is invalid');
	}

	emit.call(this, 'send', message);
};


/**
 * Private API.
 */


function emit() {
	if (arguments.length === 1) {
		debug('emit "%s"', arguments[0]);
	} else {
		debug('emit "%s" [arg:%o]', arguments[0], arguments[1]);
	}

	try {
		this.emit.apply(this, arguments);
	} catch (error) {
		debugerror('emit() | error running an event handler for "%s" event: %o', arguments[0], error);
	}
}

},{"./Message":1,"./parse":5,"debug":7,"events":6}],3:[function(require,module,exports){
/**
 * Dependencies.
 */
var
	Session = require('./Session');


module.exports = {
	Session: Session
};

},{"./Session":2}],4:[function(require,module,exports){

var
	/**
	 * Constants.
	 */
	REGEXP_CONTENT_TYPE = /^([^\t \/]+)\/([^\t ;]+)(.*)$/,
	REGEXP_PARAM = /^[ \t]*([^\t =]+)[ \t]*=[ \t]*([^\t =]+)[ \t]*$/,
	// CPIM headers that can only appear once.
	SINGLE_CPIM_HEADERS = {
		From: true,
		DateTime: true
	},

	/**
	 * Exported object.
	 */
	grammar = module.exports = {};


grammar.cpimHeaderRules = {
	From: {
		reg: /^(.*[^ ])?[ ]*<(.*)>$/,
		names: ['name', 'uri'],
		format: function (data) {
			return data.name ?
				data.name + ' ' + '<' + data.uri + '>' :
				'<' + data.uri + '>';
		}
	},

	To: {
		reg: /^(.*[^ ])?[ ]*<(.*)>$/,
		names: ['name', 'uri'],
		format: function (data) {
			return data.name ?
				data.name + ' ' + '<' + data.uri + '>' :
				'<' + data.uri + '>';
		}
	},

	cc: {
		reg: /^(.*[^ ])?[ ]*<(.*)>$/,
		names: ['name', 'uri'],
		format: function (data) {
			return data.name ?
				data.name + ' ' + '<' + data.uri + '>' :
				'<' + data.uri + '>';
		}
	},

	DateTime: {
		reg: function (value) {
			var seconds = Date.parse(value);

			if (seconds) {
				return {
					date: new Date(seconds)
				};
			} else {
				return undefined;
			}
		},
		format: function (data) {
			return data.date.toISOString();
		}
	},

	NS: {
		reg: /^([a-zA-Z0-9!#$%&'+,\-\^_`|~]+)?[ ]*<(.*)>$/,
		names: ['prefix', 'uri'],
		format: function (data) {
			return data.prefix ?
				data.prefix + ' ' + '<' + data.uri + '>' :
				'<' + data.uri + '>';
		}
	}
};


grammar.unknownCpimHeaderRule = {
	reg: /(.*)/,
	names: ['value'],
	format: '%s'
};


grammar.isSingleCpimHeader = function (name) {
	return !!SINGLE_CPIM_HEADERS[name];
};


grammar.NS_PREFIX_CORE = 'urn:ietf:params:cpim-headers:';


grammar.mimeHeaderRules = {
	'Content-Type': {
		// reg: /^([^\t \/]+)\/([^\t ;]+).*$/,
		reg: function (value) {
			var match = value.match(REGEXP_CONTENT_TYPE),
				params = {};

			if (!match) {
				return undefined;
			}

			if (match[3]) {
				params = parseParams(match[3]);
				if (!params) {
					return undefined;
				}
			}

			return {
				type: match[1].toLowerCase(),
				subtype: match[2].toLowerCase(),
				params: params
			};
		},
		format: function (data) {
			return data.type + '/' + data.subtype + serializeParams(data.params);
		}
	}
};


grammar.unknownMimeHeaderRule = {
	reg: /(.*)/,
	names: ['value'],
	format: '%s'
};


grammar.headerize = function (string) {
	var
		exceptions = {
			'Content-Id': 'Content-ID'
		},
		name = string.toLowerCase().replace(/_/g, '-').split('-'),
		hname = '',
		parts = name.length,
		part;

	for (part = 0; part < parts; part++) {
		if (part !== 0) {
			hname += '-';
		}
		hname += name[part].charAt(0).toUpperCase() + name[part].substring(1);
	}

	if (exceptions[hname]) {
		hname = exceptions[hname];
	}

	return hname;
};


// Set sensible defaults to avoid polluting the grammar with boring details.

Object.keys(grammar.cpimHeaderRules).forEach(function (name) {
	var rule = grammar.cpimHeaderRules[name];

	if (!rule.reg) {
		rule.reg = /(.*)/;
	}
	if (!rule.format) {
		rule.format = '%s';
	}
});

Object.keys(grammar.mimeHeaderRules).forEach(function (name) {
	var rule = grammar.mimeHeaderRules[name];

	if (!rule.reg) {
		rule.reg = /(.*)/;
	}
	if (!rule.format) {
		rule.format = '%s';
	}
});


/**
 * Private API.
 */


function parseParams(rawParams) {
	var
		splittedParams,
		i, len,
		paramMatch,
		params = {};

	if (rawParams === '' || rawParams === undefined || rawParams === null) {
		return params;
	}

	splittedParams = rawParams.split(';');
	if (splittedParams.length === 0) {
		return undefined;
	}

	for (i = 1, len = splittedParams.length; i < len; i++) {
		paramMatch = splittedParams[i].match(REGEXP_PARAM);
		if (!paramMatch) {
			return undefined;
		}

		params[paramMatch[1].toLowerCase()] = paramMatch[2];
	}

	return params;
}


function serializeParams(params) {
	var
		str = '',
		value;


	if (!params) {
		return str;
	}

	Object.keys(params).forEach(function (param) {
		value = params[param];

		if (value) {
			str += ';' + param.toLowerCase() + '=' + value;
		} else {
			str += ';' + param.toLowerCase();
		}
	});

	return str;
}

},{}],5:[function(require,module,exports){
/**
 * Expose the parse function.
 */
module.exports = parse;


/**
 * Dependencies.
 */
var
	debug = require('debug')('cpim:parse'),
	debugerror = require('debug')('cpim:ERROR:parse'),
	grammar = require('./grammar'),
	Message = require('./Message'),


/**
 * Constants.
 */
	REGEXP_VALID_HEADER = /^(([a-zA-Z0-9!#$%&'+,\-\^_`|~]+)\.)?([a-zA-Z0-9!#$%&'+,\-\^_`|~]+):[^ ]* (.+)$/,
	REGEXP_VALID_MIME_HEADER = /^([a-zA-Z0-9!#$%&'+,\-\^_`|~]+)[ \t]*:[ \t]*(.+)$/;  // TODO: RFC 2045


debugerror.log = console.warn.bind(console);


function parse(raw) {
	debug('parse()');

	var
		headersEnd,
		mimeHeadersEnd,
		rawHeaders,
		rawMimeHeaders,
		rawBody,
		message;

	if (typeof raw !== 'string') {
		throw new Error('given data must be a string');
	}

	headersEnd = raw.indexOf('\r\n\r\n');
	if (headersEnd === -1) {
		debugerror('wrong headers');
		return false;
	}
	rawHeaders = raw.slice(0, headersEnd);

	mimeHeadersEnd = raw.indexOf('\r\n\r\n', headersEnd + 1);
	rawMimeHeaders = raw.slice(headersEnd + 4, mimeHeadersEnd).trim();

	if (mimeHeadersEnd !== -1) {
		rawBody = raw.slice(mimeHeadersEnd + 4, -1);
	}

	// Init the Message instance.
	message = new Message();

	// Parse headers.
	if (!parseHeaders(rawHeaders)) {
		return false;
	}

	// Parse MIME headers.
	if (!parseMimeHeaders(rawMimeHeaders)) {
		return false;
	}

	// Get body.
	if (rawBody) {
		message._body = rawBody;
	}

	return message;


	function parseHeaders(rawHeaders) {
		var
			lines = rawHeaders.split('\r\n'),
			i, len,
			currentDefaultNSUri,
			ns = {};  // key: prefix, value: uri.

		for (i = 0, len = lines.length; i < len; i++) {
			if (!parseHeader(lines[i])) {
				debugerror('discarding message due to invalid header: "%s"', lines[i]);
				return false;
			}
		}

		return true;


		function parseHeader(line) {
			var
				match = line.match(REGEXP_VALID_HEADER),
				prefix,
				name,
				value,
				nsUri,
				rule,
				parsedValue,
				i, len,
				data = {};

			if (!match) {
				debugerror('invalid header "%s"', line);
				return false;
			}

			prefix = match[2];
			name = match[3];
			value = match[4];

			if (prefix) {
				nsUri = ns[prefix];

				if (!ns[prefix]) {
					debugerror('non declared prefix in line "%s"', line);
					return false;
				}
			// Don't apply defualt prefix if header is a NS.
			} else if (currentDefaultNSUri && name !== 'NS') {
				nsUri = currentDefaultNSUri;
			}

			// Ignore prefixes to the CORE NS URI ('urn:ietf:params:cpim-headers:').
			if (nsUri === grammar.NS_PREFIX_CORE) {
				nsUri = undefined;
			}

			// Complete the header name with its prefix URI.
			if (nsUri) {
				name = nsUri + '@' + name;
			}

			if (message._cpimHeaders[name] && grammar.isSingleCpimHeader(name)) {
				debugerror('"%s" header can only appear once', name);
				return false;
			}

			rule = grammar.cpimHeaderRules[name] || grammar.unknownCpimHeaderRule;

			if (typeof rule.reg !== 'function') {
				parsedValue = value.match(rule.reg);
				if (!parsedValue) {
					debugerror('wrong header: "%s"', line);
					return false;
				}

				for (i = 0, len = rule.names.length; i < len; i++) {
					if (parsedValue[i + 1] !== undefined) {
						data[rule.names[i]] = parsedValue[i + 1];
					}
				}
			} else {
				data = rule.reg(value);
				if (!data) {
					debugerror('wrong header: "%s"', line);
					return false;
				}
			}
			data.value = value;

			// Special treatment for NS headers.
			if (name === 'NS') {
				if (data.prefix) {
					ns[data.prefix] = data.uri.toLowerCase();
				} else {
					currentDefaultNSUri = data.uri.toLowerCase();
				}

				message.addNS(data.uri.toLowerCase());
			}

			(message._cpimHeaders[name] = message._cpimHeaders[name] || []).push(data);
			return true;
		}
	}

	function parseMimeHeaders(rawMimeHeaders) {
		var
			lines = rawMimeHeaders.split('\r\n'),
			i, len;

		for (i = 0, len = lines.length; i < len; i++) {
			if (!parseMimeHeader(lines[i])) {
				debugerror('discarding message due to invalid MIME header: "%s"', lines[i]);
				return false;
			}
		}

		return true;


		function parseMimeHeader(line) {
			var
				match = line.match(REGEXP_VALID_MIME_HEADER),
				name,
				value,
				rule,
				parsedValue,
				i, len,
				data = {};

			if (!match) {
				debugerror('invalid MIME header "%s"', line);
				return false;
			}

			name = grammar.headerize(match[1]);
			value = match[2];

			rule = grammar.mimeHeaderRules[name] || grammar.unknownMimeHeaderRule;

			if (typeof rule.reg !== 'function') {
				parsedValue = value.match(rule.reg);
				if (!parsedValue) {
					debugerror('wrong MIME header: "%s"', line);
					return false;
				}

				for (i = 0, len = rule.names.length; i < len; i++) {
					if (parsedValue[i + 1] !== undefined) {
						data[rule.names[i]] = parsedValue[i + 1];
					}
				}
			} else {
				data = rule.reg(value);
				if (!data) {
					debugerror('wrong MIME header: "%s"', line);
					return false;
				}
			}
			data.value = value;

			message._mimeHeaders[name] = data;
			return true;
		}
	}
}

},{"./Message":1,"./grammar":4,"debug":7}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],7:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":8}],8:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":9}],9:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}]},{},[3])(3)
});