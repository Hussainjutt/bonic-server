export function isEmpty(fields: any[]): Boolean {
  for (const field of fields) {
    if (field === undefined || field === null || field === "") {
      return true;
    }
  }
  return false;
}
