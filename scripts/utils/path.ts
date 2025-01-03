export const isValidPath = (pathString: string) => {
  const windowsAbsolutePathRegex =
    /^[a-zA-Z]:[\\/](?:[^\x00-\x1F\x7F<>:"/\\|?*]+[\\/]?)*$/;
  const unixAbsolutePathRegex =
    /^\/([^\x00-\x1F\x7F/]+(?:\/[^\x00-\x1F\x7F/]+)*)\/?$/;
  const windowsRelativePathRegex = /^(?:[^\x00-\x1F\x7F<>:"/\\|?*]+[\\/]?)+$/;
  const unixRelativePathRegex =
    /^([^\x00-\x1F\x7F/]+(?:\/[^\x00-\x1F\x7F/]+)*)\/?$/;

  return (
    pathString !== "" &&
    (windowsAbsolutePathRegex.test(pathString) ||
      unixAbsolutePathRegex.test(pathString) ||
      windowsRelativePathRegex.test(pathString) ||
      unixRelativePathRegex.test(pathString))
  );
};
