(function() {
  define(["lodash"], function(_) {
    var KeyConverter;
    return KeyConverter = (function() {
      function KeyConverter() {
        this.initializeKeyMap();
        this.scaleIntervals = [0, 2, 2, 1, 2, 2, 2];
      }

      KeyConverter.prototype.getNumberForCanonicalKeyString = function(keyString) {
        return parseInt(_.findKey(this.keyMap, function(key) {
          return key === keyString;
        }), 10);
      };

      KeyConverter.prototype.getNumberForKeyString = function(keyString) {
        keyString = this.getCanonicalForm(keyString);
        return this.getNumberForCanonicalKeyString(keyString);
      };

      KeyConverter.prototype.getScaleForBase = function(baseKey) {
        var lastNote;
        if (_.isString(baseKey)) {
          baseKey = this.getNumberForKeyString(baseKey);
        }
        baseKey = parseInt(baseKey, 10);
        lastNote = baseKey;
        return _.times(7, (function(_this) {
          return function(index) {
            lastNote = lastNote + _this.scaleIntervals[index];
            return lastNote;
          };
        })(this)).map(this.getKeyStringForNumber, this);
      };

      KeyConverter.prototype.getCanonicalForm = function(key) {
        var flatDifference, sharpDifference, stripKey, _ref, _ref1;
        stripKey = function(keyToStrip, modifier) {
          var difference, regexp, strippedKey;
          regexp = new RegExp(modifier, "g");
          strippedKey = keyToStrip[0] + keyToStrip.slice(1).replace(regexp, "");
          difference = keyToStrip.length - strippedKey.length;
          return [strippedKey, difference];
        };
        _ref = stripKey(key, "#"), key = _ref[0], sharpDifference = _ref[1];
        _ref1 = stripKey(key, "b"), key = _ref1[0], flatDifference = _ref1[1];
        key = this.getNumberForCanonicalKeyString(key);
        key = key + sharpDifference - flatDifference;
        return this.getKeyStringForNumber(key);
      };

      KeyConverter.prototype.getKeyStringForNumber = function(number) {
        return this.keyMap[number + ""];
      };

      KeyConverter.prototype.initializeKeyMap = function() {
        var baseScale, claviature, index, key, keyMap, nr, offsettedIndex, _i, _len;
        baseScale = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
        claviature = baseScale.slice(-3).concat(_.flatten(_.times(7, function() {
          return baseScale;
        }))).concat([baseScale[0]]);
        keyMap = {};
        for (index = _i = 0, _len = claviature.length; _i < _len; index = ++_i) {
          key = claviature[index];
          offsettedIndex = index - 3;
          nr = Math.floor((offsettedIndex + 12) / 12);
          keyMap[index + 21] = key + "/" + nr;
        }
        return this.keyMap = keyMap;
      };

      return KeyConverter;

    })();
  });

}).call(this);
