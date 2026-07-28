import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiDroplet,
  FiGlobe,
  FiHeart,
  FiLayers,
  FiMapPin,
  FiMessageCircle,
  FiPhoneCall,
  FiSearch,
  FiShield,
  FiThumbsUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi';

export default function Home() {
  const { t, isBn } = useLang();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [recentDonations, setRecentDonations] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cms, setCms] = useState({});
  const [pulseIndex, setPulseIndex] = useState(0);

  const isDark = theme === 'dark';

  const pulses = [
    { textEn: "Adnan donated A+ Blood in Mirpur, Dhaka", textBn: "আদনান মিরপুর, ঢাকায় এ+ রক্ত দান করেছেন", timeEn: "2m ago", timeBn: "২ মিনিট আগে", icon: "🩸", color: "#EF4444" },
    { textEn: "Job Application submitted for Remote Developer", textBn: "রিমোট ডেভেলপারের জন্য নতুন চাকরির আবেদন করা হয়েছে", timeEn: "5m ago", timeBn: "৫ মিনিট আগে", icon: "💼", color: "#06B6D4" },
    { textEn: "Emergency support dispatched from fire service", textBn: "ফায়ার সার্ভিস থেকে জরুরি উদ্ধারকারী দল পাঠানো হয়েছে", timeEn: "12m ago", timeBn: "১২ মিনিট আগে", icon: "🚒", color: "#F97316" },
    { textEn: "Ayesha requested financial help for education", textBn: "আয়েশা শিক্ষার জন্য সাহায্য চেয়ে পোস্ট করেছেন", timeEn: "25m ago", timeBn: "২৫ মিনিট আগে", icon: "🎓", color: "#EC4899" },
    { textEn: "Anis registered as a new blood donor", textBn: "আনিস নতুন রক্তদাতা হিসেবে নিবন্ধিত হয়েছেন", timeEn: "40m ago", timeBn: "৪০ মিনিট আগে", icon: "❤️", color: "#10B981" },
  ];

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseIndex(p => (p + 1) % pulses.length);
    }, 4000);
    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    api.get('/donations?limit=3')
      .then((r) => setRecentDonations(r.data.data.rows || []))
      .catch(() => {});
    api.get('/settings')
      .then(r => setCms(r.data.data || {}))
      .catch(() => {});
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/jobs?search=${encodeURIComponent(search.trim())}`);
  };

  const quickItems = [
    {
      key: 'emergency',
      icon: <FiActivity />,
      label: t('nav.emergency'),
      sub: isBn ? 'হাসপাতাল, পুলিশ, অ্যাম্বুলেন্স' : 'Hospitals, police, ambulance',
      to: '/emergency',
      color: '#E63946',
      featured: true,
    },
    {
      key: 'blood',
      icon: <FiDroplet />,
      label: t('nav.blood'),
      sub: isBn ? 'রক্তদাতা দ্রুত খুঁজুন' : 'Find available donors fast',
      to: '/blood',
      color: '#EF4444',
    },
    {
      key: 'jobs',
      icon: <FiBriefcase />,
      label: t('nav.jobs'),
      sub: isBn ? 'চাকরি ও আয় সুযোগ' : 'Jobs and earning opportunities',
      to: '/jobs',
      color: '#06B6D4',
    },
    {
      key: 'donation',
      icon: <FiHeart />,
      label: t('nav.donate'),
      sub: isBn ? 'যাচাইকৃত সাহায্যের অনুরোধ' : 'Verified help requests',
      to: '/donation',
      color: '#EC4899',
      featured: true,
    },
    {
      key: 'volunteers',
      icon: <FiUsers />,
      label: t('nav.volunteers'),
      sub: isBn ? 'কমিউনিটি হেল্পার নেটওয়ার্ক' : 'Community helper network',
      to: '/volunteers',
      color: '#10B981',
    },
    {
      key: 'map',
      icon: <FiMapPin />,
      label: t('nav.map'),
      sub: isBn ? 'কাছের সেবা খুঁজুন' : 'See services near you',
      to: '/map',
      color: '#8B5CF6',
    },
  ];

  const features = [
    {
      icon: <FiShield />,
      title: isBn ? 'যাচাইকৃত তথ্য' : 'Verified information',
      desc: isBn
        ? 'জরুরি, রক্ত ও সাহায্য সংক্রান্ত তথ্য দল এবং কমিউনিটি মিলিয়ে যাচাই করা হয়।'
        : 'Emergency, blood, and support listings are reviewed by the team and community.',
    },
    {
      icon: <FiZap />,
      title: isBn ? 'দ্রুত সাড়া' : 'Fast response flow',
      desc: isBn
        ? 'কম ধাপে দরকারি তথ্য পাওয়া যায়, যাতে জরুরি সময়ে সময় নষ্ট না হয়।'
        : 'Short flows help people find critical information without wasting time.',
    },
    {
      icon: <FiGlobe />,
      title: isBn ? 'সবার জন্য উন্মুক্ত' : 'Built for everyone',
      desc: isBn
        ? 'বাংলাদেশের নাগরিকদের জন্য এক জায়গায় দরকারি নাগরিক সেবা ও সহায়তা।'
        : 'Citizen services, support, and opportunities collected in one place.',
    },
  ];

  const serviceHighlights = [
    {
      icon: <FiPhoneCall />,
      title: isBn ? 'জরুরি নম্বর ও যোগাযোগ' : 'Emergency contacts',
      desc: isBn
        ? 'হাসপাতাল, পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স এক জায়গায়।'
        : 'Hospitals, police, fire service, and ambulance details in one view.',
      to: '/emergency',
      accent: 'var(--red)',
    },
    {
      icon: <FiDroplet />,
      title: isBn ? 'রক্তদাতা খোঁজ' : 'Blood donor search',
      desc: isBn
        ? 'গ্রুপ ও লোকেশন অনুযায়ী রক্তদাতা খুঁজে যোগাযোগ করুন।'
        : 'Search donors by group and location, then connect quickly.',
      to: '/blood',
      accent: 'var(--cyan)',
    },
    {
      icon: <FiBriefcase />,
      title: isBn ? 'চাকরি ও কাজের সুযোগ' : 'Jobs and work',
      desc: isBn
        ? 'ফুলটাইম, পার্টটাইম ও ফ্রিল্যান্স সুযোগ দেখুন।'
        : 'Browse full-time, part-time, and freelance opportunities.',
      to: '/jobs',
      accent: 'var(--amber)',
    },
    {
      icon: <FiUsers />,
      title: isBn ? 'স্বেচ্ছাসেবক সহায়তা' : 'Volunteer support',
      desc: isBn
        ? 'কমিউনিটি হেল্পারদের সাথে সংযোগ করে সহযোগিতা নিন।'
        : 'Connect with local volunteers ready to help communities.',
      to: '/volunteers',
      accent: 'var(--green)',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: isBn ? 'যা দরকার তা বেছে নিন' : 'Choose what you need',
      desc: isBn
        ? 'জরুরি সেবা, রক্ত, চাকরি বা আর্থিক সহায়তা থেকে শুরু করুন।'
        : 'Start from emergency services, blood, jobs, or financial support.',
    },
    {
      step: '02',
      title: isBn ? 'ফিল্টার ও তথ্য দেখুন' : 'Filter and review',
      desc: isBn
        ? 'অবস্থান, ধরন বা প্রয়োজন অনুযায়ী তথ্য মিলিয়ে নিন।'
        : 'Refine by location, type, or urgency to find the right result.',
    },
    {
      step: '03',
      title: isBn ? 'সরাসরি অ্যাকশন নিন' : 'Take action quickly',
      desc: isBn
        ? 'কল করুন, আবেদন করুন, দান করুন বা কমিউনিটির সাথে যুক্ত হোন।'
        : 'Call, apply, donate, or connect with the community immediately.',
    },
  ];

  const trustStats = [
    { value: (isBn && cms.stat_services_bn) ? cms.stat_services_bn : (cms.stat_services || (isBn ? '৫০০+' : '500+')), label: t('home.statServices'), icon: <FiLayers /> },
    { value: (isBn && cms.stat_donors_bn) ? cms.stat_donors_bn : (cms.stat_donors   || (isBn ? '১০ হাজার+' : '10K+')), label: t('home.statDonors'),   icon: <FiDroplet /> },
    { value: (isBn && cms.stat_helped_bn) ? cms.stat_helped_bn : (cms.stat_helped   || (isBn ? '৫০ হাজার+' : '50K+')), label: t('home.statHelped'),   icon: <FiThumbsUp /> },
  ];


  const heroPanelStyle = {
    background: isDark
      ? 'linear-gradient(145deg, rgba(15,23,36,0.92), rgba(8,14,26,0.96))'
      : 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(241,245,249,0.96))',
    border: '1px solid var(--border)',
    boxShadow: isDark ? 'var(--shadow-lg)' : '0 20px 60px rgba(15,23,42,0.08)',
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* HERO */}
      <section className="relative px-4 pt-12 md:pt-24 pb-12 md:pb-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(circle at top left, rgba(230,57,70,0.12), transparent 32%), radial-gradient(circle at bottom right, rgba(6,182,212,0.12), transparent 28%)'
              : 'radial-gradient(circle at top left, rgba(230,57,70,0.08), transparent 34%), radial-gradient(circle at bottom right, rgba(6,182,212,0.08), transparent 30%)',
          }}
        />

        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-10 items-center">
            {/* Left content */}
            <div
              className={`transition-all duration-1000 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full mb-6 md:mb-8"
                style={heroPanelStyle}
              >
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span style={{ color: 'var(--text-muted)' }} className="text-xs font-bold uppercase">
                  {(isBn && cms.hero_badge_bn) ? cms.hero_badge_bn : (cms.hero_badge || t('home.badge'))}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight mb-6 md:mb-8">
                {(isBn && cms.hero_title_bn) ? cms.hero_title_bn : (cms.hero_title || t('home.title'))}
                <br />
                <span className="text-red-500">{(isBn && cms.hero_highlight_bn) ? cms.hero_highlight_bn : (cms.hero_highlight || t('home.highlight'))}</span>
              </h1>

              <p
                className="max-w-2xl text-base md:text-lg lg:text-xl mb-8 md:mb-10 leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                {(isBn && cms.hero_subtitle_bn) ? cms.hero_subtitle_bn : (cms.hero_subtitle || t('home.subtitle'))}
              </p>


              {/* Search bar */}
              <div className="max-w-2xl mb-8 md:mb-10">
                <form
                  onSubmit={handleSearch}
                  className="group relative flex items-center p-1.5 md:p-2 rounded-[1.75rem]"
                  style={heroPanelStyle}
                >
                  <div className="flex-1 flex items-center pl-3 md:pl-4">
                    <FiSearch style={{ color: 'var(--text-dim)' }} size={22} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('nav.search')}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm md:text-base lg:text-lg py-3 md:py-4 px-3 md:px-4 outline-none"
                      style={{ color: 'var(--text)' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="text-white p-3 md:p-4 rounded-2xl transition-all active:scale-95"
                    style={{ background: 'var(--grad-red)', boxShadow: 'var(--shadow-red)' }}
                  >
                    <FiArrowRight size={20} />
                  </button>
                </form>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4">
                <Link
                  to="/emergency"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 md:px-7 md:py-4 rounded-2xl font-bold text-white text-sm md:text-base"
                  style={{ background: 'var(--grad-red)', boxShadow: 'var(--shadow-red)' }}
                >
                  {t('home.ctaExplore')}
                  <FiArrowRight />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 md:px-7 md:py-4 rounded-2xl font-bold text-sm md:text-base"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {t('home.ctaRegister')}
                </Link>
              </div>
            </div>

            {/* Right panels */}
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6" style={heroPanelStyle}>
                <div className="flex items-start justify-between mb-5 md:mb-6">
                  <div>
                    <div className="text-xs md:text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {isBn ? 'আজকের অগ্রাধিকার' : 'Today priority'}
                    </div>
                    <div className="text-lg md:text-2xl font-black mt-1">
                      {isBn ? 'দ্রুত নাগরিক সহায়তা' : 'Fast citizen assistance'}
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--red-light)', color: 'var(--red)' }}
                  >
                    <FiAlertCircle size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {trustStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl p-3 md:p-4"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-1 text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--red)' }}>{item.icon}</span>
                        {item.label}
                      </div>
                      <div className="text-xl md:text-2xl font-black mt-2 md:mt-3">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Platform Pulse Feed */}
              <div className="rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 relative overflow-hidden" style={heroPanelStyle}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs md:text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text)' }}>
                      {isBn ? 'সরাসরি প্ল্যাটফর্ম আপডেট' : 'Live Platform Pulse'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {isBn ? 'সক্রিয়' : 'Active'}
                  </span>
                </div>

                <div className="min-h-[72px] flex items-center gap-4 rounded-2xl p-4 transition-all duration-500" 
                     style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                       style={{ background: `${pulses[pulseIndex].color}12`, border: `1px solid ${pulses[pulseIndex].color}24` }}>
                    {pulses[pulseIndex].icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs md:text-sm font-bold leading-snug" style={{ color: 'var(--text)' }}>
                      {isBn ? pulses[pulseIndex].textBn : pulses[pulseIndex].textEn}
                    </div>
                    <div className="text-[10px] mt-1 font-semibold" style={{ color: 'var(--text-dim)' }}>
                      {isBn ? pulses[pulseIndex].timeBn : pulses[pulseIndex].timeEn}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6" style={heroPanelStyle}>
                <div className="grid gap-3">
                  {[
                    {
                      icon: <FiPhoneCall />,
                      title: isBn ? 'জরুরি যোগাযোগ' : 'Emergency contact',
                      sub: isBn ? 'কল বা দিকনির্দেশনা দ্রুত নিন' : 'Call or get directions quickly',
                    },
                    {
                      icon: <FiCheckCircle />,
                      title: isBn ? 'যাচাইকৃত অনুরোধ' : 'Verified requests',
                      sub: isBn ? 'সহায়তার পোস্ট আগে যাচাই' : 'Support posts reviewed first',
                    },
                    {
                      icon: <FiClock />,
                      title: isBn ? 'সময় বাঁচানো ফ্লো' : 'Time-saving flow',
                      sub: isBn ? 'কম ক্লিক, সরাসরি কাজে যান' : 'Fewer clicks, faster action',
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 md:gap-4 rounded-2xl p-3 md:p-4"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    >
                      <div
                        className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--cyan-light)', color: 'var(--cyan)' }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm md:text-base">{item.title}</div>
                        <div className="text-xs md:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                          {item.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SERVICES */}
      <section className="py-12 md:py-24 px-4" style={{ background: 'var(--surface-2)' }}>
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-3 md:mb-4">
                {t('home.quickTitle')}
              </h2>
              <p className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>{t('home.quickSub')}</p>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 font-bold text-sm md:text-base"
              style={{ color: 'var(--red)' }}
            >
              {isBn ? 'সব সেবা দেখুন' : 'Explore All Services'}
              <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {quickItems.map((item, idx) => (
              <Link
                key={item.key}
                to={item.to}
                className={`group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between ${
                  item.featured ? 'sm:col-span-2 md:col-span-2 md:row-span-2' : 'sm:col-span-1'
                }`}
                style={{
                  background: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-3)',
                  border: idx % 2 === 0 ? '1px solid var(--border)' : '1px solid transparent',
                  boxShadow: isDark ? 'var(--shadow-md)' : '0 18px 40px rgba(15,23,42,0.05)',
                }}
              >
                <div
                  className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full opacity-[0.08] group-hover:opacity-[0.16] transition-opacity duration-500"
                  style={{ backgroundColor: item.color }}
                />
                <div className="relative z-10">
                  <div
                    className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-6 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                    style={{ background: `${item.color}20`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-lg md:text-2xl font-black mb-1 md:mb-2">{item.label}</h3>
                  <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {item.sub}
                  </p>
                </div>

                <div
                  className="relative z-10 inline-flex items-center gap-2 mt-6 md:mt-8 font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-sm md:text-base"
                  style={{ color: item.color }}
                >
                  {isBn ? 'বিস্তারিত' : 'Start Now'}
                  <FiArrowRight />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES & SERVICES */}
      <section className="py-12 md:py-24 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black leading-[1.05] tracking-tight mb-6 md:mb-8">
                {isBn ? 'বাংলাদেশের নাগরিকদের জন্য এক জায়গায় প্রয়োজনীয় সহায়তা' : 'Essential support for citizens, organized in one place'}
              </h2>

              <div className="space-y-4 md:space-y-6">
                {features.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 md:gap-5 rounded-[1.25rem] md:rounded-[1.5rem] p-4 md:p-5"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--red-light)', color: 'var(--red)' }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">{item.title}</h3>
                      <p className="text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {serviceHighlights.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="rounded-[1.5rem] md:rounded-[1.75rem] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: isDark ? 'var(--shadow-md)' : '0 16px 40px rgba(15,23,42,0.05)',
                  }}
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center mb-4 md:mb-5"
                    style={{ background: `${item.accent}20`, color: item.accent }}
                  >
                    {item.icon}
                  </div>
                  <div className="text-lg md:text-xl font-black mb-2">{item.title}</div>
                  <p className="text-xs md:text-sm leading-relaxed mb-5 md:mb-6" style={{ color: 'var(--text-muted)' }}>
                    {item.desc}
                  </p>
                  <div className="inline-flex items-center gap-2 font-bold text-sm md:text-base" style={{ color: item.accent }}>
                    {isBn ? 'আরও দেখুন' : 'Learn more'}
                    <FiArrowRight />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12 md:py-24 px-4" style={{ background: 'var(--surface-2)' }}>
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-3 md:mb-4">
                {(isBn && cms.how_title_bn) ? cms.how_title_bn : (cms.how_title || (isBn ? 'কীভাবে কাজ করে' : 'How the platform works'))}
              </h2>
              <p className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                {(isBn && cms.how_sub_bn) ? cms.how_sub_bn : (cms.how_sub || (isBn
                  ? 'দ্রুত তথ্য খুঁজে অ্যাকশন নেওয়ার জন্য ফ্লোটা সহজ রাখা হয়েছে।'
                  : 'The experience is kept simple so people can move from search to action quickly.'))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="text-xs md:text-sm font-black mb-4 md:mb-6" style={{ color: 'var(--red)' }}>
                  {item.step}
                </div>
                <h3 className="text-lg md:text-2xl font-black mb-2 md:mb-3">{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT DONATIONS */}
      {recentDonations.length > 0 && (
        <section className="py-12 md:py-24 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
              <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-3 md:mb-4">
                  {isBn ? 'জরুরি সহায়তার অনুরোধ' : 'Urgent support requests'}
                </h2>
                <p className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                  {isBn
                    ? 'যাচাইকৃত কয়েকটি সহায়তার অনুরোধ এখানে দেখানো হচ্ছে।'
                    : 'A few verified help requests that currently need support.'}
                </p>
              </div>
              <Link
                to="/donation"
                className="inline-flex items-center gap-2 font-bold text-sm md:text-base"
                style={{ color: 'var(--red)' }}
              >
                {t('common.viewAll')}
                <FiArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {recentDonations.map((d) => {
                const needed = Number(d.amount_needed) || 0;
                const raised = Number(d.amount_raised) || 0;
                const pct = needed > 0 ? Math.min(100, Math.round((raised / needed) * 100)) : 0;

                return (
                  <Link
                    key={d.id}
                    to={`/donation/${d.id}`}
                    className="rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-7 transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      boxShadow: isDark ? 'var(--shadow-md)' : '0 16px 40px rgba(15,23,42,0.05)',
                    }}
                  >
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black uppercase mb-4 md:mb-5"
                      style={{ background: 'var(--red-light)', color: 'var(--red)' }}
                    >
                      {d.category || (isBn ? 'সহায়তা' : 'Support')}
                    </span>
                    <h3 className="text-lg md:text-2xl font-black leading-tight mb-2 md:mb-3 line-clamp-2">{d.title}</h3>
                    <p className="text-xs md:text-sm leading-relaxed line-clamp-3 mb-6 md:mb-8" style={{ color: 'var(--text-muted)' }}>
                      {d.description}
                    </p>

                    <div className="flex justify-between text-xs md:text-sm mb-2 md:mb-3" style={{ color: 'var(--text-muted)' }}>
                      <span>
                        ৳{raised.toLocaleString()} {isBn ? 'সংগ্রহ' : 'raised'}
                      </span>
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: isDark ? 'var(--surface-3)' : '#E2E8F0' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: 'var(--grad-red)' }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA / COMMUNITY */}
      <section className="py-12 md:py-24 px-4" style={{ background: 'var(--surface-2)' }}>
        <div className="container max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 md:gap-8 items-start">
            <div
              className="rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: isDark ? 'var(--shadow-md)' : '0 16px 40px rgba(15,23,42,0.05)',
              }}
            >
              <div
                className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6"
                style={{ background: 'var(--green-light)', color: 'var(--green)' }}
              >
                <FiMessageCircle size={20} />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight tracking-tight mb-4 md:mb-5">
                {(isBn && cms.cta_title_bn) ? cms.cta_title_bn : (cms.cta_title || t('home.ctaTitle'))}
              </h2>
              <p className="text-sm md:text-lg leading-relaxed mb-6 md:mb-10" style={{ color: 'var(--text-muted)' }}>
                {(isBn && cms.cta_sub_bn) ? cms.cta_sub_bn : (cms.cta_sub || t('home.ctaSub'))}
              </p>


              <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 md:px-7 md:py-4 rounded-2xl font-bold text-white text-sm md:text-base"
                  style={{ background: 'var(--grad-red)', boxShadow: 'var(--shadow-red)' }}
                >
                  {t('home.ctaRegister')}
                  <FiArrowRight />
                </Link>
                <Link
                  to="/volunteers"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 md:px-7 md:py-4 rounded-2xl font-bold text-sm md:text-base"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {isBn ? 'স্বেচ্ছাসেবক দেখুন' : 'Explore volunteers'}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <FiShield />,
                  title: isBn ? 'নিরাপদ তথ্য' : 'Safer information',
                  desc: isBn ? 'কমিউনিটি ও টিম রিভিউ করা তথ্য।' : 'Listings reviewed by the team and community.',
                  accent: 'var(--cyan)',
                },
                {
                  icon: <FiMapPin />,
                  title: isBn ? 'লোকেশন-ভিত্তিক খোঁজ' : 'Location-based discovery',
                  desc: isBn ? 'কাছের সেবা দ্রুত দেখা যায়।' : 'Find nearby services faster.',
                  accent: 'var(--purple)',
                },
                {
                  icon: <FiCheckCircle />,
                  title: isBn ? 'সহজ অ্যাকশন' : 'Action-ready flows',
                  desc: isBn ? 'কল, আবেদন বা দানের পথে কম বাধা।' : 'Fewer steps to call, apply, or donate.',
                  accent: 'var(--green)',
                },
                {
                  icon: <FiThumbsUp />,
                  title: isBn ? 'কমিউনিটি-চালিত' : 'Community-powered',
                  desc: isBn ? 'মানুষ মানুষের পাশে দাঁড়ানোর জায়গা।' : 'A space built around people helping people.',
                  accent: 'var(--amber)',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.25rem] md:rounded-[1.75rem] p-4 md:p-6"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center mb-4 md:mb-5"
                    style={{ background: `${item.accent}20`, color: item.accent }}
                  >
                    {item.icon}
                  </div>
                  <div className="text-base md:text-xl font-black mb-1 md:mb-2">{item.title}</div>
                  <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}