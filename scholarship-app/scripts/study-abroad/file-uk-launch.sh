#!/usr/bin/env bash
# Files the UK launch proposals to the Command Center Inbox, in the order they must be approved.
# Run from scholarship-app/ on the machine that has the production database settings.
#
#   scripts/study-abroad/file-uk-launch.sh <step> [--target=production|staging] [--dry-run]
#
# Start with --dry-run on every step: it reads the Inbox and the live pages and prints, per page, whether it would be
# filed, "page already exists", "already live" or "already waiting", without writing anything.
#
#   step 1  2 guides, 12 universities, 3 new facts and the fact updates
#   step 2  35 course pages (file only after the step 1 universities are approved: a course needs its university to exist)
#   step 3  corrections to the pages (surcharge, HC 584 living money, scholarship and tuition fixes)
#           file only after the step 1 and 2 pages are approved: a correction needs its page to exist
#   step 4  publish the 49 pages (file after step 3 is approved AND the "UK pre-launch fixes" PR is merged and deployed)
#
# Approve each step in /admin/agents before filing the next. The two HC 584 fact updates in step 1 carry the new
# monthly amounts: approve those on or after 30 November 2026. A step that finds a page already filed or approved
# just reports it, so re-running a step is safe.
set -u
STEP="${1:-}"; shift || true
TARGET=production; DRY=""
for a in "$@"; do case "$a" in --target=*) TARGET="${a#--target=}";; --dry-run) DRY="--dry-run";; esac; done
P=scripts/study-abroad/proposals
case "$STEP" in
  1) FILES="$P/uk-guides-2026-11-03.json
$(ls $P/uk-university-*.json | grep -v -E 'pilot|deadline-fix')
$P/uk-facts-provenance-2026-11-02.json
$P/uk-funds-calculator-facts-2026-11-21.json" ;;
  2) FILES="$(ls $P/uk-course-*-mba-2026-11-03.json $P/uk-course-*-cs-2026-11-04.json $P/uk-course-*-ds-2026-11-04.json)" ;;
  3) FILES="$P/uk-university-warwick-mba-deadline-fix-2026-11-03.json
$P/uk-guides-surcharge-fix-2026-11-03.json
$P/uk-surcharge-correction-2026-11-04.json
$(ls $P/uk-course-*-visa-cost-fix-2026-11-05.json)
$P/uk-course-university-of-glasgow-mba-world-changers-fix-2026-11-21.json
$P/uk-course-university-of-manchester-ds-tuition-fix-2026-11-21.json
$P/uk-course-university-of-nottingham-mba-experience-fix-2026-11-21.json
$P/uk-hc584-living-money-align-2026-11-21.json" ;;
  4) FILES="$P/uk-publish-2026-11-28.json" ;;
  *) echo "usage: $0 <1|2|3|4> [--target=production|staging] [--dry-run]"; exit 2 ;;
esac
for f in $FILES; do
  echo "=================== $f"
  if ! node scripts/study-abroad/check-proposals.mjs "$f" > /tmp/uk-preflight.txt 2>&1; then cat /tmp/uk-preflight.txt; echo "pre-flight failed, skipping $f"; continue; fi
  node scripts/study-abroad/propose-changes.mjs "$f" --target="$TARGET" $DRY
done
