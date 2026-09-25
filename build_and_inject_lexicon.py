import json
import re

with open('missing_strings.json') as f:
    items = json.load(f)

# Translation mappings for components
# Let's write out dictionaries and translators for:
# 1. Medical & Retinal concepts
# 2. General UI and Buttons
# 3. Research & SaMD metrics
# 4. Status chips and badges
# 5. Full sentences and descriptions

# Let's inspect all items to make sure our mappings cover all categories
print(f"Loaded {len(items)} items to process.")
