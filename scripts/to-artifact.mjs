// Turns Vite's single-file build into the body-only page the Artifact tool publishes
// (the publisher adds its own <!doctype>/<head> skeleton).
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
const styles = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0]).join("\n");
const scripts = [...html.matchAll(/<script[^>]*>[\s\S]*?<\/script>/g)].map((m) => m[0]).join("\n");
const out = `<title>My Planner</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@700&display=swap">
${styles}
<div id="root"></div>
${scripts}
`;
writeFileSync("dist/my-planner.html", out);
console.log(`dist/my-planner.html  ${(out.length / 1024).toFixed(1)} kB`);
