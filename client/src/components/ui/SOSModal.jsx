import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiPhone, FiAlertTriangle, FiSearch, FiCopy, FiCheck,
  FiAlertCircle, FiInfo, FiTruck, FiPlusSquare, FiShield,
  FiActivity, FiSmile, FiDroplet, FiUser, FiUsers,
  FiZap, FiHome, FiWind, FiNavigation, FiBriefcase,
  FiShoppingCart, FiSun, FiMapPin
} from 'react-icons/fi';
import { useLang } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const GROUPS = [
  {
    key: 'critical',
    titleEn: 'Critical Emergency',
    titleBn: 'জরুরি জীবনরক্ষা',
    color: '#E63946',
    contacts: [
      { icon: <FiAlertCircle />, labelEn: 'National Emergency', labelBn: 'জাতীয় জরুরি সেবা', number: '999', descEn: 'Police · Fire · Ambulance', descBn: 'পুলিশ · ফায়ার · অ্যাম্বুলেন্স' },
      { icon: <FiInfo />, labelEn: 'Govt Info & Services', labelBn: 'সরকারি তথ্য ও সেবা', number: '333', descEn: 'National helpline', descBn: 'জাতীয় হেল্পলাইন' },
      { icon: <FiTruck />, labelEn: 'Fire Service', labelBn: 'ফায়ার সার্ভিস', number: '199', descEn: 'Fire & rescue', descBn: 'আগুন ও উদ্ধার' },
      { icon: <FiPlusSquare />, labelEn: 'Ambulance', labelBn: 'অ্যাম্বুলেন্স', number: '199', descEn: 'Medical transport', descBn: 'চিকিৎসা পরিবহন' },
      { icon: <FiShield />, labelEn: 'Police Control Room', labelBn: 'পুলিশ কন্ট্রোল রুম', number: '999', descEn: 'Nationwide', descBn: 'সারাদেশ' },
    ],
  },
  {
    key: 'health',
    titleEn: 'Health',
    titleBn: 'স্বাস্থ্য সেবা',
    color: '#10B981',
    contacts: [
      { icon: <FiActivity />, labelEn: 'Shastho Batayon', labelBn: 'স্বাস্থ্য বাতায়ন', number: '16263', descEn: 'Govt health advice', descBn: 'সরকারি স্বাস্থ্য পরামর্শ' },
      { icon: <FiSmile />, labelEn: 'Mental Health (Kaan Pete Roi)', labelBn: 'মানসিক স্বাস্থ্য', number: '09612119911', descEn: 'Emotional support', descBn: 'মানসিক সহায়তা' },
      { icon: <FiAlertTriangle />, labelEn: 'Poison Info Center', labelBn: 'বিষক্রিয়া তথ্য কেন্দ্র', number: '02223353000', descEn: 'DMCH poison unit', descBn: 'ঢামেক বিষ ইউনিট' },
      { icon: <FiDroplet />, labelEn: 'Quantum Blood', labelBn: 'কোয়ান্টাম ব্লাড', number: '01714010869', descEn: 'Blood donation', descBn: 'রক্তদান সহায়তা' },
    ],
  },
  {
    key: 'women',
    titleEn: 'Women & Child',
    titleBn: 'নারী ও শিশু',
    color: '#EC4899',
    contacts: [
      { icon: <FiUser />, labelEn: 'Women & Child Repression', labelBn: 'নারী ও শিশু নির্যাতন', number: '109', descEn: 'Govt helpline', descBn: 'সরকারি হেল্পলাইন' },
      { icon: <FiUsers />, labelEn: 'Women Support (BNWLA)', labelBn: 'নারী সহায়তা (বিএনডব্লিউএলএ)', number: '10921', descEn: 'Legal & shelter', descBn: 'আইন ও আশ্রয়' },
      { icon: <FiSmile />, labelEn: 'Child Helpline', labelBn: 'শিশু সহায়তা লাইন', number: '1098', descEn: 'Child protection', descBn: 'শিশু সুরক্ষা' },
      { icon: <FiShield />, labelEn: 'Police Cyber Support (Women)', labelBn: 'সাইবার সহায়তা (নারী)', number: '01320000888', descEn: 'Online harassment', descBn: 'অনলাইন হয়রানি' },
    ],
  },
  {
    key: 'civic',
    titleEn: 'Utility & Civic',
    titleBn: 'নাগরিক ও ইউটিলিটি সেবা',
    color: '#3B82F6',
    contacts: [
      { icon: <FiZap />, labelEn: 'DPDC Electricity', labelBn: 'ডিপিডিসি বিদ্যুৎ', number: '16116', descEn: 'Power complaint', descBn: 'বিদ্যুৎ অভিযোগ' },
      { icon: <FiZap />, labelEn: 'DESCO Electricity', labelBn: 'ডেসকো বিদ্যুৎ', number: '16120', descEn: 'Power complaint', descBn: 'বিদ্যুৎ অভিযোগ' },
      { icon: <FiHome />, labelEn: 'Palli Bidyut', labelBn: 'পল্লী বিদ্যুৎ', number: '16899', descEn: 'Rural power', descBn: 'গ্রামীণ বিদ্যুৎ' },
      { icon: <FiWind />, labelEn: 'Titas Gas', labelBn: 'তিতাস গ্যাস', number: '16496', descEn: 'Gas complaint', descBn: 'গ্যাস অভিযোগ' },
      { icon: <FiDroplet />, labelEn: 'Dhaka WASA', labelBn: 'ঢাকা ওয়াসা', number: '16162', descEn: 'Water & sewerage', descBn: 'পানি ও পয়ঃনিষ্কাশন' },
      { icon: <FiNavigation />, labelEn: 'Bangladesh Railway', labelBn: 'বাংলাদেশ রেলওয়ে', number: '163', descEn: 'Train info', descBn: 'ট্রেন তথ্য' },
    ],
  },
  {
    key: 'legal',
    titleEn: 'Legal & Complaints',
    titleBn: 'আইন ও অভিযোগ',
    color: '#8B5CF6',
    contacts: [
      { icon: <FiBriefcase />, labelEn: 'National Legal Aid', labelBn: 'জাতীয় আইনি সহায়তা', number: '16430', descEn: 'Free legal help', descBn: 'বিনামূল্যে আইনি সহায়তা' },
      { icon: <FiSearch />, labelEn: 'Anti-Corruption (ACC)', labelBn: 'দুর্নীতি দমন কমিশন', number: '106', descEn: 'Report corruption', descBn: 'দুর্নীতির অভিযোগ' },
      { icon: <FiShoppingCart />, labelEn: 'Consumer Rights (DNCRP)', labelBn: 'ভোক্তা অধিকার', number: '16121', descEn: 'Consumer complaint', descBn: 'ভোক্তা অভিযোগ' },
      { icon: <FiSun />, labelEn: 'Agriculture Call Center', labelBn: 'কৃষি কল সেন্টার', number: '16123', descEn: 'Farming advice', descBn: 'কৃষি পরামর্শ' },
      { icon: <FiMapPin />, labelEn: 'Highway Police', labelBn: 'হাইওয়ে পুলিশ', number: '01320182498', descEn: 'Road accidents', descBn: 'সড়ক দুর্ঘটনা' },
    ],
  },
];

const ALL = GROUPS.flatMap(g => g.contacts.map(c => ({ ...c, color: g.color, group: g.key })));

function telHref(n) { return `tel:${n.replace(/[^\d+]/g, '')}`; }
function pretty(n) { return n.length > 6 ? n.replace(/(\d{5})(\d+)/, '$1-$2') : n; }

// Framer Motion variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function SOSModal({ isOpen, onClose }) {
  const { isBn } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => { if (!isOpen) { setQuery(''); setCopied(''); } }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS
      .map(g => ({
        ...g,
        contacts: g.contacts.filter(c =>
          c.labelEn.toLowerCase().includes(q) ||
          c.labelBn.includes(query.trim()) ||
          c.number.includes(q)
        ),
      }))
      .filter(g => g.contacts.length > 0);
  }, [query]);

  const copyNumber = async (num) => {
    try { await navigator.clipboard.writeText(num); setCopied(num); setTimeout(() => setCopied(''), 1500); } catch { /* ignore */ }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-[var(--surface)] border border-[var(--border-2)] rounded-[2rem] overflow-hidden shadow-2xl"
          >
            {/* Accent top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-pink-500 to-blue-500" />
            
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[var(--border)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-[1rem] bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <FiAlertTriangle className="animate-ping absolute opacity-50" color="#fff" size={20} />
                  <FiAlertTriangle className="relative" color="#fff" size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-black text-[var(--text)] leading-tight">
                    {isBn ? 'জরুরি হেল্পলাইন নম্বর' : 'Emergency Hotlines'}
                  </h2>
                  <div className="text-xs sm:text-sm text-[var(--text-muted)] flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)] animate-pulse" />
                    {isBn ? `${ALL.length}টি যাচাইকৃত নম্বর · সরাসরি কল করুন` : `${ALL.length} verified numbers · tap to dial`}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[var(--surface-2)] border border-[var(--border-2)] text-[var(--text-muted)] flex items-center justify-center hover:text-[var(--text)] hover:border-[var(--border)] hover:bg-[var(--surface-3)] transition-all"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 sm:px-6 pt-4 sm:pt-5 pb-2">
              <div className="relative">
                <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={isBn ? 'সেবা বা নম্বর খুঁজুন...' : 'Search a service or number...'}
                  className="w-full py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Scrollable List */}
            <div className="px-5 sm:px-6 pb-6 overflow-y-auto flex-1 custom-scrollbar">
              {filtered.length === 0 && (
                <div className="text-center py-12 text-[var(--text-muted)] text-sm sm:text-base">
                  {isBn ? 'কোনো নম্বর পাওয়া যায়নি।' : 'No matching numbers found.'}
                </div>
              )}
              
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 mt-4">
                {filtered.map(group => (
                  <div key={group.key}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-2 h-2 rounded-sm" style={{ background: group.color }} />
                      <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[var(--text-muted)]">
                        {isBn ? group.titleBn : group.titleEn}
                      </span>
                      <span className="flex-1 h-px bg-[var(--border)]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {group.contacts.map(c => (
                        <motion.div
                          variants={staggerItem}
                          key={c.number + c.labelEn}
                          className="group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] hover:-translate-y-1 transition-all duration-300"
                          style={{ '--hover-color': c.color }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = isDark ? `0 12px 24px -10px ${c.color}25` : `0 12px 24px -10px ${c.color}40`; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <div
                            className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-[1rem] flex items-center justify-center text-xl sm:text-2xl transition-transform group-hover:scale-110"
                            style={{ background: `${c.color}15`, color: c.color }}
                          >
                            {c.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm sm:text-base font-bold text-[var(--text)] truncate">
                              {isBn ? c.labelBn : c.labelEn}
                            </div>
                            <div className="text-xs sm:text-sm text-[var(--text-muted)] truncate mt-0.5">
                              {isBn ? c.descBn : c.descEn}
                            </div>
                            <div
                              className="text-base sm:text-lg font-black mt-1 tabular-nums"
                              style={{ color: c.color }}
                            >
                              {pretty(c.number)}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <a
                              href={telHref(c.number)}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-[0.85rem] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                              style={{ background: c.color, boxShadow: `0 8px 16px -6px ${c.color}` }}
                            >
                              <FiPhone size={16} />
                            </a>
                            <button
                              onClick={() => copyNumber(c.number)}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-[0.85rem] bg-[var(--surface-3)] border border-[var(--border)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                              style={{ color: copied === c.number ? '#10B981' : 'var(--text-muted)' }}
                            >
                              {copied === c.number ? <FiCheck size={14} /> : <FiCopy size={14} />}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Sticky footer banner */}
            <div className="px-5 sm:px-6 py-3 sm:py-4 border-t border-[var(--border)] bg-[var(--surface)] z-10">
              <a
                href="tel:999"
                className="flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-[1rem] bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold text-sm sm:text-base transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-red-500/30"
              >
                <FiPhone size={18} className="animate-pulse" />
                {isBn ? 'জীবন-ঝুঁকিপূর্ণ জরুরি অবস্থায় ৯৯৯ ডায়াল করুন' : 'Dial 999 for life-threatening emergencies'}
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
