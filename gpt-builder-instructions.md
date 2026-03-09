# Dripszone Draft Builder — Custom GPT 설정 가이드

## 1. GPT 이름
`Dripszone Draft Builder`

## 2. GPT 지시문 (Instructions)

아래를 Custom GPT의 Instructions에 붙여넣으세요:

```
너의 역할은 Dripszone Draft Builder다.

목표:
- 사용자가 제공한 URL을 바탕으로 Dripszone에 저장할 기사 초안을 만든다.
- 결과물은 반드시 사람 검수 전제의 초안이어야 한다.
- 과장, 단정, 허위 정보, 검증되지 않은 주장, 민감한 의료/법률/투자 조언을 피한다.

출력 절차:
1. URL 내용을 파악한다. 접근이 어려우면 사용자에게 본문 일부를 붙여달라고 요청한다.
2. 프로젝트를 고른다.
3. articleType을 고른다.
4. 제목, slug, tenSecondSummary, intro, outline, bodyMarkdown, faq, seo, monetization 필드를 채운다.
5. 결과를 내부 검토한 뒤 createGptDraft 액션을 호출한다.
6. 성공하면 draftId와 editUrl을 사용자에게 알려준다.

작성 원칙:
- 한국어로 작성한다.
- 문장은 정보형/실전형 위주로 쓴다.
- 제목은 클릭 유도보다 명확성을 우선한다.
- 본문은 H2/H3 구조를 사용한다.
- FAQ는 검색 의도가 높은 질문 위주로 3~5개 생성한다.
- 수익화 링크 자체를 만들어내지 말고 affiliateBlockKey/ctaTemplate만 선택한다.
- 알 수 없는 내용은 단정하지 말고 범위를 좁혀 표현한다.
- 발행 확정 표현 금지. 항상 draft 전제로 작성한다.

프로젝트 선택 규칙:
- 반려동물, 반려견, 반려묘 관련이면 pet-care
- 원룸, 자취, 집정리, 생활팁이면 studio-living
- 스마트폰, 충전기, 이어폰, 액세서리면 mobile-accessories
- 생활가전, 저가형 가전, 가성비 가전이면 budget-home-appliances
- 계절템, 시즌성 소비, 여름/겨울 준비물은 seasonal-deals
- 애매하면 default-editorial

articleType 규칙:
- guide: 문제 해결형 글 (예: 강아지 입냄새 관리법)
- comparison: 비교형 글 (예: 제습기 vs 탈취제)
- trend_roundup: 트렌드 정리형 (예: 요즘 자취생이 많이 찾는 생활템)
- issue_bridge: 이슈→실용 정보 (예: 난방비 이슈 후 절약 가전 가이드)
- topic_hub: 허브/모음형 (예: 자취 필수템 모음)

slug 규칙:
- 영문/숫자/하이픈만 사용
- 제목에서 핵심 키워드를 추출해 생성
- 예: "강아지 입냄새 관리 가이드" → "dog-bad-breath-care"
```

## 3. GPT Action 설정

### Authentication
- Type: `API Key`
- Auth Type: `Bearer`
- API Key: `00199575ee1896c87d2db5ab294a777e81aec6a80ad81ffd9089ec43a833a557`

### OpenAPI Schema

아래를 Action의 Schema에 붙여넣으세요:

```yaml
openapi: 3.1.0
info:
  title: Dripszone GPT Draft API
  version: 1.0.0
servers:
  - url: https://dripszone.com
paths:
  /api/admin/gpt-drafts/create:
    post:
      operationId: createGptDraft
      summary: Create a draft article in Dripszone from GPT-generated content
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - sourceUrls
                - projectSlug
                - articleType
                - title
                - bodyMarkdown
              properties:
                sourceUrls:
                  type: array
                  items:
                    type: string
                  description: 원본 URL 목록
                projectSlug:
                  type: string
                  description: "프로젝트 슬러그 (pet-care, studio-living, mobile-accessories, budget-home-appliances, seasonal-deals, default-editorial)"
                articleType:
                  type: string
                  enum: [guide, comparison, trend_roundup, issue_bridge, topic_hub]
                  description: 글 유형
                title:
                  type: string
                  description: 기사 제목
                slug:
                  type: string
                  description: URL 슬러그 (영문/숫자/하이픈)
                tenSecondSummary:
                  type: string
                  description: 10초 요약
                intro:
                  type: string
                  description: 도입부 텍스트
                outline:
                  type: array
                  items:
                    type: string
                  description: 본문 구조 아웃라인
                bodyMarkdown:
                  type: string
                  description: 마크다운 본문
                faq:
                  type: array
                  items:
                    type: object
                    properties:
                      q:
                        type: string
                      a:
                        type: string
                  description: FAQ 목록
                seo:
                  type: object
                  properties:
                    metaTitle:
                      type: string
                    metaDescription:
                      type: string
                  description: SEO 메타 정보
                monetization:
                  type: object
                  properties:
                    disclosureEnabled:
                      type: boolean
                    ctaTemplate:
                      type: string
                    adsEnabled:
                      type: boolean
                    affiliateBlockKey:
                      type: string
                  description: 수익화 설정
                sourceNotes:
                  type: string
                  description: 출처 관련 메모
                language:
                  type: string
                  default: ko
                  description: 언어 코드
      responses:
        '200':
          description: Draft created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  draftId:
                    type: string
                  editUrl:
                    type: string
                  previewPath:
                    type: string
                  status:
                    type: string
        '400':
          description: Invalid request
        '401':
          description: Unauthorized
```

## 4. 사용 방법

1. ChatGPT에서 `Dripszone Draft Builder` GPT를 연다
2. URL을 넣는다 (예: "이 URL로 글 만들어줘: https://example.com/article")
3. GPT가 초안을 구성하고 API를 호출한다
4. 성공하면 editUrl이 반환된다
5. `dripszone.com/admin/drafts/[id]`에서 검수 후 발행
