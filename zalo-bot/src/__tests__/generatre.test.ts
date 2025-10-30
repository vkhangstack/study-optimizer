import { describe, it, expect } from 'bun:test';
import { GenerateUtils } from '../utils/generatre';

describe('GenerateUtils', () => {
    it('generateId returns a non-empty string', () => {
        const gen = GenerateUtils.getInstance();
        const id = gen.generateId();
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
    });

    it('createHashAssignment returns consistent result for same input', () => {
        const gen = GenerateUtils.getInstance();
        const a = gen.createHashAssignment('hello');
        const b = gen.createHashAssignment('hello');
        expect(a).toBe(b);
    });

    it('createHashAssignment returns different result for different input', () => {
        const gen = GenerateUtils.getInstance();
        const a = gen.createHashAssignment('hello');
        const b = gen.createHashAssignment('world');
        expect(a).not.toBe(b);
    });
});
