module.exports = {
  env: {"es6": true},
  parserOptions: {"ecmaVersion": 2017},
  extends: ["google"],
  plugins: ["node"],
  rules: {
      "node/no-unsupported-features": ["error", {"version": 7}],
      "require-jsdoc": ["off"],
      "max-len": ["error", 120]
  }
}
