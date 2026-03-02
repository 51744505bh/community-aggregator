# 🔥 커뮤니티 인기글 큐레이션 사이트 개발 가이드

## 📋 프로젝트 개요

에펨코리아, 디시인사이드, 루리웹, 보배드림, 도그드립의 인기글을 자동으로 수집해서
한 곳에 모아 보여주는 큐레이션 사이트. feedpost.net과 유사한 구조.

- 로그인 없음 (익명 열람만)
- DB 없음 (크롤러 → JSON → Next.js 직접 표시)
- 수익화: 구글 애드센스 + 쿠팡파트너스

> 나중에 로그인/댓글 기능 추가할 때 Supabase 또는 네온DB 붙이면 됨

---

## 🎨 디자인 레퍼런스 (feedpost.net 스타일)

### 상단 네비게이션
```
실시간 베스트 | 주간 베스트 | 월간 베스트 | 이슈 | 유머 | 정보/꿀팁
```

### 게시글 카드 레이아웃
```
┌────────────────────────────────────────────────────┐
│  [썸네일 이미지]    제목이 여기 나옵니다              │
│  (왼쪽 크게)        출처 뱃지 | 시간                 │
│                     요약 텍스트 한두줄               │
│                     [Read More]                    │
│  조회수 | 추천 | 댓글수                              │
└────────────────────────────────────────────────────┘
```

### 상세 페이지 레이아웃
```
제목
출처: [에펨코리아] | 시간 | 조회수 | 추천 | 댓글수
원본링크: https://...

본문 이미지들 (원본 URL 참조)
본문 텍스트

[원본 보기 버튼]
```

---

## 🛠 기술 스택

- **프론트엔드:** Next.js 14 (App Router) + Tailwind CSS
- **크롤러:** Python (BeautifulSoup + requests)
- **데이터 저장:** JSON 파일 (DB 없음)
- **배포:** Vercel (Next.js) + GitHub Actions (크롤러 자동화)
- **언어:** TypeScript
- **비용:** 완전 무료 (Vercel 무료 + GitHub Actions 무료)

---

## 📁 프로젝트 구조

```
project/
  crawler/
    crawler.py          → 크롤러 메인
    requirements.txt    → pip 패키지 목록
  public/
    data/
      posts.json        → 크롤링 결과 저장 (GitHub Actions가 자동 업데이트)
  app/
    page.tsx            → 실시간 베스트
    weekly/page.tsx     → 주간 베스트
    monthly/page.tsx    → 월간 베스트
    category/
      [slug]/page.tsx   → 카테고리별 (유머/이슈/정보·꿀팁)
    post/
      [id]/page.tsx     → 게시글 상세 페이지
    layout.tsx          → 공통 레이아웃
  components/
    PostCard.tsx
    NavBar.tsx
    AdBanner.tsx
```

---

## 🐍 Python 크롤러

### requirements.txt
```
requests
beautifulsoup4
```

### 수집 전략
- 각 사이트별 조회수 상위 10개씩 수집
- 상세 페이지까지 접속해서 본문 이미지 URL 수집
- 결과를 posts.json으로 저장
- 1시간마다 GitHub Actions로 자동 실행

### crawler.py

```python
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json
import time
import os

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
TOP_N = 10

# ─────────────────────────────────────────
# 공통: 상세 페이지 이미지 수집 함수
# ─────────────────────────────────────────
def fetch_detail_images(url: str, content_selector: str) -> list:
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        content = soup.select_one(content_selector)
        if not content:
            return []
        imgs = content.select("img")
        image_urls = []
        for img in imgs:
            src = img.get("src") or img.get("data-src")
            if not src or not src.startswith("http"):
                continue
            if any(x in src for x in ["icon", "logo", "ad", "banner", "emoji"]):
                continue
            image_urls.append(src)
        return image_urls
    except Exception as e:
        print(f"상세 페이지 이미지 수집 오류 ({url}): {e}")
        return []

# ─────────────────────────────────────────
# 1. 에펨코리아
# ─────────────────────────────────────────
def crawl_fmkorea():
    url = "https://www.fmkorea.com/humor"
    res = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(res.text, "html.parser")

    posts = []
    items = soup.select(".fm_best_widget ul li")

    for item in items[:TOP_N]:
        try:
            title_el = item.select_one("h3.title a")
            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            link = "https://www.fmkorea.com" + title_el["href"]

            img = item.select_one("img")
            thumbnail_url = img["src"] if img else None

            view_el = item.select_one(".view_count")
            view_count = int(view_el.get_text(strip=True).replace(",", "")) if view_el else 0

            comment_el = item.select_one(".num_comment")
            comment_count = int(comment_el.get_text(strip=True).replace(",", "")) if comment_el else 0

            image_urls = fetch_detail_images(link, ".xe_content")
            time.sleep(1)

            posts.append({
                "id": link.split("/")[-1],
                "source": "fmkorea",
                "source_name": "에펨코리아",
                "category": "humor",
                "title": title,
                "url": link,
                "thumbnail_url": thumbnail_url,
                "image_urls": image_urls,
                "view_count": view_count,
                "comment_count": comment_count,
                "like_count": 0,
                "crawled_at": datetime.utcnow().isoformat()
            })
        except Exception as e:
            print(f"에펨코리아 오류: {e}")
            continue

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]

# ─────────────────────────────────────────
# 2. 디시인사이드
# ─────────────────────────────────────────
def crawl_dcinside():
    url = "https://www.dcinside.com/hotissue/bestnew"
    res = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(res.text, "html.parser")

    posts = []
    items = soup.select(".bestnew_lst li")

    for item in items[:TOP_N]:
        try:
            title_el = item.select_one("a.title")
            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            link = title_el["href"]
            if not link.startswith("http"):
                link = "https://www.dcinside.com" + link

            view_el = item.select_one(".view")
            view_count = int(view_el.get_text(strip=True).replace(",", "")) if view_el else 0

            image_urls = fetch_detail_images(link, ".writing_view_box")
            time.sleep(1)

            posts.append({
                "id": link.split("/")[-1],
                "source": "dcinside",
                "source_name": "디시인사이드",
                "category": "issue",
                "title": title,
                "url": link,
                "thumbnail_url": None,
                "image_urls": image_urls,
                "view_count": view_count,
                "comment_count": 0,
                "like_count": 0,
                "crawled_at": datetime.utcnow().isoformat()
            })
        except Exception as e:
            print(f"디시 오류: {e}")
            continue

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]

# ─────────────────────────────────────────
# 3. 루리웹
# ─────────────────────────────────────────
def crawl_ruliweb():
    url = "https://bbs.ruliweb.com/best/humor_only"
    res = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(res.text, "html.parser")

    posts = []
    items = soup.select("table.board_list_table tbody tr.table_body")

    for item in items[:TOP_N]:
        try:
            title_el = item.select_one("a.deco")
            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            link = title_el["href"]
            if not link.startswith("http"):
                link = "https://bbs.ruliweb.com" + link

            view_el = item.select_one(".col_view")
            view_count = int(view_el.get_text(strip=True).replace(",", "")) if view_el else 0

            like_el = item.select_one(".col_recomd")
            like_count = int(like_el.get_text(strip=True).replace(",", "")) if like_el else 0

            image_urls = fetch_detail_images(link, ".view_content")
            time.sleep(1)

            posts.append({
                "id": link.split("/")[-1],
                "source": "ruliweb",
                "source_name": "루리웹",
                "category": "humor",
                "title": title,
                "url": link,
                "thumbnail_url": None,
                "image_urls": image_urls,
                "view_count": view_count,
                "comment_count": 0,
                "like_count": like_count,
                "crawled_at": datetime.utcnow().isoformat()
            })
        except Exception as e:
            print(f"루리웹 오류: {e}")
            continue

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]

# ─────────────────────────────────────────
# 4. 보배드림
# ─────────────────────────────────────────
def crawl_bobaedream():
    url = "https://www.bobaedream.co.kr/best"
    res = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(res.text, "html.parser")

    posts = []
    items = soup.select(".best-post-list li")

    for item in items[:TOP_N]:
        try:
            title_el = item.select_one("a.title")
            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            link = title_el["href"]
            if not link.startswith("http"):
                link = "https://www.bobaedream.co.kr" + link

            view_el = item.select_one(".count")
            view_count = int(view_el.get_text(strip=True).replace(",", "")) if view_el else 0

            image_urls = fetch_detail_images(link, ".bodyCont")
            time.sleep(1)

            posts.append({
                "id": link.split("/")[-1],
                "source": "bobaedream",
                "source_name": "보배드림",
                "category": "issue",
                "title": title,
                "url": link,
                "thumbnail_url": None,
                "image_urls": image_urls,
                "view_count": view_count,
                "comment_count": 0,
                "like_count": 0,
                "crawled_at": datetime.utcnow().isoformat()
            })
        except Exception as e:
            print(f"보배드림 오류: {e}")
            continue

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]

# ─────────────────────────────────────────
# 5. 도그드립
# ─────────────────────────────────────────
def crawl_dogdrip():
    url = "https://www.dogdrip.net/dogdrip"
    res = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(res.text, "html.parser")

    posts = []
    items = soup.select(".eg-doc-row")

    for item in items[:TOP_N * 2]:
        try:
            title_el = item.select_one("a.daum_adsense") or item.select_one(".title a")
            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            link = title_el["href"]
            if not link.startswith("http"):
                link = "https://www.dogdrip.net" + link

            view_el = item.select_one(".view_count")
            view_count = int(view_el.get_text(strip=True).replace(",", "")) if view_el else 0

            img = item.select_one("img")
            thumbnail_url = img["src"] if img else None

            image_urls = fetch_detail_images(link, ".ed-body")
            time.sleep(1)

            posts.append({
                "id": link.split("/")[-1],
                "source": "dogdrip",
                "source_name": "도그드립",
                "category": "humor",
                "title": title,
                "url": link,
                "thumbnail_url": thumbnail_url,
                "image_urls": image_urls,
                "view_count": view_count,
                "comment_count": 0,
                "like_count": 0,
                "crawled_at": datetime.utcnow().isoformat()
            })
        except Exception as e:
            print(f"도그드립 오류: {e}")
            continue

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]

# ─────────────────────────────────────────
# 6. JSON 저장
# ─────────────────────────────────────────
def save_to_json(posts):
    os.makedirs("../public/data", exist_ok=True)
    with open("../public/data/posts.json", "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"✅ posts.json 저장 완료 ({len(posts)}개)")

# ─────────────────────────────────────────
# 7. 메인
# ─────────────────────────────────────────
def main():
    print("🔥 크롤링 시작...")
    all_posts = []

    crawlers = [
        ("에펨코리아", crawl_fmkorea),
        ("디시인사이드", crawl_dcinside),
        ("루리웹", crawl_ruliweb),
        ("보배드림", crawl_bobaedream),
        ("도그드립", crawl_dogdrip),
    ]

    for name, crawler in crawlers:
        try:
            print(f"  📥 {name} 수집 중...")
            posts = crawler()
            all_posts.extend(posts)
            print(f"  ✅ {name}: {len(posts)}개")
            time.sleep(2)
        except Exception as e:
            print(f"  ❌ {name} 오류: {e}")

    save_to_json(all_posts)
    print(f"\n🎉 총 {len(all_posts)}개 완료!")

if __name__ == "__main__":
    main()
```

---

## ⚙️ GitHub Actions 자동화 (1시간마다)

### .github/workflows/crawler.yml
```yaml
name: Run Crawler

on:
  schedule:
    - cron: '0 * * * *'  # 매 시간 실행
  workflow_dispatch:       # 수동 실행 가능

jobs:
  crawl:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install requests beautifulsoup4

      - name: Run crawler
        run: cd crawler && python crawler.py

      - name: Commit and push posts.json
        run: |
          git config --global user.name "crawler-bot"
          git config --global user.email "bot@example.com"
          git add public/data/posts.json
          git commit -m "Update posts.json" || echo "No changes"
          git push
```

> 크롤러가 돌 때마다 posts.json을 자동으로 GitHub에 커밋 → Vercel이 자동 재배포

---

## 🖥 Next.js 프론트엔드

### 프로젝트 생성
```bash
npx create-next-app@latest community-aggregator --typescript --tailwind --app
```

### 환경변수 없음 (DB 없으므로)
posts.json을 그대로 읽어서 사용

### 메인 페이지 (app/page.tsx)
```tsx
import posts from '@/public/data/posts.json'
import PostCard from '@/components/PostCard'
import NavBar from '@/components/NavBar'

export default function Home() {
  // 최신순 정렬
  const sorted = [...posts].sort(
    (a, b) => new Date(b.crawled_at).getTime() - new Date(a.crawled_at).getTime()
  )

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <NavBar />
      <div className="my-4">{/* 애드센스 상단 광고 */}</div>
      <div>
        {sorted.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <div className="my-6">{/* 쿠팡파트너스 하단 광고 */}</div>
    </main>
  )
}
```

### 카테고리 페이지 (app/category/[slug]/page.tsx)
```tsx
import posts from '@/public/data/posts.json'
import PostCard from '@/components/PostCard'

const categoryMap: Record<string, string> = {
  humor: "humor",
  issue: "issue",
  info: "info",
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const filtered = posts.filter((p) => p.category === categoryMap[params.slug])

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {filtered.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </main>
  )
}
```

### 상세 페이지 (app/post/[id]/page.tsx)
```tsx
import posts from '@/public/data/posts.json'

export default function PostDetail({ params }: { params: { id: string } }) {
  const post = posts.find((p) => p.id === params.id)
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
          {post.source_name}
        </span>
        <span>👀 {post.view_count.toLocaleString()}</span>
        <span>👍 {post.like_count.toLocaleString()}</span>
        <span>💬 {post.comment_count.toLocaleString()}</span>
      </div>

      <a href={post.url} target="_blank" rel="noopener noreferrer"
        className="text-blue-500 text-sm underline mb-4 block">
        🔗 원본 보기
      </a>

      <div className="my-4">{/* 애드센스 */}</div>

      {/* 본문 이미지 (원본 URL 참조) */}
      {post.image_urls?.map((imgUrl, i) => (
        <img key={i} src={imgUrl} alt="" className="w-full mb-3 rounded" />
      ))}

      <div className="mt-6">{/* 쿠팡파트너스 */}</div>
    </main>
  )
}
```

### 게시글 카드 (components/PostCard.tsx)
```tsx
export default function PostCard({ post }: { post: any }) {
  return (
    <div className="flex gap-4 p-4 bg-white border-b hover:bg-gray-50">
      {post.thumbnail_url && (
        <img src={post.thumbnail_url} alt=""
          className="w-40 h-32 object-cover rounded flex-shrink-0" />
      )}
      <div className="flex-1">
        <h2 className="text-lg font-bold mb-1">{post.title}</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
            {post.source_name}
          </span>
        </div>
        <a href={`/post/${post.id}`}
          className="inline-block mt-2 px-4 py-1 border border-gray-300 text-sm rounded hover:bg-gray-100">
          Read More
        </a>
        <div className="flex gap-3 mt-2 text-xs text-gray-400">
          <span>👀 {post.view_count.toLocaleString()}</span>
          <span>👍 {post.like_count.toLocaleString()}</span>
          <span>💬 {post.comment_count.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
```

---

## 💰 수익화

### 구글 애드센스
1. https://adsense.google.com 가입
2. 사이트 등록 후 심사 (1~2주)
3. 승인 후 layout.tsx에 광고 코드 삽입

### 쿠팡파트너스
1. https://partners.coupang.com 가입
2. 배너 위젯 생성
3. 상세 페이지 하단에 삽입

---

## 🚀 배포

```bash
npx vercel deploy
```
Vercel이 posts.json 업데이트될 때마다 자동 재배포

---

## ✅ 개발 체크리스트

### Day 1
- [ ] Next.js 프로젝트 생성
- [ ] public/data/posts.json 빈 파일 생성

### Day 2
- [ ] Python 크롤러 작성 (5개 사이트)
- [ ] 로컬에서 크롤링 테스트
- [ ] posts.json 정상 생성 확인

### Day 3
- [ ] NavBar 컴포넌트 (feedpost 스타일)
- [ ] PostCard 컴포넌트
- [ ] 메인 / 카테고리 / 상세 페이지
- [ ] 광고 자리 배치

### Day 4
- [ ] GitHub Actions 자동화 설정
- [ ] Vercel 배포
- [ ] 구글 애드센스 신청
- [ ] 쿠팡파트너스 배너 삽입
- [ ] SNS 공유 시작

---

## ⚠️ 주의사항

- 출처 표기 필수 (source_name 항상 표시)
- 원본 링크 제공 필수
- 이미지는 원본 URL 참조 (저장 금지)
- 크롤링 간격 최소 1시간
- 네이버, 카카오 콘텐츠 크롤링 금지
