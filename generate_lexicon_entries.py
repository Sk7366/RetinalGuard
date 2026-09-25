import json
import re

with open('missing_strings.json') as f:
    items = json.load(f)

print(f"Translating {len(items)} missing items...")

# We will generate entries for each item
# Let's inspect some of the items and ensure full coverage
