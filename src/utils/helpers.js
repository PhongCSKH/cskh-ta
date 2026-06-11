export const formatCurrency = (number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number || 0);
};

export const formatDateVN = (dateStr) => {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

export const maskName = (name) => {
  if (!name) return '---';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const maskedParts = parts.map((part, index) => {
    if (index === parts.length - 1) {
      return part;
    }
    if (part.length > 1) {
      return part[0] + '*'.repeat(part.length - 1);
    }
    return part;
  });
  return maskedParts.join(' ');
};

export const maskPID = (pid) => {
  if (!pid) return '---';
  const cleanPid = pid.trim();
  if (cleanPid.length <= 6) {
    return cleanPid;
  }
  return cleanPid.slice(0, 2) + '*'.repeat(cleanPid.length - 6) + cleanPid.slice(-4);
};
