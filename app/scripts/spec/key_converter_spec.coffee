### define
../services/key_converter : KeyConverter
###

describe("KeyConverter", ->
  it("can resolve a simple note", ->
    keyConverter = new KeyConverter()
    console.log("keyConverter",  keyConverter)
    numberA0 = keyConverter.getNumberForKeyString("a/0")

    expect(numberA0).toBe("21")
  )
)
