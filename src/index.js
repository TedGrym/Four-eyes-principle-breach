const _ = require('lodash');

// Small demo module so bot PRs (Dependabot bumps, automated refactors,
// test PRs from the bot) have real code to touch.
function summarize(numbers) {
  return {
    min: _.min(numbers),
    max: _.max(numbers),
    sum: _.sum(numbers),
    mean: _.mean(numbers),
  };
}

module.exports = { summarize };

if (require.main === module) {
  console.log(summarize([1, 2, 3, 4, 5]));
}
