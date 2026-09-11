#!/usr/bin/env node

/**
 * Create a GitHub Release by bumping package.json, committing, tagging and pushing.
 * GitHub Actions builds the VSIX and attaches it to the tag release.
 *
 * Usage:
 *   pnpm release current
 *   pnpm release patch|minor|major|x.y.z
 *   pnpm release patch --dry-run
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flags = new Set(args.filter((arg) => arg.startsWith('--')))
const bump = args.find((arg) => !arg.startsWith('--'))
const dryRun = flags.has('--dry-run')
const skipCheck = flags.has('--skip-check')
const packagePath = join(root, 'package.json')

function fail(message) {
  console.error(`\n✘ ${message}`)
  process.exit(1)
}

function gitOutput(...args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

function git(...args) {
  if (dryRun) {
    console.log(`  > git ${args.join(' ')}`)
    return
  }
  const result = spawnSync('git', args, { cwd: root, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`git ${args[0]} 执行失败`)
}

function compareVersion(left, right) {
  const a = left.split('.').map(Number)
  const b = right.split('.').map(Number)
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
}

function nextVersion(current, value) {
  if (value === 'current') return current
  if (/^\d+\.\d+\.\d+$/.test(value)) return value
  if (!['patch', 'minor', 'major'].includes(value)) return undefined
  const [major, minor, patch] = current.split('.').map(Number)
  if (value === 'major') return `${major + 1}.0.0`
  if (value === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

if (!bump) fail('用法: pnpm release current|patch|minor|major|x.y.z [--dry-run] [--skip-check]')

const branch = gitOutput('rev-parse', '--abbrev-ref', 'HEAD')
const dirty = gitOutput('status', '--porcelain')
if (!dryRun && branch !== 'main') fail(`请在 main 分支上发布（当前分支: ${branch}）`)
if (!dryRun && dirty) fail(`工作区有未提交的改动，请先提交或清理：\n${dirty}`)

const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
const current = pkg.version
const next = nextVersion(current, bump)
if (!next) fail(`无效的版本参数 "${bump}"`)
if (bump !== 'current' && compareVersion(next, current) <= 0) {
  fail(`新版本 ${next} 必须高于当前版本 ${current}`)
}

const tag = `v${next}`
if (gitOutput('tag', '--list', tag)) fail(`标签 ${tag} 已存在`)

console.log(`\n发布 ${current} → ${next}${dryRun ? '（dry-run，不实际修改）' : ''}\n`)

if (!skipCheck && !dryRun) {
  console.log('运行完整发布检查...')
  try {
    execFileSync('pnpm', ['run', 'package'], { cwd: root, stdio: 'inherit', shell: true })
  } catch {
    fail('发布检查失败，已中止发布（未修改版本文件）')
  }
}

if (bump !== 'current') {
  if (dryRun) console.log('  将更新 package.json')
  else {
    pkg.version = next
    writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
  }
}

if (dryRun) {
  console.log('\ndry-run 完成，未做任何修改。')
  process.exit(0)
}

try {
  if (bump !== 'current') git('add', 'package.json')
  if (bump !== 'current') git('commit', '-m', `chore(release): ${next}`)
  git('tag', '-a', tag, '-m', `v${next}`)
  git('push', 'origin', 'main')
  git('push', 'origin', tag)
} catch (error) {
  console.error(`\n✘ ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}

console.log(`\n✅ 已发布 ${next}（tag: ${tag}）`)
console.log('GitHub Actions 将自动构建 VSIX 并创建 GitHub Release。')
