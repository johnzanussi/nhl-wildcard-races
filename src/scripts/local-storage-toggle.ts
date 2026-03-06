interface LocalStorageToggleOptions {
    toggleId: string;
    storageKey: string;
    /** Read current DOM state → return whether checkbox should be checked */
    getChecked: () => boolean;
    /** Apply checked state to the DOM */
    apply: (checked: boolean) => void;
    /** Return the string to persist in localStorage */
    toStorageValue: (checked: boolean) => string;
}

export function initLocalStorageToggle({
    toggleId,
    storageKey,
    getChecked,
    apply,
    toStorageValue,
}: LocalStorageToggleOptions): void {
    const toggle = document.getElementById(toggleId) as HTMLInputElement | null;
    if (!toggle) return;

    toggle.checked = getChecked();

    toggle.addEventListener('change', () => {
        apply(toggle.checked);
        localStorage.setItem(storageKey, toStorageValue(toggle.checked));
    });
}
