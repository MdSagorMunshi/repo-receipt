import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: ["next-env.d.ts", ".next/**", "out/**", "build/**", "coverage/**"],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "react/display-name": "off",
    },
  },
];

export default config;
