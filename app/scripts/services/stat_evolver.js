// Runs evolutions on statistic objects, so that we can update the schema

const evolutions = [
  statObj => {
    if (!statObj.version) {
      statObj.version = 1;
      delete statObj.formattedDate;
    }
    return statObj;
  },
  statObj => {
    if (statObj.version < 2) {
      statObj.version = 2;
      statObj.keySignature = "C";
    }
    return statObj;
  }
];

export default {
  runEvolution: (statObj, index) => evolutions[index](statObj),
  evolveToLatestSchema: statObj => _.flow(...evolutions)(statObj)
};
