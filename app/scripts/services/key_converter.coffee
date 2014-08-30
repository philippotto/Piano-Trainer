### define
lodash : _
###

class KeyConverter

  constructor : ->

    @initializeKeyMap()
    @scaleIntervals = [ 0, 2, 2, 1, 2, 2, 2 ]


  getNumberForCanonicalKeyString : (keyString) ->

    parseInt(_.findKey(@keyMap, (key) -> key == keyString), 10)


  getNumberForKeyString : (keyString) ->

    keyString = @getCanonicalForm(keyString)
    @getNumberForCanonicalKeyString(keyString)


  getScaleForBase : (baseKey) ->

    # TODO: this returns canonical key strings
    # For example, the last key of the f sharp major scale is e#
    # The function will return a f (which is harmonically seen the same)

    if _.isString(baseKey)
      baseKey = @getNumberForKeyString(baseKey)

    baseKey = parseInt(baseKey, 10)

    lastNote = baseKey

    _.times(7, (index) =>
      lastNote = lastNote + @scaleIntervals[index]
      lastNote
    )
    .map(@getKeyStringForNumber, @)


  getCanonicalForm : (key) ->

    stripKey = (keyToStrip, modifier) ->

      regexp = new RegExp(modifier, "g")
      # ignore the first character because of b notes
      strippedKey = key[0] + key.slice(1).replace(regexp, "")
      difference = keyToStrip.length - strippedKey.length

      [strippedKey, difference]

    [key, sharpDifference] = stripKey(key, "#")
    [key, flatDifference] = stripKey(key, "b")

    key = @getNumberForCanonicalKeyString(key)
    key = key + sharpDifference - flatDifference

    @getKeyStringForNumber(key)



  getKeyStringForNumber : (number) ->

    @keyMap[number + ""]


  initializeKeyMap : ->

    # builds a keyMap which looks like this
    # {
    #   21 : "a/0"
    #   22 : "a#/0"
    #   ...
    #   108 : "c/8"
    # }


    baseScale = [
      "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"
    ]

    claviature = baseScale
      .slice(-3)
      .concat(_.flatten(_.times(7, -> baseScale)))
      .concat([baseScale[0]])


    keyMap = {}

    for key, index in claviature
      offsettedIndex = index - 3
      nr = Math.floor((offsettedIndex + 12) / 12)

      keyMap[index + 21] = key + "/" + nr

    @keyMap = keyMap
