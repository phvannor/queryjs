// Generated by CoffeeScript 1.3.3

/*
# 
# Copyright (c) Microsoft Corporation
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#   http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
*/


(function() {
  var ODataFilterQueryVisitor, ODataProvider, Q, Query, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('./Utilities');

  Q = require('./QueryNodes');

  Query = require('./Query').Query;

  exports.ODataProvider = ODataProvider = (function() {

    function ODataProvider() {}

    /*
            # Convert a query into an OData URI.
    */


    ODataProvider.prototype.toQuery = function(query) {
      var odata, s, url;
      odata = this.toOData(query);
      url = "/" + odata.table;
      s = '?';
      if (odata.filters) {
        url += "" + s + "$filter=" + odata.filters;
        s = '&';
      }
      if (odata.ordering) {
        url += "" + s + "$orderby=" + odata.ordering;
        s = '&';
      }
      if (odata.skip) {
        url += "" + s + "$skip=" + odata.skip;
        s = '&';
      }
      if (odata.take) {
        url += "" + s + "$top=" + odata.take;
        s = '&';
      }
      if (odata.selections) {
        url += "" + s + "$select=" + odata.selections;
      }
      return url;
    };

    /*
            # Translate the query components into OData strings
    */


    ODataProvider.prototype.toOData = function(query) {
      var asc, components, name, odata, ordering, _ref, _ref1;
      components = (_ref = query != null ? query.getComponents() : void 0) != null ? _ref : {};
      ordering = (function() {
        var _ref1, _results;
        _ref1 = components != null ? components.ordering : void 0;
        _results = [];
        for (name in _ref1) {
          asc = _ref1[name];
          _results.push(asc ? name : "" + name + " desc");
        }
        return _results;
      })();
      return odata = {
        table: components != null ? components.table : void 0,
        filters: ODataFilterQueryVisitor.convert(components.filters),
        ordering: ordering != null ? ordering.toString() : void 0,
        skip: components != null ? components.skip : void 0,
        take: components != null ? components.take : void 0,
        selections: components != null ? (_ref1 = components.selections) != null ? _ref1.toString() : void 0 : void 0
      };
    };

    /*
            # Convert OData components into a query object
    */


    ODataProvider.prototype.fromOData = function(table, filters, ordering, skip, take, selections) {
      var direction, field, item, query, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      query = new Query(table);
      if (filters) {
        query.where(filters);
      }
      if (skip) {
        query.skip(skip);
      }
      if (take) {
        query.take(take);
      }
      _ref1 = (_ref = selections != null ? selections.split(',') : void 0) != null ? _ref : [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        field = _ref1[_i];
        query.select(field.trim());
      }
      _ref2 = (function() {
        var _k, _len1, _ref2, _ref3, _results;
        _ref3 = (_ref2 = ordering != null ? ordering.split(',') : void 0) != null ? _ref2 : [];
        _results = [];
        for (_k = 0, _len1 = _ref3.length; _k < _len1; _k++) {
          item = _ref3[_k];
          _results.push(item.trim().split(' '));
        }
        return _results;
      })();
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        _ref3 = _ref2[_j], field = _ref3[0], direction = _ref3[1];
        if ((direction != null ? direction.toUpperCase() : void 0) !== 'DESC') {
          query.orderBy(field);
        } else {
          query.orderByDescending(field);
        }
      }
      return query;
    };

    return ODataProvider;

  })();

  /*
  # Visitor that converts query expression trees into OData filter statements.
  */


  ODataFilterQueryVisitor = (function(_super) {

    __extends(ODataFilterQueryVisitor, _super);

    function ODataFilterQueryVisitor() {
      return ODataFilterQueryVisitor.__super__.constructor.apply(this, arguments);
    }

    ODataFilterQueryVisitor.convert = function(filters) {
      var visitor, _ref;
      visitor = new ODataFilterQueryVisitor;
      return (_ref = (filters ? visitor.visit(filters) : void 0)) != null ? _ref : null;
    };

    ODataFilterQueryVisitor.prototype.toOData = function(value) {
      var day, hours, minutes, month, ms, pad, seconds, year;
      if ((_.isNumber(value)) || (_.isBoolean(value))) {
        return value.toString();
      } else if (_.isString(value)) {
        value = value.replace(/'/g, "''");
        return "'" + value + "'";
      } else if (_.isDate(value)) {
        /*
                    # Dates are expected in the format
                    #   "datetime'yyyy-mm-ddThh:mm[:ss[.fffffff]]'"
        */

        pad = function(value, length, ch) {
          var text;
          text = value.toString();
          while (text.length < length) {
            text = ch + text;
          }
          return text;
        };
        year = pad(value.getFullYear(), 4, '0');
        month = pad(value.getMonth() + 1, 2, '0');
        day = pad(value.getDate(), 2, '0');
        hours = pad(value.getHours(), 2, '0');
        minutes = pad(value.getMinutes(), 2, '0');
        seconds = pad(value.getSeconds(), 2, '0');
        ms = pad(value.getMilliseconds(), 3, '0');
        return "datetime'" + year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + "." + ms + "'";
      } else if (!value) {
        return "null";
      } else {
        throw "Unsupported literal value " + value;
      }
    };

    ODataFilterQueryVisitor.prototype.ConstantExpression = function(node) {
      return this.toOData(node.value);
    };

    ODataFilterQueryVisitor.prototype.MemberExpression = function(node) {
      return node.member;
    };

    ODataFilterQueryVisitor.prototype.UnaryExpression = function(node) {
      if (node.operator === Q.UnaryOperators.Not) {
        return "not " + (this.visit(node.operand));
      } else if (node.operator === Q.UnaryOperators.Negate) {
        return "(0 sub " + (this.visit(node.operand)) + ")";
      } else {
        throw "Unsupported operator " + node.operator;
      }
    };

    ODataFilterQueryVisitor.prototype.BinaryExpression = function(node) {
      var mapping, op;
      mapping = {
        And: 'and',
        Or: 'or',
        Add: 'add',
        Subtract: 'sub',
        Multiply: 'mul',
        Divide: 'div',
        Modulo: 'mod',
        GreaterThan: 'gt',
        GreaterThanOrEqual: 'ge',
        LessThan: 'lt',
        LessThanOrEqual: 'le',
        NotEqual: 'ne',
        Equal: 'eq'
      };
      op = mapping[node.operator];
      if (op) {
        return "(" + (this.visit(node.left)) + " " + op + " " + (this.visit(node.right)) + ")";
      } else {
        throw "Unsupported operator " + node.operator;
      }
    };

    ODataFilterQueryVisitor.prototype.InvocationExpression = function(node) {
      var mapping, method;
      mapping = {
        Length: 'length',
        ToUpperCase: 'toupper',
        ToLowerCase: 'tolower',
        Trim: 'trim',
        IndexOf: 'indexof',
        Replace: 'replace',
        Substring: 'substring',
        Concat: 'concat',
        Day: 'day',
        Month: 'month',
        Year: 'year',
        Floor: 'floor',
        Ceiling: 'ceiling',
        Round: 'round'
      };
      method = mapping[node.method];
      if (method) {
        return "" + method + "(" + (this.visit(node.args)) + ")";
      } else {
        throw "Invocation of unsupported method " + node.method;
      }
    };

    ODataFilterQueryVisitor.prototype.LiteralExpression = function(node) {
      var ch, inString, literal, _i, _len, _ref;
      literal = '';
      inString = false;
      _ref = node.queryString;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ch = _ref[_i];
        if (inString) {
          literal += ch;
          inString = ch !== "'";
        } else if (ch === '?') {
          if ((!node.args) || (node.args.length <= 0)) {
            throw "Too few arguments for " + node.queryString + ".";
          }
          literal += this.toOData(node.args.shift());
        } else if (ch === "'") {
          literal += ch;
          inString = true;
        } else {
          literal += ch;
        }
      }
      if (node.args && node.args.length > 0) {
        throw "Too many arguments for " + node.queryString;
      }
      return literal;
    };

    return ODataFilterQueryVisitor;

  })(Q.QueryExpressionVisitor);

}).call(this);