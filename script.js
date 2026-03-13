(() => {
  const USERS_KEY = "edu_users";
  const CURRENT_KEY = "edu_current_user";
  const EMAIL_SUFFIX = "@edulearn.local";
  const AVATAR_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#9333ea", "#f43f5e", "#14b8a6"];

  function emailToUsername(email) {
    if (!email || !email.endsWith(EMAIL_SUFFIX)) return "";
    return email.slice(0, -EMAIL_SUFFIX.length);
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (_err) {
      return [];
    }
  }

  function setUsers(list) {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  }

  function ensureUserInStorage(username) {
    const users = getUsers();
    let user = users.find((u) => u.username.toLowerCase() === (username || "").toLowerCase());
    if (!user) {
      user = {
        username,
        email: "",
        avatarColor: AVATAR_COLORS[0],
        profile: { nickname: username, realName: "", school: "", birthday: "", gender: "未填写" },
        stats: { totalMinutes: 0, wrongCount: 0 },
        progress: { videosWatched: [], booksRead: [], quizTotal: 0, quizCorrect: 0, homeworkScore: 0 },
        wrongBook: [],
        subscribed: false
      };
      users.push(user);
      setUsers(users);
    }
    return user;
  }

  const chapters = [
    {
      id: "ch1",
      name: "1. 人造光源的历史",
      videos: [{ id: "v11", title: "从火把到白炽灯", duration: "07:20" }, { id: "v12", title: "现代照明发展脉络", duration: "08:44" }],
      bookSections: ["人造光源经历了火、油灯、煤气灯、白炽灯、荧光灯再到 LED 的演化。", "每次升级都围绕更高发光效率、更低功耗和更长寿命。", "学习本章可理解 LED 为何成为主流照明器件。"],
      questions: [
        { q: "下列哪项最符合照明发展趋势？", options: ["更高能耗", "更低效率", "更高能效与寿命", "更复杂维护"], answer: 2, explain: "照明技术长期目标是提高能效并降低维护成本。" },
        { q: "LED 相比白炽灯的典型优势是？", options: ["更高发热", "更高能耗", "更长寿命", "更易损坏"], answer: 2, explain: "LED 通常寿命更长、发热更低。" }
      ]
    },
    {
      id: "ch2",
      name: "2. LED实验需要的材料和注意事项",
      videos: [{ id: "v21", title: "实验器材清单讲解", duration: "06:35" }, { id: "v22", title: "实验安全规范", duration: "05:41" }],
      bookSections: ["常见材料有电池、电阻、LED、导线、开关、面包板。", "实验前确认电源电压与 LED 极性，防止反接。", "注意导线绝缘与短路风险，操作时先断电后调整。"],
      questions: [
        { q: "LED 实验中防止过流通常使用？", options: ["电容", "电阻", "电感", "保险丝"], answer: 1, explain: "限流电阻是最常见且必要的保护元件。" },
        { q: "调整线路前更安全的做法是？", options: ["保持通电", "先断电", "加大电压", "忽略极性"], answer: 1, explain: "先断电可显著降低误接导致的风险。" }
      ]
    },
    {
      id: "ch3",
      name: "3. 点亮LED（实验一）",
      videos: [{ id: "v31", title: "最简回路搭建", duration: "08:10" }, { id: "v32", title: "极性判断与排错", duration: "07:05" }],
      bookSections: ["最基础回路：电源正极 -> 电阻 -> LED 正极 -> LED 负极 -> 电源负极。", "LED 具有方向性，通常长脚为正极。", "不亮时先检查极性、接触是否良好、限流电阻是否合适。"],
      questions: [
        { q: "LED 一般需要什么条件才会发光？", options: ["反向连接", "正向导通且有合适电流", "只接正极", "只接负极"], answer: 1, explain: "LED 需正向偏置并且电流在合理范围内。" },
        { q: "下列哪项最可能导致 LED 不亮？", options: ["串联限流电阻", "极性接反", "使用开关", "连接导线"], answer: 1, explain: "极性反接会阻止正常导通。" }
      ]
    },
    {
      id: "ch4",
      name: "4. LED的串联与并联（实验二）",
      videos: [{ id: "v41", title: "串联电路中的亮度变化", duration: "09:26" }, { id: "v42", title: "并联支路观察", duration: "09:02" }],
      bookSections: ["串联时同一支路电流相同，等效电阻增大。", "并联时各支路电压近似相同，电流按阻值分配。", "实验中要关注不同连接方式对亮度的影响。"],
      questions: [
        { q: "两个相同 LED 串联后通常会？", options: ["更亮", "电流减小", "电压减小", "不需要电源"], answer: 1, explain: "串联后总压降增大，电流通常减小。" },
        { q: "并联电路中各支路一般？", options: ["电压不同", "电压相同", "电流相同", "均无电流"], answer: 1, explain: "并联支路接在同一对节点，电压相同。" }
      ]
    },
    {
      id: "ch5",
      name: "5. 导体与绝缘体，还有半导体（实验三）",
      videos: [{ id: "v51", title: "三类材料导电性对比", duration: "10:21" }, { id: "v52", title: "半导体应用实例", duration: "07:58" }],
      bookSections: ["导体中自由电子多，电阻率低；绝缘体相反。", "半导体导电性介于两者之间，可通过掺杂调节。", "LED、二极管、晶体管都属于半导体器件应用。"],
      questions: [
        { q: "LED 属于哪类材料应用？", options: ["导体", "绝缘体", "半导体", "超导体"], answer: 2, explain: "LED 是典型半导体发光器件。" },
        { q: "导体的典型特征是？", options: ["电阻率高", "几乎不导电", "电阻率低", "不能通电"], answer: 2, explain: "导体电阻率通常较低，易导电。" }
      ]
    },
    {
      id: "ch6",
      name: "6. LED照明发展历史与基本原理",
      videos: [{ id: "v61", title: "LED 发光机理基础", duration: "08:32" }, { id: "v62", title: "LED 照明应用场景", duration: "06:59" }],
      bookSections: ["LED 发光源于半导体 PN 结复合发光。", "不同材料决定不同发光波长与颜色。", "高效驱动与散热设计是工程应用关键。"],
      questions: [
        { q: "LED 发光的本质是？", options: ["机械振动", "电子与空穴复合", "电阻发热", "磁场感应"], answer: 1, explain: "PN 结中电子空穴复合释放光子。" },
        { q: "LED 工程设计中常见重点不包括？", options: ["驱动电流控制", "热管理", "过流保护", "无限升压"], answer: 3, explain: "电源设计必须在安全范围内，不能无限升压。" }
      ]
    },
    {
      id: "ch7",
      name: "7. 点亮三基色LED（实验四）",
      videos: [{ id: "v71", title: "RGB 三基色演示", duration: "09:12" }, { id: "v72", title: "混色实验", duration: "10:10" }],
      bookSections: ["RGB 三基色通过不同亮度配比可合成多种颜色。", "实验重点是控制各通道电流比例。", "可通过电阻或 PWM 思路调节亮度。"],
      questions: [
        { q: "RGB 中不包含哪种颜色？", options: ["红", "绿", "蓝", "黄"], answer: 3, explain: "RGB 三基色为红绿蓝。" },
        { q: "调节 RGB 颜色常见方法是？", options: ["改变导线长度", "调节各色通道亮度", "断开地线", "反接电源"], answer: 1, explain: "通过调节三色相对亮度实现混色。" }
      ]
    },
    {
      id: "ch8",
      name: "8. 制作触摸式LED灯（实验五）",
      videos: [{ id: "v81", title: "触摸控制原理", duration: "07:34" }, { id: "v82", title: "触摸灯搭建实操", duration: "10:02" }],
      bookSections: ["触摸式电路常利用人体电容变化触发控制。", "关键是输入抗干扰与误触发抑制。", "实验可训练传感输入与执行输出联动思维。"],
      questions: [
        { q: "触摸开关常检测的变化是？", options: ["电容变化", "重力变化", "气压变化", "光照变化"], answer: 0, explain: "常见触摸方案基于人体电容变化。" },
        { q: "降低误触发可优先考虑？", options: ["去抖和滤波", "提高噪声", "去掉限流电阻", "断开电源"], answer: 0, explain: "去抖与滤波能提升输入稳定性。" }
      ]
    },
    {
      id: "ch9",
      name: "9. 没有电源也能亮的电路（实验六）",
      videos: [{ id: "v91", title: "储能元件与余辉", duration: "08:05" }, { id: "v92", title: "感应发电小实验", duration: "07:42" }],
      bookSections: ["“无电源亮灯”常见于储能释放、感应供电或化学能转换。", "并非真正无能量输入，而是能量形式发生转换。", "实验需强调能量守恒与转换路径。"],
      questions: [
        { q: "“无电源亮灯”更准确理解是？", options: ["能量凭空产生", "能量转换驱动", "违反守恒", "无法解释"], answer: 1, explain: "实际是储能或其他能量形式转换为电能。" },
        { q: "以下哪项可短时供能？", options: ["电容放电", "木块", "橡皮", "空气"], answer: 0, explain: "电容存储并释放电能，可短时供电。" }
      ]
    },
    {
      id: "ch10",
      name: "10. 渐暗、熄灭的LED灯（实验七）",
      videos: [{ id: "v101", title: "RC 延时基本现象", duration: "09:48" }, { id: "v102", title: "渐暗效果调参", duration: "07:31" }],
      bookSections: ["通过 RC 放电可实现 LED 亮度随时间减弱。", "时间常数受 R 和 C 共同影响。", "适当调参可设计不同熄灭速度。"],
      questions: [
        { q: "RC 电路中，增大电阻 R 常导致？", options: ["熄灭更快", "熄灭更慢", "无变化", "立即短路"], answer: 1, explain: "R 增大会使时间常数增大，变化更慢。" },
        { q: "LED 渐暗本质上是？", options: ["电流随时间变化", "颜色固定不变", "电压恒定不变", "导线变长"], answer: 0, explain: "亮度与电流相关，放电时电流逐渐减小。" }
      ]
    },
    {
      id: "ch11",
      name: "11. 可设定时间的LED灯（实验八）",
      videos: [{ id: "v111", title: "定时控制思路", duration: "08:22" }, { id: "v112", title: "定时灯实验演示", duration: "09:11" }],
      bookSections: ["定时控制可基于 RC、555、单片机等方案。", "教学阶段可先理解“触发-计时-动作”三段流程。", "设计中需关注时间精度与重复性。"],
      questions: [
        { q: "定时电路的核心流程通常是？", options: ["触发-计时-执行", "执行-断电-导通", "加热-冷却-发光", "连接-拆除-连接"], answer: 0, explain: "多数定时方案都包含触发、计时、执行三步。" },
        { q: "要让定时时间变长，常用做法是？", options: ["减小 R 和 C", "增大 R 或 C", "反接 LED", "拆掉电源"], answer: 1, explain: "许多定时电路中，R/C 增大会使时间变长。" }
      ]
    },
    {
      id: "ch12",
      name: "12. 多级开关LED灯（实验九）",
      videos: [{ id: "v121", title: "多级开关逻辑", duration: "08:05" }, { id: "v122", title: "状态切换演示", duration: "07:56" }],
      bookSections: ["多级开关通过不同状态组合实现多档位控制。", "可以理解为“状态机”的入门实例。", "实验关注每级状态下回路导通情况。"],
      questions: [
        { q: "多级开关的主要作用是？", options: ["固定单一状态", "实现多状态切换", "提高电压", "替代电源"], answer: 1, explain: "多级开关用于不同功能档位切换。" },
        { q: "多状态电路调试时应先做什么？", options: ["一次全接", "逐状态验证", "忽略逻辑", "删除开关"], answer: 1, explain: "逐状态排查更容易定位问题。" }
      ]
    },
    {
      id: "ch14",
      name: "14. 简易电气装置制作2：装饰用彩灯",
      videos: [{ id: "v141", title: "彩灯回路设计", duration: "09:07" }, { id: "v142", title: "外观与布线安全", duration: "06:33" }],
      bookSections: ["装饰彩灯强调美观与安全并重。", "建议分组分段布线，便于维护。", "留意总功耗与电源容量匹配。"],
      questions: [
        { q: "装饰彩灯设计中优先考虑？", options: ["仅颜色", "仅亮度", "安全与功耗", "仅长度"], answer: 2, explain: "任何电气作品都应先满足安全，再优化效果。" },
        { q: "彩灯分段布线的优点是？", options: ["更难维护", "便于排故和扩展", "必须增压", "无法并联"], answer: 1, explain: "分段有助于定位故障并便于后续扩展。" }
      ]
    },
    {
      id: "ch15",
      name: "15. 简易电气装置制作3：检测水的传感电路",
      videos: [{ id: "v151", title: "导电检测原理", duration: "08:15" }, { id: "v152", title: "水位检测实验", duration: "09:28" }],
      bookSections: ["水位检测可利用电导变化触发信号。", "需注意探针防腐蚀和误报抑制。", "适合引入“传感器-控制-执行器”系统概念。"],
      questions: [
        { q: "水位检测电路常依赖哪种变化？", options: ["温度", "导电性", "颜色", "磁场"], answer: 1, explain: "很多简易方案通过液体导电性判断状态。" },
        { q: "探针长期使用常见问题是？", options: ["防水过强", "腐蚀", "亮度上升", "电阻为零"], answer: 1, explain: "潮湿环境下探针容易腐蚀，需要材料与结构优化。" }
      ]
    },
    {
      id: "ch16",
      name: "16. LED实验：开拓认识电的世界",
      videos: [{ id: "v161", title: "综合复盘与拓展", duration: "07:20" }, { id: "v162", title: "跨学科应用案例", duration: "09:03" }],
      bookSections: ["通过 LED 系列实验可建立完整电路思维链。", "从元件、连接到系统功能，逐步形成工程化意识。", "建议结合真实生活场景进行再设计。"],
      questions: [
        { q: "本系列实验最终目标更偏向？", options: ["死记公式", "形成系统化电路思维", "仅做装饰", "避免动手"], answer: 1, explain: "核心在于形成理解与应用能力。" },
        { q: "拓展项目设计建议先做？", options: ["直接焊接", "明确需求与功能", "先加最大电压", "省略测试"], answer: 1, explain: "先定义需求与功能，再选电路方案更高效。" }
      ]
    }
  ];

  const premiumResources = [
    {
      id: "res1",
      title: "LED核心知识专题",
      pages: [
        "【LED 发光基础】\n1) LED 是 PN 结器件，正向导通时电子与空穴复合发光。\n2) 不同材料对应不同波长，决定发光颜色。\n3) 亮度受电流影响明显，教学中要先建立“电流-亮度”关系。",
        "【常见参数】\n1) 正向压降 Vf：不同颜色通常范围不同。\n2) 额定电流 If：超过额定值会加速老化或损坏。\n3) 光效与寿命：受温度、驱动方式、散热条件共同影响。",
        "【教学建议】\n通过“同电源不同电阻”实验，让学生观察亮度变化；再通过串并联对比实验，理解回路结构对电流分配的影响。"
      ]
    },
    {
      id: "res2",
      title: "低压电路安全与实验规范",
      pages: [
        "【实验前检查】\n- 先确认电源额定电压和极性。\n- 检查导线绝缘层是否完整。\n- 先画简图，再连接实物。",
        "【实验中规范】\n- 调线先断电，避免短路火花。\n- 先小电流试运行，再逐步调整。\n- 发现异常发热立即断电检查。",
        "【实验后整理】\n- 记录成功回路和故障回路差异。\n- 总结“为什么这样接会亮/不亮”。\n- 清点器材，养成工程化习惯。"
      ]
    },
    {
      id: "res3",
      title: "电路设计与排障方法",
      pages: [
        "【设计四步法】\n1) 明确目标功能。\n2) 选择元件并估算参数。\n3) 画回路并确认电流路径。\n4) 搭建与验证。",
        "【排障优先级】\n- 先查供电与开关状态。\n- 再查极性和接触情况。\n- 最后查参数是否超限（如电阻过小导致过流）。",
        "【课堂应用】\n可让学生对同一题目尝试两种实现路径，再比较稳定性、成本、维护性，培养工程思维和表达能力。"
      ]
    }
  ];

  const premiumPapers = [
    {
      id: "paperA",
      title: "精品试卷A（电路基础与符号）",
      questions: [
        { q: "电流单位是？", options: ["安培(A)", "伏特(V)", "瓦特(W)", "欧姆(Ω)"], answer: 0, explain: "电流的国际单位是安培(A)。" },
        { q: "下列不是导电现象的是？", options: ["冬天脱毛衣的啪嗒声", "摩擦后塑料尺吸纸屑", "夏天云中的闪电", "夏天出汗手吸住纸片"], answer: 3, explain: "D 项不属于典型导电放电现象。" },
        { q: "小灯泡在电路中的符号是？", options: ["圆圈内叉", "矩形", "圆圈A", "开关符号"], answer: 0, explain: "小灯泡常见符号为圆圈内叉。" },
        { q: "电池不能随意丢弃最主要原因是？", options: ["还能继续用", "外壳很值钱", "含有有害物质会污染环境", "有香味"], answer: 2, explain: "废电池含重金属与有害成分，应规范回收。" },
        { q: "家庭用电通常来自？", options: ["发电厂直接单户供电", "变电厂到发电厂", "变电厂分配到家庭", "发电站一家一线"], answer: 2, explain: "一般经过电网与变电环节分配到用户。" },
        { q: "以下关于安全用电正确的是？", options: ["湿手可接插座", "发现触电不必断电", "插头松了用手扶着", "电器着火先断电源"], answer: 3, explain: "电器着火应先断电，再采取灭火措施。" }
      ]
    },
    {
      id: "paperB",
      title: "精品试卷B（电学前概念）",
      questions: [
        { q: "下图（示意）中，两灯同时亮最可能对应？", options: ["并联合理闭合回路", "仅单灯回路", "开路回路", "无电源回路"], answer: 0, explain: "要两灯同时亮需形成有效供电回路，常见为并联或完整串联。" },
        { q: "铅笔芯属于？", options: ["绝缘体", "半导体", "导体材料的一种", "完全不导电"], answer: 2, explain: "铅笔芯含石墨，具备导电性。" },
        { q: "下列能量转换正确的是？", options: ["电风扇：电->热", "电风扇：电->动能", "电动机：电->热(唯一)", "电水壶：电->动能"], answer: 1, explain: "电风扇主要将电能转换为机械能。" },
        { q: "电压单位是？", options: ["A", "V", "W", "Hz"], answer: 1, explain: "电压单位是伏特(V)。" },
        { q: "灯泡变暗最可能是？", options: ["电源电压下降或回路电阻增大", "导线变短", "开关更紧", "并联支路减少"], answer: 0, explain: "电流减小会导致灯泡变暗。" },
        { q: "若一灯不亮另一灯还亮，常见原因是？", options: ["该支路开路", "电源消失", "全回路短路", "总开关断开"], answer: 0, explain: "并联回路中单支路故障常不影响另一支路。" }
      ]
    },
    {
      id: "paperC",
      title: "精品试卷C（科学思维与实验）",
      questions: [
        { q: "电路要点亮灯至少需要？", options: ["电池与灯泡", "灯泡与开关", "开关与导线", "所有选项"], answer: 0, explain: "最小可运行回路关键是电源与负载，并配导线构成闭环。" },
        { q: "当灯泡不亮时，最先排查的是？", options: ["换灯泡颜色", "检查电源与连线是否闭合", "增加电压到最大", "忽略开关状态"], answer: 1, explain: "先排查基本供电与连接完整性最有效。" },
        { q: "并联电路的典型特征是？", options: ["各支路电压近似相同", "所有支路电流必相同", "只有一个电流路径", "无法单独控制支路"], answer: 0, explain: "并联支路共享电压，但电流可不同。" },
        { q: "你最喜欢哪类电路实践？（选一项）", options: ["串并联搭建", "故障排查", "传感器应用", "都可以"], answer: 3, explain: "开放题可鼓励学生说明理由，培养表达能力。" },
        { q: "安全操作中错误的是？", options: ["先断电再改线", "出现异味立即断电", "潮湿手直接插拔电源", "记录实验步骤"], answer: 2, explain: "潮湿手接触电源有触电风险，应严格避免。" },
        { q: "错题复训的主要价值是？", options: ["减少思考", "巩固薄弱点", "增加题量即可", "替代实验"], answer: 1, explain: "错题复训可针对性补齐认知缺口。" }
      ]
    }
  ];

  const page = document.body.dataset.page || "";
  const protectedPages = ["home", "video", "videos", "books", "book-read", "quiz", "subscribe", "pay", "premium", "premium-resources", "premium-papers", "premium-resource", "premium-quiz", "profile", "password", "simulator"];

  // B站视频：根据教学标题搜索匹配的分享链接
  const videoBvids = {
    "ch1:v11": "https://www.bilibili.com/video/BV1t4411t7v6",
    "ch1:v12": "https://www.bilibili.com/video/BV1vY4y1F7cu",
    "ch2:v21": "https://www.bilibili.com/video/BV1xJ411R7b6",
    "ch2:v22": "https://www.bilibili.com/video/BV1vY4y1F7cu",
    "ch3:v31": "https://www.bilibili.com/video/BV1cY4y1T7JU",
    "ch3:v32": "https://www.bilibili.com/video/BV1Jv411j7SS",
    "ch4:v41": "https://www.bilibili.com/video/BV1cY4y1T7JU",
    "ch4:v42": "https://www.bilibili.com/video/BV1i34112768",
    "ch5:v51": "https://www.bilibili.com/video/BV1pv4y1K7NL",
    "ch5:v52": "https://www.bilibili.com/video/BV1ho4y1u7Z9",
    "ch6:v61": "https://www.bilibili.com/video/BV1ho4y1u7Z9",
    "ch6:v62": "https://www.bilibili.com/video/BV1VE41167wz",
    "ch7:v71": "https://www.bilibili.com/video/BV1XK411J7Yi",
    "ch7:v72": "https://www.bilibili.com/video/BV1pS4y1R7RQ",
    "ch8:v81": "https://www.bilibili.com/video/BV1DD4y1r7uT",
    "ch8:v82": "https://www.bilibili.com/video/BV1DD4y1r7uT",
    "ch9:v91": "https://www.bilibili.com/video/BV1SK411c7w3",
    "ch9:v92": "https://www.bilibili.com/video/BV1W144e3EZL",
    "ch10:v101": "https://www.bilibili.com/video/BV1qt411R7vJ",
    "ch10:v102": "https://www.bilibili.com/video/BV1qt411R7vJ",
    "ch11:v111": "https://www.bilibili.com/video/BV1qt411R7vJ",
    "ch11:v112": "https://www.bilibili.com/video/BV1VJ4m1V75F",
    "ch12:v121": "https://www.bilibili.com/video/BV1yf421Q7bS",
    "ch12:v122": "https://www.bilibili.com/video/BV17b411X7M8",
    "ch14:v141": "https://www.bilibili.com/video/BV1C5411w7vq",
    "ch14:v142": "https://www.bilibili.com/video/BV1Au4m1g7aA",
    "ch15:v151": "https://www.bilibili.com/video/BV1DD4y1r7uT",
    "ch15:v152": "https://www.bilibili.com/video/BV1DD4y1r7uT",
    "ch16:v161": "https://www.bilibili.com/video/BV1t4411t7v6",
    "ch16:v162": "https://www.bilibili.com/video/BV1gb411E7C8"
  };

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (_err) {
      return [];
    }
  }

  function setUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function currentUsername() {
    return localStorage.getItem(CURRENT_KEY) || "";
  }

  function getCurrentUser() {
    const username = currentUsername();
    if (!username) return null;
    return getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  function ensureUserShape(user) {
    if (!user.profile) user.profile = {};
    user.profile.nickname = user.profile.nickname || user.username;
    user.profile.realName = user.profile.realName || "";
    user.profile.school = user.profile.school || "";
    user.profile.birthday = user.profile.birthday || "";
    user.profile.gender = user.profile.gender || "未填写";
    if (!user.avatarColor) user.avatarColor = AVATAR_COLORS[0];
    if (!user.progress) user.progress = {};
    if (!Array.isArray(user.progress.videosWatched)) user.progress.videosWatched = [];
    if (!Array.isArray(user.progress.booksRead)) user.progress.booksRead = [];
    user.progress.quizTotal = Number(user.progress.quizTotal || 0);
    user.progress.quizCorrect = Number(user.progress.quizCorrect || 0);
    user.progress.homeworkScore = Number(user.progress.homeworkScore || 0);
    if (!Array.isArray(user.wrongBook)) user.wrongBook = [];
    if (!user.stats) user.stats = {};
    user.stats.totalMinutes = Number(user.stats.totalMinutes || 0);
    user.stats.wrongCount = Number(user.stats.wrongCount || user.wrongBook.length);
    if (typeof user.subscribed !== "boolean") user.subscribed = false;
  }

  function updateCurrentUser(mutator) {
    const username = currentUsername();
    const users = getUsers();
    const idx = users.findIndex((u) => (u.username || "").toLowerCase() === (username || "").toLowerCase());
    if (idx < 0) return null;
    ensureUserShape(users[idx]);
    mutator(users[idx]);
    ensureUserShape(users[idx]);
    setUsers(users);
    return users[idx];
  }

  function getRates(user) {
    ensureUserShape(user);
    const totalVideos = chapters.reduce((sum, ch) => sum + ch.videos.length, 0);
    const totalQuestions = chapters.reduce((sum, ch) => sum + ch.questions.length, 0);
    const videoRate = Math.round((user.progress.videosWatched.length / Math.max(1, totalVideos)) * 100);
    const bookRate = Math.round((user.progress.booksRead.length / Math.max(1, chapters.length)) * 100);
    const quizRate = Math.round((Math.min(user.progress.quizTotal, totalQuestions * 2) / Math.max(1, totalQuestions * 2)) * 100);
    const summaryRate = Math.round((videoRate + bookRate + quizRate) / 3);
    user.progress.homeworkScore = summaryRate;
    return { videoRate, bookRate, quizRate, summaryRate };
  }

  function requireAuth() {
    if (protectedPages.includes(page) && !getCurrentUser()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  function wireBackButtons() {
    document.querySelectorAll(".back-btn").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const target = btn.getAttribute("data-back-target") || "index.html";
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function getDisplayName(user) {
    if (!user) return "";
    ensureUserShape(user);
    const val = user.profile.nickname || user.username;
    return (val && val.includes("@")) ? user.username : (val || "用户");
  }

  function setupHeader() {
    const user = getCurrentUser();
    if (!user) return;
    ensureUserShape(user);
    const avatarEl = document.getElementById("headerAvatar");
    const nameEl = document.getElementById("headerName");
    const logoutBtn = document.getElementById("logoutBtn");
    if (avatarEl) avatarEl.style.background = user.avatarColor;
    if (nameEl) nameEl.textContent = getDisplayName(user);
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        const sb = window.supabaseClient;
        if (sb) await sb.auth.signOut();
        localStorage.removeItem(CURRENT_KEY);
        window.location.href = "login.html";
      });
    }
  }

  function addStudyMinutes(mins) {
    updateCurrentUser((u) => {
      u.stats.totalMinutes += mins;
    });
  }

  function renderProgressBox(progressBox) {
    if (!progressBox) return;
    const user = getCurrentUser();
    if (!user) return;
    const rates = getRates(user);
    progressBox.innerHTML = "";
    const rows = [
      ["视频学习进度", rates.videoRate],
      ["电子书阅读进度", rates.bookRate],
      ["习题完成进度", rates.quizRate],
      ["综合学习进度", rates.summaryRate]
    ];
    rows.forEach(([label, rate]) => {
      const line = document.createElement("div");
      line.className = "progress-line";
      line.innerHTML = `<div class="progress-label">${label}: ${rate}%</div><div class="bar"><span style="width:${rate}%"></span></div>`;
      progressBox.appendChild(line);
    });
  }

  function markVideo(chapterId, videoId) {
    updateCurrentUser((u) => {
      const key = `${chapterId}:${videoId}`;
      if (!u.progress.videosWatched.includes(key)) u.progress.videosWatched.push(key);
    });
  }

  function markBook(chapterId) {
    updateCurrentUser((u) => {
      if (!u.progress.booksRead.includes(chapterId)) u.progress.booksRead.push(chapterId);
    });
  }

  function addWrongQuestion(q) {
    updateCurrentUser((u) => {
      if (!u.wrongBook.some((w) => w.q === q.q)) u.wrongBook.push(q);
      u.stats.wrongCount = u.wrongBook.length;
    });
  }

  function removeWrongQuestion(q) {
    updateCurrentUser((u) => {
      u.wrongBook = u.wrongBook.filter((w) => w.q !== q.q);
      u.stats.wrongCount = u.wrongBook.length;
    });
  }

  function submitQuestionResult(ok) {
    updateCurrentUser((u) => {
      u.progress.quizTotal += 1;
      if (ok) u.progress.quizCorrect += 1;
    });
  }

  function renderHome() {
    addStudyMinutes(1);
    renderProgressBox(document.getElementById("progressBox"));
  }

  function showVideoModal(chapterName, videoTitle, duration, chapterId, videoId) {
    const modal = document.getElementById("videoModal");
    const titleEl = document.getElementById("videoModalTitle");
    const metaEl = document.getElementById("videoModalMeta");
    const playerWrap = document.getElementById("videoModalPlayer");
    if (!modal || !titleEl || !metaEl) return;
    titleEl.textContent = videoTitle;
    metaEl.textContent = `${chapterName} · 时长 ${duration}`;
    const key = `${chapterId}:${videoId}`;
    const shareLink = videoBvids[key] || "【这里替换成你的BV号】";
    const src = getBiliPlayerUrl(shareLink);
    playerWrap.innerHTML = `<iframe class="bili-player-inline" src="${src}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"></iframe>`;
    modal.classList.remove("hidden");
  }

  function extractBvidFromShareLink(link) {
    if (!link || link === "【这里替换成你的BV号】") return null;
    const m = String(link).match(/(BV[a-zA-Z0-9]+)/i);
    return m ? m[1] : (link.startsWith("BV") ? link : null);
  }

  function getBiliPlayerUrl(shareLinkOrBvid) {
    const bv = extractBvidFromShareLink(shareLinkOrBvid) || "BV1GJ411x7h7";
    return `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bv)}&page=1&high_quality=1&danmaku=0&show_related=0`;
  }

  function renderVideosPage() {
    addStudyMinutes(2);
    const listSection = document.getElementById("videosListSection");
    const playerSection = document.getElementById("videosPlayerSection");
    const listRoot = document.getElementById("videosListRoot");
    const iframe = document.getElementById("biliPlayerIframe");
    const titleEl = document.getElementById("videosPlayerTitle");
    const backBtn = document.getElementById("videosBackBtn");

    if (!listSection || !playerSection || !listRoot || !iframe || !titleEl || !backBtn) return;

    listRoot.innerHTML = "";
    chapters.forEach((ch) => {
      const block = document.createElement("div");
      block.className = "videos-chapter-block";
      const top = document.createElement("h3");
      top.textContent = ch.name;
      block.appendChild(top);
      ch.videos.forEach((v) => {
        const row = document.createElement("div");
        row.className = "videos-list-item";
        const info = document.createElement("div");
        info.className = "videos-list-info";
        info.innerHTML = `<strong>${v.title}</strong><p class="muted">时长 ${v.duration}</p>`;
        const watchBtn = document.createElement("button");
        watchBtn.className = "btn primary videos-watch-btn";
        watchBtn.textContent = "观看";
        watchBtn.addEventListener("click", () => {
          const key = `${ch.id}:${v.id}`;
          const bvid = videoBvids[key] || "【这里替换成你的BV号】";
          iframe.src = getBiliPlayerUrl(bvid);
          titleEl.textContent = `${ch.name} · ${v.title}`;
          listSection.classList.add("hidden");
          playerSection.classList.remove("hidden");
        });
        row.appendChild(info);
        row.appendChild(watchBtn);
        block.appendChild(row);
      });
      listRoot.appendChild(block);
    });

    backBtn.addEventListener("click", () => {
      const wrap = document.getElementById("videosPlayerFullscreenWrap");
      if (wrap && window.BiliFullscreen) window.BiliFullscreen.exit(wrap);
      iframe.src = "about:blank";
      listSection.classList.remove("hidden");
      playerSection.classList.add("hidden");
    });
  }

  function renderVideoPage() {
    addStudyMinutes(2);
    const root = document.getElementById("videoPageList");
    if (!root) return;
    root.innerHTML = "";
    chapters.forEach((ch) => {
      const block = document.createElement("div");
      block.className = "card";
      const top = document.createElement("h3");
      top.textContent = ch.name;
      block.appendChild(top);
      ch.videos.forEach((v) => {
        const row = document.createElement("div");
        row.className = "list-item";
        row.innerHTML = `<div><strong>${v.title}</strong><p>时长 ${v.duration}</p></div>`;
        const group = document.createElement("div");
        group.className = "button-group";
        const watchBtn = document.createElement("button");
        watchBtn.className = "btn primary";
        watchBtn.textContent = "点击观看";
        watchBtn.addEventListener("click", () => showVideoModal(ch.name, v.title, v.duration, ch.id, v.id));
        const quizBtn = document.createElement("a");
        quizBtn.className = "btn ghost";
        quizBtn.textContent = "课后习题";
        quizBtn.href = `quiz.html?chapter=${encodeURIComponent(ch.id)}`;
        group.appendChild(watchBtn);
        group.appendChild(quizBtn);
        row.appendChild(group);
        block.appendChild(row);
      });
      root.appendChild(block);
    });
  }

  function renderBooksPage() {
    addStudyMinutes(2);
    const root = document.getElementById("bookPageList");
    if (!root) return;
    root.innerHTML = "";
    chapters.forEach((ch) => {
      const wrap = document.createElement("div");
      wrap.className = "list-item";
      const left = document.createElement("div");
      left.style.width = "100%";
      const link = document.createElement("a");
      link.href = `book-read.html?chapter=${encodeURIComponent(ch.id)}`;
      link.className = "book-chapter-link";
      link.innerHTML = `<strong>${ch.name}</strong>`;
      left.appendChild(link);

      const btn = document.createElement("button");
      btn.className = "btn ghost";
      btn.textContent = "标记已阅读";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        markBook(ch.id);
        btn.textContent = "已记录";
      });
      wrap.appendChild(left);
      wrap.appendChild(btn);
      root.appendChild(wrap);
    });
  }

  function renderBookReadPage() {
    addStudyMinutes(2);
    const params = new URLSearchParams(window.location.search);
    const chapterId = params.get("chapter");
    const titleEl = document.getElementById("bookReadTitle");
    const contentEl = document.getElementById("bookReadContent");
    if (!contentEl) return;
    if (!chapterId) {
      contentEl.innerHTML = "<p>未指定章节，请从目录选择。</p>";
      return;
    }
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) {
      contentEl.innerHTML = "<p>未找到该章节。</p>";
      return;
    }
    if (titleEl) titleEl.textContent = ch.name;
    contentEl.innerHTML = ch.bookSections.map((s) => `<p>${s}</p>`).join("");
  }

  function renderQuizPage() {
    addStudyMinutes(2);
    const chapterSelect = document.getElementById("quizChapterSelect");
    const wrongBtn = document.getElementById("startWrongBookBtn");
    const quizBox = document.getElementById("quizBox");
    if (!chapterSelect || !wrongBtn || !quizBox) return;

    const queryChapter = new URLSearchParams(window.location.search).get("chapter");
    const initialChapter = chapters.some((ch) => ch.id === queryChapter) ? queryChapter : chapters[0].id;
    let state = { mode: "chapter", chapterId: initialChapter, index: 0, wrongSet: [] };

    chapters.forEach((ch) => {
      const option = document.createElement("option");
      option.value = ch.id;
      option.textContent = ch.name;
      chapterSelect.appendChild(option);
    });
    chapterSelect.value = initialChapter;

    function currentQuestion() {
      if (state.mode === "wrong") return state.wrongSet[state.index] || null;
      const chapter = chapters.find((c) => c.id === state.chapterId);
      return chapter?.questions[state.index] || null;
    }

    function totalCount() {
      if (state.mode === "wrong") return state.wrongSet.length;
      return chapters.find((c) => c.id === state.chapterId)?.questions.length || 0;
    }

    function nextQuestion() {
      state.index += 1;
      renderQuestion();
    }

    function renderQuestion() {
      const q = currentQuestion();
      if (!q) {
        quizBox.innerHTML = `<p>本轮练习完成，可切换章节继续学习。</p>`;
        return;
      }
      const count = totalCount();
      quizBox.innerHTML = `<strong>题目 ${state.index + 1}/${count}</strong><p>${q.q}</p><div class="quiz-options-wrap"></div><div class="quiz-explain-wrap"></div><button id="quizNextBtn" class="btn primary quiz-next-btn hidden">下一题</button>`;
      const optsWrap = quizBox.querySelector(".quiz-options-wrap");
      const explainWrap = quizBox.querySelector(".quiz-explain-wrap");
      const nextBtn = quizBox.querySelector("#quizNextBtn");

      q.options.forEach((op, idx) => {
        const btn = document.createElement("button");
        btn.className = "btn option-btn";
        btn.textContent = `${idx + 1}. ${op}`;
        btn.dataset.idx = String(idx);
        btn.addEventListener("click", () => {
          if (optsWrap.dataset.answered === "1") return;
          optsWrap.dataset.answered = "1";
          const ok = idx === q.answer;
          submitQuestionResult(ok);
          optsWrap.querySelectorAll(".option-btn").forEach((b, i) => {
            if (i === q.answer) b.classList.add("right");
            if (i === idx && i !== q.answer) b.classList.add("wrong");
          });
          if (ok && state.mode === "wrong") removeWrongQuestion(q);
          if (!ok) addWrongQuestion(q);
          explainWrap.innerHTML = `<div class="explain-box">${ok ? "答对了！" : "答错了："} ${q.explain}</div>`;
          nextBtn.classList.remove("hidden");
        });
        optsWrap.appendChild(btn);
      });

      nextBtn.addEventListener("click", () => {
        if (state.mode === "wrong") {
          state.wrongSet = getCurrentUser().wrongBook;
          if (state.index >= state.wrongSet.length) state.index = 0;
        }
        nextQuestion();
      });
    }

    chapterSelect.addEventListener("change", () => {
      state = { mode: "chapter", chapterId: chapterSelect.value, index: 0, wrongSet: [] };
      renderQuestion();
    });

    wrongBtn.addEventListener("click", () => {
      const user = getCurrentUser();
      if (!user.wrongBook.length) {
        quizBox.innerHTML = "<p>当前没有错题，继续章节练习吧。</p>";
        return;
      }
      state = { mode: "wrong", chapterId: "", index: 0, wrongSet: user.wrongBook };
      renderQuestion();
    });

    renderQuestion();
  }

  function renderSubscribe() {
    const user = getCurrentUser();
    if (!user) return;
    const unpaid = document.getElementById("subscribeUnpaid");
    const paid = document.getElementById("subscribePaid");
    if (!unpaid || !paid) return;
    unpaid.classList.toggle("hidden", user.subscribed);
    paid.classList.toggle("hidden", !user.subscribed);
  }

  function renderPay() {
    const status = document.getElementById("payStatus");
    const paidBtn = document.getElementById("paidBtn");
    if (!status || !paidBtn) return;
    paidBtn.addEventListener("click", () => {
      paidBtn.disabled = true;
      status.textContent = "正在检测支付状态...";
      setTimeout(() => {
        updateCurrentUser((u) => {
          u.subscribed = true;
        });
        status.textContent = "支付成功，正在跳转订阅内容...";
        setTimeout(() => {
          window.location.href = "subscribe.html";
        }, 800);
      }, 1200);
    });
  }

  function renderPremium() {
    window.location.href = "subscribe.html";
  }

  function renderPremiumResources() {
    const user = getCurrentUser();
    if (!user?.subscribed) {
      window.location.href = "subscribe.html";
      return;
    }
    const resList = document.getElementById("premiumResourceList");
    if (!resList) return;
    resList.innerHTML = "";
    premiumResources.forEach((res) => {
      const a = document.createElement("a");
      a.href = `premium-resource.html?resource=${encodeURIComponent(res.id)}`;
      a.className = "premium-list-item";
      a.innerHTML = `<strong>${res.title}</strong>`;
      resList.appendChild(a);
    });
  }

  function renderPremiumPapers() {
    const user = getCurrentUser();
    if (!user?.subscribed) {
      window.location.href = "subscribe.html";
      return;
    }
    const paperList = document.getElementById("premiumPaperList");
    if (!paperList) return;
    paperList.innerHTML = "";
    premiumPapers.forEach((paper) => {
      const a = document.createElement("a");
      a.href = `premium-quiz.html?paper=${encodeURIComponent(paper.id)}`;
      a.className = "premium-list-item";
      a.innerHTML = `<strong>${paper.title}</strong>`;
      paperList.appendChild(a);
    });
    const wrongA = document.createElement("a");
    wrongA.href = "premium-quiz.html?mode=wrong";
    wrongA.className = "premium-list-item";
    wrongA.innerHTML = "<strong>精品错题集复训</strong>";
    paperList.appendChild(wrongA);
  }

  function renderPremiumResource() {
    const user = getCurrentUser();
    if (!user?.subscribed) {
      window.location.href = "subscribe.html";
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const resourceId = params.get("resource");
    const titleEl = document.getElementById("resourceTitle");
    const contentEl = document.getElementById("premiumResourceContent");
    const prevBtn = document.getElementById("premiumPrevPageBtn");
    const nextBtn = document.getElementById("premiumNextPageBtn");
    const pageLabel = document.getElementById("premiumPageLabel");
    if (!resourceId || !contentEl || !prevBtn || !nextBtn || !pageLabel) return;

    const resource = premiumResources.find((r) => r.id === resourceId);
    if (!resource) {
      contentEl.innerHTML = "<p>未找到该资源。</p>";
      return;
    }
    if (titleEl) titleEl.textContent = resource.title;

    let pageIndex = 0;
    const pageCount = resource.pages.length;

    function render() {
      const idx = Math.max(0, Math.min(pageCount - 1, pageIndex));
      pageIndex = idx;
      contentEl.textContent = resource.pages[idx];
      contentEl.style.whiteSpace = "pre-wrap";
      pageLabel.textContent = `第 ${idx + 1} / ${pageCount} 页`;
      prevBtn.disabled = idx <= 0;
      nextBtn.disabled = idx >= pageCount - 1;
    }

    prevBtn.addEventListener("click", () => { pageIndex -= 1; render(); });
    nextBtn.addEventListener("click", () => { pageIndex += 1; render(); });
    render();
  }

  function renderPremiumQuiz() {
    const user = getCurrentUser();
    if (!user?.subscribed) {
      window.location.href = "subscribe.html";
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const paperId = params.get("paper");
    const mode = params.get("mode");
    const titleEl = document.getElementById("quizPaperTitle");
    const quizRoot = document.getElementById("premiumQuizBox");
    if (!quizRoot) return;

    let paperState = { paperId: paperId || "", index: 0, mode: mode === "wrong" ? "wrong" : "paper", wrongSet: [] };
    if (paperState.mode === "wrong") paperState.wrongSet = user.premiumWrongBook || [];

    function addPremiumWrong(q) {
      updateCurrentUser((u) => {
        if (!Array.isArray(u.premiumWrongBook)) u.premiumWrongBook = [];
        if (!u.premiumWrongBook.some((x) => x.q === q.q)) u.premiumWrongBook.push(q);
      });
    }
    function removePremiumWrong(q) {
      updateCurrentUser((u) => {
        if (!Array.isArray(u.premiumWrongBook)) u.premiumWrongBook = [];
        u.premiumWrongBook = u.premiumWrongBook.filter((x) => x.q !== q.q);
      });
    }

    function currentQuestion() {
      if (paperState.mode === "wrong") return paperState.wrongSet[paperState.index] || null;
      const paper = premiumPapers.find((p) => p.id === paperState.paperId);
      return paper?.questions[paperState.index] || null;
    }
    function totalCount() {
      if (paperState.mode === "wrong") return paperState.wrongSet.length;
      return premiumPapers.find((p) => p.id === paperState.paperId)?.questions.length || 0;
    }

    if (paperState.mode === "paper" && paperId) {
      const paper = premiumPapers.find((p) => p.id === paperId);
      if (titleEl && paper) titleEl.textContent = paper.title;
    } else if (paperState.mode === "wrong") {
      if (titleEl) titleEl.textContent = "精品错题集复训";
      if (!paperState.wrongSet.length) {
        quizRoot.innerHTML = "<p>当前没有精品错题，<a href='premium-papers.html'>返回选择试卷</a>。</p>";
        return;
      }
    } else {
      quizRoot.innerHTML = "<p>未指定试卷，<a href='premium-papers.html'>返回选择</a>。</p>";
      return;
    }

    function renderQuestion() {
      const q = currentQuestion();
      if (!q) {
        quizRoot.innerHTML = "<p>当前试卷已完成。<a href='premium-papers.html'>返回列表</a></p>";
        return;
      }
      const count = totalCount();
      quizRoot.innerHTML = `<strong>题目 ${paperState.index + 1}/${count}</strong><p>${q.q}</p><div class="quiz-options-wrap"></div><div class="quiz-explain-wrap"></div><button id="premiumQuizNextBtn" class="btn primary quiz-next-btn hidden">下一题</button>`;
      const optsWrap = quizRoot.querySelector(".quiz-options-wrap");
      const explainWrap = quizRoot.querySelector(".quiz-explain-wrap");
      const nextBtn = quizRoot.querySelector("#premiumQuizNextBtn");

      q.options.forEach((op, idx) => {
        const btn = document.createElement("button");
        btn.className = "btn option-btn";
        btn.textContent = `${idx + 1}. ${op}`;
        btn.addEventListener("click", () => {
          if (optsWrap.dataset.answered === "1") return;
          optsWrap.dataset.answered = "1";
          const ok = idx === q.answer;
          submitQuestionResult(ok);
          optsWrap.querySelectorAll(".option-btn").forEach((b, i) => {
            if (i === q.answer) b.classList.add("right");
            if (i === idx && i !== q.answer) b.classList.add("wrong");
          });
          if (ok && paperState.mode === "wrong") removePremiumWrong(q);
          if (!ok) addPremiumWrong(q);
          explainWrap.innerHTML = `<div class="explain-box">${ok ? "答对了！" : "答错了："} ${q.explain}</div>`;
          nextBtn.classList.remove("hidden");
        });
        optsWrap.appendChild(btn);
      });

      nextBtn.addEventListener("click", () => {
        paperState.index += 1;
        if (paperState.mode === "wrong") {
          paperState.wrongSet = getCurrentUser().premiumWrongBook || [];
          if (paperState.index >= paperState.wrongSet.length) paperState.index = 0;
        }
        renderQuestion();
      });
    }
    renderQuestion();
  }

  function renderAvatarOptions(container, hiddenInput, activeColor) {
    if (!container || !hiddenInput) return;
    container.innerHTML = "";
    AVATAR_COLORS.forEach((color) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `avatar-dot${activeColor === color ? " active" : ""}`;
      btn.style.background = color;
      btn.addEventListener("click", () => {
        container.querySelectorAll(".avatar-dot").forEach((el) => el.classList.remove("active"));
        btn.classList.add("active");
        hiddenInput.value = color;
      });
      container.appendChild(btn);
    });
  }

  function renderProfile() {
    addStudyMinutes(1);
    const profileView = document.getElementById("profileView");
    const profileForm = document.getElementById("profileForm");
    const editBtn = document.getElementById("editProfileBtn");
    const profileMsg = document.getElementById("profileMsg");
    const statsBox = document.getElementById("statsBox");
    const avatarOptions = document.getElementById("profileAvatarOptions");
    const avatarValue = document.getElementById("profileAvatarValue");
    if (!profileView || !profileForm || !editBtn || !statsBox || !avatarOptions || !avatarValue) return;

    function refresh() {
      const user = getCurrentUser();
      ensureUserShape(user);
      const rates = getRates(user);
      profileView.innerHTML = `
        <div class="list-item">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="avatar large" style="background:${user.avatarColor}"></div>
            <div>
              <div><strong>${getDisplayName(user)}</strong></div>
              <div class="muted">用户名：${user.username}</div>
            </div>
          </div>
        </div>
        <p>姓名：${user.profile.realName || "未填写"}</p>
        <p>学校：${user.profile.school || "未填写"}</p>
        <p>生日：${user.profile.birthday || "未填写"}</p>
        <p>性别：${user.profile.gender || "未填写"}</p>
      `;

      profileForm.nickname.value = (user.profile.nickname && !user.profile.nickname.includes("@")) ? user.profile.nickname : (user.username || "");
      profileForm.realName.value = user.profile.realName || "";
      profileForm.school.value = user.profile.school || "";
      profileForm.birthday.value = user.profile.birthday || "";
      profileForm.gender.value = user.profile.gender || "未填写";
      profileForm.username.value = user.username || "";
      avatarValue.value = user.avatarColor;
      renderAvatarOptions(avatarOptions, avatarValue, user.avatarColor);

      statsBox.innerHTML = `
        <p>总学习时长：${user.stats.totalMinutes} 分钟</p>
        <p>错题数量：${user.stats.wrongCount}</p>
        <p>视频学习进度：${rates.videoRate}%</p>
        <p>电子书阅读进度：${rates.bookRate}%</p>
        <p>习题完成进度：${rates.quizRate}%</p>
      `;
    }

    editBtn.addEventListener("click", () => {
      profileForm.classList.toggle("hidden");
    });

    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const newUsername = profileForm.username?.value.trim();
      const currentUser = getCurrentUser();
      
      // 如果修改了用户名，需要检查唯一性
      if (newUsername && newUsername !== currentUser.username) {
        const users = getUsers();
        if (users.some((u) => u.username.toLowerCase() === newUsername.toLowerCase())) {
          profileMsg.textContent = "用户名已被使用，请选择其他名称。";
          profileMsg.className = "muted error";
          return;
        }
        // 更新用户名
        updateCurrentUser((u) => {
          u.username = newUsername;
          u.profile.nickname = profileForm.nickname.value.trim() || newUsername;
          u.profile.realName = profileForm.realName.value.trim();
          u.profile.school = profileForm.school.value.trim();
          u.profile.birthday = profileForm.birthday.value;
          u.profile.gender = profileForm.gender.value;
          u.avatarColor = avatarValue.value || AVATAR_COLORS[0];
        });
        localStorage.setItem(CURRENT_KEY, newUsername);
      } else {
        updateCurrentUser((u) => {
          u.profile.nickname = profileForm.nickname.value.trim() || u.username;
          u.profile.realName = profileForm.realName.value.trim();
          u.profile.school = profileForm.school.value.trim();
          u.profile.birthday = profileForm.birthday.value;
          u.profile.gender = profileForm.gender.value;
          u.avatarColor = avatarValue.value || AVATAR_COLORS[0];
        });
      }
      profileMsg.textContent = "资料更新成功。";
      profileMsg.className = "muted";
      refresh();
    });

    refresh();
  }

  function renderPasswordPage() {
    const form = document.getElementById("passwordForm");
    const msg = document.getElementById("passwordMsg");
    if (!form || !msg) return;
    const validPassword = (pwd) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(pwd);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const oldPassword = form.oldPassword.value;
      const newPassword = form.newPassword.value;
      const confirmPassword = form.confirmPassword.value;
      if (!validPassword(newPassword)) {
        msg.textContent = "新密码需 8~16 位且包含字母和数字。";
        msg.className = "hint-box error";
        return;
      }
      if (newPassword !== confirmPassword) {
        msg.textContent = "两次新密码输入不一致。";
        msg.className = "hint-box error";
        return;
      }
      const sb = window.supabaseClient;
      if (!sb) {
        msg.textContent = "Supabase 未加载，请刷新页面。";
        msg.className = "hint-box error";
        return;
      }
      try {
        const { data: { user } } = await sb.auth.getUser();
        if (!user?.email) {
          msg.textContent = "无法获取当前用户。";
          msg.className = "hint-box error";
          return;
        }
        const { error: reauthError } = await sb.auth.signInWithPassword({ email: user.email, password: oldPassword });
        if (reauthError) {
          msg.textContent = "旧密码错误。";
          msg.className = "hint-box error";
          return;
        }
        const { error: updateError } = await sb.auth.updateUser({ password: newPassword });
        if (updateError) {
          msg.textContent = updateError.message || "修改失败。";
          msg.className = "hint-box error";
          return;
        }
        msg.textContent = "密码修改成功。";
        msg.className = "hint-box ok";
        form.reset();
      } catch (err) {
        msg.textContent = "修改失败，请重试。";
        msg.className = "hint-box error";
      }
    });
  }

  async function waitSupabase(maxMs) {
    const start = Date.now();
    while (!window.supabaseClient && (Date.now() - start) < (maxMs || 5000)) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return window.supabaseClient;
  }

  (async function init() {
    const sb = await waitSupabase();
    if (sb && protectedPages.includes(page)) {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) {
        localStorage.removeItem(CURRENT_KEY);
        window.location.href = "login.html";
        return;
      }
      // 从 user_info 获取 username（Supabase 使用真实邮箱，非 @edulearn.local）
      let username = "";
      const { data: userInfo } = await sb.from("user_info").select("username").eq("id", session.user.id).single();
      if (userInfo?.username) {
        username = userInfo.username;
      } else {
        username = session.user.email?.split("@")[0] || "user";
      }
      localStorage.setItem(CURRENT_KEY, username);
      ensureUserInStorage(username);
      updateCurrentUser((x) => {
        if ((x.profile?.nickname || "").includes("@") || !x.profile?.nickname) x.profile.nickname = username;
      });
    }
    if (!requireAuth()) return;
    wireBackButtons();
    setupHeader();

  const videoModal = document.getElementById("videoModal");
  const videoModalClose = document.getElementById("videoModalClose");
  const videoModalPlayer = document.getElementById("videoModalPlayer");
  const videoModalFullscreenWrap = document.getElementById("videoModalFullscreenWrap");
  const videoModalFullscreenBtn = document.getElementById("videoModalFullscreenBtn");
  if (videoModal && videoModalClose) {
    videoModalClose.addEventListener("click", () => {
      if (window.BiliFullscreen && videoModalFullscreenWrap) {
        window.BiliFullscreen.exit(videoModalFullscreenWrap, videoModalFullscreenBtn);
      }
      if (videoModalPlayer) videoModalPlayer.innerHTML = '<span class="video-player-placeholder">加载中...</span>';
      videoModal.classList.add("hidden");
    });
    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) {
        if (window.BiliFullscreen && videoModalFullscreenWrap) {
          window.BiliFullscreen.exit(videoModalFullscreenWrap, videoModalFullscreenBtn);
        }
        if (videoModalPlayer) videoModalPlayer.innerHTML = '<span class="video-player-placeholder">加载中...</span>';
        videoModal.classList.add("hidden");
      }
    });
  }
  if (videoModalFullscreenWrap && videoModalFullscreenBtn) {
    videoModalFullscreenBtn.setAttribute("data-bili-fullscreen-btn", "1");
    videoModalFullscreenBtn.addEventListener("click", () => {
      if (window.BiliFullscreen) {
        window.BiliFullscreen.toggle(videoModalFullscreenWrap, videoModalFullscreenBtn);
      }
    });
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && !videoModalFullscreenWrap.classList.contains("bili-overlay-active") && videoModalFullscreenBtn) {
        videoModalFullscreenBtn.textContent = "全屏";
      }
    });
  }

  if (page === "home") renderHome();
  if (page === "video") renderVideoPage();
  if (page === "videos") renderVideosPage();
  if (page === "books") renderBooksPage();
  if (page === "book-read") renderBookReadPage();
  if (page === "quiz") renderQuizPage();
  if (page === "subscribe") renderSubscribe();
  if (page === "pay") renderPay();
  if (page === "premium") renderPremium();
  if (page === "premium-resources") renderPremiumResources();
  if (page === "premium-papers") renderPremiumPapers();
  if (page === "premium-resource") renderPremiumResource();
  if (page === "premium-quiz") renderPremiumQuiz();
  if (page === "profile") renderProfile();
  if (page === "password") renderPasswordPage();
  })();
})();
