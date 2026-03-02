import requests
from bs4 import BeautifulSoup, NavigableString, Tag
from datetime import datetime, timedelta
import json
import time
import os
import re

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ko-KR,ko;q=0.9",
}
TOP_N = 10


def make_id(prefix: str, raw_id: str) -> str:
    """안전한 ID 생성 (특수문자 제거)"""
    clean = re.sub(r"[^a-zA-Z0-9_-]", "", str(raw_id))
    return f"{prefix}_{clean}"


# -----------------------------------------
# 공통: 상세 페이지 본문 + 이미지 수집
# -----------------------------------------
def to_absolute_url(src: str, base_url: str = "") -> str:
    """상대 경로를 절대 경로로 변환"""
    if not src:
        return ""
    if src.startswith("http"):
        return src
    if src.startswith("//"):
        return "https:" + src
    if src.startswith("/") and base_url:
        from urllib.parse import urlparse
        parsed = urlparse(base_url)
        return f"{parsed.scheme}://{parsed.netloc}{src}"
    return src


def resolve_img_src(img_tag, base_url: str = "") -> str:
    """이미지 태그에서 실제 URL 추출 (lazy loading, 상대 경로 처리)"""
    src = (
        img_tag.get("data-original")
        or img_tag.get("data-src")
        or img_tag.get("data-lazy-src")
        or img_tag.get("src")
        or ""
    )
    if any(x in src for x in ["loading", "transparent.gif", "blank.", "spacer"]):
        src = img_tag.get("data-original") or img_tag.get("data-src") or ""
    return to_absolute_url(src, base_url)


def is_valid_img(src: str) -> bool:
    if not src or not src.startswith("http"):
        return False
    skip = ["icon", "logo", "ad_", "/ad/", "banner", "emoji", "1x1", "transparent.gif",
            "gallview_loading", "nstatic.dcinside.com/dc/m/img/"]
    return not any(x in src for x in skip)


def sanitize_html(content_el, base_url: str = "") -> str:
    if not content_el:
        return ""
    for tag in content_el.select("script, style, .ad, .adsbygoogle, ins"):
        tag.decompose()
    parts = []
    for el in content_el.descendants:
        if isinstance(el, NavigableString):
            text = str(el).strip()
            if text:
                parts.append(text)
        elif isinstance(el, Tag):
            if el.name == "br":
                parts.append("<br/>")
            elif el.name == "img":
                src = resolve_img_src(el, base_url)
                if is_valid_img(src):
                    parts.append(f'<img src="{src}" alt="" loading="lazy"/>')
            elif el.name == "iframe":
                src = to_absolute_url(el.get("src", ""), base_url)
                if "youtube" in src or "youtu.be" in src:
                    parts.append(f'<iframe src="{src}" width="100%" height="400" frameborder="0" allowfullscreen style="max-width:100%;aspect-ratio:16/9;"></iframe>')
            elif el.name == "video":
                video_src = el.get("src", "")
                source = el.select_one("source")
                if source:
                    video_src = source.get("src", video_src)
                video_src = to_absolute_url(video_src, base_url)
                if video_src and video_src.startswith("http"):
                    parts.append(f'<video src="{video_src}" controls playsinline style="max-width:100%;width:100%;"></video>')
            elif el.name == "p":
                parts.append("<br/>")
    html = " ".join(parts)
    html = re.sub(r"(<br/>\s*){3,}", "<br/><br/>", html)
    return html.strip()


def extract_text_summary(content_el, max_len=150) -> str:
    if not content_el:
        return ""
    text = content_el.get_text(separator=" ", strip=True)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > max_len:
        return text[:max_len] + "..."
    return text


def fetch_detail_content(url: str, content_selector: str, encoding: str = None) -> dict:
    result = {"content": "", "summary": "", "image_urls": []}
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        if encoding:
            res.encoding = encoding
        soup = BeautifulSoup(res.text, "html.parser")
        content = soup.select_one(content_selector)
        if not content:
            return result
        imgs = content.select("img")
        for img in imgs:
            src = resolve_img_src(img, url)
            if is_valid_img(src):
                result["image_urls"].append(src)
        result["content"] = sanitize_html(content, url)
        result["summary"] = extract_text_summary(content)
        return result
    except Exception as e:
        print(f"  상세 페이지 수집 오류 ({url}): {e}")
        return result


def parse_korean_number(text: str) -> int:
    """'1.5만' -> 15000, '3천' -> 3000 등 한국어 약어 숫자 파싱"""
    text = text.strip().replace(",", "")
    if "백만" in text:
        return int(float(text.replace("백만", "")) * 1_000_000)
    elif "만" in text:
        return int(float(text.replace("만", "")) * 10_000)
    elif "천" in text:
        return int(float(text.replace("천", "")) * 1_000)
    else:
        m = re.search(r"\d+", text)
        return int(m.group()) if m else 0


# -----------------------------------------
# 1. 에펨코리아 (Selenium 사용 - 보안 시스템 우회)
# -----------------------------------------
def get_selenium_driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    driver = webdriver.Chrome(options=options)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    })
    return driver


# period별 URL 매핑
FMKOREA_URLS = {
    "daily":    "https://www.fmkorea.com/index.php?mid=humor&sort_index=pop&order_type=desc",
    "weekly":   "https://www.fmkorea.com/index.php?mid=best&sort_index=pop&order_type=desc",
    "monthly":  "https://www.fmkorea.com/index.php?mid=best_of_best&sort_index=pop&order_type=desc",
}

FMKOREA_INFO_URLS = {
    "daily":    "https://www.fmkorea.com/index.php?mid=digital&sort_index=pop&order_type=desc",
    "weekly":   "https://www.fmkorea.com/index.php?mid=digital&sort_index=pop&order_type=desc",
    "monthly":  "https://www.fmkorea.com/index.php?mid=digital&sort_index=pop&order_type=desc",
}

def crawl_fmkorea(period="daily", category="humor", url_map=None):
    if url_map is None:
        url_map = FMKOREA_URLS
    url = url_map.get(period, list(url_map.values())[0])
    try:
        driver = get_selenium_driver()
    except Exception as e:
        print(f"  에펨코리아 Selenium 드라이버 실패: {e}")
        return []

    posts = []
    try:
        driver.get(url)
        time.sleep(5)

        title_els = driver.find_elements(By.CSS_SELECTOR, "h3.title a")
        links_data = []
        for el in title_els[:TOP_N * 2]:
            href = el.get_attribute("href") or ""
            text = el.text.strip()
            if not text or not href:
                continue

            title = re.sub(r"\s*\[\d+\]\s*$", "", text)
            srl_match = re.search(r"document_srl=(\d+)", href)
            doc_id = srl_match.group(1) if srl_match else href.rstrip("/").split("/")[-1].split("?")[0]

            comment_count = 0
            m = re.search(r"\[(\d+)\]", text)
            if m:
                comment_count = int(m.group(1))

            thumbnail_url = None
            try:
                li = el.find_element(By.XPATH, "./ancestor::li")
                imgs = li.find_elements(By.CSS_SELECTOR, "img")
                for img in imgs:
                    src = img.get_attribute("src") or ""
                    if src and "cache/thumb" in src:
                        thumbnail_url = src
                        break
            except:
                pass

            links_data.append({
                "title": title, "href": href, "doc_id": doc_id,
                "comment_count": comment_count, "thumbnail_url": thumbnail_url,
            })

        for data in links_data[:TOP_N]:
            try:
                driver.get(data["href"])
                time.sleep(3)

                page_html = driver.page_source
                soup = BeautifulSoup(page_html, "html.parser")
                content_el = soup.select_one(".xe_content")

                content, summary, image_urls = "", "", []
                view_count, like_count = 0, 0

                if content_el:
                    for img in content_el.select("img"):
                        src = resolve_img_src(img, data["href"])
                        if is_valid_img(src):
                            image_urls.append(src)
                    content = sanitize_html(content_el, data["href"])
                    summary = extract_text_summary(content_el)

                side_el = soup.select_one(".side.fr") or soup.select_one(".btm_area")
                if side_el:
                    side_text = side_el.get_text(strip=True)
                    vm = re.search(r"조회\s*수\s*([\d,]+)", side_text)
                    if vm:
                        view_count = int(vm.group(1).replace(",", ""))
                    lm = re.search(r"추천\s*수\s*([\d,]+)", side_text)
                    if lm:
                        like_count = int(lm.group(1).replace(",", ""))

                if not data["thumbnail_url"] and image_urls:
                    data["thumbnail_url"] = image_urls[0]

                posts.append({
                    "id": make_id("fmkorea", data["doc_id"]),
                    "source": "fmkorea", "source_name": "에펨코리아",
                    "category": category, "period": period,
                    "title": data["title"], "url": data["href"],
                    "thumbnail_url": data["thumbnail_url"],
                    "image_urls": image_urls, "content": content, "summary": summary,
                    "view_count": view_count, "comment_count": data["comment_count"],
                    "like_count": like_count,
                    "crawled_at": datetime.utcnow().isoformat(),
                })
            except Exception as e:
                print(f"  에펨코리아 상세 오류: {e}")
                continue
    except Exception as e:
        print(f"  에펨코리아 접속 실패: {e}")
    finally:
        driver.quit()

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]


# -----------------------------------------
# 2. 디시인사이드
# -----------------------------------------
DCINSIDE_URLS = {
    "daily":    "https://gall.dcinside.com/board/lists/?id=dcbest&page=1",
    "weekly":   "https://gall.dcinside.com/board/lists/?id=dcbest&page=1",
    "monthly":  "https://gall.dcinside.com/board/lists/?id=hit&page=1",
}

def crawl_dcinside(period="daily"):
    url = DCINSIDE_URLS.get(period, DCINSIDE_URLS["daily"])
    headers = {**HEADERS, "Referer": "https://gall.dcinside.com/"}
    try:
        res = requests.get(url, headers=headers, timeout=10)
    except Exception as e:
        print(f"  디시인사이드 접속 실패: {e}")
        return []
    soup = BeautifulSoup(res.text, "html.parser")

    posts = []
    rows = soup.select("tr.ub-content")

    for row in rows[:TOP_N * 2]:
        try:
            if not row.get("data-no"):
                continue
            num_td = row.select_one("td.gall_num")
            if num_td and num_td.get_text(strip=True) in ["공지", "설문", "AD"]:
                continue

            title_a = row.select_one("td.gall_tit a")
            if not title_a:
                continue

            raw_title = title_a.get_text(strip=True)
            match = re.match(r"\[(.+?)\]\s*(.*)", raw_title)
            title = match.group(2) if match else raw_title
            if not title:
                continue

            link = title_a.get("href", "")
            if not link.startswith("http"):
                link = "https://gall.dcinside.com" + link

            doc_id = row.get("data-no", "")

            reply_el = row.select_one("a.reply_numbox")
            comment_count = 0
            if reply_el:
                m = re.findall(r"\d+", reply_el.get_text(strip=True))
                comment_count = int(m[0]) if m else 0

            view_el = row.select_one("td.gall_count")
            view_count = 0
            if view_el:
                vt = view_el.get_text(strip=True).replace(",", "")
                view_count = int(vt) if vt.isdigit() else 0

            rec_el = row.select_one("td.gall_recommend")
            like_count = 0
            if rec_el:
                rt = rec_el.get_text(strip=True).replace(",", "")
                like_count = int(rt) if rt.isdigit() else 0

            detail = fetch_detail_content(link, ".writing_view_box")
            time.sleep(1)

            thumbnail_url = detail["image_urls"][0] if detail["image_urls"] else None

            posts.append({
                "id": make_id("dcinside", doc_id),
                "source": "dcinside", "source_name": "디시인사이드",
                "category": "issue", "period": period,
                "title": title, "url": link,
                "thumbnail_url": thumbnail_url,
                "image_urls": detail["image_urls"],
                "content": detail["content"], "summary": detail["summary"],
                "view_count": view_count, "comment_count": comment_count,
                "like_count": like_count,
                "crawled_at": datetime.utcnow().isoformat(),
            })
        except Exception as e:
            print(f"  디시 항목 오류: {e}")
            continue

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]


# -----------------------------------------
# 3. 루리웹
# -----------------------------------------
RULIWEB_URLS = {
    "daily":    "https://bbs.ruliweb.com/best/humor_only",
    "weekly":   "https://bbs.ruliweb.com/best/humor_only?orderby=readcount&range=weekly",
    "monthly":  "https://bbs.ruliweb.com/best/humor_only?orderby=readcount&range=monthly",
}

def crawl_ruliweb(period="daily"):
    url = RULIWEB_URLS.get(period, RULIWEB_URLS["daily"])
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
    except Exception as e:
        print(f"  루리웹 접속 실패: {e}")
        return []
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

            id_match = re.search(r"/read/(\d+)", link)
            doc_id = id_match.group(1) if id_match else link.split("/")[-1].split("?")[0]

            view_el = item.select_one(".col_view")
            view_count = int(view_el.get_text(strip=True).replace(",", "")) if view_el else 0

            like_el = item.select_one(".col_recomd")
            like_count = int(like_el.get_text(strip=True).replace(",", "")) if like_el else 0

            detail = fetch_detail_content(link, ".view_content")
            time.sleep(1)

            thumbnail_url = detail["image_urls"][0] if detail["image_urls"] else None

            posts.append({
                "id": make_id("ruliweb", doc_id),
                "source": "ruliweb", "source_name": "루리웹",
                "category": "humor", "period": period,
                "title": title, "url": link,
                "thumbnail_url": thumbnail_url,
                "image_urls": detail["image_urls"],
                "content": detail["content"], "summary": detail["summary"],
                "view_count": view_count, "comment_count": 0,
                "like_count": like_count,
                "crawled_at": datetime.utcnow().isoformat(),
            })
        except Exception as e:
            print(f"  루리웹 항목 오류: {e}")
            continue

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]


# -----------------------------------------
# 4. 보배드림
# -----------------------------------------
def crawl_bobaedream(period="daily"):
    url = "https://www.bobaedream.co.kr/list?code=best"
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        res.encoding = "euc-kr"
    except Exception as e:
        print(f"  보배드림 접속 실패: {e}")
        return []
    res.encoding = "utf-8"
    soup = BeautifulSoup(res.text, "html.parser")

    posts = []
    rows = soup.select("#boardlist tbody tr")

    for row in rows[:TOP_N * 2]:
        try:
            title_el = row.select_one("a.bsubject")
            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            href = title_el["href"]
            link = "https://www.bobaedream.co.kr" + href if not href.startswith("http") else href

            no_match = re.search(r"No=(\d+)", href)
            doc_id = no_match.group(1) if no_match else href.split("/")[-1].split("?")[0]

            tds = row.find_all("td")
            view_count, like_count, comment_count = 0, 0, 0

            count_td = row.select_one("td.count")
            if count_td:
                ct = count_td.get_text(strip=True).replace(",", "")
                view_count = int(ct) if ct.isdigit() else 0

            recomm_td = row.select_one("td.recomm")
            if recomm_td:
                rt = recomm_td.get_text(strip=True).replace(",", "")
                like_count = int(rt) if rt.isdigit() else 0

            comment_el = row.select_one("span.Comment")
            if comment_el:
                m = re.search(r"\((\d+)\)", comment_el.get_text(strip=True))
                comment_count = int(m.group(1)) if m else 0

            detail = fetch_detail_content(link, ".bodyCont", encoding="utf-8")
            time.sleep(1)

            thumbnail_url = detail["image_urls"][0] if detail["image_urls"] else None

            posts.append({
                "id": make_id("bobaedream", doc_id),
                "source": "bobaedream", "source_name": "보배드림",
                "category": "issue", "period": period,
                "title": title, "url": link,
                "thumbnail_url": thumbnail_url,
                "image_urls": detail["image_urls"],
                "content": detail["content"], "summary": detail["summary"],
                "view_count": view_count, "comment_count": comment_count,
                "like_count": like_count,
                "crawled_at": datetime.utcnow().isoformat(),
            })
        except Exception as e:
            print(f"  보배드림 항목 오류: {e}")
            continue

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]


# -----------------------------------------
# 5. 도그드립
# -----------------------------------------
DOGDRIP_URLS = {
    "daily":    "https://www.dogdrip.net/dogdrip?sort_index=popular",
    "weekly":   "https://www.dogdrip.net/dogdrip?sort_index=popular&period=weekly",
    "monthly":  "https://www.dogdrip.net/dogdrip?sort_index=popular&period=monthly",
}

def crawl_dogdrip(period="daily"):
    url = DOGDRIP_URLS.get(period, DOGDRIP_URLS["daily"])
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
    except Exception as e:
        print(f"  도그드립 접속 실패: {e}")
        return []
    soup = BeautifulSoup(res.text, "html.parser")

    posts = []
    items = soup.select("ul.ed.list > li.webzine:not(.notice)")

    for item in items[:TOP_N * 2]:
        try:
            if item.select_one("#npl-list") or item.select_one("span.badge-ad-sm-v2"):
                continue

            a_tag = item.select_one("a.title-link")
            if not a_tag:
                continue

            title = a_tag.get_text(strip=True)
            link = a_tag.get("href", "")
            if not link.startswith("http"):
                link = "https://www.dogdrip.net" + link

            doc_srl = a_tag.get("data-document-srl", "")
            if not doc_srl:
                doc_srl = link.rstrip("/").split("/")[-1].split("?")[0]

            comment_span = item.select_one("h5.title span.text-xxsmall")
            comment_count = 0
            if comment_span:
                m = re.search(r"\d+", comment_span.get_text(strip=True))
                comment_count = int(m.group()) if m else 0

            vote_spans = item.select("div.list-meta span.margin-right-xsmall span.text-primary")
            like_count = 0
            if vote_spans:
                m = re.search(r"\d+", vote_spans[-1].get_text(strip=True))
                like_count = int(m.group()) if m else 0

            thumb_img = item.select_one("img.webzine-thumbnail")
            thumbnail_url = None
            if thumb_img:
                thumbnail_url = thumb_img.get("src")
                if thumbnail_url and thumbnail_url.startswith("/"):
                    thumbnail_url = "https://www.dogdrip.net" + thumbnail_url

            detail = fetch_detail_content(link, ".xe_content")
            time.sleep(1)

            posts.append({
                "id": make_id("dogdrip", doc_srl),
                "source": "dogdrip", "source_name": "도그드립",
                "category": "humor", "period": period,
                "title": title, "url": link,
                "thumbnail_url": thumbnail_url,
                "image_urls": detail["image_urls"],
                "content": detail["content"], "summary": detail["summary"],
                "view_count": 0, "comment_count": comment_count,
                "like_count": like_count,
                "crawled_at": datetime.utcnow().isoformat(),
            })
        except Exception as e:
            print(f"  도그드립 항목 오류: {e}")
            continue

    posts.sort(key=lambda x: x["like_count"], reverse=True)
    return posts[:TOP_N]


# -----------------------------------------
# 6. 클리앙
# -----------------------------------------
CLIEN_URLS = {
    "daily":    "https://www.clien.net/service/board/lecture",
    "weekly":   "https://www.clien.net/service/board/lecture",
    "monthly":  "https://www.clien.net/service/board/lecture",
}

def crawl_clien(period="daily"):
    url = CLIEN_URLS.get(period, CLIEN_URLS["daily"])
    try:
        res = requests.get(url, headers={**HEADERS, "Referer": "https://www.clien.net/"}, timeout=10)
    except Exception as e:
        print(f"  클리앙 접속 실패: {e}")
        return []
    soup = BeautifulSoup(res.text, "html.parser")

    posts = []
    items = soup.select("div.list_item.symph_row")

    for item in items[:TOP_N * 2]:
        try:
            if "notice" in item.get("class", []):
                continue

            title_a = item.select_one("a.list_subject")
            if not title_a:
                continue

            title_span = title_a.select_one("span.subject_fixed")
            title = title_span.get_text(strip=True) if title_span else title_a.get("title", title_a.get_text(strip=True))
            if not title:
                continue

            href = title_a.get("href", "")
            link = "https://www.clien.net" + href if not href.startswith("http") else href

            doc_id = item.get("data-board-sn", "")
            if not doc_id:
                id_match = re.search(r"/(\d+)", href)
                doc_id = id_match.group(1) if id_match else href.split("/")[-1].split("?")[0]

            view_count = 0
            hit_el = item.select_one("div.list_hit span.hit")
            if hit_el:
                view_count = parse_korean_number(hit_el.get_text(strip=True))

            comment_count = 0
            comment_attr = item.get("data-comment-count", "0")
            try:
                comment_count = int(comment_attr)
            except ValueError:
                pass

            like_count = 0
            symph_el = item.select_one("div.list_symph span")
            if symph_el:
                m = re.search(r"\d+", symph_el.get_text(strip=True))
                like_count = int(m.group()) if m else 0

            detail = fetch_detail_content(link, "div.post_article")
            time.sleep(1)

            thumbnail_url = detail["image_urls"][0] if detail["image_urls"] else None

            posts.append({
                "id": make_id("clien", doc_id),
                "source": "clien", "source_name": "클리앙",
                "category": "info", "period": period,
                "title": title, "url": link,
                "thumbnail_url": thumbnail_url,
                "image_urls": detail["image_urls"],
                "content": detail["content"], "summary": detail["summary"],
                "view_count": view_count, "comment_count": comment_count,
                "like_count": like_count,
                "crawled_at": datetime.utcnow().isoformat(),
            })
        except Exception as e:
            print(f"  클리앙 항목 오류: {e}")
            continue

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]


# -----------------------------------------
# 7. 뽐뿌
# -----------------------------------------
def crawl_ppomppu(period="daily"):
    url = "https://www.ppomppu.co.kr/hot.php"
    ppomppu_headers = {**HEADERS, "Referer": "https://www.ppomppu.co.kr/"}
    try:
        res = requests.get(url, headers=ppomppu_headers, timeout=10)
        res.encoding = "euc-kr"
    except Exception as e:
        print(f"  뽐뿌 접속 실패: {e}")
        return []
    soup = BeautifulSoup(res.text, "html.parser")

    posts = []
    rows = soup.select("table.board_table tr.baseList")

    for row in rows[:TOP_N * 2]:
        try:
            title_a = row.select_one("a.baseList-title")
            if not title_a:
                continue

            title_clone = title_a.__copy__()
            for span in title_clone.select("span"):
                span.decompose()
            title = title_clone.get_text(strip=True)
            if not title:
                continue

            href = title_a.get("href", "")
            link = "https://www.ppomppu.co.kr" + href if href.startswith("/") else href
            if not link.startswith("http"):
                link = "https://www.ppomppu.co.kr/" + href

            no_match = re.search(r"no=(\d+)", href)
            doc_id = no_match.group(1) if no_match else href.split("/")[-1].split("?")[0]

            thumbnail_url = None
            thumb_a = row.select_one("a.baseList-thumb")
            if thumb_a:
                thumb_img = thumb_a.select_one("img")
                if thumb_img:
                    thumb_src = thumb_img.get("src", "")
                    thumbnail_url = to_absolute_url(thumb_src, "https://www.ppomppu.co.kr")
                    if thumbnail_url and ("noimage" in thumbnail_url or "blank" in thumbnail_url):
                        thumbnail_url = None

            board_date_tds = row.select("td.board_date")
            view_count, like_count = 0, 0

            if len(board_date_tds) >= 1:
                vt = board_date_tds[-1].get_text(strip=True).replace(",", "")
                view_count = int(vt) if vt.isdigit() else 0
            if len(board_date_tds) >= 2:
                rec_text = board_date_tds[-2].get_text(strip=True)
                m = re.search(r"(\d+)", rec_text)
                like_count = int(m.group(1)) if m else 0

            comment_count = 0
            comment_span = row.select_one("span.list_comment2")
            if comment_span:
                m = re.search(r"\d+", comment_span.get_text(strip=True))
                comment_count = int(m.group()) if m else 0

            detail_url = link.replace("zboard.php", "view.php")
            detail = fetch_detail_content(detail_url, "td.han", encoding="euc-kr")
            time.sleep(1)

            if not thumbnail_url and detail["image_urls"]:
                thumbnail_url = detail["image_urls"][0]

            posts.append({
                "id": make_id("ppomppu", doc_id),
                "source": "ppomppu", "source_name": "뽐뿌",
                "category": "info", "period": period,
                "title": title, "url": link,
                "thumbnail_url": thumbnail_url,
                "image_urls": detail["image_urls"],
                "content": detail["content"], "summary": detail["summary"],
                "view_count": view_count, "comment_count": comment_count,
                "like_count": like_count,
                "crawled_at": datetime.utcnow().isoformat(),
            })
        except Exception as e:
            print(f"  뽐뿌 항목 오류: {e}")
            continue

    posts.sort(key=lambda x: x["view_count"], reverse=True)
    return posts[:TOP_N]


# -----------------------------------------
# 8. JSON 저장 / 로드
# -----------------------------------------
POST_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "data", "posts.json")
MAX_AGE_DAYS = 7  # 7일 이상 된 글 삭제

def load_existing_posts():
    try:
        with open(POST_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_to_json(posts):
    output_dir = os.path.dirname(POST_JSON_PATH)
    os.makedirs(output_dir, exist_ok=True)
    with open(POST_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"posts.json 저장 완료 ({len(posts)}개)")

def merge_posts(existing, new_posts):
    """기존 글 보존 + 새 글 추가 (같은 id+period면 새 글로 갱신, 오래된 글 삭제)"""
    cutoff = datetime.utcnow() - timedelta(days=MAX_AGE_DAYS)

    # 기존 글을 dict로
    post_map = {}
    for p in existing:
        key = (p["id"], p["period"])
        post_map[key] = p

    # 새 글로 갱신/추가
    for p in new_posts:
        key = (p["id"], p["period"])
        post_map[key] = p

    # 오래된 글 삭제
    result = []
    for p in post_map.values():
        try:
            crawled = datetime.fromisoformat(p["crawled_at"])
            if crawled >= cutoff:
                result.append(p)
        except (ValueError, KeyError):
            result.append(p)

    # 최신순 정렬
    result.sort(key=lambda x: x.get("crawled_at", ""), reverse=True)
    return result


# -----------------------------------------
# 9. 메인
# -----------------------------------------
def main():
    print("크롤링 시작...")
    existing_posts = load_existing_posts()
    print(f"기존 게시글: {len(existing_posts)}개")

    new_posts = []

    # period별 크롤러: (사이트명, 함수, 기간별 URL 지원 여부)
    crawlers = [
        ("에펨코리아", crawl_fmkorea, True),
        ("에펨코리아 디지털", lambda period="daily": crawl_fmkorea(period=period, category="info", url_map=FMKOREA_INFO_URLS), True),
        ("디시인사이드", crawl_dcinside, True),
        ("루리웹", crawl_ruliweb, True),
        ("보배드림", crawl_bobaedream, False),
        ("도그드립", crawl_dogdrip, True),
        ("클리앙", crawl_clien, True),
        ("뽐뿌", crawl_ppomppu, False),
    ]

    periods = ["daily", "weekly", "monthly"]

    for period in periods:
        print(f"\n=== {period} 수집 ===")
        for name, crawler, supports_period in crawlers:
            try:
                if supports_period:
                    print(f"  {name} ({period}) 수집 중...")
                    posts = crawler(period=period)
                elif period == "daily":
                    # period 미지원 사이트는 daily에서만 크롤링
                    print(f"  {name} (daily only) 수집 중...")
                    posts = crawler(period="daily")
                else:
                    continue
                new_posts.extend(posts)
                print(f"  {name}: {len(posts)}개")
                time.sleep(2)
            except Exception as e:
                print(f"  {name} 오류: {e}")

    print(f"\n새로 수집: {len(new_posts)}개")
    merged = merge_posts(existing_posts, new_posts)
    save_to_json(merged)
    print(f"총 {len(merged)}개 완료! (기존 {len(existing_posts)} → 병합 후 {len(merged)})")


if __name__ == "__main__":
    main()
