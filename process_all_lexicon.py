import json
import re

with open('missing_strings.json') as f:
    missing_items = json.load(f)

print(f"Total missing strings to process: {len(missing_items)}")

# We will build translations for all missing strings.
# First, load the existing domTranslator.ts to see what's already there
with open('src/i18n/domTranslator.ts', 'r', encoding='utf-8') as f:
    dom_code = f.read()

# Let's verify existing keys
existing_keys = set(re.findall(r'\"([^\"]+)\":\s*\{', dom_code))
print(f"Existing lexicon keys in domTranslator.ts: {len(existing_keys)}")

