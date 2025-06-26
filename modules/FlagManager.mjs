import _ from 'lodash';
import FlagLoader from './FlagLoader.mjs';

export default class FlagManager {
    constructor(flags = 0, flagDefinitions = FlagLoader()) {
        this.flags = flags;
        this.flagDefinitions = flagDefinitions;
    }

    _normalizeFlags(flagNames) {
        const names = _.castArray(flagNames);
        for (const name of names) {
            if (!_.has(this.flagDefinitions, name)) {
                throw new Error(`Unknown flag: ${name}`);
            }
        }
        return names;
    }

    enable(flagNames) {
        const names = this._normalizeFlags(flagNames);
        let newFlags = this.flags;
        for (const name of names) {
            newFlags |= this.flagDefinitions[name];
        }
        return new FlagManager(newFlags, this.flagDefinitions);
    }

    disable(flagNames) {
        const names = this._normalizeFlags(flagNames);
        let newFlags = this.flags;
        for (const name of names) {
            newFlags &= ~this.flagDefinitions[name];
        }
        return new FlagManager(newFlags, this.flagDefinitions);
    }

    has(flagNames, options = { matchAll: true }) {
        const { matchAll } = options;
        const names = this._normalizeFlags(flagNames);

        if (matchAll) {
            return names.every(name =>
                (this.flags & this.flagDefinitions[name]) === this.flagDefinitions[name]
            );
        } else {
            return names.some(name =>
                (this.flags & this.flagDefinitions[name]) === this.flagDefinitions[name]
            );
        }
    }

    getValue() {
        return this.flags;
    }
}
