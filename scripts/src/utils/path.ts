// 预编译正则表达式，避免重复创建
const PATH_REGEX = {
  // Windows绝对路径: 盘符开头 + 合法路径字符 (例如 C:\或D:/)
  WINDOWS_ABSOLUTE: /^[a-zA-Z]:[\\/](?:[^\x00-\x1f\x7f<>:"/\\|?*]+[\\/]?)*$/,

  // Unix绝对路径: 以/开头 (例如 /usr/local)
  UNIX_ABSOLUTE: /^\/(?:[^\x00-\x1f\x7f/]+(?:[\\/][^\x00-\x1f\x7f/]+)*)*\/?$/,

  // 通用相对路径 (同时兼容Windows和Unix风格)
  RELATIVE: /^(?:\.{0,2}[\\/]?|[^\x00-\x1f\x7f<>:"/\\|?*]+[\\/]?)+$/,
} as const;

export const isValidPath = (pathString: string): boolean => {
  if (!pathString) return false;

  // 统一路径分隔符为斜杠，简化正则判断
  const normalizedPath = pathString.replace(/\\/g, "/");

  return (
    PATH_REGEX.WINDOWS_ABSOLUTE.test(pathString) ||
    PATH_REGEX.UNIX_ABSOLUTE.test(normalizedPath) ||
    PATH_REGEX.RELATIVE.test(normalizedPath)
  );
};
