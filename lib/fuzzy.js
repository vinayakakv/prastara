class FuzzySet {
    constructor() {
        this.set = {};
    }

    add(data, membership) {
        this.set[data] = membership;
    }

    intersection(other) {
        if (!(other instanceof FuzzySet)) {
            return new FuzzySet();
        }
        let result = new FuzzySet();
        let current_keys = Object.keys(this.set);
        let other_keys = Object.keys(other.set);
        for (let other_key of other_keys)
            if (current_keys.includes(other_key))
                result.set[other_key] = Math.min(
                    this.set[other_key],
                    other.set[other_key]
                );
        return result;
    }

    union(other) {
        if (!(other instanceof FuzzySet)) {
            return new FuzzySet();
        }
        let result = new FuzzySet();
        let current_keys = Object.keys(this.set);
        let other_keys = Object.keys(other.set);
        let keys = new Set(current_keys.push(...other_keys));
        for (let key of keys) {
            if (current_keys.includes(key) && other_keys.includes(key)) {
                result.set[key] = Math.max(
                    this.set[key],
                    other.set[key]
                );
            }
            else if (current_keys.includes(key))
                result.set[key] = this.set[key];
            else
                result.set[key] = other.set[key];
        }
        return result;
    }
}

export {FuzzySet}