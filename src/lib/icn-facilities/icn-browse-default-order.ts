// 인천 공항 시설 기본 목록에서 대분류 라운드 순서를 만드는 순수 유틸 모듈이다.
import type { IcnBrowseCategoryFilter } from "./icn-browse-category-taxonomy"; // 허브 카테고리 필터 타입을 가져온다.
import {
  ICN_BROWSE_CATEGORY_ALL, // "all" 상수 — 필터 미선택 상태를 나타낸다.
  ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS, // 승인된 대분류 키와 방문 순서를 담은 상수 배열이다.
} from "./icn-browse-category-taxonomy"; // 카테고리 택소노미 모듈에서 상수들을 가져온다.
import { normalizeIcnSearchText } from "./icn-facility-search"; // 검색어가 실질적으로 비었는지 판별할 때 쓴다.
import type { IcnBrowseListItem } from "./icn-browse-view-model"; // 브라우즈 리스트 항목 타입을 가져온다.

/** 라운드마다 각 대분류에서 연속으로 꺼낼 시설 개수(승인값 2). */
export const ICN_BROWSE_DEFAULT_CATEGORY_ROUND_SIZE = 2; // 제품이 승인한 라운드당 대분류 노출 개수다.

/**
 * 유효 검색어가 비어 있고 대분류·서브타입이 비활성일 때 true를 반환한다.
 * 터미널만 선택된 경우에도 라운드 순서를 적용한다(필터 결과 위에 재정렬).
 * 공백만 있는 검색어는 검색 인덱스와 같이 빈 쿼리로 취급한다.
 */
export function shouldApplyIcnDefaultCategoryRoundOrder(args: {
  query: string; // 사용자가 입력한 원본 검색어 문자열이다.
  terminalFilter: string; // 터미널 칩 값("all"/P01 등). 게이트에서는 무시하며 호출 호환용이다.
  categoryFilter: IcnBrowseCategoryFilter; // 대분류·중분류 허브 필터 상태다.
}): boolean {
  // 터미널 인자는 화면 호출 시그니처 호환을 위해 받되, 터미널 단독 선택은 라운드를 막지 않는다.
  void args.terminalFilter; // 의도적으로 미사용 — 터미널 필터 여부와 무관하게 아래 조건만 본다.
  // 정규화된 검색어가 남아 있으면 기본 라운드 순서를 적용하지 않는다.
  if (normalizeIcnSearchText(args.query)) return false; // normalizeIcnSearchText는 폭·대소문자·공백을 접는다.
  // 대분류 필터가 켜져 있으면 라운드 순서를 건너뛴다.
  if (args.categoryFilter.categoryLarge !== ICN_BROWSE_CATEGORY_ALL) return false; // 대분류가 all이 아니면 활성이다.
  // 서브타입(중분류) 필터가 켜져 있어도 라운드 순서를 건너뛴다.
  if (args.categoryFilter.categoryMedium !== ICN_BROWSE_CATEGORY_ALL) return false; // 중분류가 all이 아니면 활성이다.
  // 검색·카테고리·서브타입이 비활성이므로(터미널 유무와 무관) 라운드 순서를 적용한다.
  return true; // 호출자는 이 값이 true일 때만 order 함수를 호출한다.
}

/**
 * 승인된 대분류 순서를 돌며 라운드마다 최대 N개씩 가져와 새 배열을 만든다.
 * 각 대분류 안에서는 입력 배열의 상대 순서를 보존한다.
 * 승인 목록에 없거나 large 키가 비어 있는 항목은 leftover 버킷에 넣어 마지막에 방문한다.
 */
export function orderIcnBrowseItemsByTopLevelCategoryRounds(
  items: readonly IcnBrowseListItem[], // 필터 이후(또는 전체) 브라우즈 항목 목록이다.
  perCategoryPerRound: number = ICN_BROWSE_DEFAULT_CATEGORY_ROUND_SIZE, // 라운드당 대분류별 개수다.
): IcnBrowseListItem[] {
  // 잘못된 개수이거나 항목이 1개 이하면 복사본만 반환해 부작용을 피한다.
  if (perCategoryPerRound < 1 || items.length <= 1) {
    return [...items]; // 입력 배열을 얕은 복사해 반환한다.
  }

  // 대분류 키 → 아직 꺼내지 않은 시설 큐를 담을 Map을 만든다.
  const queues = new Map<string, IcnBrowseListItem[]>(); // 키는 대분류 문자열이다.
  // 승인된 대분류마다 빈 큐를 미리 등록해 방문 순서를 고정한다.
  for (const key of ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS) {
    queues.set(key, []); // 각 대분류의 초기 큐는 빈 배열이다.
  }
  // 승인 택소노미 밖·누락 키를 담을 leftover 버킷 키다.
  const leftoverKey = "__icn_browse_category_leftover__"; // UI에 노출되지 않는 내부 키다.
  // leftover 큐도 Map에 등록한다.
  queues.set(leftoverKey, []); // 이후 라운드에서 승인 키 다음에 방문한다.

  // 입력 순서를 유지한 채 각 항목을 해당 큐에 넣는다.
  for (const item of items) {
    // 항목의 대분류 키를 읽는다(KO 상속 후 EN 카탈로그에서도 동일 키를 쓴다).
    const key = item.categoryLargeKey; // null이면 leftover로 보낸다.
    // 승인된 대분류 키가 있으면 그 큐에 추가한다.
    if (key && queues.has(key)) {
      queues.get(key)!.push(item); // 상대 순서를 위해 push만 사용한다.
    } else {
      // 카테고리 폴백/미분류 시설도 누락하지 않고 leftover에 남긴다.
      queues.get(leftoverKey)!.push(item); // 기존 상대 순서를 leftover 안에서도 유지한다.
    }
  }

  // 매 라운드에서 방문할 키 순서: 승인 대분류 다음 leftover.
  const visitOrder = [...ICN_BROWSE_TOP_LEVEL_CATEGORY_KEYS, leftoverKey]; // 스프레드로 새 배열을 만든다.
  // 최종 결과 배열을 담을 빈 목록이다.
  const ordered: IcnBrowseListItem[] = []; // 호출자가 받는 재정렬 결과다.
  // 아직 배치하지 않은 항목 수를 추적한다.
  let remaining = items.length; // 0이 되면 루프를 종료한다.

  // 모든 시설이 배치될 때까지 라운드를 반복한다.
  while (remaining > 0) {
    // 이번 라운드에서 하나라도 꺼냈는지 확인하는 플래그다.
    let progressed = false; // 교착 상태를 막기 위한 안전장치다.
    // 대분류(및 leftover)를 순서대로 방문한다.
    for (const key of visitOrder) {
      // 현재 키의 남은 시설 큐를 가져온다.
      const queue = queues.get(key)!; // 위에서 모든 키를 등록했으므로 존재한다.
      // 이 카테고리에서 최대 perCategoryPerRound개까지 연속으로 꺼낸다.
      for (let taken = 0; taken < perCategoryPerRound && queue.length > 0; taken += 1) {
        // 큐 앞에서 하나 꺼내 결과 배열에 붙인다(카테고리 내부 상대 순서 유지).
        ordered.push(queue.shift()!); // shift는 앞쪽 요소를 제거하며 반환한다.
        // 남은 개수를 하나 줄인다.
        remaining -= 1; // while 종료 조건에 사용한다.
        // 이번 라운드에서 진행이 있었음을 기록한다.
        progressed = true; // 빈 큐만 남은 경우 false로 남는다.
      }
    }
    // 어떤 큐에서도 꺼내지 못했다면 무한 루프를 피하고 중단한다.
    if (!progressed) {
      break; // 이론상 remaining>0과 동시에 발생하면 안 되지만 방어한다.
    }
  }

  // 재정렬된 전체 목록을 반환한다(중복·누락 없이 items.length와 같아야 한다).
  return ordered; // 화면/테스트가 이 배열 순서를 그대로 렌더한다.
}
