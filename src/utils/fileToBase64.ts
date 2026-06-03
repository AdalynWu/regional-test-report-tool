/**
 * Read a File and resolve to a base64 data URL string
 * (e.g. "data:image/png;base64,....").
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("读取档案失败：结果不是字串"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("读取档案失败"));
    reader.readAsDataURL(file);
  });
}
