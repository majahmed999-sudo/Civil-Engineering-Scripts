export declare function jsepEval(expression: string, context?: Record<string, unknown>): unknown;
/**
 * Evaluates a step-level or hook-entry-level `if:` condition: strips the
 * optional `${{ }}` / `${ }` delimiters and coerces the result to boolean.
 * The evaluation context is the caller's — step conditions include the step's
 * inputs and env, entry conditions the global context only.
 */
export declare function evaluateIfCondition(ifCondition: string, context: Record<string, unknown>): boolean;
