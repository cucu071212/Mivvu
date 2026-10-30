# GateWise — 에이전트 도구 인벤토리 (베이스라인)

## 문서 성격

이 문서는 **프로젝트 오너가 제공한 최종 도구 인벤토리**를 기록한 **설명용 베이스라인**입니다.

- 에이전트가 **독립적으로 설치·연결을 검증했다고 주장하지 않습니다.**
- 목록에 있는 항목만으로 **매 세션마다 자동 실행**, **인증 완료**, **항상 사용 가능**을 **추론하지 않습니다.**
- 이 문서는 **도구 설치, 설정 변경, 배포, 범위 확대에 대한 권한**을 부여하지 않습니다. 권한은 `AGENTS.md`, `PLAN.md`, `docs/IMPLEMENTATION_PLAN.md`, 그리고 **명시적 인간 과제 지시**에 따릅니다.
- 런타임에 노출된 **본 목록과 무관한 도구**를 여기에 추가하지 않습니다.

인벤토리 갱신은 **인간 오너가 제공한 새 베이스라인** 또는 **명시적으로 범위가 지정된 문서 작업**을 통해서만 합니다.

---

## 협업 모델

| 역할 | 책임 |
|------|------|
| **인간 오너** | 최종 제품 결정, 수용(acceptance), 실행·배포·범위 **승인** |
| **ChatGPT coordinator** | 요구사항 정리, 범위·과제 배정, 보고·증거 검토 |
| **Cursor** | UI, 애플리케이션 구현, 통합(integration) |
| **Codex** | 로직, 디버깅, 독립 검토·어려운 엔지니어링 |

과제마다 **해당 작업에 맞는 도구만** 선택합니다. **모든 과제에서 모든 도구를 실행할 것을 지시하지 않습니다.** 기존 `AGENTS.md`의 역할·권한·검증 경계는 그대로 유지합니다.

### 과제 유형별 도구 선택 (가이드)

| 과제 유형 | 참고 도구·스킬 |
|-----------|----------------|
| UI 작업 | UI UX Pro Max, Hallmark |
| Cursor에서 계획 작성·개정 (**과제 범위에 계획 작업이 포함된 경우만**) | `writing-plans` |
| 브라우저 검증 | 해당 에이전트에 연결된 브라우저 도구 (예: Chrome DevTools MCP, Playwright MCP) |
| 코드 구조·의존·변경 영향 | Graphify |
| Codex 탐색·리뷰 보조 | Ponytail (유용할 때) |
| 디버깅, 구현, 완료 선언 전 검증 | `systematic-debugging`, `test-driven-development`, `verification-before-completion` |
| 제품·요구사항·계획 대화 (coordinator) | GrillMe |

실제 작업 중 **목록과 다른 가용성**(미설치, 미연결, 세션에서 사용 불가 등)을 발견하면 **해당 과제 맥락에서 보고**합니다. 과제 시작마다 **전체 인벤토리 재감사**를 수행하지 않습니다.

---

## Cursor

| 도구·스킬 | 용도 |
|-----------|------|
| **UI UX Pro Max** | UI/UX 설계 |
| **Hallmark** | 관습적인 AI 생성형 디자인 패턴 검토 및 개선 |
| **Chrome DevTools MCP** | 브라우저 UI, 콘솔, 네트워크, 성능 진단 |
| **Vercel plugin + MCP** | Vercel 가이드, 배포·프로젝트 조회 |
| **Graphify** | 코드 구조·의존성 탐색 |
| **writing-plans** | 구현 계획 작성·개정 (**과제 범위에 계획 작업이 포함될 때**) |
| **systematic-debugging** | 근본 원인 조사 |
| **test-driven-development** | 의미 있는 회귀 커버리지를 갖춘 구현 |
| **verification-before-completion** | 증거 기반 완료·검증 |

---

## Codex

| 도구·스킬 | 용도 |
|-----------|------|
| **Playwright MCP** | 브라우저 상호작용·기능 검증 |
| **Chrome DevTools MCP** | 브라우저 진단 |
| **Graphify** | 구조, 호출 관계, 변경 영향 조사 |
| **Ponytail** | 코드 탐색, 작업 중 가이드, 컨텍스트 보조 |
| **systematic-debugging** | 근본 원인 조사 |
| **test-driven-development** | 의미 있는 회귀 커버리지를 갖춘 구현 |
| **verification-before-completion** | 증거 기반 완료·검증 |

Codex 측 Graphify·Ponytail·브라우저 도구에 대한 **설치 정책·범위 제한**은 `AGENTS.md`의 「Codex local tools — installation policy」를 따릅니다. 본 인벤토리는 그 정책을 대체하지 않습니다.

---

## ChatGPT coordinator

| 연결·도구 | 용도 |
|-----------|------|
| **GitHub connection** | 코드·문서·PR 조회 및 **승인된** 저장소 조율 |
| **Vercel plugin/connection** | 배포·프로젝트 정보 조회 |
| **GrillMe** | 아이디어 명확화, 요구사항 인터뷰, 계획 검토 |

---

## 보류·미설치

| 항목 | 상태 |
|------|------|
| **I Have ADHD** | 보류(deferred) |
| **Effortless** | 조사했으나 미설치 |

---

## 관련 문서

- [`AGENTS.md`](../../AGENTS.md) — 역할, 권한, 스킬 정책, Codex 로컬 도구 정책
- [`PLAN.md`](../../PLAN.md) — 제품 요구사항
- [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) — 과제별 권한·증거
