#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootArgument = process.argv.indexOf("--root");
const repositoryRoot =
  rootArgument >= 0
    ? path.resolve(process.argv[rootArgument + 1] ?? "")
    : path.resolve(scriptDirectory, "../../../..");

const ignoredDirectories = new Set([
  ".venv",
  "data",
  "torob-dataset",
  "__MACOSX",
  ".git",
  ".next",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "test-results",
  "tmp",
]);
const violations = [];

function relative(filePath) {
  return path.relative(repositoryRoot, filePath).replaceAll(path.sep, "/");
}

function report(filePath, reason) {
  violations.push(`${relative(filePath)}: ${reason}`);
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolutePath)));
    if (entry.isFile()) files.push(absolutePath);
  }

  return files;
}

function readFrontmatter(content, skillFile) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    report(skillFile, "missing YAML frontmatter");
    return undefined;
  }

  const fields = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const field = line.match(/^([a-z][a-z0-9_-]*):\s*(.*)$/);
    if (!field) {
      report(skillFile, `unsupported frontmatter line: ${line}`);
      continue;
    }
    if (fields.has(field[1]))
      report(skillFile, `duplicate frontmatter field ${field[1]}`);
    fields.set(
      field[1],
      field[2].trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2"),
    );
  }

  for (const field of fields.keys()) {
    if (field !== "name" && field !== "description")
      report(skillFile, `unsupported frontmatter field ${field}`);
  }

  return fields;
}

async function validateSkill(skillRoot) {
  const skillName = path.basename(skillRoot);
  const skillFile = path.join(skillRoot, "SKILL.md");
  const metadataFile = path.join(skillRoot, "agents", "openai.yaml");
  let content;

  try {
    content = await fs.readFile(skillFile, "utf8");
  } catch {
    report(skillFile, "missing readable SKILL.md");
    return;
  }

  const fields = readFrontmatter(content, skillFile);
  const declaredName = fields?.get("name");
  const description = fields?.get("description");

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skillName) || skillName.length > 64) {
    report(
      skillFile,
      "skill directory must use a lowercase hyphenated name of at most 64 characters",
    );
  }
  if (declaredName !== skillName)
    report(skillFile, `frontmatter name must match directory ${skillName}`);
  if (!description) report(skillFile, "frontmatter description is required");

  let metadata;
  try {
    metadata = await fs.readFile(metadataFile, "utf8");
  } catch {
    report(metadataFile, "missing readable agents/openai.yaml");
    return;
  }

  for (const field of ["display_name", "short_description", "default_prompt"]) {
    if (
      !new RegExp(`^[ \\t]*${field}:[ \\t]*["'].+["'][ \\t]*$`, "m").test(
        metadata,
      )
    ) {
      report(metadataFile, `${field} must be present and quoted`);
    }
  }

  const shortDescription = metadata.match(
    /^[ \t]*short_description:[ \t]*["'](.+)["'][ \t]*$/m,
  )?.[1];
  if (
    shortDescription &&
    (shortDescription.length < 25 || shortDescription.length > 64)
  ) {
    report(metadataFile, "short_description must contain 25 to 64 characters");
  }

  const defaultPrompt = metadata.match(
    /^[ \t]*default_prompt:[ \t]*["'](.+)["'][ \t]*$/m,
  )?.[1];
  if (defaultPrompt && !defaultPrompt.includes(`$${skillName}`)) {
    report(metadataFile, `default_prompt must mention $${skillName}`);
  }
}

async function validateLocalLinks(markdownFiles) {
  let checkedLinkCount = 0;

  for (const markdownFile of markdownFiles) {
    const content = await fs.readFile(markdownFile, "utf8");
    const links = content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g);

    for (const link of links) {
      let target = link[1].trim().replace(/^<|>$/g, "");
      if (/^(?:https?:|mailto:|#)/i.test(target)) continue;

      target = target.split("#", 1)[0];
      if (!target) continue;

      checkedLinkCount += 1;
      const resolvedTarget = path.resolve(path.dirname(markdownFile), target);
      try {
        await fs.access(resolvedTarget);
      } catch {
        report(markdownFile, `missing local link target ${target}`);
      }
    }
  }

  return checkedLinkCount;
}

let repositoryFiles = [];
try {
  repositoryFiles = await walk(repositoryRoot);
} catch {
  report(repositoryRoot, "missing readable repository root");
}

const markdownFiles = repositoryFiles.filter((filePath) => {
  const fileName = relative(filePath);
  return (
    path.basename(filePath) === "AGENTS.md" ||
    (fileName.startsWith("agents/") && path.extname(filePath) === ".md") ||
    (fileName.startsWith(".agents/skills/") && path.extname(filePath) === ".md")
  );
});
const agentFiles = markdownFiles.filter(
  (filePath) => path.basename(filePath) === "AGENTS.md",
);
const rootAgentFile = path.join(repositoryRoot, "AGENTS.md");
if (!agentFiles.includes(rootAgentFile))
  report(rootAgentFile, "missing root AGENTS.md");

const skillsRoot = path.join(repositoryRoot, ".agents", "skills");
let skillDirectories = [];
try {
  skillDirectories = (await fs.readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(skillsRoot, entry.name));
} catch {
  report(skillsRoot, "missing readable skills directory");
}

for (const skillDirectory of skillDirectories)
  await validateSkill(skillDirectory);
const checkedLinkCount = await validateLocalLinks(markdownFiles);

if (violations.length > 0) {
  console.error("Agent and Skill documentation check failed:");
  for (const violation of violations.sort()) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log(
    `Agent and Skill documentation check passed (${agentFiles.length} AGENTS.md files, ${skillDirectories.length} skills, ${checkedLinkCount} local links).`,
  );
}
