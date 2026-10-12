
from pathlib import Path
import re

API_DIR = Path(__file__).resolve().parent.parent / "src" / "api"

for file in API_DIR.rglob("*.ts"):
    text = file.read_text(encoding="utf-8")

    pattern = re.compile(
        r"(?m)^(export\s+interface\s+\w+Model\s*\{)"
    )

    def add_category(match):
        start = match.start()
        before = text[:start].rstrip()

        # Не дублюємо наявну категорію
        if re.search(r"@category\s+Models\b", before.split("\n")[-5:][0] if False else before[-300:]):
            return match.group(1)

        # Якщо перед інтерфейсом уже є JSDoc — додаємо тег до нього
        comment = re.search(r"/\*\*(?![\s\S]*?/\*\*)[\s\S]*?\*/\s*$", before)

        if comment:
            docs = comment.group(0)
            if "@category" not in docs:
                updated_docs = docs[:-2].rstrip() + "\n * @category Models\n */"
                return updated_docs + "\n" + match.group(1)
            return match.group(1)

        return "/**\n * @category Models\n */\n" + match.group(1)

    updated = pattern.sub(add_category, text)

    if updated != text:
        file.write_text(updated, encoding="utf-8")
        print(f"Updated: {file}")
    else:
        print(f"No changes: {file}")
