import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import SOSModal from "../ui/SOSModal";
import { MdAgriculture } from "react-icons/md";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiShield,
  FiAlertTriangle,
  FiDroplet,
  FiHeart,
  FiBriefcase,
  FiUsers,
  FiSearch,
  FiChevronDown,
  FiGlobe,
  FiBookmark,
  FiPlusSquare,
  FiTruck,
  FiList,
  FiEdit,
  FiMonitor,
  FiAward,
  FiPlusCircle,
  FiBook,
  FiActivity,
  FiSun,
  FiMoon,
  FiPhone,
  FiBell,
  FiFileText,
  FiClock,
  FiChevronRight,
  FiHome,
  FiTool,
  FiWifi,
  FiMap,
  FiDollarSign,
  FiCreditCard,
} from "react-icons/fi";

export default function Navbar() {
  const { isAuth, isAdmin, user, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);
  const searchRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [userMenu, setUserMenu] = useState(false);
  const [openCat, setOpenCat] = useState(null);
  const [openSubCat, setOpenSubCat] = useState(null);
  const [noticesSub, setNoticesSub] = useState(null);

  const isDark = theme === "dark";

  if (location.pathname.startsWith("/admin")) return null;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobile(false);
    setActiveMenu(null);
    setUserMenu(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1240) setMobile(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenu && !event.target.closest("#mega-nav") && !event.target.closest("#user-menu-wrap")) {
        setActiveMenu(null);
        setNoticesSub(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu]);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobile]);

  const openDrop = (k) => {
    clearTimeout(timerRef.current);
    setActiveMenu(k);
  };
  const closeDrop = () => {
    timerRef.current = setTimeout(() => {
      setActiveMenu(null);
      setNoticesSub(null);
    }, 160);
  };
  const stayDrop = () => clearTimeout(timerRef.current);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate("/jobs?search=" + encodeURIComponent(searchQ.trim()));
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  const hoverIn = (e) => {
    e.currentTarget.style.background = "var(--surface-3)";
    e.currentTarget.style.color = "var(--text)";
  };
  const hoverOut = (e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.color = "var(--text-muted)";
  };

  const MEGA = [
    {
      key: "emergency",
      icon: <FiAlertTriangle size={15} />,
      color: "#E63946",
      label: t("nav.emergency"),
      items: [
        {
          icon: <FiPlusSquare size={15} />,
          label: t("emergency.hospital"),
          to: "/emergency?type=hospital",
        },
        {
          icon: <FiShield size={15} />,
          label: t("emergency.police"),
          to: "/emergency?type=police",
        },
        {
          icon: <FiActivity size={15} />,
          label: t("emergency.fire"),
          to: "/emergency?type=fire",
        },
        {
          icon: <FiTruck size={15} />,
          label: t("emergency.ambulance"),
          to: "/emergency?type=ambulance",
        },
        {
          icon: <FiList size={15} />,
          label: t("common.viewAll"),
          to: "/emergency",
        },
      ],
    },
    {
      key: "health",
      icon: <FiHeart size={15} />,
      color: "#EC4899",
      label: t("nav.health"),
      items: [
        {
          icon: <FiPlusSquare size={15} />,
          label: t("health.govt_hospital"),
          to: "/health?type=govt-hospital",
        },
        {
          icon: <FiActivity size={15} />,
          label: t("health.private_hospital"),
          to: "/health?type=private-hospital",
        },
        {
          icon: <FiUser size={15} />,
          label: t("health.doctors"),
          to: "/doctors",
        },
        {
          icon: <FiList size={15} />,
          label: t("health.pharmacy"),
          to: "/pharmacy",
        },
        { icon: <FiDroplet size={15} />, label: t("nav.blood"), to: "/blood" },
      ],
    },
    {
      key: "jobs",
      icon: <FiBriefcase size={15} />,
      color: "#06B6D4",
      label: t("nav.jobs"),
      items: [
        {
          icon: <FiBriefcase size={15} />,
          label: t("jobs.title"),
          to: "/jobs",
        },
        {
          icon: <FiShield size={15} />,
          label: t("jobs.govt"),
          to: "/jobs/govt",
        },
        {
          icon: <FiMonitor size={15} />,
          label: t("jobs.fullTime"),
          to: "/jobs/fulltime",
        },
        {
          icon: <FiWifi size={15} />,
          label: t("jobs.remote"),
          to: "/jobs/remote",
        },
        { icon: <FiEdit size={15} />, label: t("jobs.post"), to: "/jobs/new" },
      ],
    },
    {
      key: "education",
      icon: <FiBook size={15} />,
      color: "#F59E0B",
      label: t("nav.education"),
      items: [
        {
          icon: <FiBook size={15} />,
          label: t("education.govt_school"),
          to: "/education/school",
        },
        {
          icon: <FiBook size={15} />,
          label: t("education.govt_college"),
          to: "/education/college",
        },
        {
          icon: <FiAward size={15} />,
          label: t("education.public_uni"),
          to: "/education/university",
        },
        {
          icon: <FiAward size={15} />,
          label: t("education.private_uni"),
          to: "/education/university",
        },
        {
          icon: <FiAward size={15} />,
          label: t("education.scholarships"),
          to: "/education/scholarships",
        },
      ],
    },
    {
      key: "services",
      icon: <FiList size={15} />,
      color: "#8B5CF6",
      label: t("nav.services"),
      items: [
        {
          icon: <FiHome size={15} />,
          label: t("services.home"),
          to: "/services?cat=home",
        },
        {
          icon: <FiTruck size={15} />,
          label: t("services.transport"),
          to: "/services?cat=transport",
        },
        {
          icon: <FiTool size={15} />,
          label: t("services.repairs"),
          to: "/services?cat=repairs",
        },
        {
          icon: <FiActivity size={15} />,
          label: t("health.title"),
          to: "/services?cat=telemedicine",
        },
        {
          icon: <FiUsers size={15} />,
          label: t("education.tutors"),
          to: "/services?cat=tutor",
        },
        {
          icon: <FiWifi size={15} />,
          label: t("government.utility"),
          to: "/services?cat=utility",
        },
        {
          icon: <FiList size={15} />,
          label: t("common.viewAll"),
          to: "/services",
        },
      ],
    },
    {
      key: "notices",
      icon: <FiBell size={15} />,
      color: "#64748B",
      label: t("nav.notices"),
      isWide: true,
      sections: [
        {
          key: "academic",
          label: t("notices.academic"),
          icon: <FiBook size={14} />,
          to: "/notices?cat=academic",
          sub: [
            {
              label: t("notices.admission"),
              to: "/notices?cat=academic&search=admission",
              icon: <FiAward size={13} />,
            },
          ],
        },
        {
          key: "career",
          label: t("notices.career"),
          icon: <FiBriefcase size={14} />,
          to: "/notices?cat=career",
          sub: [
            {
              label: t("notices.job_circular"),
              to: "/notices?cat=career&search=job",
              icon: <FiBriefcase size={13} />,
            },
            {
              label: t("notices.exam"),
              to: "/notices?cat=career&search=exam",
              icon: <FiClock size={13} />,
            },
          ],
        },
        {
          key: "scholarship",
          label: t("notices.scholarship"),
          icon: <FiAward size={14} />,
          to: "/notices?cat=scholarship",
        },
        {
          key: "gazette",
          label: t("notices.gazette"),
          icon: <FiShield size={14} />,
          to: "/notices?cat=government",
        },
      ],
    },
    {
      key: "government",
      icon: <FiShield size={15} />,
      color: "#06B6D4",
      label: t("nav.government"),
      items: [
        {
          icon: <FiCreditCard size={15} />,
          label: t("government.nid"),
          to: "/government?type=nid",
        },
        {
          icon: <FiFileText size={15} />,
          label: t("government.schemes"),
          to: "/government?type=schemes",
        },
        {
          icon: <FiWifi size={15} />,
          label: t("government.utility"),
          to: "/government?type=utility",
        },
      ],
    },

    {
      key: "donation",
      icon: <FiHeart size={15} />,
      color: "#10B981",
      label: t("nav.donate"),
      items: [
        {
          icon: <FiList size={15} />,
          label: t("donate.view_all"),
          to: "/donation",
        },
        {
          icon: <FiPlusCircle size={15} />,
          label: t("donate.post_request"),
          to: "/donation",
        },
        {
          icon: <FiActivity size={15} />,
          label: t("donate.medical"),
          to: "/donation?category=medical",
        },
        {
          icon: <FiBook size={15} />,
          label: t("donate.education"),
          to: "/donation?category=education",
        },
        {
          icon: <MdAgriculture size={15} />,
          label: t("donate.agriculture"),
          to: "/donation?category=agriculture",
        },
      ],
    },
  ];

  const VIEW_PAGES = [
    { icon: <FiHome size={16} />, label: t("nav.home"), to: "/" },
    {
      icon: <FiAlertTriangle size={16} />,
      label: t("nav.emergency"),
      to: "/emergency",
    },
    { icon: <FiDroplet size={16} />, label: t("nav.blood"), to: "/blood" },
    { icon: <FiBook size={16} />, label: t("nav.education"), to: "/education" },
    { icon: <FiBriefcase size={16} />, label: t("nav.jobs"), to: "/jobs" },
    { icon: <FiEdit size={16} />, label: t("jobs.post"), to: "/jobs/new" },
    {
      icon: <FiHeart size={16} />,
      label: t("donate.post_request"),
      to: "/donation",
    },
    {
      icon: <FiUsers size={16} />,
      label: t("nav.volunteers"),
      to: "/volunteers",
    },
    { icon: <FiMap size={16} />, label: t("nav.map"), to: "/map" },
    {
      icon: <FiShield size={16} />,
      label: t("nav.government"),
      to: "/government",
    },

    { icon: <FiBell size={16} />, label: t("nav.notices"), to: "/notices" },
    { icon: <FiPhone size={16} />, label: t("common.contact"), to: "/contact" },
    ...(!isAuth
      ? [{ icon: <FiUser size={16} />, label: t("nav.login"), to: "/login" }]
      : [
          {
            icon: <FiUser size={16} />,
            label: t("nav.profile"),
            to: "/profile",
          },
        ]),
    ...(isAdmin
      ? [{ icon: <FiShield size={16} />, label: t("nav.admin"), to: "/admin" }]
      : []),
  ];

  const renderDropPanel = (cat) => (
    <div
      onMouseEnter={stayDrop}
      onMouseLeave={closeDrop}
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: isDark ? "rgba(15,23,36,0.97)" : "rgba(255,255,255,0.97)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1px solid var(--border-2)",
        borderRadius: 14,
        padding: 6,
        minWidth: 230,
        zIndex: 9999,
        boxShadow: "var(--shadow-lg)",
        animation: "dropFadeCenter 0.15s ease",
      }}
    >
      <div
        style={{
          padding: "7px 12px 8px",
          marginBottom: 4,
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{ color: cat.color, display: "flex", alignItems: "center" }}
        >
          {cat.icon}
        </span>
        <span
          style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text)" }}
        >
          {cat.label}
        </span>
      </div>
      {cat.items.map((item, i) => (
        <Link
          key={i}
          to={item.to}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 8,
            textDecoration: "none",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            fontWeight: 500,
            transition: "all 0.15s",
          }}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          <span
            style={{
              width: 22,
              display: "flex",
              justifyContent: "center",
              color: "var(--text-dim)",
            }}
          >
            {item.icon}
          </span>
          {item.label}
        </Link>
      ))}
    </div>
  );

  const renderNoticesPanel = (cat) => {
    const activeSec = cat.sections.find((s) => s.key === noticesSub);
    return (
      <div
        onMouseEnter={stayDrop}
        onMouseLeave={() => {
          closeDrop();
          setNoticesSub(null);
        }}
        style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: isDark ? "rgba(15,23,36,0.97)" : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid var(--border-2)",
          borderRadius: 14,
          padding: 6,
          zIndex: 9999,
          boxShadow: "var(--shadow-lg)",
          animation: "dropFadeCenter 0.15s ease",
          display: "flex",
        }}
      >
        <div style={{ minWidth: 220 }}>
          <div
            style={{
              padding: "7px 12px 8px",
              marginBottom: 4,
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                color: cat.color,
                display: "flex",
                alignItems: "center",
              }}
            >
              {cat.icon}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              {cat.label}
            </span>
          </div>
          {cat.sections.map((sec) => (
            <div
              key={sec.key}
              onMouseEnter={() =>
                sec.sub ? setNoticesSub(sec.key) : setNoticesSub(null)
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                borderRadius: 8,
                cursor: "pointer",
                color:
                  noticesSub === sec.key ? "var(--text)" : "var(--text-muted)",
                background:
                  noticesSub === sec.key ? "var(--surface-3)" : "transparent",
                fontSize: "0.85rem",
                fontWeight: 500,
                transition: "all 0.15s",
              }}
            >
              <Link
                to={sec.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  color: "inherit",
                  flex: 1,
                }}
              >
                <span
                  style={{
                    width: 22,
                    display: "flex",
                    justifyContent: "center",
                    color: "var(--text-dim)",
                  }}
                >
                  {sec.icon}
                </span>
                {sec.label}
              </Link>
              {sec.sub && <FiChevronRight size={11} style={{ opacity: 0.5 }} />}
            </div>
          ))}
        </div>
        {activeSec?.sub && (
          <div
            style={{
              minWidth: 210,
              borderLeft: "1px solid var(--border)",
              paddingLeft: 4,
            }}
          >
            <div
              style={{
                padding: "7px 12px 8px",
                marginBottom: 4,
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  color: cat.color,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {activeSec.icon}
              </span>
              <span
                style={{
                  fontSize: "0.73rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                }}
              >
                {activeSec.label}
              </span>
            </div>
            {activeSec.sub.map((item, i) => (
              <Link
                key={i}
                to={item.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  transition: "all 0.15s",
                }}
                onMouseEnter={hoverIn}
                onMouseLeave={hoverOut}
              >
                <span
                  style={{
                    width: 20,
                    display: "flex",
                    justifyContent: "center",
                    color: "var(--text-dim)",
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled ? "var(--glass-bg)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
          border: scrolled ? "1px solid var(--border-2)" : "none",
          borderTop: "none",
          borderRadius: scrolled ? "0 0 24px 24px" : "0",
          boxShadow: scrolled ? "0 20px 40px -15px rgba(0,0,0,0.1)" : "none",
          margin: scrolled ? "0 auto" : "0",
          width: scrolled ? "calc(100% - 40px)" : "100%",
          maxWidth: scrolled ? "1550px" : "100%",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          overflow: "visible",
          left: scrolled ? "50%" : "0",
          transform: scrolled ? "translateX(-50%)" : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: scrolled ? 64 : 80,
            padding: "0 16px",
            overflow: "visible",
            gap: 4,
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              flexShrink: 0,
              marginRight: 8,
            }}
          >
            <img
              src={isDark ? "/logo-dark.png" : "/Logo.png"}
              alt="People E-Sheba"
              className="laptop-nav-logo"
              style={{ height: 38, width: "auto", objectFit: "contain" }}
            />
          </Link>

          {/* Desktop Nav */}
          <div
            id="mega-nav"
            className="laptop-mega-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: "0 0 auto",
            }}
          >
            {MEGA.map((cat) => (
              <div
                key={cat.key}
                style={{ position: "relative" }}
                onMouseEnter={() => openDrop(cat.key)}
                onMouseLeave={closeDrop}
              >
                <button
                  className="laptop-nav-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeMenu === cat.key) {
                      setActiveMenu(null);
                    } else {
                      openDrop(cat.key);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    background: "transparent",
                    color:
                      activeMenu === cat.key
                        ? "var(--red)"
                        : "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    position: "relative",
                    transition: "color 0.2s",
                  }}
                >
                  <span style={{ opacity: activeMenu === cat.key ? 1 : 0.65 }}>
                    {cat.icon}
                  </span>
                  {cat.label}
                  <FiChevronDown
                    size={10}
                    style={{
                      opacity: 0.5,
                      transition: "transform 0.2s",
                      transform:
                        activeMenu === cat.key ? "rotate(180deg)" : "none",
                    }}
                  />
                  {activeMenu === cat.key && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: -2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "var(--red)",
                      }}
                    />
                  )}
                </button>
                {activeMenu === cat.key &&
                  (cat.isWide ? renderNoticesPanel(cat) : renderDropPanel(cat))}
              </div>
            ))}
            <Link
              to="/contact"
              className="laptop-nav-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "8px 10px",
                borderRadius: 10,
                textDecoration: "none",
                cursor: "pointer",
                background: "transparent",
                color: location.pathname === "/contact" ? "var(--red)" : "var(--text-muted)",
                fontSize: "0.75rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
                position: "relative",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--red)"}
              onMouseLeave={(e) => {
                if (location.pathname !== "/contact") {
                  e.currentTarget.style.color = "var(--text-muted)";
                }
              }}
            >
              <FiPhone size={12} style={{ opacity: 0.65 }} />
              {t("common.contact")}
              {location.pathname === "/contact" && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -2,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--red)",
                  }}
                />
              )}
            </Link>
          </div>

          {/* Right Side */}
          <div
            className="laptop-nav-right"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            {/* Search */}
            <button
              id="desktop-search"
              onClick={() => setSearchOpen((s) => !s)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <FiSearch size={14} />
            </button>

            {/* SOS */}
            <button
              id="desktop-sos"
              onClick={() => setSosOpen(true)}
              style={{
                height: 38,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 16px",
                borderRadius: 12,
                background: "var(--red)",
                border: "none",
                color:'var(--text-strong)',
                fontSize: "0.75rem",
                fontWeight: 900,
                cursor: "pointer",
                letterSpacing: "1px",
                boxShadow: "0 6px 18px -4px rgba(230,57,70,0.55)",
              }}
            >
              <FiAlertTriangle size={13} /> {t("nav.sos")}
            </button>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
            </button>

            {/* Language */}
            <button
              onClick={toggleLang}
              style={{
                height: 36,
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                gap: 4,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text-muted)",
                fontSize: "0.74rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <FiGlobe size={12} /> {lang === "en" ? "বাংলা" : "EN"}
            </button>

            {/* User */}
            <div id="user-menu-wrap" style={{ position: "relative" }}>
              {isAuth ? (
                <>
                  <button
                    onClick={() => setUserMenu((s) => !s)}
                    style={{
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0 10px 0 5px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--text)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "var(--grad-cyan)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color:'var(--text-strong)',
                      }}
                    >
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        maxWidth: 80,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.name?.split(" ")[0]}
                    </span>
                    <FiChevronDown size={11} style={{ opacity: 0.5 }} />
                  </button>
                  {userMenu && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 7px)",
                        right: 0,
                        background: isDark ? "rgba(15,23,36,0.98)" : "#fff",
                        backdropFilter: "blur(20px)",
                        border: "1px solid var(--border-2)",
                        borderRadius: 12,
                        padding: 6,
                        minWidth: 185,
                        zIndex: 9999,
                        boxShadow: "var(--shadow-lg)",
                        animation: "dropFade 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          padding: "9px 12px 8px",
                          borderBottom: "1px solid var(--border)",
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--text)",
                            fontSize: "0.88rem",
                          }}
                        >
                          {user?.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.71rem",
                            color: "var(--text-dim)",
                            marginTop: 2,
                          }}
                        >
                          {user?.email}
                        </div>
                      </div>
                      {[
                        {
                          icon: <FiUser size={13} />,
                          label: t("nav.profile"),
                          to: "/profile",
                        },
                        {
                          icon: <FiBookmark size={13} />,
                          label: t("profile.bookmarks"),
                          to: "/profile?tab=bookmarks",
                        },
                        ...(isAdmin
                          ? [
                              {
                                icon: <FiShield size={13} />,
                                label: t("nav.admin"),
                                to: "/admin",
                              },
                            ]
                          : []),
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setUserMenu(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                            padding: "8px 12px",
                            borderRadius: 8,
                            textDecoration: "none",
                            color: "var(--text-muted)",
                            fontSize: "0.83rem",
                            fontWeight: 500,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={hoverIn}
                          onMouseLeave={hoverOut}
                        >
                          <span style={{ color: "var(--text-dim)" }}>
                            {item.icon}
                          </span>
                          {item.label}
                        </Link>
                      ))}
                      <div
                        style={{
                          borderTop: "1px solid var(--border)",
                          marginTop: 4,
                          paddingTop: 4,
                        }}
                      >
                        <button
                          onClick={() => {
                            logout();
                            navigate("/");
                            setUserMenu(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                            padding: "8px 12px",
                            borderRadius: 8,
                            background: "transparent",
                            border: "none",
                            color: "var(--red)",
                            fontSize: "0.83rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            width: "100%",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--red-light)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <FiLogOut size={13} /> {t("nav.logout")}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  style={{
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border-2)",
                    background: "var(--surface-2)",
                    color: "var(--text-muted)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {t("nav.login")}
                </Link>
              )}
            </div>

            {/* Mobile burger */}
            <button
              id="mobile-burger"
              onClick={() => setMobile((s) => !s)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {mobile ? <FiX size={17} /> : <FiMenu size={17} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ padding: "0 1.5rem 1rem" }}>
            <form
              onSubmit={handleSearch}
              style={{
                display: "flex",
                gap: 8,
                maxWidth: 560,
                margin: "0 auto",
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <FiSearch
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-dim)",
                    pointerEvents: "none",
                  }}
                  size={15}
                />
                <input
                  ref={searchRef}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder={t("nav.search")}
                  className="form-input"
                  style={{ paddingLeft: 34 }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                {t("common.search")}
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                <FiX size={14} />
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Drawer */}
      {mobile && (
        <>
          <div
            onClick={() => setMobile(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 9998,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              maxWidth: 400,
              background: isDark ? "var(--bg)" : "#fff",
              zIndex: 9999,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-10px 0 40px rgba(0,0,0,0.4)",
              animation: "slideInRight 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.2rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: isDark ? "var(--bg)" : "#fff",
              }}
            >
              <Link to="/" onClick={() => setMobile(false)}>
                <img
                  src={isDark ? "/logo-dark.png" : "/Logo.png"}
                  alt="People E-Sheba"
                  style={{ height: 36, width: "auto" }}
                />
              </Link>
              <button
                onClick={() => setMobile(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <FiX size={18} />
              </button>
            </div>
            <div
              style={{
                padding: "1.5rem",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <button
                onClick={() => setSosOpen(true)}
                style={{
                  height: 48,
                  borderRadius: 12,
                  background: "var(--grad-red)",
                  border: "none",
                  color:'var(--text-strong)',
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "var(--shadow-red)",
                }}
              >
                <FiAlertTriangle size={16} /> {t("nav.sos")}{" "}
                {t("emergency.title")}
              </button>
              <form onSubmit={handleSearch} style={{ position: "relative" }}>
                <FiSearch
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-dim)",
                    pointerEvents: "none",
                  }}
                  size={16}
                />
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder={t("nav.search")}
                  className="form-input"
                  style={{
                    paddingLeft: 44,
                    paddingRight: 44,
                    height: 52,
                    borderRadius: 26,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    fontSize: "0.9rem",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    position: "absolute",
                    right: 6,
                    top: 6,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: "var(--grad-red)",
                    border: "none",
                    color:'var(--text-strong)',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-red)",
                  }}
                >
                  <FiSearch size={16} />
                </button>
              </form>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    background: "var(--surface-2)",
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      letterSpacing: "0.3px",
                      color: "var(--text-dim)",
                      marginBottom: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    {t("nav.services")}
                  </div>
                  <div className="mobile-menu-grid">
                    {VIEW_PAGES.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobile(false)}
                        style={{
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "11px 12px",
                          borderRadius: 12,
                          textDecoration: "none",
                          color: "var(--text-muted)",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--red)",
                            opacity: 0.85,
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </span>
                        <span
                          style={{
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {MEGA.map((cat) => {
                  const isOpen = openCat === cat.key;
                  return (
                    <div
                      key={cat.key}
                      style={{
                        background: "var(--surface-2)",
                        borderRadius: 16,
                        border: "1px solid var(--border)",
                        overflow: "hidden",
                        transition: "var(--t)",
                      }}
                    >
                      <button
                        onClick={() => setOpenCat(isOpen ? null : cat.key)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "1rem 1.25rem",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            color: isOpen ? "var(--text)" : "var(--text-muted)",
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: isOpen
                                ? cat.color + "20"
                                : "var(--surface)",
                              color: isOpen ? cat.color : "var(--text-dim)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid var(--border)",
                              transition: "var(--t)",
                            }}
                          >
                            {cat.icon}
                          </div>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              letterSpacing: "0.3px",
                            }}
                          >
                            {cat.label}
                          </span>
                        </div>
                        <FiChevronDown
                          size={18}
                          style={{
                            color: "var(--text-dim)",
                            transform: isOpen ? "rotate(180deg)" : "none",
                            transition:
                              "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                          }}
                        />
                      </button>
                      <div
                        style={{
                          maxHeight: isOpen ? "720px" : "0",
                          opacity: isOpen ? 1 : 0,
                          overflow: "hidden",
                          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                          padding: isOpen ? "0 1rem 1rem" : "0 1rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            paddingTop: 4,
                          }}
                        >
                          {cat.items &&
                            cat.items.map((item, i) => (
                              <Link
                                key={i}
                                to={item.to}
                                onClick={() => setMobile(false)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "12px 14px",
                                  borderRadius: 12,
                                  textDecoration: "none",
                                  color: "var(--text-muted)",
                                  fontSize: "0.88rem",
                                  fontWeight: 600,
                                  background: "var(--surface)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                <span
                                  style={{
                                    color: cat.color,
                                    opacity: 0.8,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {item.icon}
                                </span>
                                {item.label}
                              </Link>
                            ))}
                          {cat.sections &&
                            cat.sections.map((sec) => {
                              const isSub = openSubCat === sec.key;
                              return (
                                <div key={sec.key}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      padding: "12px 14px",
                                      borderRadius: 12,
                                      background: "var(--surface)",
                                      border: "1px solid var(--border)",
                                      cursor: sec.sub ? "pointer" : "default",
                                    }}
                                    onClick={() =>
                                      sec.sub &&
                                      setOpenSubCat(isSub ? null : sec.key)
                                    }
                                  >
                                    <Link
                                      to={sec.to}
                                      onClick={(e) => {
                                        if (sec.sub) e.preventDefault();
                                        else setMobile(false);
                                      }}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        textDecoration: "none",
                                        color: "var(--text-muted)",
                                        fontSize: "0.88rem",
                                        fontWeight: 600,
                                        flex: 1,
                                      }}
                                    >
                                      <span
                                        style={{
                                          color: cat.color,
                                          opacity: 0.8,
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        {sec.icon}
                                      </span>
                                      {sec.label}
                                    </Link>
                                    {sec.sub && (
                                      <FiChevronDown
                                        size={14}
                                        style={{
                                          color: "var(--text-dim)",
                                          transform: isSub
                                            ? "rotate(180deg)"
                                            : "none",
                                          transition: "transform 0.2s",
                                        }}
                                      />
                                    )}
                                  </div>
                                  {sec.sub && isSub && (
                                    <div
                                      style={{
                                        paddingLeft: 14,
                                        marginTop: 6,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 5,
                                      }}
                                    >
                                      {sec.sub.map((sub, j) => (
                                        <Link
                                          key={j}
                                          to={sub.to}
                                          onClick={() => setMobile(false)}
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            padding: "10px 14px",
                                            borderRadius: 10,
                                            textDecoration: "none",
                                            color: "var(--text-muted)",
                                            fontSize: "0.85rem",
                                            fontWeight: 500,
                                            background: "var(--surface)",
                                            border: "1px solid var(--border)",
                                          }}
                                        >
                                          <span
                                            style={{
                                              color: cat.color,
                                              opacity: 0.7,
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            {sub.icon}
                                          </span>
                                          {sub.label}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderTop: "1px solid var(--border)",
                background: "var(--surface-2)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {isAuth ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <Link
                    to="/profile"
                    onClick={() => setMobile(false)}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <FiUser size={15} /> {t("nav.profile")}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobile(false)}
                      style={{
                        height: 44,
                        borderRadius: 12,
                        background: "rgba(230,57,70,0.08)",
                        border: "1px solid rgba(230,57,70,0.2)",
                        color: "var(--red)",
                        textDecoration: "none",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <FiShield size={15} /> {t("nav.admin")}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                      setMobile(false);
                    }}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      background: "var(--grad-red)",
                      border: "none",
                      color:'var(--text-strong)',
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "var(--shadow-red)",
                    }}
                  >
                    <FiLogOut size={15} /> {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobile(false)}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    border: "1px solid var(--border-2)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {t("nav.login")}
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      <div style={{ height: 80 }} />
      <SOSModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />

      <style>{`
        .mobile-menu-grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:8px;
        }
        @media(max-width:1240px){
          #mega-nav,#desktop-search,#user-menu-wrap,#desktop-sos{ display:none!important; }
          #mobile-burger{ display:flex!important; }
        }
        @keyframes dropFade{ from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes dropFadeCenter{ from{opacity:0;transform:translate(-50%,-10px);} to{opacity:1;transform:translate(-50%,0);} }
        @keyframes slideInRight{ from{transform:translateX(100%);} to{transform:translateX(0);} }
      `}</style>
    </>
  );
}
