export default class FunctionChain {
    constructor() {
        this.conditions = [];
    }

    add(test, action, priority = 0) {
        this.conditions.push({ test, action, priority });
        return this;
    }

    run(input) {
        // Prioritize by highest priority
        const sorted = [...this.conditions].sort((a, b) => b.priority - a.priority);
        const match = sorted.find(cond => cond.test(input));
        return match?.action(input);
    }

    runAll(input) {
        return this.conditions
            .filter(cond => cond.test(input))
            .sort((a, b) => b.priority - a.priority)
            .map(cond => cond.action(input));
    }
}
