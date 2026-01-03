const MAX_LENGTH = 10;
export function generate() {
    let ans = "";
    const subset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < MAX_LENGTH; i++) {
        ans += subset[Math.floor(Math.random() * subset.length)];
    }
    return ans;
}
