### define
lodash : _
###

class KeyConverter

  constructor : ->

    @initializeKeyMap()
    @scaleIntervals = [ 0, 2, 2, 1, 2, 2, 2 ]


  getNumberForKeyString : (keyString) ->

    _.findKey(@keyMap, (key) -> key == keyString)


  getScaleForBase : (baseKey) ->

    if _.isString(baseKey)
      baseKey = @getNumberForKeyString(baseKey)

    _.times(12, (index) =>
      baseKey + @scaleIntervals[index]
    )
    .map(@getKeyStringForNumber, @)


  getKeyStringForNumber : (number) ->

    @keyMap[number]


  initializeKeyMap : ->

    # builds a keyMap which looks like this
    # {
    #   21 : "a0"
    #   22 : "a#0"
    #   ...
    #   108 : "c8"
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
