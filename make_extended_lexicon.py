import json

with open('rich_lexicon_entries.json', 'r', encoding='utf-8') as f:
    entries = json.load(f)

print(f"Loaded {len(entries)} entries from rich_lexicon_entries.json")

# Write out src/i18n/extendedLexicon.ts
with open('src/i18n/extendedLexicon.ts', 'w', encoding='utf-8') as f:
    f.write('import { LanguageCode } from "./translations";\n\n')
    f.write('export const EXTENDED_LEXICON: Record<string, Record<Exclude<LanguageCode, "en">, string>> = ')
    json.dump(entries, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print("Wrote src/i18n/extendedLexicon.ts successfully.")
