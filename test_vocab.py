import json

# Let's inspect the most frequent words in missing_strings.json
import re
with open('missing_strings.json') as f:
    items = json.load(f)

word_counts = {}
for item in items:
    for w in re.findall(r'[A-Za-z]+', item):
        wl = w.lower()
        word_counts[wl] = word_counts.get(wl, 0) + 1

sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
print(f"Top 50 words out of {len(sorted_words)} total:")
for w, c in sorted_words[:50]:
    print(f"  '{w}': {c}")
