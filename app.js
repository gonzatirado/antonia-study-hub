// ============================================
// ANTONIA STUDY HUB - Complete Application
// ============================================

(function () {
  'use strict';

  // --- Data (dynamic, stored in localStorage) ---
  const ICONS = ['\u2666', '\u25B2', '\u2600', '\u2690', '\u2605', '\u2302', '\u2618', '\u2738', '\u2756', '\u2748'];

  function getSubjects() {
    return Store.get('subjects', []);
  }

  function saveSubjects(subjects) {
    Store.set('subjects', subjects);
  }

  function addSubject(name, shortName, color) {
    const subjects = getSubjects();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (subjects.find(s => s.id === id)) {
      showToast('Ya existe una asignatura con ese nombre', 'error');
      return false;
    }
    const icon = ICONS[subjects.length % ICONS.length];
    subjects.push({ id: id, name: name, color: color, icon: icon, shortName: shortName });
    saveSubjects(subjects);
    return true;
  }

  function deleteSubject(id) {
    let subjects = getSubjects();
    subjects = subjects.filter(s => s.id !== id);
    saveSubjects(subjects);
    // Clean up subject data
    Store.set('notes_' + id, []);
    Store.set('files_' + id, []);
    Store.set('summaries_' + id, []);
  }

  function deleteSubjectUI(id) {
    const subject = getSubject(id);
    if (!subject) return;
    if (!confirm('Eliminar "' + subject.name + '"? Se borran todos sus apuntes, archivos y resumenes.')) return;
    deleteSubject(id);
    // Also remove from schedule
    const schedule = getSchedule();
    DAYS.forEach(day => {
      if (schedule[day]) {
        schedule[day] = schedule[day].filter(c => c.subject !== id);
      }
    });
    saveSchedule(schedule);
    renderSidebar();
    navigate('dashboard');
    showToast('Asignatura eliminada', 'success');
  }

  function getUserName() {
    return Store.get('userName', '');
  }

  function getSchedule() {
    return Store.get('schedule', { Lunes: [], Martes: [], Miercoles: [], Jueves: [], Viernes: [] });
  }

  function saveSchedule(schedule) {
    Store.set('schedule', schedule);
  }

  const TIME_SLOTS = [
    '08:00 - 09:10',
    '09:20 - 10:30',
    '10:40 - 11:50',
    '11:10 - 12:20',
    '12:30 - 13:40',
    '13:50 - 15:00',
    '15:10 - 16:20',
    '16:30 - 17:40',
    '17:50 - 19:00',
    '19:10 - 20:20'
  ];

  const DAYS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

  const QUOTES = [
    { text: 'La geologia es el estudio de la presion y el tiempo. Eso es todo lo que se necesita.', author: 'Inspirado en Shawshank' },
    { text: 'Las rocas no mienten. Cada estrato cuenta una historia que ha esperado millones de anos para ser leida.', author: 'Principio geologico' },
    { text: 'En cada cristal hay una leccion de paciencia: la perfeccion toma tiempo.', author: 'Sabiduria mineralogica' },
    { text: 'Los mapas topograficos son poesia escrita en curvas de nivel.', author: 'Cartografia geologica' },
    { text: 'Cada fosil es una carta del pasado dirigida al futuro.', author: 'Paleontologia filosofica' },
    { text: 'La tierra guarda sus secretos en capas. Tu conocimiento tambien se construye asi.', author: 'Estratigrafia del saber' },
    { text: 'Como el agua moldea la roca, la constancia moldea el conocimiento.', author: 'Geomorfologia del aprendizaje' },
    { text: 'No hay roca demasiado dura para quien tiene las herramientas correctas.', author: 'Mineria del conocimiento' }
  ];

  const BADGES = [
    { id: 'first-note', name: 'Primera Roca', desc: 'Crea tu primer apunte', icon: '\uD83E\uDEA8', condition: s => s.totalNotes >= 1 },
    { id: 'five-notes', name: 'Coleccionista', desc: '5 apuntes creados', icon: '\uD83D\uDCDA', condition: s => s.totalNotes >= 5 },
    { id: 'first-quiz', name: 'Exploradora', desc: 'Completa tu primer quiz', icon: '\uD83E\uDDED', condition: s => s.totalQuizzes >= 1 },
    { id: 'perfect-quiz', name: 'Cristal Perfecto', desc: '100% en un quiz', icon: '\uD83D\uDC8E', condition: s => s.perfectQuizzes >= 1 },
    { id: 'five-quizzes', name: 'Geologa Experta', desc: '5 quizzes completados', icon: '\uD83C\uDF1F', condition: s => s.totalQuizzes >= 5 },
    { id: 'first-summary', name: 'Cartografa', desc: 'Genera tu primer resumen', icon: '\uD83D\uDDFA\uFE0F', condition: s => s.totalSummaries >= 1 },
    { id: 'streak-3', name: 'Racha de Fuego', desc: '3 dias seguidos', icon: '\uD83D\uDD25', condition: s => s.streak >= 3 },
    { id: 'streak-7', name: 'Diamante', desc: '7 dias seguidos', icon: '\uD83D\uDC8E', condition: s => s.streak >= 7 },
    { id: 'all-subjects', name: 'Pangea', desc: 'Apuntes en todas las materias', icon: '\uD83C\uDF0D', condition: s => s.subjectsWithNotes >= Math.max(1, getSubjects().length) },
    { id: 'ten-quizzes', name: 'Maestra Geologa', desc: '10 quizzes completados', icon: '\uD83C\uDFC6', condition: s => s.totalQuizzes >= 10 }
  ];

  // --- State Management ---
  const Store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem('ash_' + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    set(key, value) {
      localStorage.setItem('ash_' + key, JSON.stringify(value));
    }
  };

  // --- Utility Functions ---
  function getSubject(id) {
    return getSubjects().find(s => s.id === id);
  }

  function sanitize(str) {
    return String(str).replace(/[^\x00-\x7F]/g, '').replace(/[<>"'&]/g, c => {
      const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
      return map[c];
    });
  }

  function sanitizeForAPI(str) {
    return String(str).replace(/[^\x00-\x7F]/g, '');
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getDayName() {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    return days[new Date().getDay()];
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // --- Toast Notification ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const icons = { success: '\u2713', error: '\u2717', info: '\u2139' };
    toast.innerHTML = '<span>' + (icons[type] || '') + '</span><span>' + escapeHTML(message) + '</span>';
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --- Confetti ---
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#9B72CF', '#2D9B6F', '#E8973A', '#3B6FA0', '#E8A0B4', '#4CAF8A'];
    const particles = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 20 - 5,
        w: Math.random() * 10 + 4,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.4
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.vx *= 0.99;
        if (p.y < canvas.height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, 1 - frame / 120);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });
      frame++;
      if (alive && frame < 150) requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate();
  }

  // --- 3D Card Hover ---
  function init3DCards() {
    document.querySelectorAll('.card-3d').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -5;
        const rotateY = (x - centerX) / centerX * 5;
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  // --- Streak ---
  function updateStreak() {
    const today = new Date().toDateString();
    const lastVisit = Store.get('lastVisit', null);
    let streak = Store.get('streak', 0);

    if (lastVisit === today) return streak;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastVisit === yesterday.toDateString()) {
      streak++;
    } else if (lastVisit !== today) {
      streak = 1;
    }

    Store.set('streak', streak);
    Store.set('lastVisit', today);
    return streak;
  }

  // --- Activity tracking ---
  function logActivity() {
    const today = new Date().toISOString().split('T')[0];
    const activity = Store.get('activity', {});
    activity[today] = (activity[today] || 0) + 1;
    Store.set('activity', activity);
  }

  // --- Stats computation ---
  function computeStats() {
    const subjects = getSubjects();
    let totalNotes = 0;
    let subjectsWithNotes = 0;
    subjects.forEach(s => {
      const notes = Store.get('notes_' + s.id, []);
      totalNotes += notes.length;
      if (notes.length > 0) subjectsWithNotes++;
    });

    let totalSummaries = 0;
    subjects.forEach(s => {
      const summaries = Store.get('summaries_' + s.id, []);
      totalSummaries += summaries.length;
    });

    const quizHistory = Store.get('quizHistory', []);
    const totalQuizzes = quizHistory.length;
    const perfectQuizzes = quizHistory.filter(q => q.score === q.total).length;
    const streak = Store.get('streak', 0);

    return { totalNotes, totalSummaries, totalQuizzes, perfectQuizzes, streak, subjectsWithNotes };
  }

  // --- AI API (Gemini free by default, Claude optional) ---
  async function callAI(systemPrompt, userMessage) {
    const geminiKey = Store.get('geminiKey', '');
    const claudeKey = Store.get('apiKey', '');

    if (!geminiKey && !claudeKey) {
      showToast('Configura tu API Key en ajustes', 'error');
      throw new Error('No API key');
    }

    const cleanMessage = sanitizeForAPI(userMessage);
    const cleanSystem = sanitizeForAPI(systemPrompt);

    // Prefer Claude if both keys exist, otherwise use whichever is available
    if (claudeKey) {
      return await callClaude(cleanSystem, cleanMessage, claudeKey);
    }
    return await callGemini(cleanSystem, cleanMessage, geminiKey);
  }

  async function callClaude(systemPrompt, userMessage, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error('API Error: ' + response.status + ' ' + err);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async function callGemini(systemPrompt, userMessage, apiKey) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 4096 }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error('API Error: ' + response.status + ' ' + err);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // --- Empty State SVG ---
  function emptyStateSVG(type) {
    if (type === 'notes') {
      return '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="8" width="48" height="64" rx="4" stroke="currentColor" stroke-width="2"/><line x1="24" y1="24" x2="56" y2="24" stroke="currentColor" stroke-width="2" opacity="0.5"/><line x1="24" y1="32" x2="48" y2="32" stroke="currentColor" stroke-width="2" opacity="0.3"/><line x1="24" y1="40" x2="52" y2="40" stroke="currentColor" stroke-width="2" opacity="0.3"/><line x1="24" y1="48" x2="44" y2="48" stroke="currentColor" stroke-width="2" opacity="0.3"/></svg>';
    }
    if (type === 'quiz') {
      return '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="28" stroke="currentColor" stroke-width="2"/><text x="40" y="48" text-anchor="middle" font-size="24" fill="currentColor" opacity="0.5">?</text></svg>';
    }
    if (type === 'summary') {
      return '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 16 L60 16 L60 64 L20 64 Z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M28 28 L52 28" stroke="currentColor" stroke-width="2" opacity="0.5"/><path d="M28 36 L52 36" stroke="currentColor" stroke-width="2" opacity="0.3"/><path d="M28 44 L44 44" stroke="currentColor" stroke-width="2" opacity="0.3"/><circle cx="54" cy="54" r="12" stroke="currentColor" stroke-width="2"/><path d="M50 54 L54 58 L60 50" stroke="currentColor" stroke-width="2"/></svg>';
    }
    return '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="28" stroke="currentColor" stroke-width="2" opacity="0.3"/></svg>';
  }

  // ============================================
  // VIEWS
  // ============================================

  // --- Dashboard ---
  function renderDashboard() {
    const main = document.getElementById('main-content');
    const streak = updateStreak();
    const today = getDayName();
    const schedule = getSchedule();
    const todayClasses = schedule[today] || [];
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const stats = computeStats();

    // Weekly progress: count days with activity this week
    const activity = Store.get('activity', {});
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    let activeDays = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const key = d.toISOString().split('T')[0];
      if (activity[key]) activeDays++;
    }
    const weekProgress = Math.round((activeDays / 5) * 100);

    let todayHTML = '';
    if (todayClasses.length === 0) {
      todayHTML = '<p style="color:var(--text-muted);margin-top:12px;">No hay clases hoy. Buen dia para repasar!</p>';
    } else {
      todayHTML = '<div class="class-list">';
      todayClasses.forEach(c => {
        const subj = getSubject(c.subject);
        todayHTML += '<div class="class-chip" style="--chip-color:' + subj.color + '">' +
          '<span><strong>' + escapeHTML(subj.shortName) + '</strong></span>' +
          '<span class="time">' + c.start + ' - ' + c.end + '</span>' +
          '</div>';
      });
      todayHTML += '</div>';
    }

    const subjects = getSubjects();
    let subjectsHTML = '';
    if (subjects.length === 0) {
      subjectsHTML = '<div class="card stagger" style="text-align:center;padding:40px">' +
        '<p style="font-size:18px;margin-bottom:16px">Aun no tienes asignaturas</p>' +
        '<p style="color:var(--text-muted);margin-bottom:20px">Crea tu primera asignatura para comenzar a estudiar</p>' +
        '<button class="btn btn-primary" onclick="window.app.openAddSubject()">+ Nueva asignatura</button>' +
      '</div>';
    }
    subjects.forEach((s, i) => {
      const notes = Store.get('notes_' + s.id, []);
      const files = Store.get('files_' + s.id, []);
      const quizzes = Store.get('quizHistory', []).filter(q => q.subjectId === s.id);
      subjectsHTML += '<div class="card card-3d subject-card stagger" data-subject="' + s.id + '" onclick="window.app.navigateToSubject(\'' + s.id + '\')">' +
        '<div class="card-accent" style="background:' + s.color + '"></div>' +
        '<div class="card-icon" style="background:' + s.color + '22;color:' + s.color + '">' + s.icon + '</div>' +
        '<h3>' + escapeHTML(s.shortName) + '</h3>' +
        '<p class="card-desc">' + escapeHTML(s.name) + '</p>' +
        '<div class="card-stats">' +
          '<div class="stat"><span class="stat-value" style="color:' + s.color + '">' + files.length + '</span><span class="stat-label">Archivos</span></div>' +
          '<div class="stat"><span class="stat-value" style="color:' + s.color + '">' + notes.length + '</span><span class="stat-label">Apuntes</span></div>' +
          '<div class="stat"><span class="stat-value" style="color:' + s.color + '">' + quizzes.length + '</span><span class="stat-label">Quizzes</span></div>' +
        '</div>' +
      '</div>';
    });

    main.innerHTML =
      '<div class="dashboard-greeting stagger">' +
        '<h1>Hola' + (getUserName() ? ', <span>' + escapeHTML(getUserName()) + '</span>' : '') + '</h1>' +
        '<p class="subtitle">Hoy es ' + today + '. ' + (streak > 1 ? 'Llevas ' + streak + ' dias de racha!' : 'Un buen dia para estudiar.') + '</p>' +
      '</div>' +

      '<div class="card today-widget stagger">' +
        '<h3>Clases de hoy</h3>' +
        todayHTML +
      '</div>' +

      '<div class="subjects-grid">' + subjectsHTML + '</div>' +

      '<div class="card progress-section stagger">' +
        '<h3>Tu semana</h3>' +
        '<p style="color:var(--text-muted);font-size:13px;margin-bottom:12px">Cada dia que usas la app cuenta como dia activo</p>' +
        '<div class="progress-bar-container"><div class="progress-bar-fill" style="width:' + weekProgress + '%"></div></div>' +
        '<div class="progress-stats"><span>' + activeDays + '/5 dias estudiaste</span><span>' + weekProgress + '%</span></div>' +
      '</div>' +

      '<div class="card quote-card stagger">' +
        '<p class="quote-text">"' + escapeHTML(quote.text) + '"</p>' +
        '<p class="quote-author">-- ' + escapeHTML(quote.author) + '</p>' +
      '</div>';

    init3DCards();
    logActivity();
  }

  // --- File Reading Utilities ---
  async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsText(file);
    });
  }

  async function extractPDFText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result);
          const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n\n';
          }
          resolve(text.trim());
        } catch (e) {
          reject(new Error('Error extrayendo texto del PDF: ' + e.message));
        }
      };
      reader.onerror = () => reject(new Error('Error leyendo PDF'));
      reader.readAsArrayBuffer(file);
    });
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsDataURL(file);
    });
  }

  async function processUploadedFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    let textContent = '';
    let rawData = '';

    if (ext === 'txt' || ext === 'md' || ext === 'csv') {
      textContent = await readFileAsText(file);
    } else if (ext === 'pdf') {
      textContent = await extractPDFText(file);
      try { rawData = await readFileAsDataURL(file); } catch(e) {}
    } else {
      textContent = await readFileAsText(file);
    }

    // Decode URL-encoded filenames
    var cleanName = file.name;
    try { cleanName = decodeURIComponent(file.name.replace(/\+/g, ' ')); } catch(e) {}

    return {
      id: generateId(),
      name: cleanName,
      type: ext,
      size: file.size,
      content: textContent,
      rawData: rawData,
      date: new Date().toISOString(),
      order: Date.now()
    };
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function getFileIcon(type) {
    if (type === 'pdf') return '\uD83D\uDCC4';
    if (type === 'txt' || type === 'md') return '\uD83D\uDCDD';
    return '\uD83D\uDCC1';
  }

  function formatFileContent(text) {
    if (!text) return '<p style="color:var(--text-muted)">(Sin contenido de texto)</p>';
    // Split by double newlines into paragraphs, escape HTML, wrap in <p>
    return text.split(/\n{2,}/)
      .map(function(block) {
        var escaped = escapeHTML(block.trim());
        if (!escaped) return '';
        // Preserve single line breaks within a block
        return '<p>' + escaped.replace(/\n/g, '<br>') + '</p>';
      })
      .filter(function(p) { return p; })
      .join('');
  }

  async function renderPDFPages(dataUrl) {
    try {
      var pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      // Convert data URL to typed array
      var raw = atob(dataUrl.split(',')[1]);
      var arr = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);

      var pdf = await pdfjsLib.getDocument(arr).promise;
      var container = document.getElementById('pdf-viewer-container');
      if (!container) return;

      container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;margin-bottom:12px">' + pdf.numPages + ' paginas</p>';

      for (var p = 1; p <= pdf.numPages; p++) {
        var page = await pdf.getPage(p);
        var scale = 1.5;
        var viewport = page.getViewport({ scale: scale });
        var canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas';
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        container.appendChild(canvas);

        await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
      }
    } catch (e) {
      var c = document.getElementById('pdf-viewer-container');
      if (c) c.innerHTML = '<p style="color:var(--text-muted)">Error renderizando PDF: ' + e.message + '</p>';
    }
  }

  function cleanFileName(name) {
    try { return decodeURIComponent((name || '').replace(/\+/g, ' ')); } catch(e) { return name; }
  }

  function getFileIconClass(type) {
    if (type === 'pdf') return 'pdf';
    if (type === 'txt' || type === 'md') return 'txt';
    return 'other';
  }

  // --- Summary prompt builder ---
  function buildSummaryPrompt(subjectName) {
    var uname = getUserName() || 'el estudiante';
    return 'Eres un asistente academico para ' + uname + '. ' +
      'Genera un resumen VISUAL y estructurado del contenido. Usa HTML rico (NO markdown). ' +
      'REGLAS DE FORMATO:\n' +
      '1) Usa <h2> para secciones principales y <h4> para subsecciones.\n' +
      '2) Envuelve conceptos clave en: <div class="concept-card green/orange/blue/pink"><h5>Titulo</h5><p>Explicacion</p></div>. Alterna los colores.\n' +
      '3) Para terminos importantes usa: <span class="key-term purple/green/orange/blue">termino</span>.\n' +
      '4) Para tips o datos clave usa: <div class="callout tip"><span class="callout-icon">&#128161;</span><div>texto</div></div>.\n' +
      '5) Para formulas o datos numericos: <div class="callout formula"><span class="callout-icon">&#128300;</span><div>formula</div></div>.\n' +
      '6) Para advertencias: <div class="callout important"><span class="callout-icon">&#9888;&#65039;</span><div>texto</div></div>.\n' +
      '7) Si hay procesos o ciclos, crea un diagrama de flujo: <div class="diagram-container"><p class="diagram-title">Titulo</p><div class="flow-diagram"><div class="flow-step"><span class="step-icon">emoji</span>Paso 1</div><span class="flow-arrow">&#8594;</span><div class="flow-step"><span class="step-icon">emoji</span>Paso 2</div></div></div>.\n' +
      '8) Si hay comparaciones, usa tabla: <table class="compare-table"><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>...</td><td>...</td></tr></tbody></table>.\n' +
      '9) Usa <div class="section-divider"><span>SECCION</span></div> para separar secciones grandes.\n' +
      '10) Usa <ul> y <li> para listas, <strong> para enfasis.\n' +
      '11) Incluye diagramas de flujo, tablas comparativas y callouts donde sea pertinente al tema.\n' +
      '12) Al final agrega una seccion "Puntos clave para recordar" con los 5 conceptos mas importantes.\n' +
      'La asignatura es: ' + subjectName + '. Se visualmente atractivo y pedagogicamente claro.';
  }

  // Selected files for AI operations
  let selectedFileIds = [];

  function getSelectedFilesContent() {
    const files = Store.get('files_' + currentSubject, []);
    const selected = files.filter(f => selectedFileIds.includes(f.id));
    if (selected.length === 0) return '';
    return selected.map(f => '--- ' + f.name + ' ---\n' + f.content).join('\n\n');
  }

  // --- Subject View ---
  let currentSubject = null;
  let currentTab = 'notes';
  let currentNoteId = null;
  let quizState = null;

  function renderSubjectView(subjectId) {
    currentSubject = subjectId;
    const subject = getSubject(subjectId);
    const main = document.getElementById('main-content');

    main.innerHTML =
      '<div class="subject-header stagger">' +
        '<div class="flex-between">' +
          '<button class="back-btn" onclick="window.app.navigate(\'dashboard\')">&larr; Volver</button>' +
          '<button class="btn btn-danger-sm" onclick="window.app.deleteSubjectUI(\'' + subjectId + '\')" title="Eliminar asignatura">Eliminar</button>' +
        '</div>' +
        '<div class="subject-color-bar" style="background:' + subject.color + '"></div>' +
        '<h1>' + escapeHTML(subject.name) + '</h1>' +
      '</div>' +

      '<div class="tabs stagger">' +
        '<button class="tab-btn ' + (currentTab === 'files' ? 'active' : '') + '" onclick="window.app.switchTab(\'files\')">Materiales</button>' +
        '<button class="tab-btn ' + (currentTab === 'notes' ? 'active' : '') + '" onclick="window.app.switchTab(\'notes\')">Apuntes</button>' +
        '<button class="tab-btn ' + (currentTab === 'summaries' ? 'active' : '') + '" onclick="window.app.switchTab(\'summaries\')">Resumenes</button>' +
        '<button class="tab-btn ' + (currentTab === 'quiz' ? 'active' : '') + '" onclick="window.app.switchTab(\'quiz\')">Cuestionario</button>' +
        '<button class="tab-btn ' + (currentTab === 'exam' ? 'active' : '') + '" onclick="window.app.switchTab(\'exam\')">Prep. Prueba</button>' +
      '</div>' +

      '<div id="tab-content"></div>';

    renderTab();
  }

  function renderTab() {
    const container = document.getElementById('tab-content');
    if (!container) return;

    switch (currentTab) {
      case 'files': renderFilesTab(container); break;
      case 'notes': renderNotesTab(container); break;
      case 'summaries': renderSummariesTab(container); break;
      case 'quiz': renderQuizTab(container); break;
      case 'exam': renderExamTab(container); break;
    }
  }

  // --- Files/Materials Tab ---
  let viewingFileId = null;
  let fileSortBy = 'date';

  function renderFilesTab(container) {
    const files = Store.get('files_' + currentSubject, []);
    const subject = getSubject(currentSubject);

    // Sort files
    let sorted = [...files];
    if (fileSortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (fileSortBy === 'size') sorted.sort((a, b) => b.size - a.size);
    else if (fileSortBy === 'type') sorted.sort((a, b) => a.type.localeCompare(b.type));
    else sorted.sort((a, b) => b.order - a.order);

    // File viewer
    if (viewingFileId) {
      const file = files.find(f => f.id === viewingFileId);
      if (file) {
        container.innerHTML =
          '<button class="btn btn-secondary mb-16" onclick="window.app.backToFiles()">&larr; Volver a materiales</button>' +
          '<div class="card">' +
            '<div class="flex-between mb-16">' +
              '<div>' +
                '<h3>' + escapeHTML(cleanFileName(file.name)) + '</h3>' +
                '<span style="color:var(--text-muted);font-size:12px">' + formatFileSize(file.size) + ' &middot; ' + formatDate(file.date) + '</span>' +
              '</div>' +
              '<div class="flex gap-8">' +
                '<button class="btn btn-primary" onclick="window.app.useFileForSummary(\'' + file.id + '\')">Resumir con IA</button>' +
                '<button class="btn btn-secondary" onclick="window.app.useFileForQuiz(\'' + file.id + '\')">Hacer quiz</button>' +
              '</div>' +
            '</div>' +
            (file.rawData && file.type === 'pdf'
              ? '<div class="file-viewer-pdf" id="pdf-viewer-container"></div>'
              : file.type === 'pdf'
                ? '<div class="file-viewer-notice"><p>Este PDF fue subido antes de la actualizacion del visor.</p><p>Eliminalo y vuelvelo a subir para verlo en formato original.</p></div>' +
                  '<div class="file-viewer">' + formatFileContent(file.content) + '</div>'
                : '<div class="file-viewer">' + formatFileContent(file.content) + '</div>') +
          '</div>';

        // Render PDF pages with PDF.js
        if (file.rawData && file.type === 'pdf') {
          renderPDFPages(file.rawData);
        }
        return;
      }
    }

    let filesHTML = '';
    sorted.forEach(f => {
      const preview = (f.content || '').substring(0, 120).replace(/\n/g, ' ');
      filesHTML += '<div class="file-card" draggable="true" data-file-id="' + f.id + '" ' +
        'ondragstart="window.app.fileDragStart(event,\'' + f.id + '\')" ' +
        'ondragover="window.app.fileDragOver(event)" ' +
        'ondragleave="window.app.fileDragLeave(event)" ' +
        'ondrop="window.app.fileDrop(event,\'' + f.id + '\')">' +
        '<div class="file-card-actions">' +
          '<button class="file-action-btn" onclick="window.app.viewFile(\'' + f.id + '\')" title="Ver contenido">\uD83D\uDC41</button>' +
          '<button class="file-action-btn danger" onclick="window.app.deleteFile(\'' + f.id + '\')" title="Eliminar">&times;</button>' +
        '</div>' +
        '<div class="file-card-header">' +
          '<div class="file-icon ' + getFileIconClass(f.type) + '">' + getFileIcon(f.type) + '</div>' +
          '<div class="file-card-info">' +
            '<div class="file-card-name">' + escapeHTML(cleanFileName(f.name)) + '</div>' +
            '<div class="file-card-meta">' + formatFileSize(f.size) + ' &middot; ' + formatDate(f.date) + '</div>' +
          '</div>' +
        '</div>' +
        (preview ? '<div class="file-card-preview">' + escapeHTML(preview) + '</div>' : '') +
        '<div style="display:flex;gap:6px;margin-top:10px;align-items:center">' +
          '<span class="file-card-badge ' + getFileIconClass(f.type) + '">' + f.type.toUpperCase() + '</span>' +
          '<button class="btn btn-primary" style="padding:4px 12px;font-size:11px;margin-left:auto" onclick="event.stopPropagation();window.app.processFileWithAI(\'' + f.id + '\')">Procesar con IA</button>' +
        '</div>' +
      '</div>';
    });

    container.innerHTML =
      '<div class="file-dropzone" id="file-dropzone">' +
        '<input type="file" id="file-input" multiple accept=".txt,.pdf,.md,.csv,.doc,.docx">' +
        '<div class="dropzone-icon">\uD83D\uDCC2</div>' +
        '<p class="dropzone-text">Arrastra archivos aqui o <span class="dropzone-browse">busca en tu computador</span></p>' +
        '<p class="dropzone-hint">PDF, TXT, MD, CSV</p>' +
      '</div>' +
      '<div id="file-processing" class="hidden"></div>' +
      (files.length > 0 ?
        '<div class="files-toolbar">' +
          '<div><h3>Materiales (' + files.length + ')</h3><p class="files-count">Arrastra las tarjetas para reordenar</p></div>' +
          '<select class="sort-select" onchange="window.app.sortFiles(this.value)">' +
            '<option value="date"' + (fileSortBy === 'date' ? ' selected' : '') + '>Mas reciente</option>' +
            '<option value="name"' + (fileSortBy === 'name' ? ' selected' : '') + '>Nombre</option>' +
            '<option value="type"' + (fileSortBy === 'type' ? ' selected' : '') + '>Tipo</option>' +
            '<option value="size"' + (fileSortBy === 'size' ? ' selected' : '') + '>Tamano</option>' +
          '</select>' +
        '</div>' +
        '<div class="files-grid">' + filesHTML + '</div>'
      :
        '<div class="empty-state mt-24">' +
          '<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="20" width="56" height="44" rx="4" stroke="currentColor" stroke-width="2"/><path d="M12 32h56" stroke="currentColor" stroke-width="2" opacity="0.3"/><path d="M32 8h16l8 12H24l8-12z" stroke="currentColor" stroke-width="2"/></svg>' +
          '<h3>Sin materiales</h3>' +
          '<p>Sube archivos PDF o de texto para usar con la IA</p>' +
        '</div>'
      );

    // Attach file input event
    setTimeout(() => {
      const dropzone = document.getElementById('file-dropzone');
      const fileInput = document.getElementById('file-input');

      if (fileInput) {
        fileInput.addEventListener('change', (e) => handleFileUpload(e.target.files));
      }
      if (dropzone) {
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
          handleFileUpload(e.dataTransfer.files);
        });
      }
    }, 50);
  }

  async function handleFileUpload(fileList) {
    if (!fileList || fileList.length === 0) return;

    const processingEl = document.getElementById('file-processing');
    if (processingEl) {
      processingEl.className = 'file-processing';
      processingEl.innerHTML = '<div class="spinner"></div><span>Procesando ' + fileList.length + ' archivo(s)...</span>';
    }

    const files = Store.get('files_' + currentSubject, []);
    let processed = 0;

    for (const file of fileList) {
      try {
        const fileData = await processUploadedFile(file);
        files.unshift(fileData);
        processed++;
      } catch (err) {
        showToast('Error con ' + file.name + ': ' + err.message, 'error');
      }
    }

    Store.set('files_' + currentSubject, files);
    if (processed > 0) {
      showToast(processed + ' archivo(s) subido(s)', 'success');
      logActivity();
    }
    renderTab();
  }

  function viewFile(id) {
    viewingFileId = id;
    renderTab();
  }

  function backToFiles() {
    viewingFileId = null;
    renderTab();
  }

  function deleteFile(id) {
    let files = Store.get('files_' + currentSubject, []);
    files = files.filter(f => f.id !== id);
    Store.set('files_' + currentSubject, files);
    selectedFileIds = selectedFileIds.filter(fid => fid !== id);
    if (viewingFileId === id) viewingFileId = null;
    renderTab();
    showToast('Archivo eliminado', 'info');
  }

  function sortFiles(by) {
    fileSortBy = by;
    renderTab();
  }

  // Drag and drop reordering
  let draggedFileId = null;

  function fileDragStart(e, id) {
    draggedFileId = id;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      const el = document.querySelector('[data-file-id="' + id + '"]');
      if (el) el.classList.add('dragging');
    }, 0);
  }

  function fileDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const card = e.target.closest('.file-card');
    if (card) card.classList.add('drag-over');
  }

  function fileDragLeave(e) {
    const card = e.target.closest('.file-card');
    if (card) card.classList.remove('drag-over');
  }

  function fileDrop(e, targetId) {
    e.preventDefault();
    const card = e.target.closest('.file-card');
    if (card) card.classList.remove('drag-over');

    if (!draggedFileId || draggedFileId === targetId) return;

    const files = Store.get('files_' + currentSubject, []);
    const dragIdx = files.findIndex(f => f.id === draggedFileId);
    const targetIdx = files.findIndex(f => f.id === targetId);
    if (dragIdx === -1 || targetIdx === -1) return;

    const [moved] = files.splice(dragIdx, 1);
    files.splice(targetIdx, 0, moved);
    // Update order values
    files.forEach((f, i) => f.order = files.length - i);
    Store.set('files_' + currentSubject, files);
    draggedFileId = null;
    fileSortBy = 'date';
    renderTab();
  }

  // Use file content in other tabs
  function useFileForSummary(fileId) {
    selectedFileIds = [fileId];
    switchTab('summaries');
  }

  function useFileForQuiz(fileId) {
    selectedFileIds = [fileId];
    switchTab('quiz');
  }

  // Full AI processing: summary + quiz from a single file
  async function processFileWithAI(fileId) {
    const files = Store.get('files_' + currentSubject, []);
    const file = files.find(f => f.id === fileId);
    if (!file || !file.content) {
      showToast('El archivo no tiene contenido de texto', 'error');
      return;
    }

    const apiKey = Store.get('apiKey', '');
    if (!apiKey) {
      showToast('Configura tu API Key en ajustes primero', 'error');
      return;
    }

    // Switch to a processing view
    viewingFileId = fileId;
    const container = document.getElementById('tab-content');
    const subject = getSubject(currentSubject);

    container.innerHTML =
      '<button class="btn btn-secondary mb-16" onclick="window.app.backToFiles()">&larr; Volver a materiales</button>' +
      '<div class="card mb-24">' +
        '<div class="flex-between mb-16">' +
          '<div>' +
            '<h3>Procesando: ' + escapeHTML(cleanFileName(file.name)) + '</h3>' +
            '<span style="color:var(--text-muted);font-size:12px">' + formatFileSize(file.size) + '</span>' +
          '</div>' +
        '</div>' +
        '<div id="ai-step-1" class="ai-loading"><div class="spinner"></div><span>Paso 1/2 - Generando el resumen...</span></div>' +
        '<div id="ai-result-summary" class="hidden"></div>' +
        '<div id="ai-step-2" class="hidden"></div>' +
        '<div id="ai-result-quiz" class="hidden"></div>' +
      '</div>';

    // Step 1: Generate summary
    try {
      const summaryPrompt = buildSummaryPrompt(subject.name);
      const summaryResult = await callAI(summaryPrompt, 'Resume el siguiente contenido de estudio:\n\n' + file.content);

      // Save summary
      const summaries = Store.get('summaries_' + currentSubject, []);
      const title = file.name + ' - Resumen';
      summaries.unshift({ id: generateId(), title: title, html: summaryResult, date: new Date().toISOString() });
      Store.set('summaries_' + currentSubject, summaries);

      const step1El = document.getElementById('ai-step-1');
      const resultSummaryEl = document.getElementById('ai-result-summary');
      if (step1El) {
        step1El.innerHTML = '<span style="color:var(--malachite);font-weight:600">\u2713 Resumen generado y guardado</span>';
        step1El.className = 'ai-loading';
      }
      if (resultSummaryEl) {
        resultSummaryEl.className = 'ai-result mb-24';
        resultSummaryEl.innerHTML = '<h4>Resumen</h4>' + summaryResult;
      }

      // Step 2: Generate quiz
      const step2El = document.getElementById('ai-step-2');
      if (step2El) {
        step2El.className = 'ai-loading';
        step2El.innerHTML = '<div class="spinner"></div><span>Paso 2/2 - Generando cuestionario de 5 preguntas...</span>';
      }

      const quizPrompt = 'Eres un asistente academico. Genera un cuestionario en formato JSON puro (sin markdown, sin ```). El JSON debe ser un array de objetos con: "question" (string), "options" (array de 4 strings), "correct" (indice 0-3 de la respuesta correcta), "explanation" (string explicando la respuesta). Dificultad: medio. Asignatura: ' + subject.name + '. Genera exactamente 5 preguntas. Basa las preguntas en el material proporcionado.';
      const quizResult = await callAI(quizPrompt, 'Genera un cuestionario basado en este material:\n\n' + file.content);

      let questions;
      try {
        const jsonMatch = quizResult.match(/\[[\s\S]*\]/);
        questions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(quizResult);
      } catch (e) {
        throw new Error('Error parseando cuestionario');
      }

      if (step2El) {
        step2El.innerHTML = '<span style="color:var(--malachite);font-weight:600">\u2713 Cuestionario generado (' + questions.length + ' preguntas)</span>';
      }

      // Show quiz start button
      const resultQuizEl = document.getElementById('ai-result-quiz');
      if (resultQuizEl) {
        resultQuizEl.className = 'mt-24';
        resultQuizEl.innerHTML =
          '<div class="card" style="text-align:center;padding:32px">' +
            '<h3>Todo listo!</h3>' +
            '<p style="color:var(--text-secondary);margin:12px 0">Resumen guardado + cuestionario de ' + questions.length + ' preguntas preparado.</p>' +
            '<div class="flex gap-12" style="justify-content:center;margin-top:20px">' +
              '<button class="btn btn-primary" id="start-generated-quiz">Hacer el cuestionario ahora</button>' +
              '<button class="btn btn-secondary" onclick="window.app.switchTab(\'summaries\')">Ver resumenes</button>' +
              '<button class="btn btn-secondary" onclick="window.app.backToFiles()">Volver a materiales</button>' +
            '</div>' +
          '</div>';

        // Attach quiz start handler
        document.getElementById('start-generated-quiz').addEventListener('click', () => {
          quizState = {
            subjectId: currentSubject,
            topic: file.name,
            questions: questions,
            currentIndex: 0,
            score: 0,
            finished: false,
            confettiDone: false
          };
          currentTab = 'quiz';
          renderSubjectView(currentSubject);
          // Force quiz tab active
          currentTab = 'quiz';
          const tabContainer = document.getElementById('tab-content');
          if (tabContainer) renderQuizQuestion(tabContainer);
          document.querySelectorAll('.tab-btn').forEach(el => {
            el.classList.toggle('active', el.textContent.toLowerCase().includes('cuestionario'));
          });
        });
      }

      showToast('Material procesado: resumen + quiz listos!', 'success');
      logActivity();

    } catch (err) {
      showToast('Error procesando: ' + err.message, 'error');
      const step1El = document.getElementById('ai-step-1');
      if (step1El && step1El.querySelector('.spinner')) {
        step1El.innerHTML = '<span style="color:#e74c3c">Error: ' + escapeHTML(err.message) + '</span>';
      }
      const step2El = document.getElementById('ai-step-2');
      if (step2El && step2El.querySelector('.spinner')) {
        step2El.innerHTML = '<span style="color:#e74c3c">Error: ' + escapeHTML(err.message) + '</span>';
      }
    }
  }

  function toggleFileSelection(fileId) {
    const idx = selectedFileIds.indexOf(fileId);
    if (idx >= 0) selectedFileIds.splice(idx, 1);
    else selectedFileIds.push(fileId);
    renderTab();
  }

  // Build file selector chips HTML
  function buildFileSelector(label) {
    const files = Store.get('files_' + currentSubject, []);
    if (files.length === 0) return '';

    let html = '<div style="margin-bottom:16px">' +
      '<label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);display:block;margin-bottom:8px">' + label + '</label>' +
      '<div class="file-selector">';

    files.forEach(f => {
      const sel = selectedFileIds.includes(f.id);
      html += '<div class="file-select-chip ' + (sel ? 'selected' : '') + '" onclick="window.app.toggleFileSelection(\'' + f.id + '\')">' +
        '<span class="chip-icon">' + getFileIcon(f.type) + '</span>' +
        '<span>' + escapeHTML(f.name.length > 25 ? f.name.substring(0, 22) + '...' : f.name) + '</span>' +
        (sel ? '<span class="chip-check">\u2713</span>' : '') +
      '</div>';
    });

    html += '</div></div>';
    return html;
  }

  // --- Notes Tab ---
  function renderNotesTab(container) {
    const notes = Store.get('notes_' + currentSubject, []);
    const subject = getSubject(currentSubject);

    if (notes.length === 0 && !currentNoteId) {
      container.innerHTML =
        '<div class="empty-state">' +
          emptyStateSVG('notes') +
          '<h3>Sin apuntes aun</h3>' +
          '<p>Crea tu primer apunte para esta asignatura</p>' +
          '<button class="btn btn-primary mt-16" onclick="window.app.createNote()">+ Nuevo apunte</button>' +
        '</div>';
      return;
    }

    let noteListHTML = '';
    notes.forEach(n => {
      noteListHTML += '<div class="note-item ' + (currentNoteId === n.id ? 'active' : '') + '" onclick="window.app.selectNote(\'' + n.id + '\')">' +
        '<span>' + escapeHTML(n.title || 'Sin titulo') + '</span>' +
        '<button class="delete-note" onclick="event.stopPropagation();window.app.deleteNote(\'' + n.id + '\')">&times;</button>' +
      '</div>';
    });

    const activeNote = notes.find(n => n.id === currentNoteId);

    container.innerHTML =
      '<div class="notes-layout">' +
        '<div class="notes-sidebar">' +
          '<button class="btn btn-primary" style="width:100%" onclick="window.app.createNote()">+ Nuevo apunte</button>' +
          '<ul class="note-list">' + noteListHTML + '</ul>' +
        '</div>' +
        '<div class="notes-editor-area">' +
          (activeNote ?
            '<div class="editor-toolbar">' +
              '<button class="toolbar-btn" onclick="window.app.formatText(\'bold\')" title="Negrita"><b>B</b></button>' +
              '<button class="toolbar-btn" onclick="window.app.formatText(\'italic\')" title="Cursiva"><i>I</i></button>' +
              '<button class="toolbar-btn" onclick="window.app.formatText(\'ul\')" title="Lista">&bull; Lista</button>' +
              '<button class="toolbar-btn" onclick="window.app.formatText(\'ol\')" title="Lista numerada">1. Lista</button>' +
              '<button class="toolbar-btn" style="margin-left:auto;color:' + subject.color + '" onclick="window.app.saveCurrentNote()">Guardar</button>' +
            '</div>' +
            '<input class="note-title-input" id="note-title" placeholder="Titulo del apunte" value="' + escapeHTML(activeNote.title) + '">' +
            '<textarea class="note-content-editor" id="note-content" placeholder="Escribe tus apuntes aqui...">' + escapeHTML(activeNote.content) + '</textarea>'
          :
            '<div class="empty-state"><p>Selecciona un apunte o crea uno nuevo</p></div>'
          ) +
        '</div>' +
      '</div>';
  }

  // --- Summaries Tab ---
  let viewingSummary = null;

  function renderSummariesTab(container) {
    const summaries = Store.get('summaries_' + currentSubject, []);
    const subject = getSubject(currentSubject);

    if (viewingSummary) {
      const sum = summaries.find(s => s.id === viewingSummary);
      if (sum) {
        container.innerHTML =
          '<button class="btn btn-secondary mb-16" onclick="window.app.backToSummaries()">&larr; Volver a la lista</button>' +
          '<div class="summary-detail">' + sum.html + '</div>';
        return;
      }
    }

    let listHTML = '';
    summaries.forEach(s => {
      listHTML += '<div class="summary-item" onclick="window.app.viewSummary(\'' + s.id + '\')">' +
        '<span>' + escapeHTML(s.title || 'Resumen') + '</span>' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<span class="summary-date">' + formatDate(s.date) + '</span>' +
          '<button class="delete-summary" onclick="event.stopPropagation();window.app.deleteSummary(\'' + s.id + '\')">&times;</button>' +
        '</div>' +
      '</div>';
    });

    // Pre-fill from selected files
    const fileContent = getSelectedFilesContent();

    // Files available for summarizing
    const files = Store.get('files_' + currentSubject, []);

    let createHTML = '<div class="card mb-24">' +
      '<h3 style="margin-bottom:12px">Crear resumen con IA</h3>';

    if (files.length > 0) {
      createHTML += '<div class="summary-file-list">';
      files.forEach(f => {
        const isSelected = selectedFileIds.indexOf(f.id) >= 0;
        createHTML += '<button class="file-select-chip ' + (isSelected ? 'selected' : '') + '" onclick="window.app.toggleFileSelection(\'' + f.id + '\');window.app.switchTab(\'summaries\')">' +
          '<span class="file-chip-icon">' + getFileIcon(f.type) + '</span>' +
          '<span>' + escapeHTML(cleanFileName(f.name)) + '</span>' +
          (isSelected ? ' <span style="margin-left:4px">&#10003;</span>' : '') +
        '</button>';
      });
      createHTML += '</div>' +
        '<button class="btn btn-primary mt-16" id="generate-summary-btn" onclick="window.app.generateSummary()" ' + (selectedFileIds.length === 0 ? 'disabled' : '') + '>Generar resumen</button>';
    } else {
      createHTML += '<p style="color:var(--text-muted)">Sube archivos en la pestana Materiales para generar resumenes</p>';
    }

    createHTML += '<div id="summary-loading" class="hidden"></div>' +
      '<div id="summary-result" class="hidden"></div>' +
      '<textarea class="hidden" id="summary-input"></textarea>' +
    '</div>';

    container.innerHTML = createHTML +
      (summaries.length > 0 ?
        '<h3 class="mb-16">Resumenes guardados</h3><div class="summary-list">' + listHTML + '</div>' :
        '<div class="empty-state mt-24">' + emptyStateSVG('summary') + '<h3>Sin resumenes</h3><p>Selecciona archivos y genera tu primer resumen</p></div>'
      );
  }

  // --- Quiz Tab ---
  function renderQuizTab(container) {
    if (quizState && quizState.subjectId === currentSubject) {
      if (quizState.finished) {
        renderQuizResults(container);
      } else {
        renderQuizQuestion(container);
      }
      return;
    }

    const history = Store.get('quizHistory', []).filter(q => q.subjectId === currentSubject);

    container.innerHTML =
      '<div class="card">' +
        '<h3>Generar cuestionario con IA</h3>' +
        buildFileSelector('Usar contenido de archivos (opcional)') +
        '<div class="quiz-setup mt-16">' +
          '<div class="form-group"><label>Tema</label><input type="text" id="quiz-topic" placeholder="Ej: Minerales igneos"></div>' +
          '<div class="form-group"><label>Dificultad</label><select id="quiz-difficulty"><option value="facil">Facil</option><option value="medio" selected>Medio</option><option value="dificil">Dificil</option></select></div>' +
          '<div class="form-group"><label>Preguntas</label><select id="quiz-count"><option value="5" selected>5</option><option value="10">10</option><option value="15">15</option></select></div>' +
        '</div>' +
        '<button class="btn btn-primary" onclick="window.app.generateQuiz()">Generar cuestionario</button>' +
        '<div id="quiz-loading" class="hidden"></div>' +
      '</div>' +
      (history.length > 0 ?
        '<div class="mt-24"><h3 class="mb-16">Historial</h3>' +
        history.map(q =>
          '<div class="summary-item">' +
            '<span>' + escapeHTML(q.topic) + ' - ' + q.score + '/' + q.total + '</span>' +
            '<span class="summary-date">' + formatDate(q.date) + '</span>' +
          '</div>'
        ).join('') + '</div>' :
        '<div class="empty-state mt-24">' + emptyStateSVG('quiz') + '<h3>Sin quizzes</h3><p>Genera tu primer cuestionario</p></div>'
      );
  }

  function renderQuizQuestion(container) {
    const q = quizState.questions[quizState.currentIndex];
    const progress = ((quizState.currentIndex) / quizState.questions.length) * 100;

    container.innerHTML =
      '<div class="card quiz-question-card">' +
        '<div class="quiz-progress"><span>Pregunta ' + (quizState.currentIndex + 1) + ' de ' + quizState.questions.length + '</span><span>Puntaje: ' + quizState.score + '</span></div>' +
        '<div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:' + progress + '%"></div></div>' +
        '<p class="quiz-question-text">' + escapeHTML(q.question) + '</p>' +
        '<div class="quiz-options">' +
          q.options.map((opt, i) => {
            const letter = ['A', 'B', 'C', 'D'][i];
            return '<div class="quiz-option" data-index="' + i + '" onclick="window.app.answerQuiz(' + i + ')">' +
              '<span class="option-letter">' + letter + '</span>' +
              '<span>' + escapeHTML(opt) + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div id="quiz-feedback"></div>' +
      '</div>';
  }

  function renderQuizResults(container) {
    const pct = Math.round((quizState.score / quizState.questions.length) * 100);
    const scoreClass = pct >= 80 ? 'excellent' : pct >= 50 ? 'good' : 'needs-work';

    container.innerHTML =
      '<div class="card quiz-results">' +
        '<h2>Resultados del cuestionario</h2>' +
        '<div class="quiz-score ' + scoreClass + '">' + pct + '%</div>' +
        '<p>' + quizState.score + ' de ' + quizState.questions.length + ' correctas</p>' +
        '<p style="color:var(--text-muted);margin-top:8px">' +
          (pct >= 80 ? 'Excelente trabajo!' : pct >= 50 ? 'Buen intento, sigue practicando!' : 'Necesitas repasar este tema.') +
        '</p>' +
        '<div class="mt-24 flex gap-12" style="justify-content:center">' +
          '<button class="btn btn-primary" onclick="window.app.resetQuiz()">Nuevo cuestionario</button>' +
          '<button class="btn btn-secondary" onclick="window.app.switchTab(\'notes\')">Ir a apuntes</button>' +
        '</div>' +
      '</div>';

    if (pct >= 80 && !quizState.confettiDone) {
      quizState.confettiDone = true;
      setTimeout(launchConfetti, 300);
    }
  }

  // --- Exam Prep Tab ---
  function renderExamTab(container) {
    const examData = Store.get('exam_' + currentSubject, { date: '', topics: '', plan: '', checklist: [] });
    const subject = getSubject(currentSubject);

    let daysLeft = '';
    let countdownHTML = '';
    if (examData.date) {
      const diff = Math.ceil((new Date(examData.date) - new Date()) / (1000 * 60 * 60 * 24));
      daysLeft = diff;
      countdownHTML = '<div class="countdown-display"><div class="countdown-number">' + Math.max(0, diff) + '</div><div class="countdown-label">dias para la prueba</div></div>';
    } else {
      countdownHTML = '<div class="countdown-display"><div class="countdown-number">--</div><div class="countdown-label">Define la fecha</div></div>';
    }

    let checklistHTML = '';
    if (examData.checklist && examData.checklist.length > 0) {
      checklistHTML = '<ul class="checklist">';
      examData.checklist.forEach((item, i) => {
        checklistHTML += '<li class="checklist-item ' + (item.done ? 'checked' : '') + '">' +
          '<input type="checkbox" ' + (item.done ? 'checked' : '') + ' onchange="window.app.toggleChecklist(' + i + ')">' +
          '<span>' + escapeHTML(item.text) + '</span></li>';
      });
      checklistHTML += '</ul>';
    }

    container.innerHTML =
      '<div class="exam-prep-header">' +
        '<div class="card">' +
          '<div class="form-group"><label>Fecha de la prueba</label><input type="date" id="exam-date" value="' + (examData.date || '') + '" onchange="window.app.saveExamDate()"></div>' +
          '<div class="form-group mt-16"><label>Temas a estudiar</label><textarea class="ai-textarea" id="exam-topics" placeholder="Lista los temas del examen..." style="min-height:80px">' + escapeHTML(examData.topics || '') + '</textarea></div>' +
          '<button class="btn btn-primary mt-16" onclick="window.app.generateStudyPlan()">Generar plan de estudio con IA</button>' +
        '</div>' +
        '<div class="card">' + countdownHTML + '</div>' +
      '</div>' +
      '<div id="exam-loading" class="hidden"></div>' +
      (examData.plan ?
        '<div class="card mt-24"><h3>Plan de estudio</h3><div class="ai-result mt-16">' + examData.plan + '</div></div>' : ''
      ) +
      (checklistHTML ?
        '<div class="card mt-24"><h3>Checklist</h3>' + checklistHTML + '</div>' : ''
      );
  }

  // --- Schedule View ---
  function renderSchedule() {
    const main = document.getElementById('main-content');
    const schedule = getSchedule();
    const subjects = getSubjects();
    let gridHTML = '<div class="schedule-grid stagger">';

    // Header row
    gridHTML += '<div class="schedule-header"></div>';
    DAYS.forEach(d => {
      const isToday = d === getDayName();
      gridHTML += '<div class="schedule-header" style="' + (isToday ? 'color:var(--amethyst);font-weight:700' : '') + '">' + d + '</div>';
    });

    // Time rows
    TIME_SLOTS.forEach(slot => {
      const [startTime, endTime] = slot.split(' - ');
      gridHTML += '<div class="schedule-time">' + slot + '</div>';

      DAYS.forEach(day => {
        const classes = (schedule[day] || []).filter(c => c.start === startTime);
        if (classes.length > 0) {
          const c = classes[0];
          const subj = getSubject(c.subject);
          if (subj) {
            gridHTML += '<div class="schedule-cell"><div class="schedule-block" style="background:' + subj.color + '" onclick="window.app.navigateToSubject(\'' + c.subject + '\')">' +
              '<div class="block-name">' + escapeHTML(subj.shortName) + '</div>' +
              '<div class="block-time">' + c.start + '-' + c.end + '</div>' +
              '<button class="schedule-remove" onclick="event.stopPropagation();window.app.removeScheduleBlock(\'' + day + '\',\'' + startTime + '\')" title="Quitar">&times;</button>' +
            '</div></div>';
          } else {
            gridHTML += '<div class="schedule-cell"></div>';
          }
        } else {
          gridHTML += '<div class="schedule-cell schedule-cell-empty" onclick="window.app.addScheduleBlock(\'' + day + '\',\'' + startTime + '\',\'' + endTime + '\')">' +
            '<span class="schedule-add-hint">+</span>' +
          '</div>';
        }
      });
    });

    gridHTML += '</div>';

    let emptyMsg = '';
    if (subjects.length === 0) {
      emptyMsg = '<div class="card stagger" style="text-align:center;padding:24px;margin-bottom:20px">' +
        '<p style="color:var(--text-muted)">Crea asignaturas primero para poder armar tu horario</p>' +
      '</div>';
    }

    main.innerHTML =
      '<h1 class="stagger" style="margin-bottom:28px">Horario semanal</h1>' +
      (subjects.length > 0 ? '<p class="stagger" style="color:var(--text-muted);margin-bottom:20px">Haz clic en una celda vacia para agregar una clase</p>' : '') +
      emptyMsg +
      gridHTML;
  }

  function addScheduleBlock(day, startTime, endTime) {
    const subjects = getSubjects();
    if (subjects.length === 0) {
      showToast('Crea asignaturas primero', 'error');
      return;
    }

    let optionsHTML = '';
    subjects.forEach(s => {
      optionsHTML += '<button class="schedule-pick-btn" style="background:' + s.color + ';color:#fff" onclick="window.app.confirmScheduleBlock(\'' + day + '\',\'' + startTime + '\',\'' + endTime + '\',\'' + s.id + '\')">' +
        escapeHTML(s.shortName) + '</button>';
    });

    // Show a small picker inline
    const main = document.getElementById('main-content');
    const overlay = document.createElement('div');
    overlay.className = 'schedule-picker-overlay';
    overlay.id = 'schedule-picker';
    overlay.innerHTML = '<div class="schedule-picker">' +
      '<h4>Agregar clase - ' + day + ' ' + startTime + '</h4>' +
      '<div class="schedule-pick-options">' + optionsHTML + '</div>' +
      '<button class="btn btn-secondary" onclick="document.getElementById(\'schedule-picker\').remove()">Cancelar</button>' +
    '</div>';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    main.appendChild(overlay);
  }

  function confirmScheduleBlock(day, startTime, endTime, subjectId) {
    const schedule = getSchedule();
    if (!schedule[day]) schedule[day] = [];
    schedule[day].push({ subject: subjectId, start: startTime, end: endTime });
    saveSchedule(schedule);
    const picker = document.getElementById('schedule-picker');
    if (picker) picker.remove();
    renderSchedule();
    showToast('Clase agregada', 'success');
  }

  function removeScheduleBlock(day, startTime) {
    const schedule = getSchedule();
    if (schedule[day]) {
      schedule[day] = schedule[day].filter(c => c.start !== startTime);
      saveSchedule(schedule);
    }
    renderSchedule();
    showToast('Clase eliminada', 'success');
  }

  // --- Stats View ---
  function renderStats() {
    const main = document.getElementById('main-content');
    const stats = computeStats();
    const activity = Store.get('activity', {});

    // Last 7 days activity
    const chartDays = [];
    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      chartDays.push({ label: dayLabels[d.getDay()], value: activity[key] || 0 });
    }
    const maxActivity = Math.max(...chartDays.map(d => d.value), 1);

    let chartHTML = '<div class="chart-grid">';
    chartDays.forEach((d, i) => {
      const height = Math.max(4, (d.value / maxActivity) * 100);
      const colors = ['#9B72CF', '#2D9B6F', '#E8973A', '#3B6FA0', '#E8A0B4', '#4CAF8A', '#9B72CF'];
      chartHTML += '<div class="chart-day">' +
        '<div class="chart-bar-container"><div class="chart-bar" style="height:' + height + '%;background:' + colors[i] + '"></div></div>' +
        '<span class="chart-label">' + d.label + '</span>' +
      '</div>';
    });
    chartHTML += '</div>';

    // Badges
    let badgesHTML = '';
    BADGES.forEach(b => {
      const unlocked = b.condition(stats);
      badgesHTML += '<div class="card badge-card ' + (unlocked ? 'unlocked' : 'locked') + '">' +
        '<div class="badge-icon">' + b.icon + '</div>' +
        '<div class="badge-name">' + escapeHTML(b.name) + '</div>' +
        '<div class="badge-desc">' + escapeHTML(b.desc) + '</div>' +
      '</div>';
    });

    main.innerHTML =
      '<h1 class="stagger" style="margin-bottom:28px">Estadisticas</h1>' +

      '<div class="streak-display stagger">' +
        '<span class="streak-fire">\uD83D\uDD25</span>' +
        '<div class="streak-info"><span class="streak-count">' + stats.streak + '</span><span class="streak-label"> dias de racha</span></div>' +
      '</div>' +

      '<div class="stats-grid">' +
        '<div class="card stat-card stagger"><div class="stat-icon">\uD83D\uDCDD</div><div class="stat-number">' + stats.totalNotes + '</div><div class="stat-title">Apuntes</div></div>' +
        '<div class="card stat-card stagger"><div class="stat-icon">\uD83D\uDCCA</div><div class="stat-number">' + stats.totalQuizzes + '</div><div class="stat-title">Quizzes</div></div>' +
        '<div class="card stat-card stagger"><div class="stat-icon">\uD83D\uDCCB</div><div class="stat-number">' + stats.totalSummaries + '</div><div class="stat-title">Resumenes</div></div>' +
        '<div class="card stat-card stagger"><div class="stat-icon">\uD83D\uDC8E</div><div class="stat-number">' + stats.perfectQuizzes + '</div><div class="stat-title">Perfecto</div></div>' +
      '</div>' +

      '<div class="card activity-chart stagger"><h3>Actividad (ultimos 7 dias)</h3>' + chartHTML + '</div>' +

      '<div class="badges-section stagger"><h2>Insignias</h2><div class="badges-grid">' + badgesHTML + '</div></div>';
  }

  // ============================================
  // SIDEBAR RENDERING
  // ============================================

  function renderSidebar() {
    const container = document.getElementById('nav-subjects');
    const subjects = getSubjects();

    let html = '';
    subjects.forEach(s => {
      html += '<a href="#" class="nav-item nav-subject" data-view="subject" data-subject="' + s.id + '">' +
        '<span class="nav-dot" style="background:' + s.color + '"></span>' +
        '<span>' + escapeHTML(s.shortName) + '</span>' +
      '</a>';
    });
    container.innerHTML = html;

    // Re-bind click events for new nav items
    container.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToSubject(el.dataset.subject);
      });
    });
  }

  function openAddSubject() {
    document.getElementById('add-subject-modal').classList.add('open');
    document.getElementById('subject-name-input').value = '';
    document.getElementById('subject-short-input').value = '';
    // Reset color picker
    document.querySelectorAll('#color-picker .color-swatch').forEach((s, i) => {
      s.classList.toggle('active', i === 0);
    });
  }

  function getSelectedColor() {
    const active = document.querySelector('#color-picker .color-swatch.active');
    return active ? active.dataset.color : '#9B72CF';
  }

  // ============================================
  // APP CONTROLLER
  // ============================================

  let currentView = 'dashboard';

  function navigate(view) {
    currentView = view;
    currentTab = 'notes';
    currentNoteId = null;
    viewingSummary = null;
    viewingFileId = null;
    selectedFileIds = [];
    quizState = null;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view && !el.dataset.subject);
    });

    switch (view) {
      case 'dashboard': renderDashboard(); break;
      case 'schedule': renderSchedule(); break;
      case 'stats': renderStats(); break;
    }

    // Close mobile menu
    document.getElementById('sidebar').classList.remove('open');
  }

  function navigateToSubject(subjectId) {
    currentView = 'subject';
    currentTab = 'files';
    currentNoteId = null;
    viewingSummary = null;
    viewingFileId = null;
    selectedFileIds = [];
    quizState = null;

    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.subject === subjectId);
    });

    renderSubjectView(subjectId);
    document.getElementById('sidebar').classList.remove('open');
  }

  function switchTab(tab) {
    currentTab = tab;
    viewingSummary = null;
    viewingFileId = null;
    if (tab !== 'quiz') quizState = null;

    const tabMap = { files: 'materiales', notes: 'apuntes', summaries: 'resumenes', quiz: 'cuestionario', exam: 'prep' };
    document.querySelectorAll('.tab-btn').forEach(el => {
      el.classList.toggle('active', el.textContent.toLowerCase().includes(tabMap[tab] || ''));
    });

    renderTab();
  }

  // --- Note actions ---
  function createNote() {
    const notes = Store.get('notes_' + currentSubject, []);
    const newNote = { id: generateId(), title: '', content: '', created: new Date().toISOString() };
    notes.unshift(newNote);
    Store.set('notes_' + currentSubject, notes);
    currentNoteId = newNote.id;
    renderTab();
    logActivity();
  }

  function selectNote(id) {
    // Auto-save previous note
    saveCurrentNote(true);
    currentNoteId = id;
    renderTab();
  }

  function saveCurrentNote(silent) {
    const titleEl = document.getElementById('note-title');
    const contentEl = document.getElementById('note-content');
    if (!titleEl || !contentEl || !currentNoteId) return;

    const notes = Store.get('notes_' + currentSubject, []);
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
      note.title = titleEl.value;
      note.content = contentEl.value;
      note.updated = new Date().toISOString();
      Store.set('notes_' + currentSubject, notes);
      if (!silent) showToast('Apunte guardado', 'success');
    }
  }

  function deleteNote(id) {
    let notes = Store.get('notes_' + currentSubject, []);
    notes = notes.filter(n => n.id !== id);
    Store.set('notes_' + currentSubject, notes);
    if (currentNoteId === id) currentNoteId = notes.length > 0 ? notes[0].id : null;
    renderTab();
    showToast('Apunte eliminado', 'info');
  }

  function formatText(type) {
    const editor = document.getElementById('note-content');
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end);

    let replacement = '';
    switch (type) {
      case 'bold': replacement = '**' + (selected || 'texto') + '**'; break;
      case 'italic': replacement = '*' + (selected || 'texto') + '*'; break;
      case 'ul': replacement = '\n- ' + (selected || 'elemento'); break;
      case 'ol': replacement = '\n1. ' + (selected || 'elemento'); break;
    }

    editor.value = editor.value.substring(0, start) + replacement + editor.value.substring(end);
    editor.focus();
  }

  // --- Summary actions ---
  async function generateSummary() {
    const input = document.getElementById('summary-input');
    // If textarea is empty but files are selected, use file content
    let content = input ? input.value.trim() : '';
    if (!content && selectedFileIds.length > 0) {
      content = getSelectedFilesContent();
    }
    if (!content) {
      showToast('Selecciona archivos o pega contenido para resumir', 'error');
      return;
    }

    const loadingEl = document.getElementById('summary-loading');
    const resultEl = document.getElementById('summary-result');
    const btn = document.getElementById('generate-summary-btn');

    loadingEl.className = 'ai-loading';
    loadingEl.innerHTML = '<div class="spinner"></div><span>Analizando el contenido...</span>';
    resultEl.className = 'hidden';
    btn.disabled = true;

    try {
      const subject = getSubject(currentSubject);
      const systemPrompt = buildSummaryPrompt(subject.name);
      const result = await callAI(systemPrompt, 'Resume el siguiente contenido de estudio:\n\n' + content);

      // Save summary
      const summaries = Store.get('summaries_' + currentSubject, []);
      const title = content.substring(0, 60).replace(/\n/g, ' ').trim() + '...';
      summaries.unshift({ id: generateId(), title: title, html: result, date: new Date().toISOString() });
      Store.set('summaries_' + currentSubject, summaries);

      loadingEl.className = 'hidden';
      resultEl.className = 'ai-result';
      resultEl.innerHTML = '<h4>Resumen generado</h4>' + result;

      showToast('Resumen guardado', 'success');
      logActivity();
    } catch (err) {
      loadingEl.className = 'hidden';
      showToast('Error: ' + err.message, 'error');
    }
    btn.disabled = false;
  }

  function viewSummary(id) {
    viewingSummary = id;
    renderTab();
  }

  function backToSummaries() {
    viewingSummary = null;
    renderTab();
  }

  function deleteSummary(id) {
    let summaries = Store.get('summaries_' + currentSubject, []);
    summaries = summaries.filter(s => s.id !== id);
    Store.set('summaries_' + currentSubject, summaries);
    renderTab();
    showToast('Resumen eliminado', 'info');
  }

  // --- Quiz actions ---
  async function generateQuiz() {
    const topic = document.getElementById('quiz-topic').value.trim();
    const difficulty = document.getElementById('quiz-difficulty').value;
    const count = parseInt(document.getElementById('quiz-count').value);

    if (!topic) {
      showToast('Escribe un tema para el cuestionario', 'error');
      return;
    }

    const loadingEl = document.getElementById('quiz-loading');
    loadingEl.className = 'ai-loading';
    loadingEl.innerHTML = '<div class="spinner"></div><span>Analizando el contenido...</span>';

    try {
      const subject = getSubject(currentSubject);
      const fileContext = getSelectedFilesContent();
      const systemPrompt = 'Eres un asistente academico. Genera un cuestionario en formato JSON puro (sin markdown, sin ```). El JSON debe ser un array de objetos con: "question" (string), "options" (array de 4 strings), "correct" (indice 0-3 de la respuesta correcta), "explanation" (string explicando la respuesta). Dificultad: ' + difficulty + '. Asignatura: ' + subject.name + '. Genera exactamente ' + count + ' preguntas.' + (fileContext ? ' Basa las preguntas en el material proporcionado.' : '');
      const userMsg = 'Genera un cuestionario sobre: ' + topic + (fileContext ? '\n\nMaterial de estudio:\n' + fileContext : '');
      const result = await callAI(systemPrompt, userMsg);

      // Parse JSON from response
      let questions;
      try {
        // Try to find JSON array in the response
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          questions = JSON.parse(result);
        }
      } catch (e) {
        throw new Error('No se pudo parsear el cuestionario. Intenta de nuevo.');
      }

      quizState = {
        subjectId: currentSubject,
        topic: topic,
        questions: questions,
        currentIndex: 0,
        score: 0,
        finished: false,
        confettiDone: false
      };

      loadingEl.className = 'hidden';
      renderTab();
      logActivity();
    } catch (err) {
      loadingEl.className = 'hidden';
      showToast('Error: ' + err.message, 'error');
    }
  }

  function answerQuiz(selectedIndex) {
    if (!quizState || quizState.answered) return;
    quizState.answered = true;

    const q = quizState.questions[quizState.currentIndex];
    const correct = q.correct === selectedIndex;
    if (correct) quizState.score++;

    // Highlight options
    document.querySelectorAll('.quiz-option').forEach((el, i) => {
      el.classList.add('disabled');
      if (i === q.correct) el.classList.add('correct');
      if (i === selectedIndex && !correct) el.classList.add('incorrect');
    });

    // Show explanation
    const feedbackEl = document.getElementById('quiz-feedback');
    feedbackEl.innerHTML =
      '<div class="quiz-explanation">' +
        '<strong>' + (correct ? 'Correcto!' : 'Incorrecto.') + '</strong> ' + escapeHTML(q.explanation || '') +
      '</div>' +
      '<button class="btn btn-primary quiz-next-btn" onclick="window.app.nextQuestion()">' +
        (quizState.currentIndex < quizState.questions.length - 1 ? 'Siguiente pregunta' : 'Ver resultados') +
      '</button>';
  }

  function nextQuestion() {
    if (!quizState) return;
    quizState.answered = false;
    quizState.currentIndex++;

    if (quizState.currentIndex >= quizState.questions.length) {
      quizState.finished = true;

      // Save to history
      const history = Store.get('quizHistory', []);
      history.unshift({
        subjectId: currentSubject,
        topic: quizState.topic,
        score: quizState.score,
        total: quizState.questions.length,
        date: new Date().toISOString()
      });
      Store.set('quizHistory', history);
    }

    renderTab();
  }

  function resetQuiz() {
    quizState = null;
    renderTab();
  }

  // --- Exam Prep actions ---
  function saveExamDate() {
    const dateEl = document.getElementById('exam-date');
    const examData = Store.get('exam_' + currentSubject, {});
    examData.date = dateEl.value;
    Store.set('exam_' + currentSubject, examData);
    renderTab();
    showToast('Fecha guardada', 'success');
  }

  async function generateStudyPlan() {
    const dateEl = document.getElementById('exam-date');
    const topicsEl = document.getElementById('exam-topics');

    if (!dateEl.value) {
      showToast('Define una fecha de prueba', 'error');
      return;
    }
    if (!topicsEl.value.trim()) {
      showToast('Escribe los temas a estudiar', 'error');
      return;
    }

    const loadingEl = document.getElementById('exam-loading');
    loadingEl.className = 'ai-loading';
    loadingEl.innerHTML = '<div class="spinner"></div><span>Analizando el contenido...</span>';

    try {
      const subject = getSubject(currentSubject);
      const daysLeft = Math.ceil((new Date(dateEl.value) - new Date()) / (1000 * 60 * 60 * 24));

      const systemPrompt = 'Eres un asistente academico para ' + (getUserName() || 'el estudiante') + '. Crea un plan de estudio dia a dia hasta la fecha de la prueba. Usa formato HTML simple (h4, ul, li, p, strong). Incluye: distribucion de temas por dia, tecnicas de estudio recomendadas, dias de repaso. Se practico y motivador. Asignatura: ' + subject.name;
      const userMsg = 'Faltan ' + daysLeft + ' dias para la prueba. Fecha: ' + dateEl.value + '. Temas: ' + topicsEl.value;
      const result = await callAI(systemPrompt, userMsg);

      // Generate checklist from topics
      const topics = topicsEl.value.split('\n').filter(t => t.trim());
      const checklist = topics.map(t => ({ text: t.trim(), done: false }));

      const examData = Store.get('exam_' + currentSubject, {});
      examData.date = dateEl.value;
      examData.topics = topicsEl.value;
      examData.plan = result;
      examData.checklist = checklist.length > 0 ? checklist : examData.checklist || [];
      Store.set('exam_' + currentSubject, examData);

      loadingEl.className = 'hidden';
      renderTab();
      showToast('Plan de estudio generado', 'success');
      logActivity();
    } catch (err) {
      loadingEl.className = 'hidden';
      showToast('Error: ' + err.message, 'error');
    }
  }

  function toggleChecklist(index) {
    const examData = Store.get('exam_' + currentSubject, {});
    if (examData.checklist && examData.checklist[index]) {
      examData.checklist[index].done = !examData.checklist[index].done;
      Store.set('exam_' + currentSubject, examData);
      renderTab();
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  // Theme toggle
  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    Store.set('theme', next);
  }

  // Load saved theme
  const savedTheme = Store.get('theme', 'dark');
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Event listeners
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('mobile-theme-toggle').addEventListener('click', toggleTheme);

  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Nav clicks (static nav items only — subject items are bound in renderSidebar)
  document.querySelectorAll('.sidebar-nav > .nav-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.dataset.view);
    });
  });

  // Add subject button
  document.getElementById('add-subject-btn').addEventListener('click', openAddSubject);

  // Settings modal
  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('open');
    document.getElementById('api-key-input').value = Store.get('apiKey', '');
    document.getElementById('gemini-key-input').value = Store.get('geminiKey', '');
    document.getElementById('user-name-input').value = getUserName();
  });

  document.getElementById('settings-close').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.remove('open');
  });

  document.getElementById('save-settings').addEventListener('click', () => {
    Store.set('apiKey', document.getElementById('api-key-input').value.trim());
    Store.set('geminiKey', document.getElementById('gemini-key-input').value.trim());
    Store.set('userName', document.getElementById('user-name-input').value.trim());
    document.getElementById('settings-modal').classList.remove('open');
    showToast('Configuracion guardada', 'success');
    if (currentView === 'dashboard') renderDashboard();
  });

  document.getElementById('settings-modal').addEventListener('click', (e) => {
    if (e.target.id === 'settings-modal') {
      document.getElementById('settings-modal').classList.remove('open');
    }
  });

  // Add subject modal
  document.getElementById('add-subject-close').addEventListener('click', () => {
    document.getElementById('add-subject-modal').classList.remove('open');
  });

  document.getElementById('add-subject-modal').addEventListener('click', (e) => {
    if (e.target.id === 'add-subject-modal') {
      document.getElementById('add-subject-modal').classList.remove('open');
    }
  });

  document.querySelectorAll('#color-picker .color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('#color-picker .color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });

  document.getElementById('save-subject').addEventListener('click', () => {
    const name = document.getElementById('subject-name-input').value.trim();
    const shortName = document.getElementById('subject-short-input').value.trim();
    if (!name) { showToast('Escribe el nombre de la asignatura', 'error'); return; }
    const color = getSelectedColor();
    if (addSubject(name, shortName || name, color)) {
      document.getElementById('add-subject-modal').classList.remove('open');
      renderSidebar();
      if (currentView === 'dashboard') renderDashboard();
      showToast('Asignatura creada', 'success');
    }
  });

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  // Expose API
  window.app = {
    navigate,
    navigateToSubject,
    switchTab,
    // Subjects
    openAddSubject,
    deleteSubjectUI,
    // Schedule
    addScheduleBlock,
    confirmScheduleBlock,
    removeScheduleBlock,
    // Files
    viewFile,
    backToFiles,
    deleteFile,
    sortFiles,
    fileDragStart,
    fileDragOver,
    fileDragLeave,
    fileDrop,
    useFileForSummary,
    useFileForQuiz,
    processFileWithAI,
    toggleFileSelection,
    // Notes
    createNote,
    selectNote,
    saveCurrentNote,
    deleteNote,
    formatText,
    // Summaries
    generateSummary,
    viewSummary,
    backToSummaries,
    deleteSummary,
    // Quiz
    generateQuiz,
    answerQuiz,
    nextQuestion,
    resetQuiz,
    // Exam
    saveExamDate,
    generateStudyPlan,
    toggleChecklist
  };

  // Initial render
  renderSidebar();
  renderDashboard();

})();
