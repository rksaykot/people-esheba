import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { useLang } from '../../context/LanguageContext';

export default function SortDropdown({ 
  options = [
    { value: 'newest', labelEn: 'Newest First', labelBn: 'নতুনগুলো আগে' },
    { value: 'oldest', labelEn: 'Oldest First', labelBn: 'পুরনো গুলো আগে' },
    { value: 'name_asc', labelEn: 'Name (A-Z)', labelBn: 'নাম (অ-ক্ষ)' },
    { value: 'name_desc', labelEn: 'Name (Z-A)', labelBn: 'নাম (ক্ষ-অ)' }
  ]
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSort = searchParams.get('sort') || options[0]?.value || 'newest';
  const { isBn } = useLang();

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    const value = e.target.value;
    if (value === options[0]?.value) {
      newParams.delete('sort'); // Default sort
    } else {
      newParams.set('sort', value);
    }
    // Optional: reset page to 1 when sorting changes, if pagination is in searchParams
    if (newParams.has('page')) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="relative inline-flex items-center shrink-0">
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="appearance-none bg-transparent font-medium text-sm md:text-[15px] outline-none cursor-pointer pr-9 py-2 pl-4 rounded-xl transition-all"
        style={{ 
          color: 'var(--text)', 
          border: '1px solid var(--border)',
          background: 'var(--surface)'
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--bg)', color: 'var(--text)' }}>
            {isBn ? opt.labelBn : opt.labelEn}
          </option>
        ))}
      </select>
      <FiChevronDown className="absolute right-3 pointer-events-none" style={{ color: 'var(--text-muted)' }} size={16} />
    </div>
  );
}
