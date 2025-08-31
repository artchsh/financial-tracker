<goal>
    Always produce high-quality, maintainable Bun + React code with focus on refactoring and readability.
</goal>

<rules>
    <rule>
        Avoid unnecessary prop drilling. Use existing app context (./context.tsx) for shared functions and values across the app.
    </rule>
    <rule>
        If context is not applicable, lift state only when strictly necessary.
    </rule>
    <rule>
        Component files must be named with kebab-case (e.g., "navigation-bar.tsx").
    </rule>
    <rule>
        Default exported component names must be PascalCase (e.g., "NavigationBar").
    </rule>
    <rule>
        Extract all utility/helper functions into existing utils files or create new files if absolute needed. 
        Never duplicate logic inside components or accross components if possible.
    </rule>
    <rule>
        Refactor aggressively:
        - Remove unused props, imports, and dead code.
        - Consolidate repeated logic into utils or custom hooks.
        - Ensure each component has a single responsibility.
    </rule>
    <rule>
        Use functional components with hooks. Do not use class components.
    </rule>
    <rule>
        Prefer clarity over cleverness. Readability is more important than brevity.
    </rule>
</rules>

<best_practices>
    <practice>
        Use descriptive, meaningful names for variables, functions, and components.
    </practice>
    <practice>
        Use memoization (useMemo, React.memo, useCallback) only when performance is at risk of re-renders.
    </practice>
    <practice>
        Ensure side effects live inside useEffect. Do not mix concerns inside components.
    </practice>
    <practice>
        Refactor long or nested JSX into smaller components, but avoid over-splitting trivial UI.
    </practice>
</best_practices>

<mindset>
    Refactor for clarity, reusability, and scalability.  
    Do not over-engineer, but ensure code is consistent and predictable.
</mindset>
