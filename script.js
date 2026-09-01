(function () {
  'use strict';

  var EXAMPLE = [
    '怎么注册账号 | 点击右上角"注册"按钮，填写手机号和验证码即可完成注册。',
    '多久能发货 | 一般下单后 24 小时内发货，节假日顺延。',
    '支持退款吗 | 支持，收到货 7 天内无理由退款。',
    '怎么联系客服 | 点击页面右下角的在线客服图标，或发邮件到 support@example.com。',
    '支持哪些支付方式 | 支持支付宝、微信支付和银行卡。',
  ].join('\n');

  var qaInput = document.getElementById('qaInput');
  var chatLog = document.getElementById('chatLog');
  var chatForm = document.getElementById('chatForm');
  var chatInput = document.getElementById('chatInput');

  var pairs = [];

  var STOPWORDS = ['的', '了', '吗', '呢', '啊', '是', '在', '我', '你', '请问', '一下', '有', '吧'];

  function tokenize(text) {
    var cleaned = text.replace(/[，。！？、；：""''（）\s,.!?;:()]/g, '');
    STOPWORDS.forEach(function (w) {
      cleaned = cleaned.split(w).join('');
    });
    return cleaned.split('');
  }

  function overlapScore(a, b) {
    var setA = new Set(tokenize(a));
    var setB = new Set(tokenize(b));
    if (!setA.size || !setB.size) return 0;
    var intersection = 0;
    setA.forEach(function (ch) { if (setB.has(ch)) intersection++; });
    return intersection / Math.min(setA.size, setB.size);
  }

  function parseQA(text) {
    return text.split('\n').map(function (line) {
      var idx = line.indexOf('|');
      if (idx === -1) return null;
      var q = line.slice(0, idx).trim();
      var a = line.slice(idx + 1).trim();
      if (!q || !a) return null;
      return { q: q, a: a };
    }).filter(Boolean);
  }

  function applyQA() {
    pairs = parseQA(qaInput.value);
    chatLog.innerHTML = '';
    addMsg('bot', pairs.length ? '问答表已更新（共 ' + pairs.length + ' 条），可以开始提问了。' : '还没有配置任何问答，请先在左边填写。');
  }

  function addMsg(role, text) {
    var el = document.createElement('div');
    el.className = 'msg ' + role;
    el.textContent = text;
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
    return el;
  }

  function answer(question) {
    if (!pairs.length) return '还没有配置任何问答，请先在左边填写问答表。';
    var best = null;
    var bestScore = 0;
    pairs.forEach(function (p) {
      var s = overlapScore(question, p.q);
      if (s > bestScore) { bestScore = s; best = p; }
    });
    if (best && bestScore >= 0.34) return best.a;
    return '抱歉，没有找到相关答案。可以换个说法试试，或者查看左边的问答表。';
  }

  chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = chatInput.value.trim();
    if (!q) return;
    addMsg('user', q);
    chatInput.value = '';
    setTimeout(function () {
      addMsg('bot', answer(q));
    }, 200);
  });

  document.getElementById('btnApply').addEventListener('click', applyQA);
  document.getElementById('btnExample').addEventListener('click', function () {
    qaInput.value = EXAMPLE;
    applyQA();
  });

  qaInput.value = EXAMPLE;
  applyQA();
})();
