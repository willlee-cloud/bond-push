// 生成「可转债潜伏配债汇总看板」：
// 1) 读取截图/公告数据生成 34 只标的 DATA
// 2) 在 DATA 中补充单页生成所需字段（rating / lockShares / lockRatio / 等）
// 3) 叠加实时股价 + 最优档位测算（安全垫最高档）
// 4) 把单页模板 template.html 内嵌为字符串，点击代码联动生成单页
// 5) 输出看板到 common_apps 工作区 与 vault 研究目录

const fs = require('fs');
const path = require('path');

const BOARD_SRC = process.env.BOARD_PATH ? path.resolve(__dirname, process.env.BOARD_PATH) : 'D:/WeGameApps/common_apps/可转债潜伏配债汇总看板.html';
const TPL = process.env.TPL_PATH ? path.resolve(__dirname, process.env.TPL_PATH) : 'C:/Users/戴尔/.workbuddy/skills/可转债潜伏配债/template.html';
const VAULT = process.env.VAULT_PATH ? path.resolve(__dirname, process.env.VAULT_PATH) : '';
const TABLE = '2026-08-17';
const ADDDATE_FILE = path.resolve(__dirname, 'addDates.json');

// 加表日期 sidecar：每只标的独立维护何时开始关注
// 缺失/未填 → 留空字符串 → 展示为「—」；不再默认到 TABLE(那是制表日)
let ADDDATE_MAP = {};
try { ADDDATE_MAP = JSON.parse(fs.readFileSync(ADDDATE_FILE, 'utf8')); } catch (e) { ADDDATE_MAP = {}; }

let html = fs.readFileSync(BOARD_SRC, 'utf8');

// 关键修复：统一换行为 LF。本地 Windows 生成的看板是 CRLF(\r\n)，
// 而下面的清理/注入/替换正则均以 \n 为准；若不归一，旧 DATA/TEMPLATE 块删不掉、
// 新数据也注入不进去（导致 301297 等标的被静默漏掉）。归一后本地与云端(GA, LF)输出一致。
html = html.replace(/\r\n/g, '\n');

// 先清理旧生成残留，防止反复重跑时 const TEMPLATE / DATA 重复声明
html = html.replace(/const TEMPLATE = ".*?";\n/sg, '');
html = html.replace(/const DATA = [\s\S]*?;\nconst BYCODE = \{\}; DATA\.forEach\(d => BYCODE\[d\.code\] = d\);\n/sg, '');

// —— 34 只标的完整数据（参考用户截图 + westock 实时价）——
// price 字段 = 制表股价（截图/公告当日快照）；rtPrice 由 westock 实时行情补充
const DATA = [
  {
    "code": "605123",
    "name": "派克新材",
    "bond": "派克转债",
    "board": "沪市主板",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 15.8,
    "conv": 81.8,
    "price": 78.12,
    "perShare": 13.039,
    "reg": "2026-08-05",
    "pay": "2026-08-06",
    "fs": 6.98,
    "ind": "航空装备Ⅱ",
    "rating": "AA",
    "progressDate": "2026-08-06",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockShares": "67620000",
    "lockList": [
      {
        "name": "宗丽萍",
        "pct": 33.23
      },
      {
        "name": "是玉丰",
        "pct": 20.18
      },
      {
        "name": "无锡众智恒达投资企业(有限合伙)",
        "pct": 2.39
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "688605",
    "name": "先锋精科",
    "bond": "先锋转债",
    "board": "沪市科创",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 7.5,
    "conv": 86.4,
    "price": 78.1,
    "perShare": 3.705,
    "reg": "2026-08-05",
    "pay": "2026-08-06",
    "fs": null,
    "ind": "半导体",
    "rating": "AA",
    "progressDate": "2026-08-06",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301565",
    "name": "中仑新材",
    "bond": "中仑转债",
    "board": "深市创业",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 10.68,
    "conv": 20.28,
    "price": 19.63,
    "perShare": 2.6699,
    "reg": "2026-08-05",
    "pay": "2026-08-06",
    "fs": 3.04,
    "ind": "塑料",
    "rating": "AA-",
    "progressDate": "2026-08-06",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockShares": "285999500",
    "lockList": [
      {
        "name": "中仑科技集团有限公司",
        "pct": 52.27
      },
      {
        "name": "Strait Co, Ltd.",
        "pct": 7.75
      },
      {
        "name": "厦门中仑海清股权投资合伙企业(有限合伙)",
        "pct": 7.65
      },
      {
        "name": "厦门中仑海杰股权投资合伙企业(有限合伙)",
        "pct": 3.82
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "688686",
    "name": "奥普特",
    "bond": "奥普转债",
    "board": "沪市科创",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 12.7,
    "conv": 150.03,
    "price": 116.13,
    "perShare": 10.396,
    "reg": "2026-07-28",
    "pay": "2026-07-29",
    "fs": 3.53,
    "ind": "自动化设备",
    "rating": "AA",
    "progressDate": "2026-07-29",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockShares": "88207566",
    "lockList": [
      {
        "name": "卢治临",
        "pct": 29.85
      },
      {
        "name": "卢盛林",
        "pct": 29.2
      },
      {
        "name": "许学亮",
        "pct": 7.31
      },
      {
        "name": "宁波千智创业投资合伙企业(有限合伙)",
        "pct": 5.81
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "605016",
    "name": "百龙创园",
    "bond": "百龙创园转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 7.48,
    "conv": 21.43,
    "price": 19.79,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "化学制品",
    "rating": "-",
    "progressDate": "2026-05-06",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "300634",
    "name": "彩讯股份",
    "bond": "彩讯股份转债",
    "board": "深市创业",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 12.7,
    "conv": 20.28,
    "price": 21.87,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "IT服务Ⅱ",
    "rating": "-",
    "progressDate": "2026-04-29",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "001316",
    "name": "润贝航科",
    "bond": "润贝航科转债",
    "board": "深市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 4.3,
    "conv": 25.7,
    "price": 26.6,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "炼化及贸易",
    "rating": "-",
    "progressDate": "2026-04-25",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "300447",
    "name": "全信股份",
    "bond": "全信股份转债",
    "board": "深市创业",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 2.45,
    "conv": 13.1,
    "price": 13.86,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "军工电子Ⅱ",
    "rating": "-",
    "progressDate": "2026-04-20",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301018",
    "name": "申菱环境",
    "bond": "申菱环境转债",
    "board": "深市创业",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 10,
    "conv": 84.17,
    "price": 92.6,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "通用设备",
    "rating": "-",
    "progressDate": "2026-04-10",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301379",
    "name": "天山电子",
    "bond": "天山电子转债",
    "board": "深市创业",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 6.97,
    "conv": 22.31,
    "price": 23.33,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "光学光电子",
    "rating": "-",
    "progressDate": "2026-03-11",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "300181",
    "name": "佐力药业",
    "bond": "佐力药业转债",
    "board": "深市创业",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 13.71,
    "conv": 14.47,
    "price": 14.94,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "中药Ⅱ",
    "rating": "-",
    "progressDate": "2026-02-27",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "300660",
    "name": "江苏雷利",
    "bond": "江苏雷利转债",
    "board": "深市创业",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 12.86,
    "conv": 26.73,
    "price": 26.75,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "电机Ⅱ",
    "rating": "-",
    "progressDate": "2025-12-09",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "600089",
    "name": "特变电工",
    "bond": "特变电工转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 80,
    "conv": 20.74,
    "price": 20.87,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "电网设备",
    "rating": "-",
    "progressDate": "2025-09-27",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "600577",
    "name": "精达股份",
    "bond": "精达股份转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 9.56,
    "conv": 7.67,
    "price": 8.11,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "电网设备",
    "rating": "-",
    "progressDate": "2025-06-26",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "603093",
    "name": "南华期货",
    "bond": "南华期货转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 12,
    "conv": 12.03,
    "price": 11.89,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "多元金融",
    "rating": "-",
    "progressDate": "2023-05-18",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "601528",
    "name": "瑞丰银行",
    "bond": "瑞丰银行转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 50,
    "conv": 8.99,
    "price": 4.86,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "银行Ⅱ",
    "rating": "-",
    "progressDate": "2023-01-20",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "601577",
    "name": "长沙银行",
    "bond": "长沙银行转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 110,
    "conv": 12.19,
    "price": 9.18,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "银行Ⅱ",
    "rating": "-",
    "progressDate": "2022-09-28",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "601187",
    "name": "厦门银行",
    "bond": "厦门银行转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 50,
    "conv": 7.68,
    "price": 7.37,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "银行Ⅱ",
    "rating": "-",
    "progressDate": "2022-09-27",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301479",
    "name": "弘景光电",
    "bond": "弘景光电转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 6.3,
    "conv": 47.96,
    "price": 55.36,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "光学光电子",
    "rating": "-",
    "progressDate": "2026-08-10",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "300695",
    "name": "兆丰股份",
    "bond": "兆丰股份转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 14,
    "conv": 47.31,
    "price": 51.96,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "汽车零部件",
    "rating": "-",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "688261",
    "name": "东微半导",
    "bond": "东微半导转债",
    "board": "沪市科创",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 14.36,
    "conv": 69.72,
    "price": 71.35,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "半导体",
    "rating": "-",
    "progressDate": "2026-07-21",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "300428",
    "name": "立中集团",
    "bond": "立中集团转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 11.8,
    "conv": 18.68,
    "price": 18.67,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "汽车零部件",
    "rating": "-",
    "progressDate": "2026-07-20",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "002978",
    "name": "安宁股份",
    "bond": "安宁股份转债",
    "board": "深市主板",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 25,
    "conv": 26.46,
    "price": 26.04,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "小金属",
    "rating": "-",
    "progressDate": "2026-06-17",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "603499",
    "name": "翔港科技",
    "bond": "翔港科技转债",
    "board": "沪市主板",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 4.78,
    "conv": 11.47,
    "price": 12.75,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "包装印刷",
    "rating": "-",
    "progressDate": "2026-06-16",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "001203",
    "name": "大中矿业",
    "bond": "大中矿业转债",
    "board": "深市主板",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 25,
    "conv": 26.99,
    "price": 27.77,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "冶钢原料",
    "rating": "-",
    "progressDate": "2026-06-02",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301585",
    "name": "蓝宇股份",
    "bond": "蓝宇股份转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 4.73,
    "conv": 26.37,
    "price": 27.52,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "化学制品",
    "rating": "-",
    "progressDate": "2026-05-27",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "688372",
    "name": "伟测科技",
    "bond": "伟测科技转债",
    "board": "沪市科创",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 20,
    "conv": 120.68,
    "price": 130.01,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "半导体",
    "rating": "-",
    "progressDate": "2026-05-23",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "688390",
    "name": "固德威",
    "bond": "固德威转债",
    "board": "沪市科创",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 14.8,
    "conv": 65.44,
    "price": 67.26,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "光伏设备",
    "rating": "-",
    "progressDate": "2026-05-21",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301263",
    "name": "泰恩康",
    "bond": "泰恩康转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 8.01,
    "conv": 20.2,
    "price": 20.65,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "化学制药",
    "rating": "-",
    "progressDate": "2026-05-20",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301522",
    "name": "上大股份",
    "bond": "上大股份转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 8,
    "conv": 22.78,
    "price": 23.35,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "金属新材料",
    "rating": "-",
    "progressDate": "2026-05-20",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301603",
    "name": "乔锋智能",
    "bond": "乔锋智能转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 11.5,
    "conv": 111.75,
    "price": 129.1,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "通用设备",
    "rating": "-",
    "progressDate": "2026-05-19",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301092",
    "name": "争光股份",
    "bond": "争光股份转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 6.17,
    "conv": 43.26,
    "price": 45.21,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "塑料",
    "rating": "-",
    "progressDate": "2026-05-19",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "688720",
    "name": "艾森股份",
    "bond": "艾森股份转债",
    "board": "沪市科创",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 5.14,
    "conv": 61.94,
    "price": 66.22,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "半导体",
    "rating": "-",
    "progressDate": "2026-08-15",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "603166",
    "name": "福达股份",
    "bond": "福达股份转债",
    "board": "沪市主板",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 10,
    "conv": 10.81,
    "price": 11.32,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "汽车零部件",
    "rating": "-",
    "progressDate": "2026-05-16",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "300389",
    "name": "艾比森",
    "bond": "艾比森转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 8.1,
    "conv": 12.16,
    "price": 12.31,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "光学光电子",
    "rating": "-",
    "progressDate": "2026-05-15",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "603409",
    "name": "汇通控股",
    "bond": "汇通控股转债",
    "board": "沪市主板",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 5,
    "conv": 17.32,
    "price": 17.61,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "汽车零部件",
    "rating": "-",
    "progressDate": "2026-05-09",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "605020",
    "name": "永和股份",
    "bond": "永和股份转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 22,
    "conv": 33.35,
    "price": 34.76,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "化学制品",
    "rating": "-",
    "progressDate": "2026-08-17",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "603693",
    "name": "江苏新能",
    "bond": "江苏新能转债",
    "board": "沪市主板",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 12.4,
    "conv": 12.25,
    "price": 11.82,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "电力",
    "rating": "-",
    "progressDate": "2026-03-25",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "603219",
    "name": "富佳股份",
    "bond": "富佳股份转债",
    "board": "沪市主板",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 5,
    "conv": 13.44,
    "price": 14.51,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "小家电",
    "rating": "-",
    "progressDate": "2026-01-24",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "605196",
    "name": "华通线缆",
    "bond": "华通线缆转债",
    "board": "沪市主板",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 8,
    "conv": 31.29,
    "price": 35.07,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "电网设备",
    "rating": "-",
    "progressDate": "2025-11-07",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "300709",
    "name": "精研科技",
    "bond": "精研科技转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 5.78,
    "conv": 35.84,
    "price": 40.15,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "消费电子",
    "rating": "-",
    "progressDate": "2025-08-19",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "300751",
    "name": "迈为股份",
    "bond": "迈为股份转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 19.67,
    "conv": 168.52,
    "price": 178.39,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "光伏设备",
    "rating": "-",
    "progressDate": "2025-06-16",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "600928",
    "name": "西安银行",
    "bond": "西安银行转债",
    "board": "沪市主板",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 80,
    "conv": 3.59,
    "price": 3.49,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "银行Ⅱ",
    "rating": "-",
    "progressDate": "2025-05-31",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "300432",
    "name": "富临精工",
    "bond": "富临精工转债",
    "board": "深市创业",
    "stage": "股东大会通过",
    "grp": "lgreen",
    "issue": 12.52,
    "conv": 15.69,
    "price": 16.23,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "电池",
    "rating": "-",
    "progressDate": "2024-12-06",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301141",
    "name": "中科磁业",
    "bond": "中科磁业转债",
    "board": "深市创业",
    "stage": "董事会预案",
    "grp": "ygreen",
    "issue": 6.09,
    "conv": 41.16,
    "price": 43.29,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "金属新材料",
    "rating": "-",
    "progressDate": "2026-08-11",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "001335",
    "name": "信凯科技",
    "bond": "信凯科技转债",
    "board": "深市主板",
    "stage": "董事会预案",
    "grp": "ygreen",
    "issue": 4.5,
    "conv": 30.22,
    "price": 31.46,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "化学制品",
    "rating": "-",
    "progressDate": "2026-07-08",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "001389",
    "name": "广合科技",
    "bond": "广合科技转债",
    "board": "深市主板",
    "stage": "董事会预案",
    "grp": "ygreen",
    "issue": 36,
    "conv": 158.08,
    "price": 169.46,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "元件",
    "rating": "-",
    "progressDate": "2026-06-23",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "002948",
    "name": "青岛银行",
    "bond": "青岛银行转债",
    "board": "深市主板",
    "stage": "董事会预案",
    "grp": "ygreen",
    "issue": 48,
    "conv": 5.76,
    "price": 5.67,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "银行Ⅱ",
    "rating": "-",
    "progressDate": "2025-08-29",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "603339",
    "name": "四方科技",
    "bond": "四方转债",
    "board": "沪市主板",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 10.23,
    "conv": 16.25,
    "price": 13.77,
    "perShare": 3.3064,
    "reg": "—",
    "pay": "—",
    "fs": 6.11,
    "ind": "通用设备",
    "rating": "AA",
    "lockShares": "124596915",
    "progressDate": "2026-07-11",
    "consPrice": 130,
    "aggrPrice": 140,
    "lockList": [
      {
        "name": "黄杰",
        "pct": 40.27
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "002913",
    "name": "奥士康",
    "bond": "奥士转债",
    "board": "深市主板",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 10,
    "conv": 54.34,
    "price": 56.88,
    "perShare": 3.1513,
    "reg": "—",
    "pay": "—",
    "fs": 3.63,
    "ind": "元件",
    "rating": "AA",
    "lockShares": "202000000",
    "progressDate": "2026-07-11",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "深圳市北电投资有限公司",
        "pct": 50.42
      },
      {
        "name": "贺波",
        "pct": 13.23
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "301459",
    "name": "丰茂股份",
    "bond": "丰茂转债",
    "board": "深市创业",
    "stage": "已发行·缴款",
    "grp": "orange",
    "issue": 6.08,
    "conv": 35.59,
    "price": 37.31,
    "perShare": 5.8347,
    "reg": "2026-08-17",
    "pay": "2026-08-18",
    "fs": 1.6,
    "ind": "橡胶",
    "rating": "AA-",
    "lockShares": "76830000",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "宁波丰茂投资控股有限公司",
        "pct": 59.93
      },
      {
        "name": "蒋春雷",
        "pct": 11.36
      },
      {
        "name": "宁波苏康企业管理合伙企业(有限合伙)",
        "pct": 2.5
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "002550",
    "name": "千红制药",
    "bond": "千红转债",
    "board": "深市主板",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 10,
    "conv": 6.79,
    "price": 7.16,
    "perShare": 0.7812,
    "reg": "—",
    "pay": "—",
    "fs": 7.34,
    "ind": "化学制药",
    "rating": "AA",
    "lockShares": "340811600",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 140,
    "lockList": [
      {
        "name": "王耀方",
        "pct": 19.96
      },
      {
        "name": "王轲",
        "pct": 6.67
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "301132",
    "name": "满坤科技",
    "bond": "满坤转债",
    "board": "深市创业",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 7.6,
    "conv": 26.35,
    "price": 35.41,
    "perShare": 5.1321,
    "reg": "—",
    "pay": "—",
    "fs": 3.24,
    "ind": "元件",
    "rating": "AA",
    "lockShares": "85000000",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 140,
    "lockList": [
      {
        "name": "洪耿奇",
        "pct": 16.88
      },
      {
        "name": "洪俊城",
        "pct": 13.51
      },
      {
        "name": "洪耿宇",
        "pct": 13.51
      },
      {
        "name": "洪娜珊",
        "pct": 13.51
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "000887",
    "name": "中鼎股份",
    "bond": "中鼎转债",
    "board": "深市主板",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 19.2,
    "conv": 17.25,
    "price": 21.75,
    "perShare": 1.4589,
    "reg": "—",
    "pay": "—",
    "fs": 11.49,
    "ind": "汽车零部件",
    "rating": "AA",
    "lockShares": "528480362",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 140
  },
  {
    "code": "301628",
    "name": "强达电路",
    "bond": "强达转债",
    "board": "深市创业",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 5.5,
    "conv": 72.66,
    "price": 84.29,
    "perShare": 7.2967,
    "reg": "2026-08-18",
    "pay": "2026-08-19",
    "fs": 2.2,
    "ind": "元件",
    "rating": "AA-",
    "lockShares": "47849564",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "祝小华",
        "pct": 32.14
      },
      {
        "name": "宋振武",
        "pct": 16.39
      },
      {
        "name": "宁波保税区鸿超翔投资合伙企业(有限合伙)",
        "pct": 6.3
      },
      {
        "name": "何伟鸿",
        "pct": 6.3
      },
      {
        "name": "宁波保税区翔振达投资合伙企业(有限合伙)",
        "pct": 1.89
      },
      {
        "name": "深圳市中小担创业投资有限公司",
        "pct": 0.46
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "688150",
    "name": "莱特光电",
    "bond": "莱特转债",
    "board": "沪市科创",
    "stage": "上市委通过",
    "grp": "lgreen",
    "issue": 5.25,
    "conv": 40.29,
    "price": 40.45,
    "perShare": 1.3059,
    "reg": "—",
    "pay": "—",
    "fs": 2.22,
    "ind": "电子化学品Ⅱ",
    "rating": "AA",
    "lockShares": "231866984",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 140,
    "lockList": [
      {
        "name": "王亚龙",
        "pct": 49.52
      },
      {
        "name": "宁波高展自有资金投资有限公司",
        "pct": 4.39
      },
      {
        "name": "北京君联成业股权投资合伙企业(有限合伙)",
        "pct": 1.13
      },
      {
        "name": "宁波君成自有资金投资合伙企业(有限合伙)",
        "pct": 0.9
      },
      {
        "name": "北京君联慧诚股权投资合伙企业(有限合伙)",
        "pct": 0.9
      },
      {
        "name": "宁波青荷自有资金投资合伙企业(有限合伙)",
        "pct": 0.78
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "301149",
    "name": "隆华新材",
    "bond": "隆华转债",
    "board": "深市创业",
    "stage": "上市委通过",
    "grp": "lgreen",
    "issue": 9.6,
    "conv": 7.13,
    "price": 7.88,
    "perShare": 1.7173,
    "reg": "—",
    "pay": "—",
    "fs": 4.6,
    "ind": "化学制品",
    "rating": "AA",
    "lockShares": "291154720",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301571",
    "name": "国科天成",
    "bond": "国科转债",
    "board": "深市创业",
    "stage": "上市委通过",
    "grp": "lgreen",
    "issue": 6.21,
    "conv": 58.35,
    "price": 68.52,
    "perShare": 4.743,
    "reg": "—",
    "pay": "—",
    "fs": 2.77,
    "ind": "军工电子Ⅱ",
    "rating": "AA",
    "lockShares": "72434350",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 140,
    "lockList": [
      {
        "name": "罗珏典",
        "pct": 8.19
      },
      {
        "name": "北京空应科技发展有限公司",
        "pct": 6.91
      },
      {
        "name": "吴明星",
        "pct": 6.16
      },
      {
        "name": "天津晟易天成企业管理合伙企业(有限合伙)",
        "pct": 5.4
      },
      {
        "name": "北京科创天成企业管理中心(有限合伙)",
        "pct": 4.91
      },
      {
        "name": "北京恒润长图资产管理有限公司-天津天盛天成资产管理中心(有限合伙)",
        "pct": 4.61
      },
      {
        "name": "北京大数长青资产管理有限公司-盐城大数成长股权投资合伙企业(有限合伙)",
        "pct": 4.18
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "603125",
    "name": "常青科技",
    "bond": "常青转债",
    "board": "沪市主板",
    "stage": "上市委通过",
    "grp": "lgreen",
    "issue": 2.18,
    "conv": 19.86,
    "price": 24.11,
    "perShare": 1.9753,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "化学制品",
    "rating": "AA",
    "lockShares": "",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 140
  },
  {
    "code": "301175",
    "name": "中科环保",
    "bond": "中科转债",
    "board": "深市创业",
    "stage": "上市委通过",
    "grp": "lgreen",
    "issue": 4.22,
    "conv": 5.49,
    "price": 5.46,
    "perShare": 0.6793,
    "reg": "—",
    "pay": "—",
    "fs": 3.73,
    "ind": "环境治理",
    "rating": "AA",
    "lockShares": "72434350",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 140,
    "lockList": [
      {
        "name": "罗珏典",
        "pct": 8.19
      },
      {
        "name": "北京空应科技发展有限公司",
        "pct": 6.91
      },
      {
        "name": "吴明星",
        "pct": 6.16
      },
      {
        "name": "天津晟易天成企业管理合伙企业(有限合伙)",
        "pct": 5.4
      },
      {
        "name": "北京科创天成企业管理中心(有限合伙)",
        "pct": 4.91
      },
      {
        "name": "北京恒润长图资产管理有限公司-天津天盛天成资产管理中心(有限合伙)",
        "pct": 4.61
      },
      {
        "name": "北京大数长青资产管理有限公司-盐城大数成长股权投资合伙企业(有限合伙)",
        "pct": 4.18
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "001380",
    "name": "华纬科技",
    "bond": "华纬转债",
    "board": "深市主板",
    "stage": "上市委通过",
    "grp": "lgreen",
    "issue": 5.75,
    "conv": 22.74,
    "price": 16.6,
    "perShare": 2.1229,
    "reg": "—",
    "pay": "—",
    "fs": 2.15,
    "ind": "汽车零部件",
    "rating": "AA",
    "lockShares": "169354284",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "浙江华纬控股有限公司",
        "pct": 35.42
      },
      {
        "name": "金雷",
        "pct": 16.88
      },
      {
        "name": "诸暨市珍珍投资管理中心(有限合伙)",
        "pct": 10.23
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "600368",
    "name": "五洲交通",
    "bond": "五洲转债",
    "board": "沪市主板",
    "stage": "上市委通过",
    "grp": "lgreen",
    "issue": 30,
    "conv": 3.94,
    "price": 3.94,
    "perShare": 1.8638,
    "reg": "—",
    "pay": "—",
    "fs": 14.32,
    "ind": "铁路公路",
    "rating": "AA",
    "lockShares": "841452568",
    "progressDate": "2026-07-31",
    "consPrice": 120,
    "aggrPrice": 125,
    "lockList": [
      {
        "name": "广西交通投资集团有限公司",
        "pct": 38.42
      },
      {
        "name": "招商局公路网络科技控股股份有限公司",
        "pct": 13.86
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "300727",
    "name": "润禾材料",
    "bond": "润禾转债",
    "board": "深市创业",
    "stage": "上市委通过",
    "grp": "lgreen",
    "issue": 1.9,
    "conv": 28,
    "price": 27.97,
    "perShare": 2.0555,
    "reg": "—",
    "pay": "—",
    "fs": 0,
    "ind": "化学制品",
    "rating": "AA",
    "lockShares": "94070116",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "浙江润禾控股有限公司",
        "pct": 37.95
      },
      {
        "name": "叶剑平",
        "pct": 10.52
      },
      {
        "name": "宁海协润投资合伙企业(有限合伙)",
        "pct": 2.8
      },
      {
        "name": "宁海咏春投资合伙企业(有限合伙)",
        "pct": 0.95
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "300909",
    "name": "汇创达",
    "bond": "汇创转债",
    "board": "深市创业",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 6.5,
    "conv": 40.46,
    "price": 54.12,
    "perShare": 3.7572,
    "reg": "—",
    "pay": "—",
    "fs": 3.47,
    "ind": "光学光电子",
    "rating": "AA",
    "lockShares": "80720106",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "李明",
        "pct": 30.25
      },
      {
        "name": "宁波通慕创业投资合伙企业(有限合伙)",
        "pct": 14.05
      },
      {
        "name": "上海犇腾向前科技发展中心(有限合伙)",
        "pct": 1.69
      },
      {
        "name": "东莞市信为通达创业投资合伙企业(有限合伙)",
        "pct": 0.68
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "002997",
    "name": "瑞鹄模具",
    "bond": "瑞鹄转债",
    "board": "深市主板",
    "stage": "上市委通过",
    "grp": "lgreen",
    "issue": 6.86,
    "conv": 26.41,
    "price": 27.06,
    "perShare": 3.2822,
    "reg": "—",
    "pay": "—",
    "fs": 4.02,
    "ind": "汽车零部件",
    "rating": "AA",
    "lockShares": "86527329",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 140
  },
  {
    "code": "300953",
    "name": "震裕科技",
    "bond": "震裕转02",
    "board": "深市创业",
    "stage": "同意注册·待发",
    "grp": "cyan",
    "issue": 18.8,
    "conv": 104.85,
    "price": 105.74,
    "perShare": 7.7324,
    "reg": "2026-08-14",
    "pay": "2026-08-17",
    "fs": 13.24,
    "ind": "电池",
    "rating": "AA-",
    "lockShares": "71933596",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 180,
    "lockList": [
      {
        "name": "蒋震林",
        "pct": 26.81
      },
      {
        "name": "洪瑞娣",
        "pct": 10.64
      },
      {
        "name": "宁波聚信投资合伙企业(有限合伙)",
        "pct": 4.02
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "603163",
    "name": "圣晖集成",
    "bond": "圣晖转债",
    "board": "沪市主板",
    "stage": "同意注册",
    "grp": "cyan",
    "issue": 5.5,
    "conv": 73.23,
    "price": 85.49,
    "perShare": 5.5,
    "reg": "—",
    "pay": "—",
    "fs": 1.39,
    "ind": "专业工程",
    "rating": "AA",
    "lockShares": "74695500",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 180,
    "lockList": [
      {
        "name": "SHENG HUEI INTERNATIONAL CO.LTD.",
        "pct": 65
      },
      {
        "name": "苏州嵩辉企业管理咨询合伙企业(有限合伙)",
        "pct": 7.63
      },
      {
        "name": "苏州圣展企业管理咨询合伙企业(有限合伙)",
        "pct": 1.31
      },
      {
        "name": "铭基国际投资公司-MATTHEWS ASIA FUNDS (US)",
        "pct": 0.75
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "001282",
    "name": "三联锻造",
    "bond": "三联转债",
    "board": "深市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 6.5,
    "conv": 20.8,
    "price": 16.2,
    "perShare": 2.7905,
    "reg": "—",
    "pay": "—",
    "fs": 1.64,
    "ind": "汽车零部件",
    "rating": "AA",
    "lockShares": "174162336",
    "progressDate": "2026-07-11",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "301279",
    "name": "金道科技",
    "bond": "金道转债",
    "board": "深市创业",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 3.06,
    "conv": 30.6,
    "price": 20.68,
    "perShare": 1.8107,
    "reg": "—",
    "pay": "—",
    "fs": 1.44,
    "ind": "工程机械",
    "rating": "AA",
    "lockShares": "89700000",
    "progressDate": "2026-07-11",
    "consPrice": 157.3,
    "aggrPrice": 200,
    "lockList": [
      {
        "name": "浙江金道控股有限公司",
        "pct": 33.82
      },
      {
        "name": "金刚强",
        "pct": 15.03
      },
      {
        "name": "金言荣",
        "pct": 7.52
      },
      {
        "name": "金晓燕",
        "pct": 7.52
      },
      {
        "name": "宁波金及创业投资合伙企业(有限合伙)",
        "pct": 5.26
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "601717",
    "name": "中创智领",
    "bond": "中创转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 43.5,
    "conv": 16.32,
    "price": 15.38,
    "perShare": 2.4367,
    "reg": "—",
    "pay": "—",
    "fs": 16.32,
    "ind": "专用设备",
    "rating": "AA",
    "lockShares": "1115443017",
    "progressDate": "2026-07-31",
    "consPrice": 120,
    "aggrPrice": 130
  },
  {
    "code": "002981",
    "name": "朝阳科技",
    "bond": "朝阳转债",
    "board": "深市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 5.2,
    "conv": 22.56,
    "price": 23,
    "perShare": 3.7956,
    "reg": "—",
    "pay": "—",
    "fs": 1.8,
    "ind": "消费电子",
    "rating": "AA",
    "lockShares": "89619576",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "广东健溢投资有限责任公司",
        "pct": 50.91
      },
      {
        "name": "郭丽勤",
        "pct": 13.23
      },
      {
        "name": "宁波鹏辰创业投资合伙企业(有限合伙)",
        "pct": 1.04
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "688600",
    "name": "皖仪科技",
    "bond": "皖仪转债",
    "board": "沪市科创",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 3.2,
    "conv": 22.58,
    "price": 26.14,
    "perShare": 2.3703,
    "reg": "—",
    "pay": "—",
    "fs": 1.74,
    "ind": "通用设备",
    "rating": "AA",
    "lockShares": "61592039",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "臧牧",
        "pct": 38.67
      },
      {
        "name": "黄文平",
        "pct": 6.04
      },
      {
        "name": "合肥成泽企业管理合伙企业(有限合伙)",
        "pct": 1
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "300813",
    "name": "泰林生物",
    "bond": "泰林转债",
    "board": "深市创业",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 2.3,
    "conv": 18.08,
    "price": 20.55,
    "perShare": 1.9008,
    "reg": "—",
    "pay": "—",
    "fs": 0.98,
    "ind": "专用设备",
    "rating": "AA",
    "lockShares": "69592700",
    "progressDate": "2026-07-31",
    "consPrice": 157.3,
    "aggrPrice": 200,
    "lockList": [
      {
        "name": "叶大林",
        "pct": 37.73
      },
      {
        "name": "倪卫菊",
        "pct": 15.18
      },
      {
        "name": "青岛高得投资合伙企业(有限合伙)",
        "pct": 4.51
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "301631",
    "name": "壹连科技",
    "bond": "壹连转债",
    "board": "深市创业",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 11.8,
    "conv": 58.54,
    "price": 66.56,
    "perShare": 9.2187,
    "reg": "—",
    "pay": "—",
    "fs": 4.8,
    "ind": "汽车零部件",
    "rating": "AA",
    "lockShares": "75932615",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "688510",
    "name": "航亚科技",
    "bond": "航亚转债",
    "board": "沪市主板",
    "stage": "上市委通过",
    "grp": "lgreen",
    "issue": 6,
    "conv": 23.34,
    "price": 23.34,
    "perShare": 2.3041,
    "reg": "—",
    "pay": "—",
    "fs": 4.89,
    "ind": "航空装备Ⅱ",
    "rating": "-",
    "lockShares": "48346639",
    "progressDate": "2026-08-12",
    "consPrice": 130,
    "aggrPrice": 140,
    "lockList": [
      {
        "name": "严奇",
        "pct": 14.49
      },
      {
        "name": "无锡华航科创投资中心(有限合伙)",
        "pct": 2.28
      },
      {
        "name": "江苏新苏投资发展集团有限公司",
        "pct": 1.86
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "300739",
    "name": "明阳电路",
    "bond": "明阳转债",
    "board": "深市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 12,
    "conv": 23.42,
    "price": 23.42,
    "perShare": 3.2051,
    "reg": "—",
    "pay": "—",
    "fs": 6.25,
    "ind": "元件",
    "rating": "-",
    "lockShares": "179446840",
    "progressDate": "2026-08-12",
    "consPrice": 130,
    "aggrPrice": 140,
    "lockList": [
      {
        "name": "张佩珂",
        "pct": 23.64
      },
      {
        "name": "丰县润佳玺企业管理有限公司",
        "pct": 20.29
      },
      {
        "name": "丰县盛健企业管理中心(有限合伙)",
        "pct": 1.75
      },
      {
        "name": "赣州圣盈高创业投资有限公司",
        "pct": 1.61
      },
      {
        "name": "丰县利运得企业管理有限公司",
        "pct": 0.75
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "301305",
    "name": "朗坤科技",
    "bond": "朗坤转债",
    "board": "深市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 5.9,
    "conv": 23.96,
    "price": 23.96,
    "perShare": 2.439,
    "reg": "—",
    "pay": "—",
    "fs": 3.74,
    "ind": "环境治理",
    "rating": "-",
    "lockShares": "88373000",
    "progressDate": "2026-08-11",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "深圳市建银财富投资控股有限公司",
        "pct": 11.9
      },
      {
        "name": "陈建湘",
        "pct": 6.45
      },
      {
        "name": "张丽音",
        "pct": 6.32
      },
      {
        "name": "深圳市朗坤投资合伙企业(有限合伙)",
        "pct": 5.94
      },
      {
        "name": "共青城朗坤投资管理合伙企业(有限合伙)",
        "pct": 5.9
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "603043",
    "name": "广州酒家",
    "bond": "广州酒家转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 10,
    "conv": 13.64,
    "price": 13.64,
    "perShare": 1.7606,
    "reg": "—",
    "pay": "—",
    "fs": 3.26,
    "ind": "休闲食品",
    "rating": "-",
    "lockShares": "382884544",
    "progressDate": "2026-08-01",
    "consPrice": 130,
    "aggrPrice": 140,
    "lockList": [
      {
        "name": "广州市城市建设投资集团有限公司",
        "pct": 50.72
      },
      {
        "name": "广州产业投资控股集团有限公司",
        "pct": 9.87
      },
      {
        "name": "广东省财政厅",
        "pct": 6.73
      }
    ],
    "lockDate": "2026-03-31"
  },
  {
    "code": "603061",
    "name": "金海通",
    "bond": "金海转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 8.5,
    "conv": 333.22,
    "price": 333.22,
    "perShare": 9.7087,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "半导体",
    "rating": "-",
    "lockShares": "",
    "progressDate": "2026-07-31",
    "consPrice": 130,
    "aggrPrice": 157.3
  },
  {
    "code": "603565",
    "name": "中谷物流",
    "bond": "中谷转债",
    "board": "沪市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 27.3,
    "conv": 10.48,
    "price": 10.48,
    "perShare": 1.2987,
    "reg": "—",
    "pay": "—",
    "fs": 11.63,
    "ind": "航运港口",
    "rating": "-",
    "lockShares": "1206682881",
    "progressDate": "2026-07-03",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "中谷海运集团有限公司",
        "pct": 57.46
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "300893",
    "name": "松原安全",
    "bond": "松原转债",
    "board": "深市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 10.55,
    "conv": 16.13,
    "price": 16.13,
    "perShare": 2.2272,
    "reg": "—",
    "pay": "—",
    "fs": 2.91,
    "ind": "汽车零部件",
    "rating": "-",
    "lockShares": "343108452",
    "progressDate": "2026-06-12",
    "consPrice": 130,
    "aggrPrice": 157.3,
    "lockList": [
      {
        "name": "胡铲明",
        "pct": 43.7
      },
      {
        "name": "沈燕燕",
        "pct": 18.73
      },
      {
        "name": "南京明凯创业投资合伙企业(有限合伙)",
        "pct": 6.57
      },
      {
        "name": "科威特政府投资局",
        "pct": 2.08
      },
      {
        "name": "澳门金融管理局-自有资金",
        "pct": 1.46
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "001221",
    "name": "悍高集团",
    "bond": "悍高转债",
    "board": "深市主板",
    "stage": "交易所已受理",
    "grp": "ygreen",
    "issue": 12,
    "conv": 39.25,
    "price": 39.25,
    "perShare": 2.994,
    "reg": "—",
    "pay": "—",
    "fs": 1.66,
    "ind": "家居用品",
    "rating": "-",
    "lockShares": "345221710",
    "progressDate": "2026-06-08",
    "consPrice": 130,
    "aggrPrice": 140,
    "lockList": [
      {
        "name": "广东悍高管理集团有限公司",
        "pct": 64.63
      },
      {
        "name": "欧锦锋",
        "pct": 8.08
      },
      {
        "name": "佛山市锦益管理咨询合伙企业(有限合伙)",
        "pct": 4.2
      },
      {
        "name": "广东悍高企业管理有限公司",
        "pct": 2.1
      },
      {
        "name": "广州二鸣创业投资合伙企业(有限合伙)",
        "pct": 2.07
      },
      {
        "name": "广东顺德科创智谷进取股权投资合伙企业(有限合伙)",
        "pct": 2.06
      },
      {
        "name": "佛山市锦悦管理咨询合伙企业(有限合伙)",
        "pct": 1.78
      },
      {
        "name": "广东顺德科创智造进取股权投资合伙企业(有限合伙)",
        "pct": 1.38
      }
    ],
    "lockDate": "2026-06-30"
  },
  {
    "code": "301297",
    "name": "富乐德",
    "bond": null,
    "board": "深市创业",
    "stage": "董事会预案",
    "grp": "gray",
    "issue": 11.76,
    "conv": 32.51,
    "price": 36.83,
    "perShare": 0,
    "reg": "—",
    "pay": "—",
    "fs": null,
    "ind": "半导体",
    "rating": "-",
    "progressDate": "2026-08-15",
    "consPrice": 120,
    "aggrPrice": 130,
    "lockShares": "",
    "lockList": [],
    "lockDate": ""
  }
];;;;;;;;;;;

// 实时股价快照（2026-08-15 由 westock-mcp data_quote 抓取）
const RT_PRICE = {
  '605123':80.06,
  '688605':79.91,
  '301565':19.97,
  '688686':124.78,
  '605016':19.99,
  '300634':21.19,
  '001316':27.05,
  '300447':14.12,
  '301018':99.27,
  '301379':24.09,
  '300181':14.67,
  '300660':27.07,
  '600089':21,
  '600577':8.21,
  '603093':12.12,
  '601528':4.84,
  '601577':9.18,
  '601187':7.36,
  '301479':55.39,
  '300695':52.66,
  '688261':75.41,
  '300428':18.79,
  '002978':25.98,
  '603499':12.7,
  '001203':27.81,
  '301585':27.69,
  '688372':137.8,
  '688390':69.18,
  '301263':20.1,
  '301522':23.97,
  '301603':130.54,
  '301092':46.41,
  '688720':70.15,
  '603166':11.41,
  '300389':12.49,
  '603409':17.74,
  '605020':35.06,
  '603693':11.73,
  '603219':14.5,
  '605196':35.62,
  '300709':41.54,
  '300751':186.28,
  '600928':3.49,
  '300432':16.59,
  '301141':42.5,
  '001335':32.03,
  '001389':170.81,
  '002948':5.69,
  '603339':14.04,
  '002913':58.6,
  '301459':38.8,
  '002550':7.13,
  '301132':37.56,
  '000887':20.41,
  '301628':90.07,
  '688150':41.96,
  '301149':8,
  '301571':68.92,
  '603125':24.65,
  '301175':5.46,
  '001380':16.89,
  '600368':3.98,
  '300727':28.62,
  '300909':54.68,
  '002997':27.99,
  '300953':105.8,
  '603163':90.62,
  '001282':16.37,
  '301279':20.96,
  '601717':15.27,
  '002981':23.02,
  '688600':26.54,
  '300813':20.6,
  '301631':66.32,
  '688510':23.83,
  '300739':24.13,
  '301305':24.94,
  '603043':13.54,
  '603061':356,
  '603565':10.63,
  '300893':16.1,
  '001221':41.55,
  '301297':37.56
};;;;;;;;;;;

// 档位扫描表（100 股整数倍）。深市按全档扫描，上限 4000；沪市因 1000 元取整台阶，
// 大仓位安全垫%反而更高，落在最大档——反直觉，故按用户资金上限约束为 1600 股内取最优。
const TIER_LIST = [100,200,300,400,500,600,700,800,900,1000,1500,2000,2500,3000,4000];
const TIER_LIST_SH = [100,200,300,400,500,600,700,800,900,1000,1500,1600];  // 沪市资金上限 1600

function fmtPct(n, dp=2){ return (n*100).toFixed(dp)+'%'; }

// 沪深市场判定：沪市(60/688 开头) 按「手」(1000元) 取整；深市(00/30 开头) 按「张」(100元) 取整
function marketOf(code){
  const c = String(code);
  return c[0] === '6' ? 'SH' : 'SZ';   // 60xxx 沪市主板 / 688xxx 科创板 均属沪市；00/30 属深市
}
function floorActual(theo, market){
  return market === 'SH' ? Math.floor(theo / 1000) * 1000 : Math.floor(theo / 100) * 100;
}
function computeOptimal(d){
  const price = d.rtPrice != null ? d.rtPrice : d.price;
  const per = d.perShare || 0;
  const consP = d.consPrice || 130;
  const aggrP = d.aggrPrice || 157.3;
  const market = marketOf(d.code);

  let best = { shares:100, cost:price*100, theo:per*100, actual:0, cushionCons:0, cushionAggr:0 };

  // 沪市资金上限 1600 股内取最优；深市全档(上限 4000)取最优
  const tiers = market === 'SH' ? TIER_LIST_SH : TIER_LIST;
  for (const n of tiers){
    const cost = n * price;
    const theo = n * per;
    const actual = floorActual(theo, market);           // 沪深差异化取整（用户铁律）
    const profitCons = (actual / 100) * (consP - 100);
    const profitAggr = (actual / 100) * (aggrP - 100);
    const cushionCons = cost > 0 ? profitCons / cost : 0;
    const cushionAggr = cost > 0 ? profitAggr / cost : 0;

    // 「最优」= 激进安全垫最高的档位；并列(差≤1e-9，吸收浮点噪声)时取更小档(资金占用更少，更符合潜伏配债逻辑)
    if (cushionAggr > best.cushionAggr + 1e-9 ||
        (Math.abs(cushionAggr - best.cushionAggr) <= 1e-9 && n < best.shares)){
      best = { shares:n, cost, theo, actual, cushionCons, cushionAggr };
    }
  }
  return best;
}

// 为每个标的附加实时价、涨幅、最优档位
for (const d of DATA){
  // 加表日期按 code 独立查表；DATA 内显式给值可覆盖 sidecar；都没有就留空（前端展示「—」）
  d.addDate = (d.addDate && d.addDate.trim()) || ADDDATE_MAP[d.code] || '';
  d.rtPrice = RT_PRICE[d.code] != null ? RT_PRICE[d.code] : d.price;
  d.tableGain = (d.rtPrice - d.price) / d.price;
  const opt = computeOptimal(d);
  d.optimalShares = opt.shares;
  d.optimalCost   = opt.cost;
  d.optimalTheo   = opt.theo;
  d.optimalActual = opt.actual;
  d.optimalCushionCons = opt.cushionCons;
  d.optimalCushionAggr = opt.cushionAggr;
  // 最小配债(股)：获配「任意额度」所需最小 100 股整数倍——沪市门槛 1000 元(1手)，深市门槛 100 元(1张)
  d.minShares = (() => {
    const market = marketOf(d.code);
    const threshold = market === 'SH' ? 1000 : 100;
    return d.perShare > 0 ? Math.ceil(threshold / d.perShare / 100) * 100 : 100;
  })();
}

// 1) 读取模板，转义 </script> 避免提前闭合看板脚本，内嵌为 TEMPLATE 常量
let tpl = fs.readFileSync(TPL, 'utf8').replace(/<\/script>/gi, '<\\/script>');
const tplJs = 'const TEMPLATE = ' + JSON.stringify(tpl) + ';\n';
const dataJs = 'const DATA = ' + JSON.stringify(DATA, null, 2) + ';\nconst BYCODE = {}; DATA.forEach(d => BYCODE[d.code] = d);\n';

if (!html.includes('const GEN_DATE =')) {
  throw new Error('GEN_DATE marker not found in board template');
}
html = html.replace(
  /const GEN_DATE = '[^']*';\n/,
  m => m + tplJs + dataJs
);

// 2) 替换 thead：加入「制表股价 / 实时股价 / 涨幅 / 最小配债 / 最优股数 / 配售金额 / 实际配售额」
const NEW_HEAD = `<colgroup>
          <col style="width:6.5%"><col style="width:5.5%"><col style="width:5%"><col style="width:6%"><col style="width:4%">
          <col style="width:4%"><col style="width:4%"><col style="width:4%"><col style="width:4%"><col style="width:4%">
          <col style="width:5.5%"><col style="width:3.5%"><col style="width:4%"><col style="width:4%"><col style="width:4%">
          <col style="width:4%"><col style="width:4.5%"><col style="width:4%"><col style="width:6%"><col style="width:3.5%">
          <col style="width:4%"><col style="width:4.5%"><col style="width:4.5%"><col style="width:3%">
        </colgroup>
        <thead>
          <tr>
            <th>行业概念</th><th>名称</th><th>代码</th><th>板块</th><th>进度</th>
            <th>规模</th><th>流通<br>规模</th><th>转股价</th><th>制表价</th><th>实时价</th>
            <th>加表<br>涨幅</th><th>每股<br>配售</th><th>最优<br>股数</th><th>配售<br>金额</th><th>实际<br>配售额</th>
            <th>上市价<br>保守</th><th>安全垫<br>保守</th><th>上市价<br>激进</th><th>安全垫<br>激进</th>
            <th>需要<br>金额</th><th>含权量</th><th>登记日</th><th>进度日</th><th>排序</th>
          </tr>
        </thead>`;
html = html.replace(/<colgroup>[\s\S]*?<\/thead>/, NEW_HEAD);

// 3) 替换 compute(d) 为基于预计算字段 + 实时价兜底
const NEW_COMPUTE = `function compute(d){
  const contain = d.perShare / d.price * 100;         // 含权量(百元)
  const minShares = d.minShares || Math.ceil(100 / d.perShare / 100) * 100;
  const rtPrice = d.rtPrice != null ? d.rtPrice : d.price;
  const tableGain = (rtPrice - d.price) / d.price;
  const cushConsNum = d.optimalCushionCons || 0;
  const cushAggrNum = d.optimalCushionAggr || 0;
  const starsCons = cushConsNum>=0.09?5:cushConsNum>=0.07?4:cushConsNum>=0.04?3:cushConsNum>=0.02?2:1;
  const starsAggr = cushAggrNum>=0.09?5:cushAggrNum>=0.07?4:cushAggrNum>=0.04?3:cushAggrNum>=0.02?2:1;
  return {contain, minShares, rtPrice, tableGain, cushConsNum, cushAggrNum, starsCons, starsAggr,
          optimalShares:d.optimalShares||minShares, optimalCost:d.optimalCost||0,
          optimalTheo:d.optimalTheo||0, optimalActual:d.optimalActual||0};
}`;
html = html.replace(/function compute\(d\)\{[\s\S]*?return \{[^}]+\};\n\}/, NEW_COMPUTE);

// 4) 替换 render() 中的排序逻辑（增加 tableGain / 最优安全垫排序）
html = html.replace(
  /rows\.sort\(\(a,b\)=>\{\n    if\(sort==='cush'\) return b\.cushConsNum-a\.cushConsNum;\n    if\(sort==='cushAggr'\) return b\.cushAggrNum-a\.cushAggrNum;\n    if\(sort==='contain'\) return b\.contain-a\.contain;\n    if\(sort==='float'\)\{ const av=a\.fs==null\?1e9:a\.fs, bv=b\.fs==null\?1e9:b\.fs; return av-bv; \}\n    if\(sort==='reg'\) return a\.reg<b\.reg\?-1:1;\n    return 0;\n  \}\);/,
  `rows.sort((a,b)=>{
    if(sort==='cush') return b.cushConsNum-a.cushConsNum;
    if(sort==='cushAggr') return b.cushAggrNum-a.cushAggrNum;
    if(sort==='contain') return b.contain-a.contain;
    if(sort==='float'){ const av=a.fs==null?1e9:a.fs, bv=b.fs==null?1e9:b.fs; return av-bv; }
    if(sort==='gain') return b.tableGain-a.tableGain;
    if(sort==='reg') return a.reg<b.reg?-1:1;
    return 0;
  });`
);

// 5) 替换 render() 行生成 HTML 为 24 列（与 NEW_HEAD 对齐，去掉缴款日）
const NEW_ROW_HTML = `'<td class="ind-col">'+r.ind.replace(/\\//g, '/<wbr>')+'</td>'+
      '<td class="name-cell click" data-code="'+r.code+'">'+r.name+'</td>'+
      '<td class="click" data-code="'+r.code+'">'+r.code+'</td>'+
      '<td>'+r.board+'</td>'+
      '<td class="stage" title="'+r.stage+'">'+stageNum(r.stage)+'</td>'+
      '<td class="num">'+fmt(r.issue,2)+'</td>'+
      '<td class="num">'+(r.fs==null?'—':fmt(r.fs,2))+'</td>'+
      '<td class="num">'+fmt(r.conv,2)+'</td>'+
      '<td class="num">'+fmt(r.price,2)+'</td>'+
      '<td class="num">'+fmt(r.rtPrice,2)+'</td>'+
      '<td class="num '+(r.tableGain>=0?'rate4':'rate1')+'">'+fmt(r.tableGain*100,2)+'%</td>'+
      '<td class="num">'+(noScheme?'—':fmt(r.perShare,4))+'</td>'+
      '<td class="num" style="background:var(--amber-tint);font-weight:800;">'+(noScheme?'—':r.optimalShares)+'</td>'+
      '<td class="num">'+(noScheme?'—':fmt(r.optimalTheo,0))+'</td>'+
      '<td class="num">'+(noScheme?'—':fmt(r.optimalActual,0))+'</td>'+
      '<td class="num">'+(noScheme?'—':fmt(r.consPrice,1))+'</td>'+
      '<td class="cush">'+(noScheme?'—':(fmt(r.cushConsNum*100,2)+'%<br><span class="star-mark">'+'★'.repeat(r.starsCons)+'</span>'))+'</td>'+
      '<td class="num">'+(noScheme?'—':fmt(r.aggrPrice,1))+'</td>'+
      '<td class="cush">'+(noScheme?'—':(fmt(r.cushAggrNum*100,2)+'%<br><span class="star-mark">'+'★'.repeat(r.starsAggr)+'</span>'))+'</td>'+
      '<td class="num">'+(noScheme?'—':fmt(r.optimalCost,0))+'</td>'+
      '<td class="num">'+(noScheme?'—':fmt(r.contain,2))+'</td>'+
      '<td>'+r.reg+'</td>'+
      '<td>'+(r.progressDate||'—')+'</td>'+
      '<td>'+(++order)+'</td>'`;

// 主表行生成已在外部维护为 24 列；此处不再自动替换，避免误伤内嵌 TEMPLATE 中的 tr.innerHTML
// html.replace(... NEW_ROW_HTML ...);
// 展开明细 colspan 已统一为 24
// html.replace(/colspan="14"/g, 'colspan="24"');

// 6) 替换排序下拉框
html = html.replace(
  /<select id="sortBy">[\s\S]*?<\/select>/,
  `<select id="sortBy">
      <option value="cush">安全垫（保守·最优档·高→低）</option>
      <option value="cushAggr">安全垫（激进·最优档·高→低）</option>
      <option value="contain">含权量（高→低）</option>
      <option value="float">可流通规模（小→大）</option>
      <option value="gain">加表后涨幅（高→低）</option>
      <option value="reg">股权登记日（近→远）</option>
    </select>`
);

// 7) 说明文字已去除：汇总看板顶部不再显示数据来源与公式说明，保持页面简洁、主题突出
// html = html.replace(/数据来源：各标的发行公告 \/ 募集说明书[\s\S]*?上市价默认按 157\.3 估算。/, ...);
// html = html.replace(/「最优股数」指在 100\/200\/…\/10000 股档位中[\s\S]*?\/制表股价。/, ...);

// 8) 重新加上「已申购·待上市」隐藏过滤（若尚未存在）
if (!html.includes("r.stage !== '已申购·待上市'")) {
  html = html.replace(
    "if(fs==='待发') rows = rows.filter(r=>r.stage.includes('待发'));",
    "rows = rows.filter(r => r.stage !== '已申购·待上市');\n  if(fs==='待发') rows = rows.filter(r=>r.stage.includes('待发'));"
  );
}

// 9) 同步制表日期/股价日期
html = html.replace(/const PRICE_DATE = '[^']*';/, "const PRICE_DATE = '" + TABLE + "';");
html = html.replace(/const GEN_DATE = '[^']*';/, "const GEN_DATE = '" + TABLE + "';");

// 9.5) 在展开明细 detailHtml 的「登记日」之前注入「加表日期」字段（防重入）
if (!html.includes("['加表日期'")) {
  html = html.replace(
    "['登记日', r.reg],",
    "['加表日期', r.addDate || '—'],\n    ['登记日', r.reg],"
  );
}

// 10) 更新底部说明
html = html.replace(
  /const avg = \(DATA\.reduce\(\(s,d\)=>s\+compute\(d\)\.theoCush,0\)\/DATA\.length\)\.toFixed\(2\);/,
  `const avg = (DATA.reduce((s,d)=>s+(d.optimalCushionCons||0),0)/DATA.length*100).toFixed(2);`
);
html = html.replace(
  /'共 '\+DATA\.length\+' 只标的 ｜ 平均满配安全垫 '\+avg\+'% ｜ 实时价截至 '\+PRICE_DATE\+'.*?$/m,
  `'共 '+DATA.length+' 只标的 ｜ 平均最优档保守安全垫 '+avg+'% ｜ 实时价截至 '+PRICE_DATE+'（腾讯自选股）｜ 上市价按保守/激进模型价估算，可在单页测算中自定义 ｜ 安全垫/含权量为理论值，小仓位因碎面损耗实际更低 ｜ 可流通规模=发行规模−锁定股东持股×每股配售÷1e8（持股≥5%/实控人/一致行动人 6 个月锁定）'`
);

// 11) 输出
const outMain = BOARD_SRC;
fs.writeFileSync(outMain, html, 'utf8');
console.log('board written:', outMain);

if (VAULT) {
  const outVault = path.join(VAULT, TABLE + '_可转债潜伏配债汇总看板.html');
  fs.writeFileSync(outVault, html, 'utf8');
  console.log('board written(vault):', outVault);
}

// 校验
const nullCount = (html.match(/fs:null/g) || []).length;
const hiddenFilter = html.includes("r.stage !== '已申购·待上市'");
const progressCol = html.includes('r.progressDate');
const hasOptimal = html.includes('最优股数');
const hasRtPrice = html.includes('实时股价');
console.log('remaining fs:null =', nullCount);
console.log('hidden 已申购·待上市 filter:', hiddenFilter);
console.log('progressDate column:', progressCol);
console.log('optimal column:', hasOptimal);
console.log('rtPrice column:', hasRtPrice);
