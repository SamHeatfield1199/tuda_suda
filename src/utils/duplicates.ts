export function checkDuplicate <T extends Record<K, string>, K extends keyof T>(
    value: string,
    collection: Iterable<T>,
    key: K,
): boolean {
    const normalized = value.toLowerCase();

    for (const item of collection) {
        if (item[key].toLowerCase() === normalized) {
            return true;
        }
    }

    return false;
}
