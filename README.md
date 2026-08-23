# e-Dnevnik Plus za nastavnike

A browser extension for teachers, enhancing their grading process with additional functionalities to better assess students’ performance and save time.

Runs on `e-dnevnik.skole.hr` (teacher site), not student `ocjene.skole.hr`. MV3, vanilla JS, no build.

Chrome: https://chrome.google.com/webstore/detail/e-dnevnik-plus-za-nastavn/jefappmpehdgllijkjpekdmkbmbigbnl

Firefox: https://addons.mozilla.org/en-US/firefox/addon/e-dnevnik-plus-za-nastavnike/

## What it does

- Class list (`/grade_book/student_list/*`): a **Plus** button scrapes each student and paints per-student averages plus class distribution.
- Single student page: injects the numeric grade average into the existing table.

## Load unpacked

`chrome://extensions` → Developer mode → Load unpacked → this folder (`manifest.json` at the repo root).
