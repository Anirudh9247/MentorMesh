import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { interpolate } from 'polymorph-js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setIsLoggedIn(true);
      const user = JSON.parse(userStr);
      setUserRole(user.role);
    }
  }, []);

  useEffect(() => {
    // Intro Animation Setup
    const letterA = document.querySelector('#letters');
    if (!letterA) return;

    const letterR = "M54 426V269.4h136.2l90 156.6H342l-95.4-163.2C294 249 331.2 213 331.2 135c0-99.6-67.8-135-135.6-135H0v426h54zm130.2-208.2H54V52.2h130.2c68.4 0 90 34.8 90 82.8s-21.6 82.8-90 82.8z";
    const letterT = "M192 426V51.6h138V0H0v51.6h138V426z";

    const introStep1 = interpolate([letterA.getAttribute('d'), letterR], {
      addPoints: 0,
      origin: { x: 0, y: 0 },
      optimize: 'fill',
      precision: 4
    });
    const introStep2 = interpolate([letterR, letterT], {
      addPoints: 0,
      origin: { x: 0, y: 0 },
      optimize: 'fill',
      precision: 4
    });

    let val = { prop: 0 };
    let val2 = { prop: 0 };

    let introLetters = gsap.timeline({ defaults: { duration: 4, ease: 'power1.inOut' } });

    introLetters.to(val, {
      prop: 1,
      onUpdate: function() {
        letterA.setAttribute("d", introStep1(val.prop));
      }
    })
    .to(val2, {
      prop: 1,
      onUpdate: function() {
        letterA.setAttribute("d", introStep2(val2.prop));
      }
    })
    .to('#intro .border-top', {
      scaleX: 1,
      duration: 8
    }, 0)
    .to('#intro .border-bottom', {
      scaleX: 1,
      duration: 8
    }, 0);

    const introTrigger = ScrollTrigger.create({
      trigger: '#intro',
      pin: true,
      animation: introLetters,
      scrub: 0.6
    });

    // Outro Animation Setup
    const outro1Start = document.querySelector('#outro1');
    const outro2Start = document.querySelector('#outro2');
    const outro3Start = document.querySelector('#outro3');
    const outro4Start = document.querySelector('#outro4');
    const outro5Start = document.querySelector('#outro5');
    const outro6Start = document.querySelector('#outro6');
    const outro7Start = document.querySelector('#outro7');
    const outro8Start = document.querySelector('#outro8');
    const outro9Start = document.querySelector('#outro9');
    const outro10Start = document.querySelector('#outro10');
    const outro11Start = document.querySelector('#outro11');

    if (!outro1Start) return;

    const outro1End = "M77.992.152H61.288C28.744.152.52 20.024.52 62.936v21.888c0 42.912 28.224 62.784 60.768 62.784h16.704c32.544 0 60.768-19.872 60.768-62.784V62.936c0-42.912-28.224-62.784-60.768-62.784zm34.848 80.064c0 25.92-10.368 42.624-43.2 42.624s-43.2-16.704-43.2-42.624V67.544c0-25.92 10.368-42.624 43.2-42.624s43.2 16.704 43.2 42.624v12.672z";
    const outro2End = "M77.368 25.288h28.8V.52H69.016c-25.632 0-47.808 14.112-47.808 57.024v9.216H.76v24.768h20.448V205h25.92V91.528h41.76V66.76h-41.76v-4.608c0-23.04 7.2-36.864 30.24-36.864z";
    const outro3End = "M131.696 101.24c0-25.344-14.4-38.304-66.528-43.488C41.84 55.448 31.76 52.28 31.76 40.76c0-9.504 12.384-16.704 31.104-16.704 22.464 0 31.104 6.912 33.984 16.992h28.8C119.312 13.112 94.544.152 65.744.152 27.728.152 5.84 16.856 5.84 43.064c0 21.024 11.808 33.12 50.688 37.728 40.896 4.896 49.248 7.776 49.248 20.16 0 9.792-5.472 21.888-38.304 21.888-27.072 0-36.288-9.504-38.592-19.584H.08c6.336 27.936 26.208 44.352 67.104 44.352 44.352 0 64.512-18.72 64.512-46.368z";
    const outro4End = "M.52 84.824c0 42.912 28.224 62.784 59.328 62.784h16.704c27.648 0 51.552-16.704 54.144-52.704h-26.784c-2.304 17.28-11.808 27.936-35.712 27.936-31.392 0-41.76-16.704-41.76-42.624V67.544c0-25.92 10.368-42.624 41.76-42.624 21.888 0 31.68 9.216 34.848 24.48h27.072C126.376 15.704 103.048.152 76.552.152H59.848C28.744.152.52 20.024.52 62.936v21.888z";
    const outro5End = "M72.904.76C54.76.76 35.176 11.992 25.96 26.392V.76H.04V139h25.92V74.2c0-35.424 24.192-48.672 38.592-48.672h27.936V.76H72.904z";
    const outro6End = "M77.992.152H61.288C28.744.152.52 20.024.52 62.936v21.888c0 42.912 28.224 62.784 60.768 62.784h16.704c32.544 0 60.768-19.872 60.768-62.784V62.936c0-42.912-28.224-62.784-60.768-62.784zm34.848 80.064c0 25.92-10.368 42.624-43.2 42.624s-43.2-16.704-43.2-42.624V67.544c0-25.92 10.368-42.624 43.2-42.624s43.2 16.704 43.2 42.624v12.672z";
    const outro7End = "M.04.912V210h25.92V.912H.04z";
    const outro8End = "M.04.912V210h25.92V.912H.04z";
    const outro9End = "M18.272 35.472c9.504 0 17.28-7.488 17.28-16.992 0-9.504-7.776-17.568-17.28-17.568C8.768.912.992 8.976.992 18.48c0 9.504 7.776 16.992 17.28 16.992zM5.312 210h25.92V71.76H5.312V210z";
    const outro10End = "M72.904.152c-17.568 0-38.88 11.232-48.672 27.36V4.76H.04V143h25.92V70.712c0-35.424 24.192-45.792 38.592-45.792 24.192 0 34.56 10.944 34.56 36.864V143h25.92V57.176c0-42.912-28.224-57.024-52.128-57.024z";
    const outro11End = "M108.672 4.76v24.768C99.744 12.536 79.872.152 61.728.152 29.184.152.96 20.024.96 62.936V79.64C.96 122.552 29.184 143 61.728 143c18.144 0 38.88-9.792 46.944-26.208v18.144c0 25.92-4.032 42.624-39.744 42.624-25.632 0-31.968-6.048-36.864-16.128H2.976c8.064 27.936 31.68 40.896 57.888 40.896H75.84c33.984 0 58.752-19.584 58.752-62.784V4.76h-25.92zM70.08 118.232c-32.832 0-43.2-17.28-43.2-43.2v-7.488c0-25.92 10.368-42.624 43.2-42.624 14.4 0 38.592 10.368 38.592 45.792v4.32c0 35.424-24.192 43.2-38.592 43.2z";

    const outroStep1 = interpolate([outro1Start.getAttribute('d'), outro1End], {
      addPoints: 2,
      origin: { x: 0, y: 0 },
      optimize: 'fill',
      precision: 4
    });
    const outroStep2 = interpolate([outro2Start.getAttribute('d'), outro2End], {
      addPoints: 4,
      origin: { x: 0, y: 0 },
      optimize: 'fill',
      precision: 4
    });

    let val3 = { prop: 0 };
    let val4 = { prop: 0 };

    let outroLetters1 = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
    outroLetters1.to(val3, {
      prop: 1,
      onUpdate: function() {
        outro1Start.setAttribute("d", outroStep1(val3.prop));
      }
    })
    .to(val4, {
      prop: 1,
      onUpdate: function() {
        outro2Start.setAttribute("d", outroStep2(val4.prop));
      }
    }, 0.2);

    const outroTrigger1 = ScrollTrigger.create({
      trigger: '#outro',
      animation: outroLetters1,
      pin: true,
      scrub: 0.6,
      start: 'top top',
      end: '+=70%'
    });

    const outroStep3 = interpolate([outro3Start.getAttribute('d'), outro3End], {
      addPoints: 4,
      origin: { x: 50, y: 50 },
      optimize: 'fill',
      precision: 4
    });
    const outroStep4 = interpolate([outro4Start.getAttribute('d'), outro4End], {
      addPoints: 20,
      origin: { x: 20, y: 20 },
      optimize: 'fill',
      precision: 4
    });
    const outroStep5 = interpolate([outro5Start.getAttribute('d'), outro5End], {
      addPoints: 0,
      origin: { x: 0, y: 0 },
      optimize: 'fill',
      precision: 4
    });

    let val5 = { prop: 0 };
    let val6 = { prop: 0 };
    let val7 = { prop: 0 };

    let outroLetters2 = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
    outroLetters2.to(val5, {
      prop: 1,
      onUpdate: function() {
        outro3Start.setAttribute("d", outroStep3(val5.prop));
      }
    })
    .to(val6, {
      prop: 1,
      onUpdate: function() {
        outro4Start.setAttribute("d", outroStep4(val6.prop));
      }
    }, 0.2)
    .to(val7, {
      prop: 1,
      onUpdate: function() {
        outro5Start.setAttribute("d", outroStep5(val7.prop));
      }
    }, 0.4);

    const outroTrigger2 = ScrollTrigger.create({
      trigger: '#outro',
      animation: outroLetters2,
      pin: true,
      scrub: 0.6,
      start: '+=25%',
      end: '+=70%'
    });

    const outroStep6 = interpolate([outro6Start.getAttribute('d'), outro6End], {
      addPoints: 0,
      origin: { x: 0, y: 0 },
      optimize: 'fill',
      precision: 4
    });
    const outroStep7 = interpolate([outro7Start.getAttribute('d'), outro7End], {
      addPoints: 0,
      origin: { x: 50, y: 50 },
      optimize: 'fill',
      precision: 4
    });
    const outroStep8 = interpolate([outro8Start.getAttribute('d'), outro8End], {
      addPoints: 0,
      origin: { x: 0, y: 0 },
      optimize: 'fill',
      precision: 4
    });
    const outroStep9 = interpolate([outro9Start.getAttribute('d'), outro9End], {
      addPoints: 0,
      origin: { x: 0, y: 0 },
      optimize: 'fill',
      precision: 4
    });

    let val8 = { prop: 0 };
    let val9 = { prop: 0 };
    let val10 = { prop: 0 };
    let val11 = { prop: 0 };

    let outroLetters3 = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
    outroLetters3.to(val8, {
      prop: 1,
      onUpdate: function() {
        outro6Start.setAttribute("d", outroStep6(val8.prop));
      }
    })
    .to(val9, {
      prop: 1,
      onUpdate: function() {
        outro7Start.setAttribute("d", outroStep7(val9.prop));
      }
    }, 0.2)
    .to(val10, {
      prop: 1,
      onUpdate: function() {
        outro8Start.setAttribute("d", outroStep8(val10.prop));
      }
    }, 0.3)
    .to(val11, {
      prop: 1,
      onUpdate: function() {
        outro9Start.setAttribute("d", outroStep9(val11.prop));
      }
    }, 0.5);

    const outroTrigger3 = ScrollTrigger.create({
      trigger: '#outro',
      animation: outroLetters3,
      pin: true,
      scrub: 0.6,
      start: '+=50%',
      end: '+=70%'
    });

    const outroStep10 = interpolate([outro10Start.getAttribute('d'), outro10End], {
      addPoints: 0,
      origin: { x: 100, y: 20 },
      optimize: 'fill',
      precision: 4
    });
    const outroStep11 = interpolate([outro11Start.getAttribute('d'), outro11End], {
      addPoints: 20,
      origin: { x: 100, y: 20 },
      optimize: 'fill',
      precision: 4
    });

    let val12 = { prop: 0 };
    let val13 = { prop: 0 };

    let outroLetters4 = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
    outroLetters4.to(val12, {
      prop: 1,
      onUpdate: function() {
        outro10Start.setAttribute("d", outroStep10(val12.prop));
      }
    })
    .to(val13, {
      prop: 1,
      onUpdate: function() {
        outro11Start.setAttribute("d", outroStep11(val13.prop));
      }
    }, 0.2)
    .to('#outro .border-bottom', {
      scaleX: 1
    }, 0.5);

    const outroTrigger4 = ScrollTrigger.create({
      trigger: '#outro',
      animation: outroLetters4,
      pin: true,
      scrub: 0.6,
      start: '+=75%',
      end: '+=40%'
    });

    return () => {
      introTrigger.kill();
      outroTrigger1.kill();
      outroTrigger2.kill();
      outroTrigger3.kill();
      outroTrigger4.kill();
    };
  }, []);

  const handleHeroCta = () => {
    if (isLoggedIn) {
      navigate(userRole === 'mentor' ? '/mentor-dashboard' : '/browse');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] relative overflow-hidden">
      {/* Background Screen-Blended Video */}
      <section data-page-background="">
        <video
          src="https://zoric.studio/codepen/blend-modes2.mp4"
          playsInline
          muted
          autoPlay
          loop
        />
      </section>

      {/* Main scrolling animation page container */}
      <div data-page-container="">
        {/* Intro/Outro SVG Scroll Section Header (scrolling) */}
        <header>
          <div className="logo"></div>
          <nav>
            <a href=""></a>
            <a href=""></a>
            <a href=""></a>
            <a href=""></a>
            <a href=""></a>
          </nav>
        </header>

        {/* Section One: Intro (pinned, A -> R -> T morph) */}
        <section data-page-section="one" id="intro">
          <div className="border-top"></div>
          <div className="intro-letters">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="auto" viewBox="0 0 398 426">
              <path
                id="letters"
                d="M57 426l47.4-134.4h189L340.8 426h57L248.4 0h-99L0 426h57zm218.4-186h-153l66-188.4h21l66 188.4z"
                fill="#000"
                fillRule="nonzero"
              />
            </svg>
          </div>
          <div className="border-bottom"></div>
        </section>

        {/* Section Two: Outro (pinned, spelling O F F S C R O L L I N G) */}
        <section data-page-section="two" id="outro">
          <div id="letters-grid">
            <div className="grid-item o">
              <div className="letter-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="139" height="148" fill="none" viewBox="0 0 139 148">
                  <path id="outro1" fill="#000" d="M138.74 0H.5v147.456h138.24V0zm-25.92 80.064h-86.4V67.392h86.4v12.672z" />
                </svg>
              </div>
            </div>
            <div className="grid-item f">
              <div className="letter-wrap f">
                <svg xmlns="http://www.w3.org/2000/svg" width="107" height="205" fill="none" viewBox="0 0 107 205">
                  <path id="outro2" fill="#000" d="M106.168 62.152V.52h-84.96v66.24H.76V205h88.128V66.76h-41.76v-4.608h59.04z" />
                </svg>
              </div>
            </div>
            <div className="grid-item s">
              <div className="letter-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="132" height="148" fill="none" viewBox="0 0 132 148">
                  <path id="outro3" fill="#000" d="M120.648 57.752H41V41.048h79.648C114.312 13.112 89.544.152 60.744.152 22.728.152.84 43.064.84 43.064L52 79l32.5 21.5 1.144-.832-50.972-32.84L.84 43.064s61.632 104.543 61.344 104.544c-.58-.412 58.464-62.208 58.464-89.856z" />
                </svg>
              </div>
            </div>
            <div className="grid-item c">
              <div className="letter-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="131" height="148" fill="none" viewBox="0 0 131 148">
                  <path id="outro4" fill="#000" d="M.52 84.824l59.328 62.784h44.064V67.544H68V126L26.44 80.216V67.544H103.912V.152H.52v84.672z" />
                </svg>
              </div>
            </div>
            <div className="grid-item r">
              <div className="letter-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="93" height="139" fill="none" viewBox="0 0 93 139">
                  <path id="outro5" fill="#000" d="M72.904.76H.04V139h25.92V74.2H92.488V.76H72.904z" />
                </svg>
              </div>
            </div>
            <div className="grid-item o2">
              <div className="letter-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="139" height="148" fill="none" viewBox="0 0 139 148">
                  <path id="outro6" fill="#000" d="M138.74 0H.5v147.456h138.24V0zm-25.92 80.064h-86.4V67.392h86.4v12.672z" />
                </svg>
              </div>
            </div>

            <div className="grid-item l">
              <div className="letter-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="210" fill="none" viewBox="0 0 26 210">
                  <path id="outro7" fill="#000" d="M.04.5V92h25.92V.5H.04z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="210" fill="none" viewBox="0 0 26 210">
                  <path id="outro8" fill="#000" d="M.04.912V26.5h25.92V.912H.04z" />
                </svg>
              </div>
            </div>
            <div className="grid-item i">
              <div className="letter-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="210" fill="none" viewBox="0 0 36 210">
                  <path id="outro9" fill="#000" d="M18.272 35.472l17.28-16.992L18.272.912.992 18.48l17.28 16.992zM5.312 210h25.92v-31H5.312v31z" />
                </svg>
              </div>
            </div>
            <div className="grid-item n">
              <div className="letter-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="126" height="143" fill="none" viewBox="0 0 126 143">
                  <path id="outro10" fill="#000" d="M72.5.76H.04V139h25.92V66.712h73.152V139h25.92V.76H72.5z" />
                </svg>
              </div>
            </div>
            <div className="grid-item g">
              <div className="letter-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="135" height="203" fill="none" viewBox="0 0 135 203">
                  <path id="outro11" fill="#000" d="M108.672.76H.96v197.568h133.632V.76h-25.92zM70.08 114.232c-32.832 0-43.2-17.28-43.2-43.2v-7.488c0-25.92 10.368-42.624 43.2-42.624 14.4 0 38.592 10.368 38.592 45.792v4.32c0 35.424-24.192 43.2-38.592 43.2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="border-bottom"></div>
        </section>

        {/* Section Three: Hero, Bento & Footer (styled as dark overlay) */}
        <div className="bg-dark-canvas text-silver relative z-10 w-full min-h-screen pt-32 pb-16">
          {/* Spotlight Ambient Glow */}
          <div className="radial-spotlight"></div>

          {/* Floating fixed glassmorphic Header */}
          <header className="fixed top-4 left-4 right-4 md:left-8 md:right-8 h-16 rounded-full border border-white/8 glass-nav z-50 px-6 flex items-center justify-between interactive-element">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-white font-extrabold text-sm">
                M
              </div>
              <span className="text-lg font-black text-cyber-white tracking-tight">
                MentorMesh
              </span>
            </div>

            <nav className="flex items-center gap-4">
              {isLoggedIn ? (
                <button
                  onClick={handleHeroCta}
                  className="py-2 px-5 rounded-full bg-white text-black font-extrabold text-xs interactive-element hover:scale-103 cursor-pointer shadow-lg hover:shadow-white/10"
                >
                  Go to Workspace
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-muted hover:text-cyber-white font-bold text-xs interactive-element cursor-pointer"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="py-2 px-5 rounded-full bg-cyber-white text-black font-extrabold text-xs interactive-element hover:scale-103 cursor-pointer shadow-lg hover:shadow-white/15"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </header>

          {/* Hero Section */}
          <main className="px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center justify-center relative z-10 w-full">
            <div className="text-center max-w-3xl space-y-6 animate-stagger-fade">
              <div className="inline-flex py-1 px-3 bg-white/5 border border-white/8 rounded-full text-[10px] font-black uppercase tracking-wider text-glow-blue shadow-inner">
                ⚡ Reimagining Peer Mentorship
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-cyber-white tracking-tight leading-none bg-gradient-to-b from-white via-white to-slate-muted bg-clip-text text-transparent">
                Master the Future.<br />Learn with Experts.
              </h1>
              
              <p className="text-slate-muted text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium">
                Connect with skilled engineering, research, and design guides in your city. Outline your custom targets and let our AI alignment router rank availability, locations, and skills.
              </p>

              <div className="pt-4">
                <button
                  onClick={handleHeroCta}
                  className="py-3.5 px-8 rounded-full bg-cyber-white text-black font-extrabold text-sm interactive-element hover:scale-103 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                >
                  {isLoggedIn ? "Access Workspace" : "Explore Mentors Now"}
                </button>
              </div>
            </div>

            {/* Bento Feature Grid */}
            <section className="w-full mt-24 grid grid-cols-1 md:grid-cols-4 gap-6 animate-stagger-fade delay-200">
              
              {/* Bento Card 1: AI Matchmaker */}
              <div className="md:col-span-2 premium-card p-8 flex flex-col justify-between min-h-[220px] interactive-element group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-glow-violet/10 border border-glow-violet/20 flex items-center justify-center text-glow-violet">
                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-cyber-white">Dual-Provider Match Engine</h3>
                  <p className="text-slate-muted text-xs leading-relaxed max-w-sm">
                    Router system that computes compatibility using OpenAI GPT-4o and Claude 3.5. Computes overlap scores based on text context.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-slate-dark mt-4">
                  AI MATCHING METRIC // STABLE ROUTING
                </div>
              </div>

              {/* Bento Card 2: Animated Graph */}
              <div className="premium-card p-6 flex flex-col justify-between min-h-[220px] interactive-element relative overflow-hidden group">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M10,120 Q50,70 90,130 T170,80" 
                      stroke="#38BDF8" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      strokeDasharray="600"
                      className="animate-line-graph"
                    />
                    <circle cx="90" cy="130" r="4" fill="#6366F1" />
                    <circle cx="170" cy="80" r="4" fill="#38BDF8" />
                  </svg>
                </div>
                
                <div className="relative z-10 space-y-2">
                  <h3 className="text-sm font-bold text-cyber-white">Locality Routing</h3>
                  <p className="text-slate-muted text-[11px] leading-relaxed">
                    Connects you with matches in your city for offline session alignment.
                  </p>
                </div>
                <div className="relative z-10 text-[9px] font-mono text-glow-blue uppercase tracking-widest font-black">
                  ⚡ LIVE GEOMETRY MESH
                </div>
              </div>

              {/* Bento Card 3: Intent Gating */}
              <div className="premium-card p-6 flex flex-col justify-between min-h-[220px] interactive-element group">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-glow-blue/10 border border-glow-blue/20 flex items-center justify-center text-glow-blue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-cyber-white">Intent-Gated Requests</h3>
                  <p className="text-slate-muted text-[11px] leading-relaxed">
                    Filter low-effort interactions. 3-step intent validation requires clear learning targets.
                  </p>
                </div>
                <div className="text-[9px] font-mono text-slate-dark uppercase">
                  Intent Wizard gating
                </div>
              </div>
              
              {/* Bento Card 4: Dashboard Integration */}
              <div className="md:col-span-4 premium-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 interactive-element group">
                <div className="space-y-2 max-w-xl">
                  <span className="text-[9px] font-mono text-glow-violet uppercase tracking-widest font-black">
                    Performance Dashboard
                  </span>
                  <h3 className="text-lg font-bold text-cyber-white">Track Milestones & Goals</h3>
                  <p className="text-slate-muted text-xs leading-relaxed">
                    A structured overview that tracks your academic or technical growth. Log study statistics, review feedback loops, and manage active scheduling coordinates.
                  </p>
                </div>
                <button 
                  onClick={handleHeroCta}
                  className="py-2.5 px-6 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-cyber-white group-hover:border-glow-violet/30 interactive-element cursor-pointer self-start md:self-auto"
                >
                  Get Started →
                </button>
              </div>

            </section>
          </main>

          {/* Footer */}
          <footer className="py-8 px-6 md:px-12 border-t border-white/5 relative z-10 w-full mt-24">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-dark">
              <div>© {new Date().getFullYear()} MentorMesh Inc. All rights reserved.</div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-slate-muted transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-slate-muted transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-slate-muted transition-colors">Contact Support</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
