import KeyConverter from "../services/key_converter.js";
import _ from "lodash";

describe("KeyConverter", function () {

  const keyConverter = new KeyConverter();

  it("resolves a simple note", function () {

    const numberA0 = keyConverter.getNumberForKeyString("a/0");
    expect(numberA0).toBe(21);

    const numberC8 = keyConverter.getNumberForKeyString("c/8");
    return expect(numberC8).toBe(108);
  });

  it("gets key strings for a number", function () {

    const aSharp0 = keyConverter.getKeyStringForNumber("22");
    expect(aSharp0).toBe("a#/0");

    const b7 = keyConverter.getKeyStringForNumber("107");
    return expect(b7).toBe("b/7");
  });

  it("gets scales for an arbitrary base", function () {

    const cScale = keyConverter.getScaleForBase("c/4");
    expect(cScale).toEqual(["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4"]);

    const fSharpScale = keyConverter.getScaleForBase("f#/4");

    const expectedFSharpScale = ["f#/4", "g#/4", "a#/4", "b/4", "c#/5", "d#/5", "e#/5"];
    const normalizedFSharpScale = expectedFSharpScale.map(keyConverter.getCanonicalForm, keyConverter);

    return expect(fSharpScale).toEqual(normalizedFSharpScale);
  });

  return it("gets the canonical form of a key", function () {

    const c4 = keyConverter.getCanonicalForm("c/4");
    expect(c4).toBe("c/4");

    const cSharpSharp = keyConverter.getCanonicalForm("c##/4");
    expect(cSharpSharp).toBe("d/4");

    const cFlat = keyConverter.getCanonicalForm("cb/4");
    return expect(cFlat).toBe("b/3");
  });

});
