# `sirsoft-board` 보드 메뉴를 최신 생성순으로 변경

Gnuboard7의 bundled `sirsoft-board`에서 `board-menu` API가 반환하는 게시판 순서를 최근 생성된 게시판이 먼저 오도록 변경하는 방법입니다.

## 대상

수정할 source:

```text
modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php
```

대상 method:

```text
getActiveBoardsForMenu()
```

이 변경은 `board-menu`용 게시판 목록에만 적용합니다.

다음 method의 정렬은 변경하지 않습니다.

```text
getActiveBoardsList()
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

예를 들어 게시판을 다음 순서로 생성했다면:

```text
게시판1 → 게시판2
```

`created_at DESC` 적용 후 `board-menu`의 게시판 순서는 다음과 같습니다.

```text
게시판2 → 게시판1
```

## Shell modification

파일 전체의 모든 `orderBy()`를 일괄 치환하지 말고, `getActiveBoardsForMenu()`의 대상 query block이 정확히 하나인지 확인한 뒤 변경합니다.

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

`getActiveBoardsForMenu()`이 `created_at DESC`로 변경되었는지 확인합니다.

```bash
grep -n -A8 -B4 \
    "function getActiveBoardsForMenu" \
    modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php
```

다음과 같이 확인되어야 합니다.

```php
return Board::where('is_active', true)
    ->select(['id', 'name', 'slug'])
    ->orderBy('created_at', 'desc')
    ->get();
```

## 다른 query가 변경되지 않았는지 확인

`getActiveBoardsList()`는 별도의 용도로 사용되므로 기존 `created_at ASC`를 유지해야 합니다.

```bash
grep -n -A8 -B4 \
    "function getActiveBoardsList" \
    modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php
```

다음과 같이 기존 정렬이 유지되어야 합니다.

```php
return Board::where('is_active', true)
    ->orderBy('created_at', 'asc')
    ->get();
```

## PHP syntax check

```bash
php -l \
    modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php
```

정상이라면 다음과 같이 표시됩니다.

```text
No syntax errors detected in modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php
```

## Git diff 확인

```bash
git diff -- \
    modules/_bundled/sirsoft-board/src/Repositories/BoardRepository.php
```

의도한 변경은 `getActiveBoardsForMenu()`의 정렬 방향 한 곳입니다.

```diff
return Board::where('is_active', true)
    ->select(['id', 'name', 'slug'])
-   ->orderBy('created_at', 'asc')
+   ->orderBy('created_at', 'desc')
    ->get();
```

`getActiveBoardsList()` 등 다른 query에 의도하지 않은 변경이 포함되어 있다면 installed module에 반영하기 전에 원복합니다.

## Installed module 반영

`modules/_bundled/sirsoft-board/**`는 bundled source이고, 실제 설치되어 동작하는 module은 `modules/sirsoft-board/**`입니다.

따라서 bundled source를 수정한 것만으로 production installed module에 변경 내용이 반영되는 것은 아닙니다.

수정한 bundled source를 installed module에 반영합니다.

```bash
php artisan module:update sirsoft-board \
    --source=bundled \
    --force \
    --layout-strategy=keep
```

각 옵션의 의미는 다음과 같습니다.

```text
--source=bundled
GitHub를 사용하지 않고 modules/_bundled/sirsoft-board를 update source로 사용

--force
현재 설치된 module과 bundled module의 버전이 같아도 update 수행

--layout-strategy=keep
기존 layout을 유지
```

이번 변경은 PHP repository의 query 정렬 변경이므로 layout 자체를 변경할 필요가 없습니다.

## Installed runtime 확인

업데이트 후 실제 runtime module에도 변경 내용이 반영되었는지 확인합니다.

```bash
grep -n -A8 -B4 \
    "function getActiveBoardsForMenu" \
    modules/sirsoft-board/src/Repositories/BoardRepository.php
```

다음과 같이 `created_at DESC`가 확인되어야 합니다.

```php
return Board::where('is_active', true)
    ->select(['id', 'name', 'slug'])
    ->orderBy('created_at', 'desc')
    ->get();
```

bundled source만 확인하지 말고 installed runtime까지 확인하는 것이 중요합니다.

## Cache clear

installed module 반영 후 `sirsoft-board` module cache를 삭제합니다.

```bash
php artisan module:cache-clear sirsoft-board
```

이어서 Laravel의 application cache를 정리합니다.

```bash
php artisan optimize:clear
```

## 최종 검증

마지막으로 실제 `board-menu` API 또는 해당 API를 사용하는 header menu에서 게시판 순서를 확인합니다.

예를 들어 게시판 생성 순서가 다음과 같다면:

```text
게시판1 → 게시판2
```

최종 게시판 메뉴 순서는 다음과 같아야 합니다.

```text
게시판2 → 게시판1
```

header에서 게시판 그룹을 인기/쇼핑보다 앞에 배치한 template을 사용하는 경우에는 다음과 같은 형태로 확인할 수 있습니다.

```text
홈 → 게시판2 → 게시판1 → 인기 → 쇼핑
```

여기까지 확인되면 bundled source 수정부터 installed runtime 및 실제 UI까지 `NEWEST_BOARD_FIRST` 적용이 완료된 것입니다.

## 적용 lifecycle 요약

```text
modules/_bundled/sirsoft-board
        │
        │ getActiveBoardsForMenu()
        │ created_at ASC → DESC
        ▼
PHP syntax / Git diff 확인
        │
        ▼
module:update
--source=bundled
--force
--layout-strategy=keep
        │
        ▼
modules/sirsoft-board
runtime 코드 확인
        │
        ▼
module:cache-clear
        │
        ▼
optimize:clear
        │
        ▼
board-menu API / 실제 UI 확인
        │
        ▼
NEWEST_BOARD_FIRST
```

## Important notes

- `reverse()`를 사용하는 방식이 아닙니다.
- 별도 hook, plugin, module을 추가하지 않습니다.
- query의 정렬 방향을 `created_at DESC`로 변경하는 것이 핵심입니다.
- `->where('is_active', true)` 조건은 변경하지 않습니다.
- `->select(['id', 'name', 'slug'])`도 변경하지 않습니다.
- API response structure는 변경하지 않습니다.
- `getActiveBoardsList()`의 정렬은 변경하지 않습니다.
- 파일 전체의 `orderBy()`를 일괄 치환하지 않습니다.
- 설치된 runtime module인 `modules/sirsoft-board/**`를 직접 수정하지 않습니다.
- source-of-truth인 `modules/_bundled/sirsoft-board/**`를 수정합니다.
- bundled source 수정과 installed module 반영은 별도의 lifecycle입니다.
- bundled source 반영에는 `module:update --source=bundled --force`를 사용합니다.
- 이번 변경에서는 기존 layout을 유지하기 위해 `--layout-strategy=keep`을 사용합니다.
- 반영 후 `module:cache-clear`와 `optimize:clear`를 수행합니다.
- 최종 검증은 bundled source만 확인하지 않고 installed runtime과 실제 API/UI까지 확인합니다.
