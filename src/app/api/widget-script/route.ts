import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const script = `
(function() {
  'use strict';

  if (window.__carbotLoaded) return;
  window.__carbotLoaded = true;

  var config = {};
  var widget = null;
  var fabEl = null;
  var pc = null;
  var dc = null;
  var localStream = null;
  var audioEl = null;
  var conversationId = null;
  var callStartTime = null;
  var currentAssistantMsg = null;
  var currentAssistantText = '';
  var pendingSaves = [];
  var muted = false;
  var waveInterval = null;
  var pulseAnimFrame = null;
  var APP_URL = '${appUrl}';

  /* ─── Public API ─────────────────────────────────────── */
  window.CarBot = {
    init: function(options) {
      config = options || {};
      if (!config.businessId) { console.error('[CarBot] businessId is required'); return; }
      loadConfig()
        .then(function(cfg) { injectStyles(cfg); createFAB(cfg); })
        .catch(function() {
          var fallback = { widget: { primary_color: '#22c55e', position: 'bottom-right' }, business: { name: 'AI Receptionist' } };
          injectStyles(fallback);
          createFAB(fallback);
        });
    }
  };

  /* ─── Config ─────────────────────────────────────────── */
  function loadConfig() {
    return fetch(APP_URL + '/api/widget/config?businessId=' + encodeURIComponent(config.businessId))
      .then(function(r) { return r.json(); });
  }

  /* ─── FAB ────────────────────────────────────────────── */
  function createFAB(cfg) {
    var color   = cfg.widget && cfg.widget.primary_color ? cfg.widget.primary_color : '#22c55e';
    var pos     = config.position || (cfg.widget && cfg.widget.position) || 'bottom-right';
    var isLeft  = pos === 'bottom-left';

    var wrap = document.createElement('div');
    wrap.id = 'carbot-fab-wrap';
    wrap.style.cssText = 'position:fixed;bottom:20px;' + (isLeft ? 'left:20px' : 'right:20px') + ';z-index:2147483646;';

    /* pulse rings */
    var ring1 = document.createElement('div');
    ring1.className = 'carbot-ring1';
    ring1.style.background = color;

    var ring2 = document.createElement('div');
    ring2.className = 'carbot-ring2';
    ring2.style.background = color;

    /* tooltip */
    var tip = document.createElement('div');
    tip.className = 'carbot-tooltip';
    tip.textContent = 'Talk to AI';

    /* button */
    fabEl = document.createElement('button');
    fabEl.className = 'carbot-fab';
    fabEl.style.cssText = 'background:linear-gradient(135deg,' + color + ',' + color + 'cc);box-shadow:0 8px 24px ' + color + '55,0 2px 8px rgba(0,0,0,.4);';
    fabEl.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.71 13 19.79 19.79 0 011.65 4.4a2 2 0 011.99-2.19h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91a16 16 0 006.29 6.29l1.77-1.77a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
    fabEl.addEventListener('click', function() { openWidget(cfg, color, pos); });

    wrap.appendChild(ring1);
    wrap.appendChild(ring2);
    wrap.appendChild(tip);
    wrap.appendChild(fabEl);
    document.body.appendChild(wrap);
    animatePulse(ring1, ring2);
  }

  function animatePulse(r1, r2) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = ((ts - start) % 2200) / 2200;
      var t2 = ((ts - start + 440) % 2200) / 2200;
      r1.style.transform = 'scale(' + (1 + t * 0.5) + ')';
      r1.style.opacity = (0.25 * (1 - t));
      r2.style.transform = 'scale(' + (1 + t2 * 0.8) + ')';
      r2.style.opacity = (0.15 * (1 - t2));
      pulseAnimFrame = requestAnimationFrame(step);
    }
    pulseAnimFrame = requestAnimationFrame(step);
  }

  /* ─── Widget panel ───────────────────────────────────── */
  function openWidget(cfg, color, pos) {
    if (widget) return;
    if (pulseAnimFrame) { cancelAnimationFrame(pulseAnimFrame); pulseAnimFrame = null; }
    var wrap = document.getElementById('carbot-fab-wrap');
    if (wrap) wrap.style.display = 'none';

    var greeting = (cfg.widget && cfg.widget.greeting) || (cfg.agent && cfg.agent.greeting_message) || 'Talk to our AI receptionist — ask about services, hours, or book an appointment.';
    var name     = (cfg.business && cfg.business.name) || 'AI Receptionist';
    var isLeft   = pos === 'bottom-left';

    widget = document.createElement('div');
    widget.className = 'carbot-widget';
    widget.style.cssText = (isLeft ? 'left:20px' : 'right:20px') + ';';
    widget.innerHTML = buildWidgetHTML(name, color, greeting);
    document.body.appendChild(widget);

    /* animate in */
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        widget.style.opacity = '1';
        widget.style.transform = 'translateY(0) scale(1)';
      });
    });

    widget.querySelector('#carbot-close').addEventListener('click', closeWidget);
    widget.querySelector('#carbot-start-btn').addEventListener('click', startVoice);
    widget.querySelector('#carbot-mute-btn').addEventListener('click', toggleMute);
    widget.querySelector('#carbot-end-btn').addEventListener('click', function() { endVoice(); showIdle(); });
  }

  function closeWidget() {
    endVoice();
    if (widget) {
      widget.style.opacity = '0';
      widget.style.transform = 'translateY(16px) scale(0.95)';
      setTimeout(function() {
        if (widget) { widget.remove(); widget = null; }
        var wrap = document.getElementById('carbot-fab-wrap');
        if (wrap) {
          wrap.style.display = '';
          animatePulse(wrap.querySelector('.carbot-ring1'), wrap.querySelector('.carbot-ring2'));
        }
      }, 220);
    }
  }

  function buildWidgetHTML(name, color, greeting) {
    var micSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    var micOffSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    var endSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07"/><path d="M13.32 10.68A19.5 19.5 0 005 4.71"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    var sparkSvg = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    var msgSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';

    var waveBarHeights = [6, 10, 14, 10, 6];
    var waveBars = waveBarHeights.map(function(h, i) {
      return '<div class="carbot-wbar" data-h="' + h + '" style="height:3px;animation-delay:' + (i * 0.07) + 's;animation-duration:' + (0.55 + i * 0.08) + 's"></div>';
    }).join('');

    return (
      /* header */
      '<div class="carbot-header">' +
        '<div class="carbot-hbg" style="background:linear-gradient(135deg,' + color + '33 0%,transparent 60%)"></div>' +
        '<div class="carbot-header-left">' +
          '<div class="carbot-hicon" style="background:' + color + '22;border:1px solid ' + color + '44">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
          '</div>' +
          '<div>' +
            '<div class="carbot-hname">' + escHtml(name) + '</div>' +
            '<div class="carbot-hsub">' +
              '<div class="carbot-hdot" style="background:' + color + '"></div>' +
              '<span id="carbot-status-text" style="color:' + color + '">AI Receptionist</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="carbot-header-right">' +
          '<div id="carbot-waveform" class="carbot-waveform" style="display:none">' + waveBars + '</div>' +
          '<button id="carbot-close" class="carbot-closebtn" title="Close">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +

      /* transcript */
      '<div id="carbot-transcript" class="carbot-transcript">' +
        '<div id="carbot-empty-state" class="carbot-empty-state">' +
          '<div class="carbot-empty-icon">' + msgSvg + '</div>' +
          '<span>Conversation will appear here</span>' +
        '</div>' +
      '</div>' +

      /* controls */
      '<div class="carbot-controls">' +
        '<div id="carbot-idle" class="carbot-idle">' +
          '<p class="carbot-greeting-text">' + escHtml(greeting) + '</p>' +
          '<div class="carbot-orb-wrap">' +
            '<button id="carbot-start-btn" class="carbot-orb" style="background:linear-gradient(135deg,' + color + ',' + color + 'bb);box-shadow:0 0 20px ' + color + '55,0 4px 16px rgba(0,0,0,.4)">' +
              micSvg +
            '</button>' +
            '<div class="carbot-tap-hint">Tap to start</div>' +
          '</div>' +
        '</div>' +

        '<div id="carbot-active" class="carbot-active-controls" style="display:none">' +
          '<div class="carbot-orb-wrap">' +
            '<div id="carbot-ring-outer" class="carbot-ring-outer" style="background:' + color + '12;display:none"></div>' +
            '<div id="carbot-ring-inner" class="carbot-ring-inner" style="background:' + color + '07;display:none"></div>' +
            '<div id="carbot-listen-ring" class="carbot-listen-ring" style="border-color:' + color + '44;display:none"></div>' +
            '<button id="carbot-mute-btn" class="carbot-orb carbot-orb-active" style="background:linear-gradient(135deg,' + color + ',' + color + 'bb);box-shadow:0 0 20px ' + color + '55,0 4px 16px rgba(0,0,0,.4)">' +
              micSvg +
            '</button>' +
          '</div>' +
          '<div class="carbot-status-row">' +
            '<div id="carbot-state-label" class="carbot-state-label" style="color:' + color + '">' +
              '<div class="carbot-sdot" style="background:' + color + '"></div>' +
              '<span id="carbot-state-text">Listening…</span>' +
            '</div>' +
            '<button id="carbot-end-btn" class="carbot-endbtn">' +
              endSvg + 'End' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* footer */
      '<div class="carbot-footer">' +
        sparkSvg + '<span>Powered by CarBot AI</span>' +
      '</div>'
    );
  }

  /* ─── Voice connection ───────────────────────────────── */
  async function startVoice() {
    var startBtn = widget.querySelector('#carbot-start-btn');
    startBtn.disabled = true;
    setStatusText('Connecting…');

    try {
      /* Phase 1: fetch session config from our backend (JSON) */
      var res = await fetch(APP_URL + '/api/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: config.businessId }),
      });
      var sessionData = await res.json();
      if (sessionData.error) throw new Error(sessionData.error);
      conversationId = sessionData.conversationId;
      var model = sessionData.model || 'gpt-realtime';

      pc = new RTCPeerConnection();
      audioEl = new Audio();
      audioEl.autoplay = true;
      pc.ontrack = function(e) { audioEl.srcObject = e.streams[0]; };

      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.getTracks().forEach(function(t) { pc.addTrack(t, localStream); });

      dc = pc.createDataChannel('oai-events');
      dc.onopen = function() {
        callStartTime = Date.now();
        muted = false;
        showActive();
        setCallState('listening');
        /* Trigger the greeting */
        dc.send(JSON.stringify({ type: 'response.create' }));
      };
      dc.onmessage = function(e) {
        try { handleEvent(JSON.parse(e.data)); } catch(_) {}
      };

      var offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      /* Wait for ICE gathering to complete before sending SDP */
      var completeSdp = await new Promise(function(resolve) {
        if (pc.iceGatheringState === 'complete') {
          resolve(pc.localDescription.sdp);
        } else {
          pc.addEventListener('icegatheringstatechange', function() {
            if (pc.iceGatheringState === 'complete') {
              resolve(pc.localDescription.sdp);
            }
          });
        }
      });

      /* Phase 2: proxy SDP + session config through our backend */
      var sdpRes = await fetch(APP_URL + '/api/realtime/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdp: completeSdp,
          model: model,
          voice: sessionData.voice,
          instructions: sessionData.systemPrompt,
          tools: sessionData.tools,
          turnDetection: sessionData.turnDetection,
        }),
      });
      if (!sdpRes.ok) throw new Error('SDP exchange failed: ' + sdpRes.status);
      var answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    } catch(err) {
      console.error('[CarBot]', err);
      setStatusText('Error: ' + err.message);
      if (startBtn) startBtn.disabled = false;
    }
  }

  function endVoice() {
    stopWaveAnimation();
    var dur = callStartTime ? Math.round((Date.now() - callStartTime) / 1000) : null;
    callStartTime = null;
    if (localStream) { localStream.getTracks().forEach(function(t) { t.stop(); }); localStream = null; }
    if (dc) { try { dc.close(); } catch(_) {} dc = null; }
    if (pc) { try { pc.close(); } catch(_) {} pc = null; }
    if (conversationId) {
      var cid = conversationId;
      conversationId = null;
      var updates = { status: 'completed' };
      if (dur && dur > 0) updates.duration_seconds = dur;
      Promise.all(pendingSaves).then(function() {
        pendingSaves = [];
        fetch(APP_URL + '/api/conversations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: cid, updates: updates }),
        }).catch(function() {});
      });
    }
  }

  function toggleMute() {
    if (!localStream) return;
    muted = !muted;
    localStream.getAudioTracks().forEach(function(t) { t.enabled = !muted; });
    var btn = widget && widget.querySelector('#carbot-mute-btn');
    if (btn) {
      if (muted) {
        btn.style.background = 'rgba(255,255,255,0.08)';
        btn.style.boxShadow = 'none';
        btn.style.border = '1.5px solid rgba(255,255,255,0.12)';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
        setCallState('muted');
      } else {
        var color = getColor();
        btn.style.background = 'linear-gradient(135deg,' + color + ',' + color + 'bb)';
        btn.style.boxShadow = '0 0 20px ' + color + '55,0 4px 16px rgba(0,0,0,.4)';
        btn.style.border = 'none';
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
        setCallState('listening');
      }
    }
  }

  /* ─── Event handling ─────────────────────────────────── */
  function handleEvent(ev) {
    if (ev.type === 'input_audio_buffer.speech_started') {
      if (!muted) setCallState('listening');
    }
    if (ev.type === 'response.created' || ev.type === 'output_audio_buffer.started') {
      if (!muted) setCallState('speaking');
    }
    /* GA: response.output_audio_transcript.delta / .done */
    if (ev.type === 'response.output_audio_transcript.delta') {
      if (!currentAssistantMsg) { currentAssistantMsg = addMessage('ai', ''); currentAssistantText = ''; }
      currentAssistantText += ev.delta || '';
      currentAssistantMsg.querySelector('.carbot-msg-text').textContent = currentAssistantText;
      scrollTranscript();
    }
    if (ev.type === 'response.output_audio_transcript.done') {
      var t = ev.transcript || currentAssistantText || '';
      if (t) {
        if (currentAssistantMsg) {
          currentAssistantMsg.querySelector('.carbot-msg-text').textContent = t;
        }
        saveMessage('assistant', t);
      }
      currentAssistantMsg = null;
      currentAssistantText = '';
      if (!muted) setCallState('listening');
    }
    /* GA: user audio committed — no transcription available, show placeholder */
    if (ev.type === 'input_audio_buffer.committed') {
      addMessage('user', '🎤 Voice message');
    }
    if (ev.type === 'response.function_call_arguments.done') {
      fetch(APP_URL + '/api/realtime/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName: ev.name, toolArgs: JSON.parse(ev.arguments || '{}'), businessId: config.businessId, conversationId: conversationId }),
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (dc && dc.readyState === 'open') {
          dc.send(JSON.stringify({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: ev.call_id, output: JSON.stringify(data.result) } }));
          dc.send(JSON.stringify({ type: 'response.create' }));
        }
      }).catch(function() {});
    }
  }

  /* ─── UI state ───────────────────────────────────────── */
  function setCallState(state) {
    if (!widget) return;
    var color = getColor();
    var stateText = widget.querySelector('#carbot-state-text');
    var stateLabel = widget.querySelector('#carbot-state-label');
    var ringOuter = widget.querySelector('#carbot-ring-outer');
    var ringInner = widget.querySelector('#carbot-ring-inner');
    var listenRing = widget.querySelector('#carbot-listen-ring');
    var waveform = widget.querySelector('#carbot-waveform');

    if (state === 'speaking') {
      if (stateText) stateText.textContent = 'AI Speaking';
      if (stateLabel) stateLabel.style.color = color;
      if (ringOuter) ringOuter.style.display = 'block';
      if (ringInner) ringInner.style.display = 'block';
      if (listenRing) listenRing.style.display = 'none';
      if (waveform) { waveform.style.display = 'flex'; startWaveAnimation(color); }
      animateSpeakingRings(ringOuter, ringInner);
    } else if (state === 'listening') {
      if (stateText) stateText.textContent = 'Listening…';
      if (stateLabel) stateLabel.style.color = color;
      if (ringOuter) { ringOuter.style.display = 'none'; ringOuter.style.transform = 'scale(1)'; }
      if (ringInner) { ringInner.style.display = 'none'; ringInner.style.transform = 'scale(1)'; }
      if (listenRing) listenRing.style.display = 'block';
      if (waveform) { waveform.style.display = 'none'; stopWaveAnimation(); }
    } else if (state === 'muted') {
      if (stateText) stateText.textContent = 'Muted';
      if (stateLabel) stateLabel.style.color = '#64748b';
      if (ringOuter) { ringOuter.style.display = 'none'; }
      if (ringInner) { ringInner.style.display = 'none'; }
      if (listenRing) listenRing.style.display = 'none';
      if (waveform) { waveform.style.display = 'none'; stopWaveAnimation(); }
    }
  }

  function showActive() {
    if (!widget) return;
    var idle = widget.querySelector('#carbot-idle');
    var active = widget.querySelector('#carbot-active');
    if (idle) idle.style.display = 'none';
    if (active) active.style.display = 'flex';
  }

  function showIdle() {
    if (!widget) return;
    var idle = widget.querySelector('#carbot-idle');
    var active = widget.querySelector('#carbot-active');
    var waveform = widget.querySelector('#carbot-waveform');
    if (idle) idle.style.display = 'block';
    if (active) active.style.display = 'none';
    if (waveform) waveform.style.display = 'none';
    stopWaveAnimation();
    setStatusText('AI Receptionist');
    var startBtn = widget.querySelector('#carbot-start-btn');
    if (startBtn) startBtn.disabled = false;
  }

  function setStatusText(text) {
    var el = widget && widget.querySelector('#carbot-status-text');
    if (el) el.textContent = text;
  }

  /* ─── Speaking ring animation ────────────────────────── */
  var ringAnimFrame = null;
  function animateSpeakingRings(outer, inner) {
    if (ringAnimFrame) cancelAnimationFrame(ringAnimFrame);
    var start = null;
    function step(ts) {
      if (!outer || !inner) return;
      if (!start) start = ts;
      var t1 = ((ts - start) % 1400) / 1400;
      var t2 = ((ts - start + 350) % 1400) / 1400;
      var s1 = 1 + Math.sin(t1 * Math.PI * 2) * 0.125;
      var s2 = 1 + Math.sin(t2 * Math.PI * 2) * 0.1;
      outer.style.transform = 'scale(' + s1 + ')';
      inner.style.transform = 'scale(' + s2 + ')';
      ringAnimFrame = requestAnimationFrame(step);
    }
    ringAnimFrame = requestAnimationFrame(step);
  }

  /* ─── Waveform animation ─────────────────────────────── */
  var waveAnimFrames = [];
  var waveStartTimes = [];
  var waveHeights = [6, 10, 14, 10, 6];

  function startWaveAnimation(color) {
    stopWaveAnimation();
    if (!widget) return;
    var bars = widget.querySelectorAll('.carbot-wbar');
    bars.forEach(function(bar, i) {
      bar.style.background = color;
      var start = null;
      var dur = (0.55 + i * 0.08) * 1000;
      var delay = i * 70;
      function step(ts) {
        if (!start) start = ts - delay;
        var elapsed = ts - start;
        var t = ((elapsed % (dur * 2)) / (dur * 2));
        var progress = t < 0.5 ? t * 2 : 2 - t * 2;
        var h = 3 + (waveHeights[i] - 3) * progress;
        bar.style.height = h + 'px';
        waveAnimFrames[i] = requestAnimationFrame(step);
      }
      waveAnimFrames[i] = requestAnimationFrame(step);
    });
  }

  function stopWaveAnimation() {
    waveAnimFrames.forEach(function(f) { if (f) cancelAnimationFrame(f); });
    waveAnimFrames = [];
    if (ringAnimFrame) { cancelAnimationFrame(ringAnimFrame); ringAnimFrame = null; }
    if (widget) {
      var bars = widget.querySelectorAll('.carbot-wbar');
      bars.forEach(function(bar) { bar.style.height = '3px'; });
    }
  }

  /* ─── Transcript ─────────────────────────────────────── */
  function addMessage(role, text) {
    if (!widget) return null;
    var t = widget.querySelector('#carbot-transcript');
    var empty = widget.querySelector('#carbot-empty-state');
    if (empty) empty.style.display = 'none';

    var color = getColor();
    var wrap = document.createElement('div');
    wrap.className = 'carbot-msg-row carbot-msg-' + role;

    var avatar = document.createElement('div');
    avatar.className = 'carbot-avatar';
    if (role === 'ai') {
      avatar.style.cssText = 'background:' + color + '22;border:1px solid ' + color + '44;color:' + color;
      avatar.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>';
    } else {
      avatar.style.cssText = 'background:rgba(255,255,255,0.07);color:#64748b';
      avatar.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    }

    var bubble = document.createElement('div');
    bubble.className = 'carbot-bubble carbot-bubble-' + role;
    if (role === 'ai') {
      bubble.style.cssText = 'background:' + color + '12;border:1px solid ' + color + '25;border-top-left-radius:3px';
    } else {
      bubble.style.cssText = 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-top-right-radius:3px';
    }
    var span = document.createElement('span');
    span.className = 'carbot-msg-text';
    span.textContent = text;
    bubble.appendChild(span);

    if (role === 'user') {
      wrap.appendChild(bubble);
      wrap.appendChild(avatar);
    } else {
      wrap.appendChild(avatar);
      wrap.appendChild(bubble);
    }
    t.appendChild(wrap);
    scrollTranscript();
    return wrap;
  }

  function scrollTranscript() {
    var t = widget && widget.querySelector('#carbot-transcript');
    if (t) t.scrollTop = t.scrollHeight;
  }

  function saveMessage(role, content) {
    if (!conversationId || !content.trim()) return;
    var p = fetch(APP_URL + '/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: conversationId, role: role, content: content }),
    }).catch(function() {});
    pendingSaves.push(p);
  }

  /* ─── Helpers ────────────────────────────────────────── */
  function getColor() {
    return config._color || '#22c55e';
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ─── Styles ─────────────────────────────────────────── */
  function injectStyles(cfg) {
    var color = cfg.widget && cfg.widget.primary_color ? cfg.widget.primary_color : '#22c55e';
    config._color = color;

    if (document.getElementById('carbot-styles')) return;
    var s = document.createElement('style');
    s.id = 'carbot-styles';
    s.textContent = [
      /* FAB wrap */
      '#carbot-fab-wrap{position:fixed;bottom:20px;right:20px;z-index:2147483646;display:flex;align-items:center;justify-content:center}',

      /* Rings */
      '.carbot-ring1,.carbot-ring2{position:absolute;width:56px;height:56px;border-radius:50%;pointer-events:none;will-change:transform,opacity}',

      /* Tooltip */
      '.carbot-tooltip{position:absolute;bottom:calc(100% + 10px);right:0;background:rgba(8,14,16,.95);border:1px solid rgba(255,255,255,.1);color:#e2e8f0;font-size:11px;font-weight:600;white-space:nowrap;padding:5px 10px;border-radius:8px;pointer-events:none;font-family:Inter,system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.4)}',
      '.carbot-tooltip::after{content:"";position:absolute;top:100%;right:14px;border:4px solid transparent;border-top-color:rgba(255,255,255,.1)}',

      /* FAB button */
      '.carbot-fab{position:relative;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;transition:transform .2s;will-change:transform}',
      '.carbot-fab:hover{transform:scale(1.06)}',
      '.carbot-fab:active{transform:scale(0.94)}',

      /* Widget panel */
      '.carbot-widget{position:fixed;bottom:20px;right:20px;width:340px;border-radius:16px;overflow:hidden;z-index:2147483645;font-family:Inter,system-ui,-apple-system,sans-serif;background:rgba(8,14,16,.97);border:1px solid rgba(255,255,255,.1);box-shadow:0 24px 64px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.05);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);opacity:0;transform:translateY(16px) scale(0.95);transition:opacity .22s ease,transform .22s ease}',

      /* Header */
      '.carbot-header{position:relative;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07);overflow:hidden}',
      '.carbot-hbg{position:absolute;inset:0;opacity:.2;pointer-events:none}',
      '.carbot-header-left{position:relative;display:flex;align-items:center;gap:10px}',
      '.carbot-header-right{position:relative;display:flex;align-items:center;gap:8px}',
      '.carbot-hicon{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
      '.carbot-hname{font-size:13px;font-weight:700;color:#f1f5f9;line-height:1.2}',
      '.carbot-hsub{display:flex;align-items:center;gap:5px;margin-top:2px}',
      '.carbot-hdot{width:6px;height:6px;border-radius:50%;animation:carbot-pulse 1.5s infinite}',
      '#carbot-status-text{font-size:10px;font-weight:500}',

      /* Waveform */
      '.carbot-waveform{display:flex;align-items:center;gap:2px;height:16px}',
      '.carbot-wbar{width:3px;border-radius:99px;height:3px;will-change:height}',

      /* Close button */
      '.carbot-closebtn{width:28px;height:28px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);color:#64748b;transition:background .2s,color .2s}',
      '.carbot-closebtn:hover{background:rgba(255,255,255,.12);color:#e2e8f0}',

      /* Transcript */
      '.carbot-transcript{height:192px;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;border-bottom:1px solid rgba(255,255,255,.06);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent}',
      '.carbot-transcript::-webkit-scrollbar{width:4px}',
      '.carbot-transcript::-webkit-scrollbar-track{background:transparent}',
      '.carbot-transcript::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:4px}',

      /* Empty state */
      '.carbot-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;color:#2a3f4d;font-size:11px}',
      '.carbot-empty-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}',

      /* Messages */
      '.carbot-msg-row{display:flex;gap:7px;align-items:flex-start}',
      '.carbot-msg-user{flex-direction:row-reverse}',
      '.carbot-avatar{width:18px;height:18px;border-radius:50%;display:flex;flex-shrink:0;align-items:center;justify-content:center;margin-top:2px}',
      '.carbot-bubble{max-width:82%;padding:8px 10px;border-radius:12px;font-size:11px;line-height:1.55;color:#cbd5e1}',
      '.carbot-bubble-user{color:#94a3b8}',

      /* Controls */
      '.carbot-controls{padding:16px 20px}',
      '.carbot-idle{display:block;text-align:center}',
      '.carbot-greeting-text{font-size:12px;color:#4b6070;line-height:1.5;margin:0 0 14px}',
      '.carbot-orb-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;position:relative}',
      '.carbot-orb{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;z-index:2;transition:transform .15s}',
      '.carbot-orb:hover{transform:scale(1.05)}',
      '.carbot-orb:active{transform:scale(0.93)}',
      '.carbot-orb:disabled{opacity:.5;cursor:not-allowed;transform:none}',
      '.carbot-tap-hint{font-size:11px;color:#3d5060}',

      /* Active controls */
      '.carbot-active-controls{display:flex;flex-direction:column;align-items:center;gap:10px}',
      '.carbot-ring-outer,.carbot-ring-inner{position:absolute;border-radius:50%;pointer-events:none}',
      '.carbot-ring-outer{width:96px;height:96px;top:50%;left:50%;margin:-48px 0 0 -48px}',
      '.carbot-ring-inner{width:112px;height:112px;top:50%;left:50%;margin:-56px 0 0 -56px}',
      '.carbot-listen-ring{position:absolute;width:80px;height:80px;border-radius:50%;border:1.5px solid;top:50%;left:50%;margin:-40px 0 0 -40px;pointer-events:none;animation:carbot-listen-pulse 1.8s ease-in-out infinite}',
      '.carbot-orb-active{z-index:3}',
      '.carbot-status-row{display:flex;align-items:center;gap:10px}',
      '.carbot-state-label{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:500}',
      '.carbot-sdot{width:6px;height:6px;border-radius:50%;animation:carbot-pulse 1.1s infinite}',
      '.carbot-endbtn{display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:500;cursor:pointer;color:#f87171;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);transition:background .2s;font-family:inherit}',
      '.carbot-endbtn:hover{background:rgba(239,68,68,.18)}',
      '.carbot-endbtn svg{margin-right:1px}',

      /* Footer */
      '.carbot-footer{padding:8px 16px;display:flex;align-items:center;justify-content:center;gap:5px;border-top:1px solid rgba(255,255,255,.05);background:rgba(0,0,0,.3);color:#2a3f4d;font-size:10px;font-family:Inter,system-ui,sans-serif}',

      /* Keyframes */
      '@keyframes carbot-pulse{0%,100%{opacity:1}50%{opacity:.3}}',
      '@keyframes carbot-listen-pulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.12);opacity:1}}',
    ].join('');
    document.head.appendChild(s);
  }

})();
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
