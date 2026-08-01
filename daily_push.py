# -*- coding: utf-8 -*-
"""
可转债上市提醒 —— 本机推送脚本（翼然电脑每天 8:30 自动跑）
=====================================================
为什么需要它：
  PythonAnywhere 免费版 Web 进程出不去外网（Server酱/PushPlus 都被网关 403 拦截），
  所以「真正发微信」这一步必须放在能访问外网的机器上 —— 即翼然的本机电脑。

做什么：
  1. 调 PA 的 /api/snapshot 拿到所有「已配 SendKey 且含账户」的用户 + 他们的可转债
  2. 本地过滤出「今天/明天上市」的（按每人的提醒时机设置）
  3. 用 Server酱 免费通道（SCT 开头 SendKey）直接推到对应用户微信
  4. 推送成功后调 /api/mark-notified 标记，避免重复推

零成本：Server酱 免费版每天 5 条/账号，足够低频的可转债提醒。
朋友侧：免费、无需实名，只需关注「方糖 Server酱」公众号。

用法：
  手动跑：  python daily_push.py
  定时跑：  用 Windows 任务计划程序，每天 8:30 触发，执行本文件
"""
import os
import sys
import json
import time
import ssl
import datetime
import urllib.parse
import urllib.request

# ========== 配置（云端用环境变量注入，本地跑用默认值） ==========
PA_BASE = os.environ.get("PA_BASE") or "https://yirankzz.pythonanywhere.com"
# cron_key 可在网页底部「定时任务触发密钥」看到，或从 PA /api/state 拿到。
# GitHub Actions 里通过 Secrets 注入 CRON_KEY，不写进代码仓库。
CRON_KEY = os.environ.get("CRON_KEY") or "cron-uVTG2p3qPWHSE2gc4NCgjQ"
# 若 CRON_KEY 留空，用一个任意 user token 去 /api/state 拿 cron_key（仅读，不改数据）
FALLBACK_USER_TOKEN = "local-dev"
# 是否在 CI 环境（GitHub Actions）里跑 —— CI 里不写本地日志文件
IN_CI = os.environ.get("GITHUB_ACTIONS") == "true"

BJ_TZ = datetime.timezone(datetime.timedelta(hours=8))

def beijing_now():
    """GitHub Actions 跑在 UTC，统一换算成北京时间，否则日期会差一天。"""
    return datetime.datetime.now(datetime.timezone.utc).astimezone(BJ_TZ)

def beijing_today():
    return beijing_now().date()

CTX = ssl.create_default_context()

def http_json(url, method="GET", data=None, headers=None, retry=6):
    hdrs = {"Content-Type": "application/json; charset=utf-8"}
    if headers:
        hdrs.update(headers)
    body = json.dumps(data).encode("utf-8") if data is not None else None
    last = None
    for i in range(retry):
        try:
            req = urllib.request.Request(url, data=body, method=method, headers=hdrs)
            with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
                return r.status, json.loads(r.read().decode("utf-8", "ignore"))
        except Exception as e:
            last = e
            time.sleep(1 + i * 0.6)
    return 0, {"error": str(last)}

def push_serverchan(sendkey, title, desp):
    """Server酱 免费通道：SCT 开头 SendKey，直接 POST，本机出得去外网。"""
    url = "https://sctapi.ftqq.com/%s.send" % sendkey
    fd = urllib.parse.urlencode({"title": title, "desp": desp}).encode("utf-8")
    req = urllib.request.Request(url, data=fd,
                                 headers={"User-Agent": "Mozilla/5.0"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15, context=CTX) as r:
            d = json.loads(r.read().decode("utf-8", "ignore"))
            if d.get("code") == 0:
                return True, "Server酱推送成功"
            return False, "Server酱返回: %s" % d.get("message", d)
    except Exception as e:
        return False, "推送失败: %s" % e

# ----------------------------------------------------------------------------
# 补抓上市日：PA 免费版出站到东方财富被 403，自身抓不到；
# 但云端 runner / 本机都能出网 —— 由这里每天轮询补齐空白上市日，再回写 PA。
# ----------------------------------------------------------------------------
EM_URL = ("https://datacenter-web.eastmoney.com/api/data/v1/get"
          "?reportName=RPT_BOND_CB_LIST"
          "&columns=SECURITY_CODE,SECURITY_NAME_ABBR,LISTING_DATE"
          "&pageSize=10&pageNumber=1")

def fetch_listing_date(code, name=""):
    """查东方财富 RPT_BOND_CB_LIST，返回 'YYYY-MM-DD' 或 None。"""
    candidates = []
    if code:
        candidates.append(('SECURITY_CODE', code))
    if name:
        candidates.append(('SECURITY_NAME_ABBR', name))
    for field, val in candidates:
        try:
            flt = urllib.parse.quote('(%s="%s")' % (field, val))
            url = EM_URL + "&filter=" + flt
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            raw = urllib.request.urlopen(req, timeout=15, context=CTX).read()
            d = json.loads(raw)
            rows = (d.get("result") or {}).get("data") or []
            for r in rows:
                ld = r.get("LISTING_DATE")
                if ld:
                    return ld[:10]
        except Exception:
            continue
    return None

def catch_up_listing_dates(users, key):
    """对 listing_date 为空的债，每天查东方财富补齐：
       - 回写 PA（/api/update-listing-date）持久化，不依赖本机记忆；
       - 同时就地改 users 内存，让本次推送循环立即用上新上市日。
    返回更新条数。"""
    updates = []
    for u in users:
        for acc in u.get("accounts", []):
            for b in acc.get("bonds", []):
                if b.get("listing_date"):
                    continue
                code = b.get("code", "")
                name = b.get("name", "")
                nd = fetch_listing_date(code, name)
                if nd:
                    b["listing_date"] = nd   # 就地生效，供后续推送判断
                    updates.append({"id": b.get("id"), "listing_date": nd, "source": "auto"})
    if updates:
        st, resp = http_json("%s/api/update-listing-date" % PA_BASE, method="POST",
                             data={"key": key, "updates": updates})
        ok = (st == 200 and resp.get("ok"))
        print("[daily_push] 补抓上市日：更新 %d 条 -> %s" % (
            len(updates), (resp if ok else "%s %s" % (st, resp))))
    else:
        print("[daily_push] 补抓上市日：无需更新（全部已有 / 东财暂未公布）")
    return len(updates)

def resolve_cron_key():
    if CRON_KEY:
        return CRON_KEY
    # 从 /api/state 拿
    st, d = http_json("%s/api/state" % PA_BASE,
                      headers={"X-User-Token": FALLBACK_USER_TOKEN})
    if st == 200 and d.get("cron_key"):
        return d["cron_key"]
    return None

def main():
    FORCE = os.environ.get("DAILY_PUSH_FORCE") in ("1", "true", "yes")
    _bjnow = beijing_now()
    print("[daily_push] 启动 北京时间 %s%s%s" % (
        _bjnow.strftime("%Y-%m-%d %H:%M:%S"),
        " (FORCE 模式)" if FORCE else "",
        " [GitHub Actions 云端]" if IN_CI else " [本机]"))
    key = resolve_cron_key()
    if not key:
        print("[daily_push] 无法获取 cron_key，退出")
        return
    print("[daily_push] cron_key = %s" % key)

    st, snap = http_json("%s/api/snapshot?key=%s" % (PA_BASE, key))
    if st != 200:
        print("[daily_push] snapshot 失败 status=%s %s" % (st, snap))
        return
    users = snap.get("users", [])
    print("[daily_push] 拿到 %d 个已配置用户" % len(users))

    today = beijing_today()   # 用北京时间的今天，云端 UTC 也不会错日
    print("[daily_push] 基准日期（北京时间今天）= %s" % today)

    # 步骤 0：补抓上市日（每天轮询东方财富补齐空白，再回写 PA）
    catch_up_listing_dates(users, key)

    total = 0
    for u in users:
        sendkey = u.get("sendkey", "")
        # 免费通道定位：只用 Server酱（SCT 开头）。其他 key 跳过，不推。
        if not sendkey.startswith("SCT"):
            print("  [跳过] 非 Server酱(SCT) key，不参与免费推送: %s..." % sendkey[:6])
            continue
        remind = int(u.get("remind_mode", "0") or 0)
        for acc in u.get("accounts", []):
            for b in acc.get("bonds", []):
                if b.get("notified"):
                    continue
                ld = b.get("listing_date")
                if not ld:
                    continue
                try:
                    ld_date = datetime.date.fromisoformat(ld[:10])
                except Exception:
                    continue
                delta = (ld_date - today).days
                hit = False
                if remind == 0 and delta == 0:
                    hit = True
                elif remind == 1 and delta == 1:
                    hit = True
                elif remind == 2 and delta in (0, 1):
                    hit = True
                if not FORCE and not hit:
                    continue

                title = "可转债上市提醒：%s" % (b.get("name") or b.get("code"))
                desp = (
                    "## 可转债上市提醒\n\n"
                    "> 你中签的可转债到上市节点了，记得盯走势决定卖不卖。\n\n"
                    "**账户**：%s  \n"
                    "**转债**：%s（%s）  \n"
                    "**持仓**：中签 %s 张  \n"
                    "**上市日**：%s  \n\n"
                    "上市首日通常有溢价，可关注开盘价与分时走势，按自己的止盈计划操作。"
                ) % (acc.get("name", "—"), b.get("name") or "—", b.get("code") or "—",
                     b.get("amount") or "?", ld[:10])

                ok, msg = push_serverchan(sendkey, title, desp)
                print("  [%s] %s/%s -> %s" % ("OK" if ok else "FAIL",
                                              acc.get("name", ""), b.get("name", ""), msg))
                if ok:
                    total += 1
                    # 标记已推送
                    http_json("%s/api/mark-notified" % PA_BASE, method="POST",
                              data={"key": key, "bond_id": b.get("id")})
    print("[daily_push] 本次共推送 %d 条" % total)

if __name__ == "__main__":
    if IN_CI:
        # GitHub Actions：直接输出到 Actions 日志，不写本地文件
        main()
        sys.exit(0)
    import io
    _log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "daily_push.log")
    _logf = open(_log_path, "a", encoding="utf-8")
    class _Tee(io.TextIOBase):
        def __init__(self, *streams):
            self.streams = streams
        def write(self, s):
            for f in self.streams:
                f.write(s)
            return len(s)
        def flush(self):
            for f in self.streams:
                try: f.flush()
                except Exception: pass
    sys.stdout = _Tee(sys.stdout, _logf)
    sys.stderr = _Tee(sys.stderr, _logf)
    main()
    _logf.close()
