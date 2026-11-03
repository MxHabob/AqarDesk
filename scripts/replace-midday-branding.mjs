import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const writeChanges = process.argv.includes("--write")
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "build",
  "coverage",
  "dist",
  "node_modules",
])
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"])
const excludedPathParts = new Set(["legal", "policy", "terms"])
const excludedFileNames = new Set([
  "app-sunset-banner.tsx",
  "competitors.ts",
  "sunset-banner.tsx",
])
const brandingPattern = /Midday/g

function isExcluded(filePath) {
  const relativePath = path.relative(root, filePath)
  const parts = relativePath.split(path.sep)

  return (
    parts.some((part) => excludedPathParts.has(part.toLowerCase())) ||
    excludedFileNames.has(path.basename(filePath).toLowerCase())
  )
}

function getSourceFiles(directory) {
  const files = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...getSourceFiles(entryPath))
      }

      continue
    }

    if (
      sourceExtensions.has(path.extname(entry.name)) &&
      !isExcluded(entryPath)
    ) {
      files.push(entryPath)
    }
  }

  return files
}

function isImportOrExportSpecifier(node) {
  const parent = node.parent

  if (
    (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) &&
    parent.moduleSpecifier === node
  ) {
    return true
  }

  return (
    ts.isCallExpression(parent) &&
    parent.expression.kind === ts.SyntaxKind.ImportKeyword &&
    parent.arguments.includes(node)
  )
}

function isPropertyName(node) {
  const parent = node.parent

  return (
    ((ts.isPropertyAssignment(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isMethodDeclaration(parent)) &&
      parent.name === node) ||
    (ts.isElementAccessExpression(parent) && parent.argumentExpression === node)
  )
}

function collectTextRanges(sourceFile) {
  const ranges = []

  function addRange(start, end) {
    const text = sourceFile.text.slice(start, end)

    if (
      !text.includes("Midday") ||
      text.includes("Midday Labs AB") ||
      text.includes("@midday") ||
      text.includes("midday.ai")
    ) {
      return
    }

    ranges.push({ start, end })
  }

  function visit(node) {
    if (
      ts.isStringLiteralLike(node) &&
      !isImportOrExportSpecifier(node) &&
      !isPropertyName(node)
    ) {
      const start = node.getStart(sourceFile)
      addRange(start + 1, node.end - 1)
    } else if (ts.isJsxText(node)) {
      addRange(node.getStart(sourceFile), node.end)
    } else if (ts.isTemplateExpression(node)) {
      const head = node.head
      addRange(head.getStart(sourceFile) + 1, head.end)

      for (const span of node.templateSpans) {
        const literal = span.literal
        const hasClosingTick = literal.kind === ts.SyntaxKind.TemplateTail
        addRange(
          literal.getStart(sourceFile),
          literal.end - Number(hasClosingTick)
        )
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return ranges
}

function updateFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8")
  const scriptKind =
    path.extname(filePath) === ".tsx" || path.extname(filePath) === ".jsx"
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(
    filePath,
    original,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  )
  const ranges = collectTextRanges(sourceFile)

  if (ranges.length === 0) {
    return 0
  }

  let updated = original

  for (const { start, end } of ranges.sort(
    (left, right) => right.start - left.start
  )) {
    const text = updated.slice(start, end)
    updated =
      updated.slice(0, start) +
      text.replace(brandingPattern, "AqarDesk") +
      updated.slice(end)
  }

  if (writeChanges) {
    fs.writeFileSync(filePath, updated, "utf8")
  }

  const relativePath = path.relative(root, filePath)
  console.log(`${writeChanges ? "Updated" : "Would update"} ${relativePath}`)
  return ranges.length
}

let changedFiles = 0
let replacements = 0

for (const filePath of getSourceFiles(root)) {
  const count = updateFile(filePath)

  if (count > 0) {
    changedFiles += 1
    replacements += count
  }
}

console.log(
  `${writeChanges ? "Applied" : "Preview"}: ${replacements} branding replacement(s) in ${changedFiles} file(s).`
)
if (!writeChanges) {
  console.log("Run with --write to apply these changes.")
}
