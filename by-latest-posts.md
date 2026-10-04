# `sirsoft-board` 보드 메뉴를 최신 생성순으로 변경

Gnuboard7의 bundled `sirsoft-board`에서 board-menu API가 반환하는 게시판 순서를 최근 생성된 게시판이 먼저 오도록 변경하는 방법입니다.

## 대상

수정할 source:

```text
modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php
```

대상 method:

```text
getActiveBoardsForMenu()
```

## 변경 전

```php
return Board::where('is_active', true)
    ->select(['id', 'name', 'slug'])
    ->orderBy('created_at', 'asc')
    ->get();
```

## 변경 후

```php
return Board::where('is_active', true)
    ->select(['id', 'name', 'slug'])
    ->orderBy('created_at', 'desc')
    ->get();
```

핵심 diff:

```diff
-    ->orderBy('created_at', 'asc')
+    ->orderBy('created_at', 'desc')
```

## 정렬 의미

```text
created_at ASC
오래된 게시판 → 최근 게시판

created_at DESC
최근 게시판 → 오래된 게시판
```

최종 의미:

```text
NEWEST_BOARD_FIRST
```

## Shell modification

파일 전체의 모든 `orderBy()`를 일괄 치환하지 말고, 대상 query block이 정확히 하나인지 확인한 뒤 변경합니다.

```bash
python3 <<'PY'
from pathlib import Path

path = Path(
    "modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php"
)

text = path.read_text()

old = """return Board::where('is_active', true)
            ->select(['id', 'name', 'slug'])
            ->orderBy('created_at', 'asc')
            ->get();"""

new = """return Board::where('is_active', true)
            ->select(['id', 'name', 'slug'])
            ->orderBy('created_at', 'desc')
            ->get();"""

if text.count(old) != 1:
    raise SystemExit("Target query was not uniquely identified. No changes made.")

path.write_text(text.replace(old, new))

print("Board menu ordering changed: created_at ASC -> DESC")
PY
```

## 변경 확인

```bash
grep -n -A8 -B4 \
    "function getActiveBoardsForMenu" \
    modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php
```

## PHP syntax check

```bash
php -l \
    modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php
```

## Git diff 확인

```bash
git diff -- \
    modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php
```

## Important notes

- `reverse()`를 사용하는 방식이 아닙니다.
- 별도 hook, plugin, module을 추가하지 않습니다.
- query의 정렬 방향을 `created_at DESC`로 변경하는 것이 핵심입니다.
- `->where('is_active', true)` 조건은 변경하지 않습니다.
- `->select(['id', 'name', 'slug'])`도 변경하지 않습니다.
- API response structure는 변경하지 않습니다.
- 설치된 runtime module인 `modules/sirsoft-board/**`를 직접 수정하지 않습니다.
- source-of-truth인 `modules/_bundled/sirsoft-board/**`를 수정합니다.
- bundled source 수정과 production installed module 반영은 별도의 lifecycle입니다. 필요한 공식 lifecycle 절차는 변경 범위와 운영 정책에 따라 별도로 수행해야 합니다.
