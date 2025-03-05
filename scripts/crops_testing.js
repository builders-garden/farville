"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var getBoostTime = function (perkSlug) {
    return constants_1.SPEED_BOOST[perkSlug].duration * (1 - 1 / constants_1.SPEED_BOOST[perkSlug].boost);
};
function maxPerksApplicationsByCrop(initialGrowthTime, bonusTime) {
    // Start with the first application at time 0.
    // Let k be the number of applications.
    var k = 1;
    // Loop until the next application time is no longer valid.
    while (true) {
        // The time for the k-th application (first is at time 0)
        var applicationTime = (k - bonusTime) * 2;
        // The watermelon will be ready at time: initialGrowthTime - k (since each application reduces the growth time by 1 hour)
        var adjustedGrowthTime = initialGrowthTime - k;
        // Check if applying at applicationTime is still before the watermelon has matured.
        if (applicationTime >= adjustedGrowthTime) {
            break;
        }
        k++;
    }
    // Return the maximum valid number of applications.
    return k - 1;
}
// const calculateQuestXP = (
//   level: number,
//   cropData: CropData,
//   amount: number
// ): number => {
//   const xpBonus: Record<"5" | "10" | "15" | "20", number> = {
//     "5": 5,
//     "10": 10,
//     "15": 20,
//     "20": 30,
//   };
//   const userCellsWidth =
//     EXPANSION_COSTS.filter((cost) => cost.level <= level).pop()?.nextSize
//       .width ?? 2;
//   const userCellsBasedOnLevel = userCellsWidth * userCellsWidth;
//   const T =
//     (cropData.growthTime / millisecondsInHour) *
//     Math.ceil(amount / userCellsBasedOnLevel);
//   const bonusLevel = Object.keys(xpBonus)
//     .filter((key) => Number(key) <= level)
//     .pop();
//   const bonusApplied = bonusLevel
//     ? xpBonus[bonusLevel as keyof typeof xpBonus]
//     : 0;
//   const xpAmount =
//     Math.ceil(
//       (amount / cropData.power) *
//         cropData.rewardXP *
//         (1 + T / (CROP_DATA["pumpkin"].growthTime / millisecondsInHour))
//     ) + bonusApplied;
//   // return here the xpAmount rounded to the nearest integer value which is to be a multiple of 10 (if xpAmount < 1000) or 100 (if xpAmount >= 1000)
//   if (xpAmount < 1000) {
//     return Math.round(xpAmount / 10) * 10;
//   } else {
//     return Math.round(xpAmount / 100) * 100;
//   }
// };
var calculateValidAmount = function (crop, level, requiredHours) {
    var _a, _b;
    var questTimeInHours = requiredHours;
    var userAvailableCells = Math.pow(((_b = (_a = constants_1.EXPANSION_COSTS.filter(function (cost) { return cost.level <= level; }).pop()) === null || _a === void 0 ? void 0 : _a.nextSize.width) !== null && _b !== void 0 ? _b : 2), 2);
    var bonusTime = 0;
    // TODO: see if we can refactor this to be more clear without using static ids
    if ([17, 5, 18].includes(crop.id)) {
        bonusTime = getBoostTime(constants_1.PerkType.Nitrogen);
    }
    else if ([19, 8, 20, 21, 7].includes(crop.id)) {
        bonusTime = getBoostTime(constants_1.PerkType.Potassium);
    }
    else if ([22, 6, 23].includes(crop.id)) {
        bonusTime = getBoostTime(constants_1.PerkType.Phosphorus);
    }
    bonusTime = bonusTime / constants_1.millisecondsInHour;
    var cropGrowthTime = crop.growthTime / constants_1.millisecondsInHour;
    var maxPerksApplications = maxPerksApplicationsByCrop(cropGrowthTime, bonusTime);
    var acceleratedGrowthTime = cropGrowthTime - maxPerksApplications * bonusTime;
    var cyclesPerCell = Math.floor(questTimeInHours / acceleratedGrowthTime);
    var maxAmount = cyclesPerCell * userAvailableCells;
    return maxAmount;
};
var main = function () {
    var level = 20;
    var requiredDays = [15, 45, 150, 540]; // used 10, 30, 100, 360 but multiplied by 1.5 to take care of the harvest possibility to get more then 1 crop per cell
    console.log("User at level: ".concat(level, "\n"));
    Object.values(constants_1.CropType).forEach(function (cropSlug) {
        var _a;
        var cropData = constants_1.CROP_DATA[cropSlug];
        var achievementThresholds = constants_1.ACHIEVEMENTS_THRESHOLDS.find(function (threshold) { return threshold.crop === cropSlug; });
        console.log("\nAchievement thresholds for ".concat(cropSlug, ":"));
        var i = 0;
        for (var _i = 0, _b = (_a = achievementThresholds === null || achievementThresholds === void 0 ? void 0 : achievementThresholds.titles) !== null && _a !== void 0 ? _a : []; _i < _b.length; _i++) {
            var threshold = _b[_i];
            var validAmount = calculateValidAmount(cropData, level, requiredDays[i] * 24);
            console.log("\t".concat(threshold, ":\t").concat(validAmount, "\t").concat(requiredDays[i], " days"));
            i++;
        }
        // const validAmount = calculateValidAmount(cropData, level, requiredHours);
        // const questXP = calculateQuestXP(level, cropData, validAmount);
        // console.log(
        //   `Crop id: ${cropData.id}\tValid amount: ${validAmount}\tXP: ${questXP}\tCrop: ${cropSlug}\t`
        // );
    });
};
main();
