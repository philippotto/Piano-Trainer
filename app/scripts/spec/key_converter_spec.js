import KeyConverter from "../services/key_converter.js";

describe("KeyConverter", function () {

  it("resolves a simple note", function () {

    const numberA0 = KeyConverter.getNumberForKeyString("a/0", "C");
    expect(numberA0).toBe(21);

    const numberC8 = KeyConverter.getNumberForKeyString("c/8", "C");
    expect(numberC8).toBe(108);

    const numberG7 = KeyConverter.getNumberForKeyString("g/7", "G");
    expect(numberG7).toBe(103);

    const numberF7Sharp = KeyConverter.getNumberForKeyString("f/7", "G");
    expect(numberF7Sharp).toBe(102);
  });

  it("gets key strings for a number", function () {

    const aSharp0 = KeyConverter.getKeyStringForNumber("22");
    expect(aSharp0).toBe("a#/0");

    const b7 = KeyConverter.getKeyStringForNumber("107");
    expect(b7).toBe("b/7");
  });

  it("gets scales for an arbitrary base", function () {

    const cScale = KeyConverter.getScaleForBase("c/4")
      .map(KeyConverter.getKeyStringForNumber, this);
    expect(cScale).toEqual(["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4"]);

    const fSharpScale = KeyConverter.getScaleForBase("f#/4")
      .map(KeyConverter.getKeyStringForNumber, this);

    const expectedFSharpScale = ["f#/4", "g#/4", "a#/4", "b/4", "c#/5", "d#/5", "e#/5"];
    const normalizedFSharpScale = expectedFSharpScale.map(KeyConverter.getCanonicalForm, KeyConverter);

    expect(fSharpScale).toEqual(normalizedFSharpScale);
  });

  it("gets the canonical form of a key", function () {

    const c4 = KeyConverter.getCanonicalForm("c/4");
    expect(c4).toBe("c/4");

    const cSharpSharp = KeyConverter.getCanonicalForm("c##/4");
    expect(cSharpSharp).toBe("d/4");

    const cFlat = KeyConverter.getCanonicalForm("cb/4");
    expect(cFlat).toBe("b/3");
  });

});
