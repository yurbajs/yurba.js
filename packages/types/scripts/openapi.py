#!/usr/bin/env python3
"""Compare OpenAPI schemas with the public API types and fill missing pieces."""

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_OPENAPI = SCRIPT_DIR / "openapi.json"
DEFAULT_TYPES = SCRIPT_DIR.parent / "src" / "api" / "index.ts"

SECTION_BY_NAMESPACE = {
	"accounts": "// ------- Account Types ------",
	"avatars": "// -------- PHOTO TYPES --------",
	"articles": "// -------- POST TYPES --------",
	"comments": "// -------- COMMENTS TYPES -------",
	"dialogs": "// -------- DIALOG TYPES --------",
	"files": "// -------- Files types --------",
	"photos": "// -------- PHOTO TYPES --------",
	"posts": "// -------- POST TYPES --------",
	"search": "// -------- Search types --------",
	"tracks": "// -------- Music types --------",
	"video": "// -------- Videos types --------",
}
SYSTEM_SECTION = "// SYSTEM ENUMS & UTILITIES"


def pascal_case(value):
	parts = re.findall(r"[A-Za-z0-9]+", value)
	return "".join(part[:1].upper() + part[1:] for part in parts) or "OpenApiType"


def schema_namespace(schema_name):
	if "." not in schema_name:
		return "general", schema_name
	return schema_name.split(".", 1)


def interface_field_names(body):
	pattern = re.compile(r"(?m)^\s*(?:readonly\s+)?(?:\"([^\"]+)\"|'([^']+)'|([A-Za-z_$][\w$]*))\s*\??\s*:")
	return {next(part for part in match.groups() if part) for match in pattern.finditer(body)}


def make_type_names(schemas, declared_names, interfaces):
	bases = {schema_name: schema_name.rsplit(".", 1)[-1] for schema_name in schemas}
	counts = Counter(bases.values())
	candidates_by_type = defaultdict(list)
	for schema_name, base in bases.items():
		candidates = [base]
		if base.endswith("Model"):
			candidates.append(base[:-5])
		for candidate in candidates:
			if candidate in interfaces:
				expected_fields = set(schemas[schema_name].get("properties", {}))
				actual_fields = interface_field_names(interfaces[candidate][2])
				overlap = len(expected_fields & actual_fields)
				if overlap:
					candidates_by_type[candidate].append((overlap, schema_name))

	matched = {}
	for type_name, candidates in candidates_by_type.items():
		candidates.sort(reverse=True)
		if len(candidates) == 1 or candidates[0][0] > candidates[1][0]:
			matched[candidates[0][1]] = type_name

	result = dict(matched)
	for schema_name in schemas:
		if schema_name in result:
			continue
		namespace, base = schema_namespace(schema_name)
		if counts[base] == 1 and base not in declared_names:
			result[schema_name] = pascal_case(base)
		else:
			result[schema_name] = pascal_case(namespace) + pascal_case(base)
	return result


def quoted_property(name):
	if re.fullmatch(r"[A-Za-z_$][A-Za-z0-9_$]*", name):
		return name
	return json.dumps(name, ensure_ascii=False)


def type_from_schema(schema, type_names):
	if not isinstance(schema, dict):
		return "unknown"

	if "$ref" in schema:
		ref_name = schema["$ref"].rsplit("/", 1)[-1]
		value = type_names.get(ref_name, pascal_case(ref_name.rsplit(".", 1)[-1]))
	elif "enum" in schema:
		values = [json.dumps(item, ensure_ascii=False) if isinstance(item, str) else str(item).lower() if isinstance(item, bool) else str(item) for item in schema["enum"]]
		value = " | ".join(values) or "never"
	elif "oneOf" in schema or "anyOf" in schema:
		variants = schema.get("oneOf", schema.get("anyOf", []))
		value = " | ".join(type_from_schema(item, type_names) for item in variants) or "unknown"
	elif "allOf" in schema:
		variants = [type_from_schema(item, type_names) for item in schema["allOf"]]
		value = " & ".join(variants) or "unknown"
	else:
		raw_type = schema.get("type", "unknown")
		if isinstance(raw_type, list):
			non_null_types = [item for item in raw_type if item != "null"]
			value = " | ".join(type_from_schema({"type": item}, type_names) for item in non_null_types) or "unknown"
			if "null" in raw_type:
				value += " | null"
			return value
		value = {
			"integer": "number",
			"number": "number",
			"string": "string",
			"boolean": "boolean",
			"array": "unknown[]",
			"object": "Record<string, unknown>",
		}.get(raw_type, "unknown")
		if raw_type == "array":
			value = type_from_schema(schema.get("items", {}), type_names) + "[]"
		elif raw_type == "object" and isinstance(schema.get("additionalProperties"), dict):
			value = "Record<string, " + type_from_schema(schema["additionalProperties"], type_names) + ">"

	if schema.get("nullable") and "null" not in value.split(" | "):
		value += " | null"
	return value


def find_matching_brace(text, open_index):
	depth = 0
	quote = None
	line_comment = False
	block_comment = False
	escaped = False
	index = open_index

	while index < len(text):
		char = text[index]
		next_char = text[index + 1] if index + 1 < len(text) else ""
		if line_comment:
			if char == "\n":
				line_comment = False
		elif block_comment:
			if char == "*" and next_char == "/":
				block_comment = False
				index += 1
		elif quote:
			if escaped:
				escaped = False
			elif char == "\\":
				escaped = True
			elif char == quote:
				quote = None
		elif char == "/" and next_char == "/":
			line_comment = True
			index += 1
		elif char == "/" and next_char == "*":
			block_comment = True
			index += 1
		elif char in ("'", '"', "`"):
			quote = char
		elif char == "{":
			depth += 1
		elif char == "}":
			depth -= 1
			if depth == 0:
				return index
		index += 1
	return None


def parse_interfaces(text):
	interfaces = {}
	pattern = re.compile(r"\bexport\s+interface\s+([A-Za-z_$][\w$]*)[^\{]*\{")
	for match in pattern.finditer(text):
		open_index = text.find("{", match.start(), match.end())
		close_index = find_matching_brace(text, open_index)
		if close_index is not None:
			interfaces[match.group(1)] = (open_index, close_index, text[open_index + 1:close_index])
	return interfaces


def find_exported_names(text):
	return set(re.findall(r"\bexport\s+(?:declare\s+)?(?:interface|type|enum|class)\s+([A-Za-z_$][\w$]*)", text))


def generate_interface(type_name, schema, type_names):
	properties = schema.get("properties", {})
	required = set(schema.get("required", []))
	lines = ["export interface " + type_name + " {"]
	for prop_name, prop_schema in properties.items():
		optional = "" if prop_name in required else "?"
		lines.append("  " + quoted_property(prop_name) + optional + ": " + type_from_schema(prop_schema, type_names) + ";")
	lines.append("}")
	return "\n".join(lines)


def section_anchor(namespace):
	return SECTION_BY_NAMESPACE.get(namespace, SYSTEM_SECTION)


def calculate_updates(openapi, source):
	schemas = openapi.get("components", {}).get("schemas", {})
	declared_names = find_exported_names(source)
	interfaces = parse_interfaces(source)
	type_names = make_type_names(schemas, declared_names, interfaces)
	additions = defaultdict(list)
	field_additions = {}
	missing_models = []

	for schema_name, schema in schemas.items():
		type_name = type_names[schema_name]
		if type_name not in declared_names:
			additions[section_anchor(schema_namespace(schema_name)[0])].append((schema_namespace(schema_name)[0], generate_interface(type_name, schema, type_names)))
			missing_models.append(schema_name)
			continue

		if type_name not in interfaces:
			continue
		_, _, body = interfaces[type_name]
		existing_fields = interface_field_names(body)
		required = set(schema.get("required", []))
		absent = []
		for prop_name, prop_schema in schema.get("properties", {}).items():
			if prop_name not in existing_fields:
				optional = "" if prop_name in required else "?"
				absent.append("  " + quoted_property(prop_name) + optional + ": " + type_from_schema(prop_schema, type_names) + ";")
		if absent:
			field_additions[type_name] = absent

	return additions, field_additions, missing_models


def apply_updates(source, additions, field_additions):
	edits = []
	interfaces = parse_interfaces(source)
	for type_name, fields in field_additions.items():
		_, close_index, _ = interfaces[type_name]
		before_close = source[:close_index].rstrip()
		separator = "\n" if before_close.endswith(";") or before_close.endswith("}") else "\n"
		edits.append((close_index, close_index, separator + "\n".join(fields) + "\n"))

	anchors = {match.group(0): match.start() for match in re.finditer(r"(?m)^//[^\n]*$", source)}
	for anchor, grouped in additions.items():
		if anchor == SYSTEM_SECTION:
			anchor_text = next((line for line in source.splitlines() if line.strip() == SYSTEM_SECTION), None)
			if anchor_text is None:
				raise ValueError("Could not find the system types section in the API file")
			anchor_position = source.index(anchor_text)
			insertion = []
			insertion.append("// -------- OPENAPI MODELS --------")
		else:
			if anchor not in anchors:
				anchor = SYSTEM_SECTION
				anchor_text = next((line for line in source.splitlines() if line.strip() == SYSTEM_SECTION), None)
				if anchor_text is None:
					raise ValueError("Could not find the system types section in the API file")
				anchor_position = source.index(anchor_text)
				insertion = ["// -------- OPENAPI MODELS --------"]
			else:
				anchor_position = anchors[anchor]
				anchor_line_end = source.find("\n", anchor_position)
				anchor_position = len(source) if anchor_line_end < 0 else anchor_line_end + 1
				insertion = []

		by_namespace = defaultdict(list)
		for namespace, declaration in grouped:
			by_namespace[namespace].append(declaration)
		for namespace in sorted(by_namespace):
			insertion.append("// OpenAPI: " + namespace)
			insertion.extend(sorted(by_namespace[namespace]))
		block = "\n".join(insertion) + "\n\n"
		edits.append((anchor_position, anchor_position, block))

	updated = source
	for start, end, replacement in sorted(edits, key=lambda edit: (edit[0], edit[1]), reverse=True):
		updated = updated[:start] + replacement + updated[end:]
	return updated


def main():
	parser = argparse.ArgumentParser(description=__doc__)
	parser.add_argument("--openapi", type=Path, default=DEFAULT_OPENAPI, help="OpenAPI JSON file")
	parser.add_argument("--target", type=Path, default=DEFAULT_TYPES, help="TypeScript API file")
	parser.add_argument("--write", action="store_true", help="explicitly write additions (this is the default)")
	parser.add_argument("--check", action="store_true", help="report differences without writing; exit 1 when any are found")
	args = parser.parse_args()

	openapi = json.loads(args.openapi.read_text(encoding="utf-8"))
	source = args.target.read_text(encoding="utf-8")
	additions, field_additions, missing_models = calculate_updates(openapi, source)
	updated = apply_updates(source, additions, field_additions)
	field_count = sum(len(fields) for fields in field_additions.values())

	if not missing_models and not field_count:
		print("API types are up to date.")
		return 0

	print("Missing OpenAPI schemas:")
	for schema_name in missing_models:
		print("  - " + schema_name)
	print("Missing properties:")
	for type_name, fields in sorted(field_additions.items()):
		names = []
		for field in fields:
			match = re.match(r"\s*(?:\"([^\"]+)\"|'([^']+)'|([^:?]+))\s*\??\s*:", field)
			names.append(next(part for part in match.groups() if part).strip())
		print("  - " + type_name + ": " + ", ".join(names))
	print("Summary: {} schemas and {} properties to add.".format(len(missing_models), field_count))

	if args.check:
		print("No files changed. Run without --check to apply these additions.")
		return 1
	else:
		args.target.write_text(updated, encoding="utf-8")
		print("Updated " + str(args.target))
	return 0


if __name__ == "__main__":
	sys.exit(main())
