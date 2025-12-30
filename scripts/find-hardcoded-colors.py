#!/usr/bin/env python3
"""
Find Hardcoded Colors
Scans .tsx files for hardcoded Tailwind color patterns that should use colors.ts

Run: python3 scripts/find-hardcoded-colors.py
"""

import os
import re
from collections import defaultdict
from pathlib import Path

# Project root
APP_DIR = Path(__file__).parent.parent / "app"

# Patterns to find (these should use colors.ts instead)
PATTERNS = {
    # Any -50 shade (should be -100 minimum)
    "bg-*-50 (use -100)": r"bg-\w+-50(?:\s|\"|\`|\/)",

    # Any opacity in dark mode backgrounds
    "dark:bg-*-N/opacity": r"dark:bg-\w+-\d+/\d+",

    # Any opacity in dark mode hover backgrounds
    "dark:hover:bg-*-N/opacity": r"dark:hover:bg-\w+-\d+/\d+",

    # Border colors with opacity
    "dark:border-*-N/opacity": r"dark:border-\w+-\d+/\d+",
}

# Files/patterns to ignore
IGNORE_PATTERNS = [
    r"node_modules",
    r"\.next",
    r"dist",
    r"lib/colors\.ts",  # The source file itself
    r"tailwind\.config",  # Safelist is intentional
]

def should_ignore(filepath: str) -> bool:
    """Check if file should be ignored."""
    for pattern in IGNORE_PATTERNS:
        if re.search(pattern, filepath):
            return True
    return False

def find_patterns_in_file(filepath: Path) -> dict:
    """Find all hardcoded color patterns in a file."""
    results = defaultdict(list)

    try:
        content = filepath.read_text()
        lines = content.split('\n')

        for line_num, line in enumerate(lines, 1):
            for pattern_name, regex in PATTERNS.items():
                matches = re.findall(regex, line)
                for match in matches:
                    # Skip focus ring patterns (acceptable)
                    if "focus:ring" in line and "-900/50" in match:
                        continue
                    results[pattern_name].append({
                        "line": line_num,
                        "match": match,
                        "context": line.strip()[:100]
                    })
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

    return results

def main():
    print("=" * 70)
    print("HARDCODED COLOR SCANNER")
    print("=" * 70)
    print()

    all_results = defaultdict(lambda: defaultdict(list))
    total_issues = 0

    # Scan all .tsx files
    for tsx_file in APP_DIR.rglob("*.tsx"):
        if should_ignore(str(tsx_file)):
            continue

        results = find_patterns_in_file(tsx_file)
        if results:
            rel_path = tsx_file.relative_to(APP_DIR.parent)
            for pattern_name, matches in results.items():
                all_results[pattern_name][str(rel_path)] = matches
                total_issues += len(matches)

    # Print results grouped by pattern
    for pattern_name, files in sorted(all_results.items()):
        file_count = len(files)
        match_count = sum(len(matches) for matches in files.values())

        print(f"\n{'=' * 70}")
        print(f"PATTERN: {pattern_name}")
        print(f"Files: {file_count} | Occurrences: {match_count}")
        print("=" * 70)

        for filepath, matches in sorted(files.items()):
            print(f"\n  {filepath}:")
            for m in matches[:5]:  # Show first 5 per file
                print(f"    Line {m['line']}: {m['match']}")
            if len(matches) > 5:
                print(f"    ... and {len(matches) - 5} more")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total issues found: {total_issues}")
    print()

    for pattern_name, files in sorted(all_results.items()):
        match_count = sum(len(matches) for matches in files.values())
        print(f"  {pattern_name}: {match_count} occurrences in {len(files)} files")

    print()
    print("Fix these by importing from @/lib/colors:")
    print("  - softBgColors, verySoftBgColors for backgrounds")
    print("  - hoverBgColors for hover states")
    print("  - infoBannerColors for info boxes")
    print("  - alertColors for alerts/messages")
    print()

if __name__ == "__main__":
    main()
