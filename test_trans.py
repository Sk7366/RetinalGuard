import json

# Let's inspect unique words in missing_strings.json
with open('missing_strings.json') as f:
    missing = json.load(f)

print(f"Loaded {len(missing)} items")
